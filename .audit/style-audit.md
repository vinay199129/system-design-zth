# System Design ZTH — Style / UX / Accessibility Audit

> Generated 2026-04-14. Scope: `dashboard.html` / `index.html` (620 KB, identical, generated), `dashboard-src/{styles.css,layout.html,app.js}`, `solutions/*.html` (20 SEO landing pages), `sitemap.xml`, `robots.txt`, `build_dashboard.py`.
>
> Methodology: read every source file in `dashboard-src/` end-to-end; spot-checked `dashboard.html` lines 1–30 and 570–600 against the source assembly in `build_dashboard.py:166-217`; read `solutions/01-url-shortener.html` end-to-end and grepped meta tags + H1s across all 20 solution pages; ran `ripgrep` over the whole repo for `aria-`, `tabindex`, `role=`, `prefers-color-scheme`, `prefers-reduced-motion`, `color-scheme`, `<button`, `:focus`, `outline`, `alert(`, `href="#"`, `<img`, `alt=`; ran a PowerShell byte-level scan over all 127 HTML/CSS/JS/MD/XML/TXT files for U+FFFD and UTF-8 BOM.
>
> No source files were modified.

---

## Executive Summary

The build is a single-file dashboard (`dashboard.html` ≈ 620 KB) assembled by `build_dashboard.py` from three modular sources in `dashboard-src/`, plus 20 generated SEO landing pages under `solutions/`. The information architecture is sound on paper — eight tabs cover Study / Overview / Designs / Design Lab / Patterns / Timer / Redo / Weekly per `setup.md` — and the visual language (GitHub-dark inspired tokens in `dashboard-src/styles.css:7-21`) is tasteful and consistent. Mermaid diagrams render inside study content via a CDN script, the estimation calculator is genuinely useful, and the spaced-repetition Redo queue is well-modeled.

What is broken or below shipping bar:

1. **Accessibility is largely absent.** Zero `aria-*` attributes, zero `role=`, zero `tabindex`, zero `:focus`/`:focus-visible` rules, zero landmarks (no `<main>`, `<nav>`, `<aside>`), and every primary interactive element except `<button>`-tagged buttons is a `<div>` with `onclick=` — the tabs (`dashboard-src/layout.html:22-29`), the sidebar study items (`dashboard-src/app.js:317`), the snav-group collapse toggle (`dashboard-src/app.js:313`), the star-rating spans (`dashboard-src/app.js:668`), the cheat items, the heatmap day cells, the header greeting. None of these are reachable by Tab; a keyboard-only user cannot operate the app at all.
2. **The 45-minute interview timer is unreliable on the platform it most needs to work on — mobile.** It uses `setInterval(..., 1000)` with naive decrement (`dashboard-src/app.js:705-721`), no `Date.now()` baseline, no Page Visibility API, no Wake Lock; iOS/Android throttle background intervals to ~1 Hz then to zero — timer drifts by minutes over a 45-min run. End-of-time signal is a synchronous `alert()` (`dashboard-src/app.js:716`) which doesn't fire if the tab is backgrounded.
3. **SEO landing pages serve broken content.** `solutions/*.html` wraps the entire markdown body in `<pre><code>…</code></pre>` (`build_dashboard.py:283`), so a Google visitor lands on a wall of raw `graph LR --> …` mermaid syntax and unrendered markdown tables. The `og:description` is identical across all 20 pages, there is no `og:image`, no `theme-color`, no Twitter card, no `Article` JSON-LD, and the pages hard-code dark colours (`solutions/01-url-shortener.html:14-25`) regardless of `prefers-color-scheme`.
4. **No `prefers-color-scheme` and no `prefers-reduced-motion` support anywhere.** Theme is opt-in via a click on a circular toggle (`dashboard-src/layout.html:4`) that has no `aria-label`, no `aria-pressed`, and uses bare glyphs `&#9790;` / `&#9728;` as content. Mermaid is hard-initialised in dark theme (`build_dashboard.py:193`) and never re-themes on toggle.
5. **The default landing tab is wrong.** "Study" is active by default (`dashboard-src/layout.html:22, 33`) and renders the literal placeholder `"Pick a topic from the sidebar to start reading."` (`dashboard-src/layout.html:42`). The "what should I do today" card lives in the Overview tab (`dashboard-src/layout.html:60-65`) and is one click away. A 60-day-plan product should land on today's task list, not on an empty prompt.

The codebase is, encouragingly, free of encoding bugs (0 × U+FFFD, 0 BOMs across 127 files), free of `href="#"` dead links, free of `<img>` tags entirely (the only image is a data-URL SVG favicon), and the colour palette is largely AA-compliant when measured. Most of the P0/P1 findings are fixable in dashboard-src/ without touching content — a focused 1-day pass.

Top 5 P0 hot-fixes (full list in §A):

1. Convert `.tab` divs to `<button role="tab">` + add `:focus-visible` ring globally.
2. Replace the timer's interval-decrement loop with a `Date.now()` deadline and add `document.visibilitychange` rebase.
3. Stop wrapping `solutions/*.html` bodies in `<pre><code>`; render markdown to real HTML (or at least render Mermaid blocks).
4. Add `<main id="content">`, `<nav>` (tabs), `<aside>` (sidebar) landmarks + skip link.
5. Replace `alert('Time is up!')` with a toast + audio cue + `Notification` API call so it works when the tab is backgrounded.

---

## A. Critical (P0) — broken, blocks shipping

### A1. Tabs are unreachable by keyboard

- **Where:** `dashboard-src/layout.html:21-30` — every tab is `<div class="tab" data-tab="...">Label</div>`.
- **What:** No `tabindex`, no `role="tab"`, no `aria-selected`, no `aria-controls`; the parent has no `role="tablist"`. The `<div class="tab-content">` panels (`dashboard-src/layout.html:33, 60, 93, 102, 127, 136, 178, 209`) have no `role="tabpanel"` or `aria-labelledby`. Click handler lives in `dashboard-src/app.js:896-901` and listens only for `click`, not `keydown`.
- **Impact:** Keyboard-only users (and screen-reader users) cannot reach or switch tabs. Tab key skips them entirely; arrow-key navigation does nothing.
- **Fix:** Render tabs as `<button role="tab" aria-selected="..." aria-controls="tab-...">`; wrap in `<div role="tablist">`. Add arrow-key handler that moves focus among siblings. Mark each `tab-content` as `role="tabpanel" aria-labelledby="tab-btn-id" tabindex="0"`. One-time CSS: hide inactive panels with `hidden` attribute instead of `display:none` class so they're inert.

### A2. The 45-min interview timer drifts on mobile and silently dies when backgrounded

- **Where:** `dashboard-src/app.js:699-737` (`Timer.toggleFocus`, `resetFocus`, `setMode`).
- **What:** `setInterval(..., 1000)` decrements `_fs` and `_totalElapsed` on each tick (`dashboard-src/app.js:705-721`). Chrome/Firefox throttle background intervals to 1 Hz then to a minimum of 1000 ms, Safari iOS pauses them entirely when the screen locks. There is no `Date.now()` deadline, no rebase on `document.visibilitychange`, no `navigator.wakeLock.request('screen')`.
- **Impact:** This is *the* feature on the Timer tab. For a 45-minute interview simulator, a phone-locked drift of 3–15 minutes makes the tool actively misleading. The Stuck Protocol pinned at `dashboard-src/layout.html:164-173` is also lost when the screen sleeps.
- **Fix:** Store `_deadline = Date.now() + _fs * 1000`; on every tick (or on `requestAnimationFrame`) compute `_fs = Math.max(0, Math.ceil((_deadline - Date.now())/1000))`. On `document.addEventListener('visibilitychange', ...)` re-derive `_fs`. On Start, call `navigator.wakeLock.request('screen').catch(() => {})` and release on Stop/Reset.

### A3. End-of-time signal is a blocking `alert()`

- **Where:** `dashboard-src/app.js:716` (and shipped into `dashboard.html:1291`).
- **What:** `alert('Time is up!')` blocks the main thread, traps focus to the OS dialog, and does not fire at all in a backgrounded tab.
- **Impact:** In a real mock-interview session the user has their notes/Mermaid open in another window — they will never see the alert.
- **Fix:** Render an in-app toast (`role="status" aria-live="assertive"`), play a short embedded audio cue (`new Audio('data:audio/...')`), and call `new Notification('Time is up')` after a one-time permission prompt. Optional: vibrate via `navigator.vibrate([200,100,200])`.

### A4. `solutions/*.html` ships raw markdown inside `<pre><code>` — Mermaid + tables don't render

- **Where:** `build_dashboard.py:282-283` (`<h2>Solution</h2>` followed by `<pre><code>{content_escaped}</code></pre>`); resulting pages e.g. `solutions/01-url-shortener.html:32-233`, `solutions/02-youtube.html:63-220`.
- **What:** The dashboard's own `Markdown.render` is *not* invoked for SEO pages. Visitors from Google land on a ~10 KB block of ASCII that contains literal ` ```mermaid `, `graph LR Client([Client]) --> LB[Load Balancer]`, raw pipe-tables (`| Column | Type | Notes |`), un-rendered headings (`## 1. Requirements & Estimation`), and HTML-escaped `&gt;`/`&lt;`/`&quot;` everywhere.
- **Impact:** Top-of-funnel SEO landing pages — the entire reason the `solutions/` directory exists — render as unparsed source. Bounce rate will be 90 %+. Mermaid diagrams (the differentiator) are invisible. Pipe tables (a major SEO win for "url shortener data model") render as monospaced lines.
- **Fix:** In `build_dashboard.py`, render the markdown to HTML (re-use the JS renderer logic in `dashboard-src/app.js:134-278` ported to Python via `markdown` + `pymdown-extensions`, or simpler: parse Mermaid fences and convert them to inline SVG via headless mermaid-cli at build time, then convert tables/headings/lists/code blocks with the `markdown` library). At minimum, replace the `<pre><code>` wrapper with a `<article>` containing rendered HTML, and include `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>` to render diagrams client-side.

### A5. Zero focus indicators anywhere

- **Where:** `dashboard-src/styles.css` (no occurrences of `:focus`, `:focus-visible`, or `outline` in 310 lines). Confirmed: `rg ":focus|outline" dashboard-src/` returns nothing.
- **What:** `.btn` (`styles.css:130-137`), `.tab` (`styles.css:76-82`), `.snav-item` (`styles.css:153-158`), `.theme-toggle` (`styles.css:62-69`), `.sel` select (`styles.css:118-121`), `textarea.notes` (`styles.css:273-277`), `<input>` controls (none of them styled) — none have a focus ring. Browser default outline is suppressed implicitly by the `transition: all .2s` overriding nothing visible.
- **Impact:** WCAG 2.4.7 (Focus Visible) failure. Keyboard users tabbing through forms (estimation calc inputs, profile form, weekly review textareas) see no indication of where focus is.
- **Fix:** Add to `dashboard-src/styles.css`:
  ```css
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
  .btn:focus-visible, .tab:focus-visible, .snav-item:focus-visible { outline-offset: 3px; }
  ```

### A6. Modals lack dialog semantics, focus trap, and Escape handler

- **Where:** `dashboard-src/app.js:62-114` (`Profile.show`) injects a raw `<div id="profile-overlay">` with no `role="dialog"`, no `aria-modal="true"`, no `aria-labelledby`, no focus trap, no `Escape` handler. The overlay is shown automatically on first visit (`dashboard-src/app.js:931` — `if (!State.data.profile) Profile.show()`).
- **Impact:** Screen readers do not announce a dialog. Tab can escape the overlay to elements behind it. There is no documented way for a returning user without a profile to dismiss the modal except clicking "Start Learning" — which forces the form to be filled.
- **Fix:** Add `role="dialog" aria-modal="true" aria-labelledby="profile-title"` to the overlay container; give the `<h2>` an `id="profile-title"`. On open, focus the first input; on `Escape`, call `Profile.close()` (also wire `Cancel` to do this — currently it only exists conditionally per `dashboard-src/app.js:109`). Trap Tab cycling between first and last focusable elements inside the overlay.

### A7. Default landing is the empty Study placeholder, not "Today"

- **Where:** `dashboard-src/layout.html:22` (`<div class="tab active" data-tab="study">`) and `dashboard-src/layout.html:41-54` (placeholder content).
- **What:** A first-time visitor lands on a sidebar of 67+ collapsed groups and a paragraph that says "Pick a topic from the sidebar to start reading." The "Today — Day N" card with the actual checklist for the current day is on the *Overview* tab, one tab over (`dashboard-src/layout.html:60-65`).
- **Impact:** The project's core promise — "60-day plan, study today's thing" — is buried. Time-to-first-meaningful-action is 2 clicks (open tab → click sidebar item) instead of 0. The Overview tab is also misnamed; it contains "today" but is labelled "Overview".
- **Fix:** Either (a) make `data-tab="overview"` the default-active tab and rename it to "Today", or (b) render the today-card *inside* the Study tab's empty state at `dashboard-src/layout.html:41-54`. Option (a) is one-line; option (b) preserves study-as-default.

### A8. No `<main>`, `<nav>`, `<aside>` landmarks; no skip link

- **Where:** `dashboard-src/layout.html:5` — the whole app is a single `<div class="container">`. The tab bar is `<div class="tabs">` not `<nav>`. The study sidebar is `<div class="study-sidebar">` not `<aside>`. The footer (`dashboard-src/layout.html:227`) correctly uses `<footer>`, which is the *only* landmark in the document.
- **Impact:** Screen-reader landmark navigation (D in NVDA, VO+U in VoiceOver) lists exactly one region. Skip-link convention is unsupported.
- **Fix:** Wrap the tab bar in `<nav aria-label="Primary">`, the study sidebar in `<aside aria-label="Study sections">`, and the tab-content area in `<main id="content">`. Add `<a class="skip-link" href="#content">Skip to content</a>` as the first child of `<body>` styled to be visible only on `:focus`.

---

## B. High (P1) — degrades UX significantly

### B1. No `prefers-color-scheme` detection

- **Where:** `dashboard-src/app.js:6-31` (`Theme.init`). Only `localStorage.getItem('sd-theme')` is consulted.
- **What:** A visitor on macOS Light Mode opens the page → gets dark theme (the default). A visitor on Windows Dark Mode opening a `solutions/*.html` page → also gets dark (hard-coded), but if the dashboard had auto-detect they would get the same. There is no `window.matchMedia('(prefers-color-scheme: light)').matches` branch.
- **Fix:** In `Theme.init`, if `!saved`, derive from `matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'`. Also subscribe to `matchMedia(...).addEventListener('change', ...)` to follow OS changes.

### B2. No `prefers-reduced-motion` support

- **Where:** `dashboard-src/styles.css:67, 79, 90, 103, 133` — transitions on `.theme-toggle`, `.tab`, `.card`, `.pfill`, `.btn`. No `@media (prefers-reduced-motion: reduce)` block anywhere.
- **Impact:** Vestibular-sensitive users see the progress-bar `width .5s` animation, hover-colour fades, and tab-underline transitions whether or not their OS asks for reduced motion. WCAG 2.3.3 violation.
- **Fix:** Append to `styles.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
  ```

### B3. No `color-scheme` CSS property

- **Where:** `dashboard-src/styles.css:7-38`. Neither `:root` nor `[data-theme="light"]` declares `color-scheme`.
- **Impact:** Native UI (scrollbars on Windows/macOS, the `<input type="date">` widget at `dashboard-src/app.js:97`, autofill highlight, `<select>` dropdown menus at `dashboard-src/layout.html:105`, `dashboard-src/app.js:81-93`) stays in the wrong shade. On dark theme, the date picker calendar icon is near-invisible.
- **Fix:**
  ```css
  :root { color-scheme: dark; }
  [data-theme="light"] { color-scheme: light; }
  ```

### B4. Mermaid theme is hard-coded to dark and never re-themes

- **Where:** `build_dashboard.py:192-193` (inlined into `dashboard.html:573`).
- **What:** `mermaid.initialize({ theme: 'dark', themeVariables: { primaryColor: '#161b22', ... } })` runs once at load and never re-runs when `Theme.toggle()` is invoked (`dashboard-src/app.js:15-25`).
- **Impact:** Light-mode users see dark diagrams with black-on-dark text inside an otherwise white study panel — visually broken.
- **Fix:** Inside `Theme.toggle()`, after the data-theme attribute swap, call `mermaid.initialize({ theme: next === 'light' ? 'default' : 'dark', themeVariables: ... })` then re-run `mermaid.run({ querySelector: '.mermaid' })` on currently-visible diagrams.

### B5. Mermaid CDN load is render-blocking and uses no SRI

- **Where:** `build_dashboard.py:191` → `dashboard.html:571`: `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>`.
- **What:** No `defer`, no `async`, no `integrity=`, no `crossorigin=`. The script is ~2.6 MB (minified, ungzipped), blocks DOM parsing for the entire `<body>` that follows.
- **Impact:** First Contentful Paint on a slow 3G connection is delayed by 2–8 seconds. A CDN compromise could inject arbitrary JS.
- **Fix:** Add `defer integrity="sha384-..." crossorigin="anonymous"`, place the tag in `<head>` not at the end of body so the parser has it earlier. Even better: self-host a vendored copy under `assets/mermaid-10.x.x.min.js` to remove the third-party dependency entirely.

### B6. `<label>` not associated with `<input>` (estimation calc, weekly review, profile form)

- **Where:**
  - `dashboard-src/layout.html:71-72, 75-76, 79-80` (estimation calculator — DAU/Actions/Bytes).
  - `dashboard-src/layout.html:213-215` (weekly review — Designs Done / Hours / Redo Left).
  - `dashboard-src/app.js:71-73, 75-77, 79-86, 87-94, 95-98` (profile overlay — Name / Target / Level / Hours / Start Date).
- **What:** Every `<label>` is a bare element next to an `<input id="..."> ` with no `for=` attribute. Screen readers fall back to nothing or to placeholder text.
- **Fix:** Add `for="est-dau"` etc. to every `<label>` and ensure each input has a matching `id`. Already partially done in `dashboard-src/app.js:489` for the today-task checkboxes — apply the same pattern everywhere.

### B7. Theme toggle has no accessible name or pressed-state

- **Where:** `dashboard-src/layout.html:4`.
- **What:** `<button class="theme-toggle" onclick="Theme.toggle()" title="Toggle light/dark theme" id="theme-btn">&#9790;</button>` — only a `title` attribute (hover-only, not announced reliably) and a glyph. `aria-label`, `aria-pressed`, and a text fallback are missing.
- **Fix:** Add `aria-label="Toggle light/dark theme"` and `aria-pressed="false"`; toggle `aria-pressed` from inside `Theme._updateBtn` (`dashboard-src/app.js:26-29`).

### B8. Tab/button/sidebar/cheat/star/heatmap `<div onclick=...>` pattern

- **Where:** `dashboard-src/layout.html:10` (header greeting), `:22-29` (tabs), `dashboard-src/app.js:313` (snav-group toggle), `:317` (sidebar item), `:518` (heatmap day cell), `:656` (cheat item — not interactive but visually a card), `:668` (star rating).
- **What:** These respond to `click` only. No keyboard handler, no `role="button"`, no `tabindex="0"`.
- **Fix:** Convert to `<button type="button">` where the affordance is a button; for tabs see A1; for the star rating, render as a radio-group with visually-hidden inputs.

### B9. `<button>` everywhere lacks `type="button"` and inline `onclick` requires CSP `unsafe-inline`

- **Where:** every button in `dashboard-src/layout.html:4, 142, 143, 146-148, 183, 221, 222` and dynamically generated buttons in `dashboard-src/app.js:109, 110, 305, 306, 359, 530-532, 829, 830, 844`.
- **What:** Default `<button>` type inside a `<form>` is `submit`; the dashboard has no forms so this is harmless today, but it's a foot-gun. Inline `onclick="X.y()"` strings make a strict Content-Security-Policy impossible without `'unsafe-inline'`.
- **Fix:** Add `type="button"` to every button. Replace inline `onclick=` with `addEventListener` wiring (e.g., delegate via `data-action="Timer.toggleFocus"` and a single listener on the document).

### B10. Hidden tabs are still in the accessibility tree

- **Where:** `dashboard-src/styles.css:83-84` — `.tab-content { display: none; } .tab-content.active { display: block; }`.
- **What:** Because tabs aren't `aria-hidden` or `inert`, when the active tab is Study, the screen reader may still scan/index off-screen content in other tabs. Worse: hidden form controls (e.g., Weekly inputs at `dashboard-src/layout.html:213-218`) are submitted to no form but still parsed.
- **Fix:** Use the `hidden` attribute on inactive panels and `aria-selected="false"` on inactive tabs.

### B11. Sticky study sidebar collides with the page on short viewports

- **Where:** `dashboard-src/styles.css:144-147` — `.study-sidebar { position: sticky; top: 20px; max-height: 80vh; }`.
- **What:** The container `padding: 20px` (`styles.css:48`) plus the header (h1 + tabs ≈ 100 px) plus `top: 20px` puts the sidebar at viewport position ~140 px. `max-height: 80vh` then runs the sidebar to `0.8 × 100vh` below that point — on a 700-px-tall laptop it pushes 60 px below the fold. The mobile breakpoint at `styles.css:302-309` collapses it to `max-height: 250px` — which is too short to show even one phase of sections without an internal scroll.
- **Fix:** Use `max-height: calc(100vh - 140px)` and on mobile expand to a collapsible `<details>` element so users can use full viewport.

### B12. Mermaid blocks in initial markdown render race the CDN script

- **Where:** `build_dashboard.py:211-214` (`setTimeout(..., 100)` after init).
- **What:** On slow networks, the CDN script may load > 100 ms after `initDashboard()`. `mermaid` is `undefined`, `setTimeout` callback's `.catch(() => {})` swallows the error, and the user sees raw `<div class="mermaid">graph LR ...</div>` placeholders.
- **Fix:** Listen for the script's `load` event before calling `mermaid.run`; or place the call in `script.onload`.

### B13. Notes auto-save fires synchronous localStorage write on every keystroke

- **Where:** `dashboard-src/app.js:371-374` (`Study.saveNotes`), `dashboard-src/app.js:611-616` (`DesignLab.saveNotes`), `dashboard-src/layout.html:116, 117, 213-218` (textareas calling `*.saveNotes()` via `oninput`).
- **What:** Each keystroke triggers `localStorage.setItem(this._key, JSON.stringify(this._data))` — re-serialising the *entire* state blob (which includes redo queue, heatmap, design status, all other notes, etc.).
- **Impact:** On large blob, observable typing jank on low-end Chromebooks/Android. Also masks data-loss risk: if the JSON ever throws, the user's edits are lost.
- **Fix:** Debounce by 250 ms (`let t; oninput = () => { clearTimeout(t); t = setTimeout(save, 250); }`). Optionally partition state into per-key `localStorage` slots.

### B14. `dashboard.html` and `index.html` are byte-identical 620 KB files

- **Where:** `build_dashboard.py:218-225` writes the same `html` string to both.
- **What:** GitHub Pages serves `index.html` for `/`, and any link to `dashboard.html` (e.g. `solutions/*.html:28` `<a class="back" href="../index.html">`) is a duplicate-URL.
- **Impact:** Doubles the deploy size of the repo and creates a canonical ambiguity for crawlers — Google may pick either as the canonical, splitting link equity.
- **Fix:** Write `dashboard.html` once, and either (a) make `index.html` a 1-line `<meta http-equiv="refresh" content="0; url=dashboard.html">` redirect, or (b) delete `dashboard.html` and only ship `index.html`. The sitemap (`sitemap.xml:3`) already only lists the root URL.

### B15. SEO landing pages are dead-end dark-only walls of escaped code

In addition to A4, the structural deficiencies:

- **No favicon** (`build_dashboard.py:252-289` — the SEO template omits the `<link rel="icon">` that `dashboard.html:184` includes).
- **No `<meta name="theme-color">`** — Android Chrome shows the default white address bar.
- **No `og:image`** — LinkedIn/Twitter/Slack cards have no preview thumbnail.
- **No `og:url`** — relying only on `<link rel="canonical">`.
- **No `twitter:card`** — Twitter falls back to summary with no image.
- **No JSON-LD `Article`, `LearningResource`, or `Course`** structured data — none of these pages will surface as rich results in Google.
- **Identical `og:description`** on all 20 pages: `"Complete system design solution with architecture diagrams and trade-off analysis."` (e.g. `solutions/01-url-shortener.html:10`, `solutions/01-instagram.html:10`, etc.). Bad for social previews.
- **No internal cross-linking.** Each page has one link back to the dashboard (`solutions/01-url-shortener.html:28`) and two footer links. There is no "Related designs" rail, no breadcrumb, no link to the next page in the curriculum. Crawlers can't discover the 20-page set from any single page except via `sitemap.xml`.
- **Filename collision risk:** `build_dashboard.py:244` strips phase prefix → `solutions/01-instagram.html` and `solutions/01-url-shortener.html` are P5 and P4 respectively. If any future P4/P5 design shares a folder slug (e.g., `01-foo`), the later write overwrites the earlier. Add the phase to the slug (`p4-01-url-shortener.html`).

### B16. Tabs overflow horizontally on phones with no indication

- **Where:** `dashboard-src/styles.css:72-75` — `.tabs { display: flex; overflow-x: auto; }`.
- **What:** 8 tabs × ~80 px = 640 px; on a 360-px-wide phone, 4 are off-screen with no scroll hint, no fade/shadow edge, and no kbd nav.
- **Fix:** Either convert to a `<select>` on `max-width: 600px`, or add a fade-out gradient on the right edge and a scroll-snap mark.

### B17. No URL routing — no deep links, no shareable state

- **Where:** `dashboard-src/app.js:896-901` (tab click handler) does not push to `history` or update `location.hash`.
- **What:** A user reading `Study → Phase 2 → Replication` cannot bookmark or share that view. After reload, they're back on the empty Study placeholder.
- **Fix:** On tab switch, `history.replaceState(null, '', '#' + tab)`; on `Study.show(id)`, `history.replaceState(null, '', '#study/' + id)`. On load, parse `location.hash` and restore.

### B18. Hidden but always-rendered tabs ship 8× the markup they need

- **Where:** `dashboard.html` is 620 KB, of which the bulk is JSON-stringified markdown content for every study section (`build_dashboard.py:167, 205`). All 67+ sections are inlined into a single `Study.sections = [...]` JSON.
- **Impact:** First-byte payload is 620 KB even though the user reads one section at a time. On 3G, Time-to-Interactive is ~5 s purely from parsing.
- **Fix:** Lazy-load per-section content via `fetch('./content/p1-03-caching.md').then(r => r.text()).then(Markdown.render)` when the user clicks a sidebar item. Keep current behaviour for offline use behind a build flag.

---

## C. Medium (P2) — polish

### C1. `chip-easy-med` CSS rule is dead

- **Where:** `dashboard-src/styles.css:129` defines `.chip-easy-med`. `dashboard-src/app.js:558` computes the chip class via `'chip-' + d.diff.toLowerCase().split('-')[0]` — for "Easy-Med" this yields `chip-easy`, never `chip-easy-med`. The dead rule is identical to `.chip-medium`.
- **Fix:** Either remove the rule, or fix the JS to compute `d.diff.toLowerCase().replace(' ', '-')` and keep the rule.

### C2. Star-rating spans use `cursor:pointer` but are not buttons

- **Where:** `dashboard-src/app.js:667-670`.
- **What:** `<span style="cursor:pointer" onclick="Patterns.rate(...)">★</span>` — no `role="button"`, no `aria-label="Rate confidence 3 of 5"`, no `tabindex`. Keyboard users cannot rate.
- **Fix:** Render as `<button type="button" aria-label="Rate confidence ${n} of 5">★</button>` with appropriate `aria-pressed`.

### C3. Profile overlay backdrop has no click-to-close

- **Where:** `dashboard-src/app.js:64-66`.
- **What:** Conventional UX: clicking the dimmed backdrop closes the modal. Here the backdrop swallows the click silently.
- **Fix:** Add `onclick="if(event.target.id==='profile-overlay') Profile.close()"` to the overlay div (only when an existing profile exists so first-run forces completion).

### C4. Header greeting click target is small, unlabeled, and toggles state on a tooltip

- **Where:** `dashboard-src/layout.html:10`.
- **What:** `<span class="header-greeting" title="Click to edit profile" onclick="Profile.show()">`. Span, not button. Title-only (no `aria-label`). 13-px font in the header.
- **Fix:** Make it a `<button>` styled as a link; add `aria-label="Edit profile"`.

### C5. Inline color text-shadows / pseudo-link styles in `solutions/*.html` footer

- **Where:** `solutions/01-url-shortener.html:18, 21, 234-237` and equivalents — anchor colour `#58a6ff` on `#0d1117` is fine (~7.3:1), but the footer's `#9198a1` on `#0d1117` (`solutions/01-url-shortener.html:24`) measures ~6.0:1, then the inline `<a>` inside the footer (`solutions/01-url-shortener.html:236`) inherits `#58a6ff` from the body rule (`solutions/01-url-shortener.html:18`) without underline — looks like decorative text, not a link.
- **Fix:** Add `text-decoration: underline; text-underline-offset: 2px;` to `footer a` in the inlined `<style>` block of the SEO template (`build_dashboard.py:275`).

### C6. Footer disclaimer drops below AA contrast

- **Where:** `dashboard-src/layout.html:235` — `<div style="...color:var(--text2);opacity:0.7;">`.
- **What:** `--text2 = #9198a1` at 70 % opacity on `--bg = #0d1117` → effective ≈ #656970 → contrast ≈ 3.4:1. Fails WCAG AA for normal text.
- **Fix:** Remove `opacity:0.7`; the disclaimer is functional copyright text, not decorative.

### C7. `.btn-red` text on red background is borderline AA

- **Where:** `dashboard-src/styles.css:139` — `background: var(--red); color: #fff;` → `#fff` on `#f85149` ≈ 3.1:1.
- **Fix:** Either darken `--red` to `#c43c2e` (then ≈ 5.0:1), or set `color: #000` (≈ 5.3:1). The "Fail" button uses the same combination dynamically (`dashboard-src/app.js:830`).

### C8. Cheat-grid signal text contrast on `--surface2`

- **Where:** `dashboard-src/styles.css:251-255` — `.cheat-item { background: var(--surface2); }` and `.signal { color: var(--text2); }` → `#9198a1` on `#21262d` ≈ 4.3:1, fails AA for 12-px text (the `font-size: 12px` is set on `.cheat-item` at line 253).
- **Fix:** Use `var(--text)` for the signal text and `var(--text2)` for the pattern, or bump signal to `#b1b8c1`.

### C9. `1.7` line-height on the Markdown blockquote (`styles.css:196-199`) — fine

(no issue)

### C10. Tables outside `.md` overflow on mobile

- **Where:** `dashboard-src/layout.html:153-162` (timer phase table), `:198-205` (SRS rules table). These use raw `<table class="tbl">` with no overflow wrapper. The `.md`-prefixed tables get a wrapper at `dashboard-src/app.js:215`.
- **Fix:** Wrap each in `<div style="overflow-x:auto">` or add `.tbl-wrapper { overflow-x: auto; } .tbl-wrapper > .tbl { min-width: 480px; }`.

### C11. Date input on the profile form allows future start dates

- **Where:** `dashboard-src/app.js:97` — no `max=`. A user picks 2030-01-01 → the "Day N" calc downstream is meaningless.
- **Fix:** Add `max="${new Date().toISOString().split('T')[0]}"`.

### C12. Last-active-tab not persisted

- **Where:** `dashboard-src/app.js:896-901` (no state save).
- **Fix:** On switch, `localStorage.setItem('sd-tab', name)`; on load, restore.

### C13. Markdown renderer's blockquote logic eats lines starting with `>`

- **Where:** `dashboard-src/app.js:140` — `h = h.replace(/^>.*Navigation.*$/gm, '');` — this targets the navigation footers in source READMEs but matches *any* line starting with `>` containing "Navigation", regardless of case sensitivity in some markdown.
- **Impact:** Minor — content may have a legitimate quote containing the word "Navigation" that vanishes.
- **Fix:** Match more conservatively, e.g. `/^> \*?\*?Navigation:/i` or a sentinel like `<!-- nav -->`.

### C14. No `<meta name="theme-color">` on the dashboard

- **Where:** `build_dashboard.py:172-184`. Android Chrome's address bar stays white on light theme and grey on dark.
- **Fix:** Add `<meta name="theme-color" content="#0d1117" media="(prefers-color-scheme: dark)"><meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">`.

### C15. `og:image` missing on dashboard root as well

- **Where:** `build_dashboard.py:177-180` lists OG title/description/type/url but no image.
- **Fix:** Add a 1200×630 PNG (or SVG) at `assets/og.png` and reference it with `<meta property="og:image" content="https://vinay199129.github.io/system-design-zth/assets/og.png">`.

### C16. Inline `<style>` block of 12 KB shipped on every page

- **Where:** `build_dashboard.py:186` inlines `dashboard-src/styles.css` into `<style>` in every output. `solutions/*.html` also inlines a separate small `<style>` block (`build_dashboard.py:265-275`).
- **Impact:** No HTTP caching across the 20 solutions + dashboard. Re-downloads 12 KB CSS on every navigation.
- **Fix:** Move the dashboard CSS to `assets/dashboard.css` and link via `<link rel="stylesheet">`; cache-bust by content hash. Same for `assets/app.js`.

### C17. `redo` "Fail" button has `style="background:var(--red);color:#fff;"` overriding `.btn`

- **Where:** `dashboard-src/app.js:830`.
- **What:** Inline override duplicates `.btn-red` (`dashboard-src/styles.css:139`). Same anti-pattern as the contrast issue C7.
- **Fix:** Use `class="btn btn-red btn-sm"`.

### C18. Numeric inputs miss `inputmode`

- **Where:** `dashboard-src/layout.html:72, 76, 80, 213-215`.
- **Fix:** Add `inputmode="numeric"` so mobile keyboards present the numeric pad on `type="number"`.

### C19. `type="number"` on the estimation calc forbids exponent notation

- **Where:** `dashboard-src/layout.html:72` — placeholder is `"e.g. 100000000"` (1e8); the user typing `1e8` works in some browsers but `parseFloat` handles it (`dashboard-src/app.js:406-408`). Not broken, but worth allowing `pattern="[0-9eE.+]+"` and `type="text"` for better mobile UX.

### C20. `Mermaid 10` dark theme variables are wrong colours

- **Where:** `build_dashboard.py:193`. `primaryColor: '#161b22'` is the surface, not the primary; `lineColor: '#58a6ff'` is the accent. Diagrams have low-contrast node borders.
- **Fix:** Use a `mermaid.theme = 'base'` and explicit `primaryTextColor: '#f0f6fc'`, `primaryBorderColor: '#58a6ff'`, `secondaryColor: '#21262d'`.

---

## D. Accessibility deep dive

### Heading order

The document has three competing heading systems and they collide on the Study tab:

- Page chrome: `<h1>System Design Zero to Hero</h1>` (`dashboard-src/layout.html:9`).
- Tab headers: `<h2>Today — Day N</h2>` (`dashboard-src/layout.html:62`), `<h2>Mock Interview Timer</h2>` (`dashboard-src/layout.html:138`), `<h2>Phase Progress</h2>` (`dashboard-src/layout.html:85`), `<h2 id="study-title">Select a topic</h2>` (`dashboard-src/layout.html:38`). All `h2`s at the document root, no `<section>` wrapping — outline is flat.
- Markdown body: every README starts with `# Title` which becomes `<h1>` via `dashboard-src/app.js:166` and is styled at `dashboard-src/styles.css:175-176`. **The study page therefore renders two `<h1>`s** (page chrome + markdown title) plus the `<h2>` for `study-title`.
- Nested studies: `<h3>` from `## Section` is fine; `<h4>` from `### Subsection` is fine.

**Fix:** In `dashboard-src/app.js:166`, demote markdown `<h1>` to `<h2>`, `<h2>` to `<h3>`, etc., so the study panel preserves a single `<h1>` per page. Or strip the leading `# Heading` line that duplicates `study-title`.

### Focus management

- No `:focus-visible` rules (see A5).
- Modal opens without moving focus into it (see A6).
- After `Study.show(id)`, `document.querySelector('.study-main').scrollTop = 0` (`dashboard-src/app.js:364`) is called but focus is not moved to the new content — screen readers do not announce the change.
- Tab switching (`dashboard-src/app.js:896-901`) does not move focus to the activated panel — keyboard users have to manually re-tab into content.

### Color contrast (computed)

| Pair | Sample | Ratio | WCAG |
|---|---|---|---|
| `--text` #f0f6fc on `--bg` #0d1117 | Body | 15.7:1 | AAA |
| `--text` #1f2328 on `--bg` #ffffff (light) | Body | 15.3:1 | AAA |
| `--text2` #9198a1 on `--bg` #0d1117 | Secondary | 6.0:1 | AA |
| `--text2` #9198a1 on `--surface` #161b22 | Card secondary | 5.4:1 | AA |
| `--text2` #9198a1 on `--surface2` #21262d | Cheat signal | 4.3:1 | **fails AA 12 px** |
| `--text2` @ opacity 0.7 on `--bg` | Footer disclaimer | ~3.4:1 | **fails AA** |
| `--accent` #58a6ff on `--bg` #0d1117 | Links | 7.3:1 | AAA |
| `#fff` on `--red` #f85149 | `.btn-red` | 3.1:1 | **fails AA** |
| `#000` on `--green` #3fb950 | `.btn-green` | 8.0:1 | AAA |
| `#000` on `--accent` #58a6ff | `.btn-accent` | 6.5:1 | AAA |
| `.chip-easy` #3fb950 on effective `rgba(63,185,80,.15)` over `#0d1117` | Chip text | ~5.7:1 | AA |

Three real failures: cheat-item signal (C8), footer disclaimer (C6), `.btn-red` white-on-red (C7).

### Keyboard reachability

A keyboard-only walkthrough today:

1. Tab into the page → first focusable element is the theme-toggle `<button>` (`dashboard-src/layout.html:4`). No visible focus ring (A5).
2. Tab again → header `<a>` to GitHub portfolio (`dashboard-src/layout.html:230`). No focus ring.
3. Tab again → footer links.

The 8 tabs, 67+ sidebar items, 14 cheat items, 14 pattern stars, 5 timer mode buttons, the heatmap, and the snav-group toggles are all **unreachable**. The only interactive elements that *are* reachable are the form inputs (because they're real `<input>` / `<textarea>`) and the few `<button>` elements in `dashboard-src/layout.html`.

### ARIA usage

`rg "aria-" .` across the entire repo returns zero hits. Not a single ARIA attribute is in use. Specifically:

- No `aria-label` on the theme toggle (B7).
- No `aria-current="page"` on the active tab.
- No `aria-expanded` on the snav-group collapse triangles (`dashboard-src/app.js:311-313`).
- No `aria-live` region for the timer countdown — sighted users see the seconds tick; screen-reader users would benefit from milestone announcements (e.g. "10 minutes remaining").
- No `aria-busy` while Mermaid renders.
- No `role="status"` on the "Auto-saved to localStorage" hint (`dashboard-src/layout.html:117`).

### `prefers-reduced-motion` and `prefers-color-scheme`

Both unsupported (B1, B2). The CSS has 5 `transition:` declarations and 1 `transition: width .5s` on the progress fill (`dashboard-src/styles.css:103`). Combined with the spinning Mermaid render and tab fade-in, this is enough motion to be a problem for vestibular-sensitive users.

---

## E. SEO surface

**Common defects across all 20 `solutions/*.html` files:**

| Defect | Where | Severity |
|---|---|---|
| Entire body wrapped in `<pre><code>`; Mermaid + tables + lists unrendered | `build_dashboard.py:283`; `solutions/*.html:32-...` | P0 |
| Identical generic `og:description` on every page | `build_dashboard.py:261`; e.g. `solutions/01-url-shortener.html:10` | P1 |
| No `og:image` | `build_dashboard.py:260-262` | P1 |
| No `og:url` (canonical is set, but `og:url` is conventionally also expected) | `build_dashboard.py:260-262` | P2 |
| No `twitter:card` | `build_dashboard.py:260-262` | P2 |
| No `theme-color` | `build_dashboard.py:265-276` (inlined `<style>` instead) | P2 |
| No favicon | `build_dashboard.py:252-289` | P2 |
| No JSON-LD `Article`/`LearningResource`/`Course` | `build_dashboard.py:252-289` | P1 |
| No breadcrumb nav | `solutions/*.html:28` only has "← Back to Dashboard" | P2 |
| No cross-links to sibling designs | `solutions/*.html:234-237` only links to root & GitHub | P2 |
| Slug strips phase prefix → P4/P5 collision risk | `build_dashboard.py:244` | P2 |
| Hard-coded dark colours; ignores `prefers-color-scheme` | `solutions/*.html:14-25` | P2 |
| `<h1>` contains a nested `<span class="badge">` — fine but the badge breaks Google's heading text extraction | e.g. `solutions/01-url-shortener.html:29` | P3 |

**`sitemap.xml`:**

- `<lastmod>`, `<changefreq>`, `<priority>` absent on every entry (`sitemap.xml:3-23`). Not strictly required, but advisable so crawlers prioritise the dashboard root over leaf pages.
- The root URL is listed but `dashboard.html` is not — good, since `index.html` is canonical (but see B14 about the duplicate).

**`robots.txt`** is correct (`robots.txt:1-3`).

**Page-specific notes** (sampled — most issues are identical across pages):

- `solutions/02-youtube.html` — `<h1>YouTube / Video Streaming<span class="badge">Hard</span></h1>` (line 29) — Google indexes this as "YouTube / Video Streaming Hard". Move the badge out of the `<h1>` into a sibling element.
- `solutions/04-uber.html`, `06-google-search.html`, `09-ticket-booking.html` — same pattern; pages with "Hard" badge collapse the difficulty into the title.
- `solutions/03-rate-limiter.html:29` — badge contains "Easy-Med" with hyphen; renders fine but the keyword in `<meta name="keywords">` is `"Rate Limiter, system design, architecture, distributed systems, interview prep, Redis, Sliding Window"` — generic and stuffed; Google has ignored `<meta name="keywords">` since 2009.
- All pages have the dashboard's CSS subset only (`body`, `h1`, `h2`, `a`, `pre`, `code`, `.back`, `.badge`, `footer`) so even the rendered headings inside the wrapped `<pre>` would not get the proper styling.

---

## F. Performance

| Concern | Measurement / Where | Impact |
|---|---|---|
| Single-file payload | `dashboard.html` is 635 KB on disk (`Get-Item dashboard.html` → 635 534 bytes) | First-byte download is large; no parallelism. |
| `index.html` is byte-identical to `dashboard.html` | `build_dashboard.py:218-225` | 635 KB duplicate on Pages. |
| Inline `<style>` 12.1 KB | `dashboard-src/styles.css` (12 414 bytes) inlined at `build_dashboard.py:186` | Re-shipped on every navigation; no caching. |
| Inline `<script>` ≈ 42 KB | `dashboard-src/app.js` (42 272 bytes) inlined at `build_dashboard.py:196` | Same — no caching. |
| Inline JSON content blob | `Study.sections = JSON.stringify(STUDY, ...)` at `build_dashboard.py:167, 205` — embeds all 67+ markdown sources | ~530 KB of the 635 KB total. |
| Render-blocking Mermaid CDN | `build_dashboard.py:191` no `defer`/`async`/`integrity` | ~2.6 MB script blocks parsing of script that follows. |
| Mermaid runs only once at init, then again per `Study.show` and `DesignLab.load` | `dashboard-src/app.js:366-368, 606-608` | Acceptable but unguarded against script-not-loaded race (B12). |
| No `<link rel="preconnect">` to `cdn.jsdelivr.net` | `build_dashboard.py:172-184` | Adds ~150 ms DNS + TLS to first paint. |
| localStorage writes are synchronous and serialise the entire state on every keystroke | `dashboard-src/app.js:373, 613` | Typing jank potential (B13). |
| 20 SEO landing pages each inline ~700 bytes of duplicate CSS | `build_dashboard.py:265-275` | 14 KB duplicate across pages — minor. |
| No service worker / no offline cache | none | Page reloads always hit network. |
| No image assets, no fonts | `<link rel="icon" href="data:image/svg+xml,...">` only | This is good: zero render-blocking image/font requests. |

**Recommended render path:**

1. `<head>` → `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>`.
2. Load CSS via `<link rel="stylesheet" href="assets/dashboard.css">` (cacheable).
3. Mermaid via `<script defer src="..." integrity="..." crossorigin="anonymous">`.
4. App JS via `<script type="module" defer src="assets/app.js">`.
5. Study content fetched per-section on demand.

Estimated First Contentful Paint improvement on cold cache 3G: 2.5 s → 0.8 s.

---

## G. Encoding / Mojibake

Full scan over 127 source files (HTML / CSS / JS / MD / XML / TXT, excluding `.git/`):

| Check | Result |
|---|---|
| U+FFFD (`�`) replacement characters | **0** occurrences |
| UTF-8 BOM (EF BB BF) at file start | **0** files |
| `â€"` / `â€™` / `â€œ` / `Ã©` / `Ã¢` mojibake sequences | **0** files |

The codebase is clean. `dashboard-src/layout.html:9, 45-52, 156-160, 165, 167-171, 199-203, 228-237` use HTML entities (`&copy;`, `&middot;`, `&#9679;`, `&#9675;`, `&#10003;`, `&larr;`) explicitly which is robust against any future encoding mishap. The python build also opens files with `encoding='utf-8'` (`build_dashboard.py:18, 220, 224, 292, 306, 314`) and writes the same. No issue here.

One small note: source markdown uses `--` (double-hyphen) consistently as a poor-man's em-dash (e.g. `phase-0-framework/...`, `solutions/01-url-shortener.html:6` `"URL Shortener (TinyURL) -- System Design Solution"`). Modern Markdown processors are configurable to auto-convert this to `—`; the dashboard's renderer does not. This is stylistic, not a bug.

---

## H. Numbered fix list (consolidated, priority-ordered)

1. **(A1, P0)** Convert tabs to `<button role="tab">` inside `<nav role="tablist">`; add keyboard arrow-key handler; mark panels with `role="tabpanel"`. — `dashboard-src/layout.html:21-30`, `dashboard-src/app.js:896-901`.
2. **(A2, P0)** Rewrite the timer to use a `Date.now()` deadline + `visibilitychange` rebase + `navigator.wakeLock`. — `dashboard-src/app.js:699-737`.
3. **(A3, P0)** Replace `alert('Time is up!')` with toast + audio + Notification API. — `dashboard-src/app.js:716`.
4. **(A4, P0)** Render `solutions/*.html` bodies as real HTML (Mermaid + tables + lists), not `<pre><code>`. — `build_dashboard.py:282-283`.
5. **(A5, P0)** Add a global `:focus-visible` ring in `dashboard-src/styles.css`. — `dashboard-src/styles.css` (no existing rule to edit; append).
6. **(A6, P0)** Add `role="dialog"`, focus trap, Escape handler, and Cancel button to the Profile overlay. — `dashboard-src/app.js:62-114`.
7. **(A7, P0)** Land users on the Today / Overview tab, or render today's checklist inside the Study placeholder. — `dashboard-src/layout.html:22, 41-54`.
8. **(A8, P0)** Wrap regions in `<main>`, `<nav>`, `<aside>`; add a skip link. — `dashboard-src/layout.html:5, 21, 35`.
9. **(B1, P1)** Detect `prefers-color-scheme` in `Theme.init` and subscribe to changes. — `dashboard-src/app.js:6-31`.
10. **(B2, P1)** Add a `@media (prefers-reduced-motion: reduce)` block that zeroes transitions/animations. — `dashboard-src/styles.css`.
11. **(B3, P1)** Add `color-scheme: dark/light` to `:root` and `[data-theme="light"]`. — `dashboard-src/styles.css:7, 24`.
12. **(B4, P1)** Re-initialise Mermaid on theme toggle. — `dashboard-src/app.js:15-25`.
13. **(B5, P1)** Add `defer integrity crossorigin` to the Mermaid `<script>`, or vendor it. — `build_dashboard.py:191`.
14. **(B6, P1)** Associate every `<label>` with its `<input>` via `for=` / `id=`. — `dashboard-src/layout.html:71-80, 213-215`; `dashboard-src/app.js:72, 76, 80, 88, 96`.
15. **(B7, P1)** Add `aria-label` and `aria-pressed` to the theme toggle. — `dashboard-src/layout.html:4`; `dashboard-src/app.js:26-29`.
16. **(B8, P1)** Convert clickable `<div>` / `<span>` to `<button>` (snav-group, sidebar item, heatmap cell, star rating). — `dashboard-src/app.js:313, 317, 518, 668`; `dashboard-src/layout.html:10`.
17. **(B9, P1)** Add `type="button"` to every `<button>` and migrate inline `onclick` to delegated listeners. — `dashboard-src/layout.html:4, 142-148, 183, 221-222`; `dashboard-src/app.js:109-110, 305-306, 359, 530-532, 829-830, 844`.
18. **(B10, P1)** Use the `hidden` attribute on inactive tab panels. — `dashboard-src/styles.css:83-84`, `dashboard-src/app.js:896-901`.
19. **(B11, P1)** Replace fixed `max-height: 80vh` and 250 px mobile cap with `calc(100vh - 140px)` and a collapsible mobile sidebar. — `dashboard-src/styles.css:146, 304`.
20. **(B12, P1)** Defer the first `mermaid.run` until the CDN script has loaded. — `build_dashboard.py:211-214`.
21. **(B13, P1)** Debounce note auto-save by 250 ms. — `dashboard-src/app.js:373, 613`.
22. **(B14, P1)** Collapse `index.html` and `dashboard.html` to a single file. — `build_dashboard.py:218-225`.
23. **(B15, P1)** Fix SEO: per-page `og:description`, `og:image`, JSON-LD Article, breadcrumbs, related-design rail, favicon, theme-color, twitter:card; namespace the slug with phase. — `build_dashboard.py:244-289`.
24. **(B16, P1)** On `max-width: 600px`, render the tabs as a `<select>` or add a scroll-hint shadow. — `dashboard-src/styles.css:302-309`.
25. **(B17, P1)** Persist tab + study-section selection to `location.hash` and restore on load. — `dashboard-src/app.js:896-901, 341-368`.
26. **(B18, P1)** Lazy-load per-section markdown instead of inlining all 67+ sections into one JSON blob. — `build_dashboard.py:167, 205`.
27. **(C1, P2)** Remove dead `.chip-easy-med` rule or fix the JS class derivation. — `dashboard-src/styles.css:129`; `dashboard-src/app.js:558`.
28. **(C2, P2)** Render star-rating as proper buttons with `aria-label` and `aria-pressed`. — `dashboard-src/app.js:667-670`.
29. **(C3, P2)** Backdrop-click closes the Profile modal (except on first-run). — `dashboard-src/app.js:64-66`.
30. **(C4, P2)** Convert header greeting to a `<button aria-label="Edit profile">`. — `dashboard-src/layout.html:10`.
31. **(C5, P2)** Underline footer links in the SEO template. — `build_dashboard.py:275` (inlined CSS).
32. **(C6, P2)** Remove `opacity: 0.7` from the footer disclaimer. — `dashboard-src/layout.html:235`.
33. **(C7, P2)** Bump `--red` to `#c43c2e` or switch `.btn-red` text to `#000`. — `dashboard-src/styles.css:17, 139`.
34. **(C8, P2)** Use `var(--text)` for `.cheat-item .signal` or lighten to `#b1b8c1`. — `dashboard-src/styles.css:254`.
35. **(C10, P2)** Wrap raw `<table class="tbl">` blocks outside `.md` in an `overflow-x:auto` container. — `dashboard-src/layout.html:95-98, 153-162, 198-205`.
36. **(C11, P2)** Cap the profile start-date with `max=` today. — `dashboard-src/app.js:97`.
37. **(C12, P2)** Persist last-active tab to `localStorage`. — `dashboard-src/app.js:896-901`.
38. **(C13, P3)** Tighten the "Navigation" line-stripping regex. — `dashboard-src/app.js:140`.
39. **(C14, P2)** Add `<meta name="theme-color">` (dark + light). — `build_dashboard.py:172-184`.
40. **(C15, P2)** Add `og:image`. — `build_dashboard.py:172-184`.
41. **(C16, P2)** Externalise CSS/JS to `assets/` and link them; let the browser cache. — `build_dashboard.py:185-217`.
42. **(C17, P3)** Replace inline-styled "Fail" button with `class="btn btn-red btn-sm"`. — `dashboard-src/app.js:830`.
43. **(C18, P3)** Add `inputmode="numeric"` to numeric inputs. — `dashboard-src/layout.html:72, 76, 80, 213-215`.
44. **(C20, P2)** Fix the Mermaid `themeVariables` mapping. — `build_dashboard.py:193`.
45. **(D heading, P1)** Demote markdown `<h1>` → `<h2>` in the renderer so the Study tab has exactly one H1. — `dashboard-src/app.js:166`.
46. **(D focus, P1)** After tab/section switch, move keyboard focus to the new region's heading. — `dashboard-src/app.js:341-368, 896-901`.
47. **(D aria-live, P2)** Add a polite `aria-live` region for timer milestone announcements (10/5/1 min remaining). — `dashboard-src/layout.html:139-149`; `dashboard-src/app.js:760-772`.

---

## Methodology

**Files fully read:**

- `dashboard-src/styles.css` (310 lines)
- `dashboard-src/layout.html` (240 lines)
- `dashboard-src/app.js` (933 lines, read in three ranges: 1-200, 200-500, 500-900, 900-933)
- `build_dashboard.py` (320 lines)
- `solutions/01-url-shortener.html` (239 lines, end-to-end)
- `sitemap.xml` (25 lines)
- `robots.txt` (4 lines)

**Files spot-sampled:**

- `dashboard.html` lines 1-30 and selected lines via grep (1291 alert site, 571 CDN script, 573 Mermaid init, 941-942 Mermaid run) — verified the inlining matches `build_dashboard.py`.
- All 20 `solutions/*.html` files via `rg` for `og:image|description|canonical|<h1>` to confirm uniform defects.

**Tools run:**

- `rg "aria-|tabindex|role=|prefers-color-scheme|prefers-reduced-motion|color-scheme" dashboard-src/` → 0 hits.
- `rg "alt=|<img|<svg" dashboard-src/` → 0 hits.
- `rg "<button" dashboard-src/` → 18 hits, none with `type=`.
- `rg "focus|:focus|outline" dashboard-src/` → only variable-name false positives (`_fi`, `focus-btn`, `focus-timer`), no CSS focus rule.
- `rg "alert\(" .` → 1 source occurrence (`dashboard-src/app.js:716`) + 2 generated copies.
- `rg "href=\"#\"|href=\"\"" .` → 0 hits.
- `rg "prefers-color-scheme|prefers-reduced-motion|color-scheme|og:image|schema.org|application/ld" solutions/` → 0 hits.
- PowerShell byte scan over 127 files for U+FFFD and UTF-8 BOM → 0 hits.
- PowerShell text scan over 127 files for mojibake sequences (`â€"`, `Ã©`, etc.) → 0 hits.

**What was inferred vs verified:**

- Colour-contrast ratios were computed from `dashboard-src/styles.css` variables using standard sRGB-to-relative-luminance formulas; not measured in a browser.
- Mobile breakpoint behaviour was inferred from the single `@media (max-width: 900px)` block (`dashboard-src/styles.css:302-309`); not tested in DevTools device emulation.
- Mermaid CDN script size (~2.6 MB) is from the public file on jsdelivr; not measured live.
- Timer drift behaviour on mobile is a known platform limitation of `setInterval` in backgrounded tabs; not reproduced in a phone test for this audit.
- All file-path citations are relative to `C:\Project Files\system-design-zth\`.

**Total findings: 47** (P0 × 8, P1 × 18, P2 × 17, P3 × 4).
