# System Design ZTH — Learner Journey Design Doc

> **Goal:** Turn the dashboard from "here are 7 phase cards + a row of tabs
> (Study / Designs / Design Lab / Timer / Redo Queue)" into a guided
> **"today, Day N — design X next"** experience that adapts to the learner's
> design experience, pace, and progress across the 60-day track.
>
> **Scope:** Onboarding form, home page redesign, build-time
> `daily-schedule.md` parser, persistent "what next" recommender, and the
> per-design 45-minute RESHADED-stage timer. Implementation deferred — this
> doc is the spec.
>
> **Files cited** are relative to repo root `C:\Project Files\system-design-zth`.
> Line numbers reference current `main` at the time of writing.
>
> **Mirrors:** `dsa-zth/.audit/learner-journey-design.md`. Where component
> names exist over there (e.g. `HeroDay`, `TodayPlan`, `ResumeCTA`, `UpNext`,
> `RedoStrip`, `LevelBanner`, `CourseMap`, `getNextRecommendation`,
> `journey.ts`), **keep them identical** so the two codebases stay in sync.

---

## 0. Current State (1-paragraph recap)

- **Content lives as markdown** in 7 phase folders at the repo root:
  - `phase-0-framework/` — 4 files: `README.md`, `how-to-approach.md`,
    `estimation-cheatsheet.md`, `requirements-gathering.md`.
  - `phase-1-building-blocks/01..09` — 9 modules (DNS, load balancing,
    caching, SQL, NoSQL, queues, blob/CDN, API design, proxies). Each has
    `README.md` + an (often empty) `case-studies/` directory.
  - `phase-2-distributed-concepts/01..07` — 7 modules (scalability,
    partitioning, replication, consistency, rate limiting, IDs, consensus).
    Same `README.md` + `case-studies/` shape.
  - `phase-3-design-patterns/01..08` — 8 modules (fan-out, event-sourcing,
    pub/sub, circuit-breaker, saga, sharding, cache patterns,
    answer-template). Same shape.
  - `phase-4-classic-starter/01..10` — 10 starter designs (URL shortener,
    pastebin, rate limiter, KV store, ID generator, web crawler,
    notifications, chat, news feed, typeahead). Each has `README.md`,
    `problem.md`, `solution.md`.
  - `phase-5-classic-advanced/01..10` — 10 advanced designs (Instagram,
    YouTube, Twitter, Uber, Dropbox, Google Search, distributed cache,
    payment, ticket booking, Google Maps). Same triple-file shape.
  - `phase-6-mock-interviews/README.md` — narrative-only; mocks are
    free-form sessions.
- **Schedule** is `daily-schedule.md` at repo root — one big markdown file,
  one table per 7-day "week" (9 weeks, Days 1–60). Each row is
  `| Day | Phase | Topics | Tasks | Time |` where `Tasks` is prose like
  `(R) Module README, (P) design schema for a social network` and uses the
  legend (R)/(P)/(V) from `daily-schedule.md:5–9`.
- **Existing dashboard** (`dashboard.html`, built from `dashboard-src/` by
  `build_dashboard.py`) exposes 5 tabs per `setup.md:23–31`:
  Study / Designs / Design Lab / Timer / Redo Queue. The 45-minute timer is
  already a tab in isolation; this redesign embeds it **per-design** so it
  follows the user through the answer template, not as a separate stopwatch.
- **No profile, no day-awareness yet.** The dashboard greets every visitor
  identically with the 7-phase grid and the static "How to Use" steps
  (`setup.md:23`). Nothing adapts to who you are or where you are.
- **The redo queue** today is a static markdown file (`redo-queue.md`) and a
  dashboard tab — it does *not* fire spaced-repetition reminders. Round 4b
  introduces a live `[1, 3, 7, 14]` queue for concepts and `[7, 21, 60]` for
  designs (see §5).

This document specifies the Next.js (`web/`) rebuild that mirrors dsa-zth's
home redesign, adapted to the **triple-tier content model**
(study-section / case-study / design-drill) and the **45-min RESHADED
stage timer**.

---

## 1. Onboarding Adjustments

The current `dashboard.html` profile dialog asks 3 fields (name, target
company, experience level). The new Next.js `ProfileForm`
(`web/src/components/ProfileForm.tsx`, to be created in Round 4a) asks 5
core fields — name, target, level, hours, startDate — exactly mirroring
dsa-zth. This section adds **3 new fields**, **1 derived signal**, and a
**diagnostic mode** for advanced learners.

### 1.1 New fields

| Field | Type | Why | UI |
|---|---|---|---|
| `priorExperience` | `'none' \| 'component-level' \| 'system-level' \| 'led-design'` | Disambiguates "advanced — I just took a Coursera class" from "advanced — I led the architecture for our payments service for 3 years". Drives the diagnostic-mode toggle (§2.4) and the LevelBanner copy. | Radio group, 4 options, paired with `level` in step 2. |
| `targetDate` | `string` (ISO yyyy-mm-dd) or `''` | The actual interview/onsite/deadline. If set, every page shows "X days until target" and warns when the chosen `hours` track won't fit. If empty, fall back to startDate + 60 / 90 / 45 days based on hours. | `<input type="date">`, hint "When's your interview? Leave blank if open-ended." |
| `studyStyle` | `'designs-first' \| 'theory-first' \| 'mixed'` | Reorders the daily plan: `designs-first` jumps straight into Phase 4 with only the bare-minimum modules pre-read; `theory-first` finishes Phase 1–3 fully before any Phase 4 design; `mixed` (default) follows `daily-schedule.md` verbatim. | Radio group. Default `'mixed'`. |

### 1.2 Derived signals (not stored, computed at runtime)

- `inferredTrack: 'intensive' | '60-day' | '90-day'` — already derivable
  from `hours`: 4h → intensive (≈45 days), 2h → 60-day (the schedule as
  written), 1h → 90-day. Surface it on the form as a read-only chip
  ("Track: 60 days, ~3h/day mornings recommended").
- `daysUntilTarget`: if `targetDate` set, compute and **warn** if the
  selected `hours` track won't fit. Specifically:
  - If `daysUntilTarget < 45` and `hours < 4` → amber chip on hero.
  - If `daysUntilTarget < 25` regardless of hours → red chip + suggest
    `studyStyle: 'designs-first'` to skip ahead.
- `diagnosticEligible`: `priorExperience ∈ {'system-level', 'led-design'}`
  OR `level === 'advanced'`. Drives the LevelBanner amber variant (§2.4).

### 1.3 Schema migration

Update `UserProfile` in `web/src/lib/profile.ts` (to be created in
Round 4a):

```ts
export type DesignExperience =
  | 'none'              // never designed a system end-to-end
  | 'component-level'   // built features but not full systems
  | 'system-level'      // designed services at work
  | 'led-design';       // led architecture for a team

export type StudyStyle = 'designs-first' | 'theory-first' | 'mixed';

export interface UserProfile {
  name: string;
  target: string;            // e.g. "Google L5 system design round"
  level: ExperienceLevel;    // beginner / intermediate / advanced
  hours: DailyHours;         // 1 | 2 | 4
  startDate: string;         // ISO yyyy-mm-dd
  // NEW (all optional for back-compat with profiles saved before Round 4b):
  priorExperience?: DesignExperience;
  targetDate?: string;       // ISO or ''
  studyStyle?: StudyStyle;
  effectiveStartDay?: number; // diagnostic skip — default 1
}
```

`ProgressProvider` already normalizes legacy state (cf. dsa-zth
`ProgressProvider.tsx:40–49`); `ProfileProvider` must do the same — treat
missing fields as `undefined`, never crash on profiles saved by Round 4a.

### 1.4 Onboarding flow (2-step modal)

`ProfileOnboarding.tsx` is a single modal that internally tracks
`step: 1 | 2`. Same pattern as dsa-zth. Each step has Back/Next; only
"Start learning" submits.

**Step 1 — Who & when**
- `name` (text)
- `target` (text — interview / company / role)
- `targetDate` (date input, optional)
- `startDate` (date input, default today)

**Step 2 — Design experience**
- `level` (radio: beginner / intermediate / advanced)
- `priorExperience` (radio: none / component-level / system-level / led-design)
  with hint text under each:
  - **none**: "I've heard of REST and caches but never sketched a system."
  - **component-level**: "I've built API endpoints, schemas, or microservices, but the boxes-and-arrows view of a whole product is new."
  - **system-level**: "I've designed services end-to-end at work, picked databases, owned an SLA."
  - **led-design**: "I've led architecture reviews and made cross-team trade-off calls."
- `hours` (radio: 1h / 2h / 4h)
- `studyStyle` (radio: theory-first / mixed / designs-first)

**Live derived chip** beneath step 2:
`Track: 60 days · ~10 weeks · finishes <date>`. Recomputes on every change.

`ProfileForm` (used on `/profile` settings page) stays one-shot — all 8
fields in a single column. Reuse `<Field>` row primitives from dsa-zth so
visual parity is automatic.

### 1.5 Adaptive defaults

In step 2:
- If `priorExperience === 'none'` → force `level: 'beginner'` and **disable**
  the "skip Phase 0" suggestion in the LevelBanner. Phase 0 is non-skippable
  for true beginners — `how-to-think.md` and `estimation-cheatsheet.md` are
  the foundation everything else assumes.
- If `priorExperience === 'system-level'` OR `'led-design'` → surface the
  **Diagnostic Mode** toggle (§2.4) inline under the radio group:
  "Skip ahead? Take a 5-design diagnostic (~25 min)."
- If `studyStyle === 'designs-first'` → injected note: "You'll see Phase 4
  drills starting Day 5. Theory modules will be linked inline, not assigned
  separately. You can switch back any time on `/profile`."

---

## 2. Home Page Redesign

Replace `web/src/app/page.tsx` (currently mirrors dsa-zth: hero + 7 phase
grid + bullets) with a day-aware dashboard. The 7 phase cards move
**below the fold** as a `<CourseMap>` reference. The existing 5 dashboard
tabs from `setup.md:23–31` get folded as follows:

| Old tab | New home (in-page) |
|---|---|
| Study | `<TodayPlan>` (today's reading) + `<UpNext>` + `<CourseMap>` |
| Designs | `<TodayPlan>` (today's drill) + `/progress` design coverage matrix |
| Design Lab | Inline on each design-drill page (no longer a top-level tab) |
| Timer | Embedded into every design-drill page as `<DesignTimer>` (§6) |
| Redo Queue | `<RedoStrip>` on home + dedicated `/redo` page |

### 2.1 Component anatomy (new)

| New component | File | Responsibility |
|---|---|---|
| `<HeroDay>` | `web/src/components/home/HeroDay.tsx` | Top hero. "Hi <Name>, Day N of T." Subline: days-until-target + on-track / behind chip. |
| `<TodayPlan>` | `web/src/components/home/TodayPlan.tsx` | Today's items from `schedule.json`. Renders each as a row with type-pill (reading / case-study / design-drill / mock-interview), title, est. time, status pill, "Open →". |
| `<ResumeCTA>` | `web/src/components/home/ResumeCTA.tsx` | "Resume where you left off" — last-touched item. Reuses `getNextRecommendation` for its label. |
| `<UpNext>` | `web/src/components/home/UpNext.tsx` | Compressed cards for the next 2–3 days. |
| `<RedoStrip>` | `web/src/components/home/RedoStrip.tsx` | Inline overdue redo callout (only if queue has overdue). |
| `<LevelBanner>` | `web/src/components/home/LevelBanner.tsx` | Level-adaptive callout (skip-Phase-0, diagnostic offer, target-date overrun). |
| `<CourseMap>` | `web/src/components/home/CourseMap.tsx` | The 7-phase grid, demoted and collapsed by default. Reuses existing `<PhaseCard>`. |

`<PhaseCard>` stays as-is and is reused inside `<CourseMap>`.

### 2.2 Layout (top to bottom)

```
+---------------------------------------------------+
| HERO: "Hi <Name>, Day 7 of 60"                    |   <HeroDay>
|   subline: "23 days until Google, on track ✓"     |
+---------------------------------------------------+
| OVERDUE REDO (only if redoQueue has overdue)      |   <RedoStrip>
|   "2 designs overdue · re-sketch first"           |
+---------------------------------------------------+
| LEVEL BANNER (conditional)                        |   <LevelBanner>
|   advanced: "Skip Phase 0–2? Take the diagnostic" |
+---------------------------------------------------+
| TODAY                                             |   <TodayPlan>
|   Phase 1 · Caching                               |
|   ▢ (R) Module README           ~45 min  [unseen] |
|   ▢ (P) Design cache layer for  ~90 min  [unseen] |
|       a read-heavy app                            |
|   ▢ (V) Re-skim load-balancing  ~20 min  [done]   |
|   ----                                            |
|   Progress: 1/3 · 1h 5m of 2h 35m                 |
|   [Resume: design cache layer →]                  |
+---------------------------------------------------+
| UP NEXT                                           |   <UpNext>
|   Day 8 — Databases SQL  (3 hrs, 1 drill)         |
|   Day 9 — Databases NoSQL (3 hrs, 1 drill)        |
+---------------------------------------------------+
| COURSE MAP (collapsed by default)                 |   <CourseMap>
|   ▸ All 7 phases · 20 designs · 24 patterns       |
+---------------------------------------------------+
```

### 2.3 Three pristine wireframes

#### State A — No profile yet (onboarding modal up; home is the backdrop)

```
+---------------------------------------------------+
| System Design Crash Course                        |
| 60-day track · 20 classic designs · 24 patterns   |
|                                                   |
| Structured, hands-on path from "what is a load    |
| balancer?" to leading a 45-min design round.      |
|                                                   |
| [Start studying →]  [Browse all designs]          |
+---------------------------------------------------+
| What you'll get:                                  |
|   ✓ A day-by-day plan tailored to your hours      |
|   ✓ RESHADED framework drilled in 45-min reps     |
|   ✓ 20 classic designs (Phase 4–5) with rubrics   |
|   ✓ 1-3-7-14 spaced-repetition for concepts       |
|   ✓ 7-21-60 long-form redo for full designs       |
|   ✓ Progress tracked locally, no signup           |
+---------------------------------------------------+
| Sample week (what your Day 33 looks like):        |
|   Phase 4 · URL Shortener — full design from      |
|   scratch with the 45-min stage timer (3.5 hrs)   |
+---------------------------------------------------+
| Course map · 7 phases                             |
|   [P0 Framework] [P1 Blocks] [P2 Distributed]     |
|   [P3 Patterns]  [P4 Starter] [P5 Advanced]       |
|   [P6 Mocks]                                      |
+---------------------------------------------------+
```

The onboarding modal floats above. No "Today" because Day = 0.

#### State B — Day 1, profile saved, nothing touched

```
+---------------------------------------------------+
| Welcome, Vinay. Day 1 of 60.                      |
| 60 days until Google interview · just started     |
+---------------------------------------------------+
| Today — Phase 0, Framework                        |
|   ▢ (R) how-to-think.md (full)         ~45 min    |
|       Learn RESHADED — the 8-step,                |
|       45-minute structure for every design.       |
|   ▢ (R) plan.md                        ~20 min    |
|       Skim the 60-day roadmap and how the         |
|       phases stack.                               |
|   ▢ (R) estimation-cheatsheet.md       ~30 min    |
|       Read once now; you'll reference it daily.   |
|                              total: ~2 hrs        |
|                                                   |
|   [Start Day 1 →]                                 |
+---------------------------------------------------+
| Up next                                           |
|   Day 2 — Estimation (3 hrs, 3 problems)          |
|   Day 3 — Requirements (3 hrs, 2 examples)        |
+---------------------------------------------------+
| ▸ Course map (7 phases)                           |
+---------------------------------------------------+
```

No redo strip (queue empty). No "Resume" CTA (nothing touched). Level
banner fires only for advanced + (system-level | led-design) users.

#### State C — Day 33, mid-Phase-4, some struggled designs

```
+---------------------------------------------------+
| Day 33 of 60. 45% complete (9/20 designs sketched)|
| 27 days until Google · on track ✓                 |
+---------------------------------------------------+
| ⚠ 2 designs overdue for redo                      |
|   [URL Shortener (5d overdue, 1st redo)]          |
|   [Rate Limiter (2d overdue, 1st redo)]           |
|   → Re-sketch each in 20-30 min using RESHADED    |
+---------------------------------------------------+
| Today — Phase 4 · URL Shortener                   |
|   ✓ (R) README skim              (10m) [done]     |
|   ✓ (R) problem.md               (10m) [done]     |
|   ▢ (P) Full design from scratch (45m) [unseen] → |
|         RESHADED · 5 stages                       |
|         R 5m · E 5m · S 3m · H 10m · A 5m         |
|         D 12m · E 3m · D 2m                       |
|   ▢ (V) Compare with solution.md (30m) [unseen]   |
|   Progress: 2/4 · 20m of 1h 35m                   |
|                                                   |
|   [Resume: Full design from scratch →]            |
+---------------------------------------------------+
| Up next                                           |
|   Day 34 — Pastebin (3 hrs, 1 drill)              |
|   Day 35 — Rate Limiter + Review (3.5 hrs)        |
+---------------------------------------------------+
| ▸ Course map · you're in Phase 4 (5 of 7)         |
+---------------------------------------------------+
```

### 2.4 Level adaptation & Diagnostic Mode

Live in a new helper `web/src/lib/journey.ts` (see §4) so the home page and
study sidebar share them.

| Profile signal | Behaviour |
|---|---|
| no profile | State A. All copy generic. |
| `level: 'beginner'` OR `priorExperience: 'none'` | `LevelBanner` green: "Phase 0 is short but essential — don't skip." Today's plan **always** follows `daily-schedule.md` exactly. |
| `level: 'intermediate'` | No banner. Plan follows schedule. |
| `level: 'advanced'` AND `priorExperience ∈ {system-level, led-design}` | `LevelBanner` amber: "Want to skip ahead? Take the 5-design diagnostic (~25 min)." |
| `targetDate` set AND `daysUntilTarget < daysRemainingOnTrack` | `HeroDay` subline amber: "You picked the 60-day track but only have 30 days. Bump hours to 4/day or switch to designs-first." |
| `studyStyle: 'designs-first'` | TodayPlan reorders: design-drills float to top, theory readings move to a collapsed "Reference" group beneath. |
| `studyStyle: 'theory-first'` | TodayPlan reorders: readings + case-studies first; design-drills only surface after all Phase 1–3 items for the week are marked `done`. |

**Diagnostic Mode** (the analog of dsa-zth's 10-medium diagnostic):
- Present **5 design prompts**, each with a 5-minute self-rated rubric.
  Example prompts (one per category):
  1. *Easy starter:* "Sketch a URL shortener for 100 M URLs in 5 minutes —
     just the box diagram and the key generation choice."
  2. *Estimation:* "Estimate the storage and QPS for a Twitter-like service
     at 500 M DAU."
  3. *Trade-off:* "Pick SQL vs NoSQL for a social-network newsfeed and
     defend the choice in 3 sentences."
  4. *Pattern:* "Describe fan-out-on-write vs fan-out-on-read in one
     paragraph with one workload that suits each."
  5. *Failure case:* "Your distributed cache loses a node mid-traffic.
     Walk through the impact and remediation."
- User self-marks each `green` (felt confident) / `amber` (got there but
  slow) / `red` (stuck).
- Scoring:
  - 4+ green → set `effectiveStartDay = 25` (skip into Phase 3 / late
    Phase 2). Hide Phase 0–1 in CourseMap (still browsable via direct URL).
  - 2–3 green → set `effectiveStartDay = 15` (skip Phase 0–1).
  - 0–1 green → leave at `1`, suggest the user keep `level: 'intermediate'`.
- `daysSinceStart` is **not** modified; instead `currentScheduleDay(profile)`
  returns `daysSinceStart(profile) + (effectiveStartDay - 1)`.

### 2.5 Day-0 / no-profile handling

`<HeroDay>` checks `hydrated && profile` before rendering personalized
copy. Until hydrated, render skeleton bars matching final layout so we
avoid CLS on first paint. When `!profile`, render State A.

---

## 3. Build-time daily-schedule parser

### 3.1 Source: `daily-schedule.md`

The schedule is **9 weekly tables** of the shape:

```
| Day | Phase | Topics             | Tasks                          | Time |
|-----|-------|--------------------|--------------------------------|------|
|  33 | P4    | URL Shortener      | (P) Full design from scratch.. | 3.5h |
```

with `(R)` / `(P)` / `(V)` prefixes per `daily-schedule.md:5–9`. Phase
column uses `P0..P6`. Topics maps to either a Phase 0–3 module or a
Phase 4–5 design slug. Tasks is prose with the (R/P/V) markers and any
inline file references (e.g. `how-to-think.md`, `estimation-cheatsheet.md`,
`Module README`). Days are always single (no ranges like dsa-zth has) —
the 60 rows are literally numbered 1..60.

### 3.2 Output: `web/src/generated/schedule.json` schema

```ts
// web/src/generated/types.ts (add to existing)

export type ItemType =
  | 'reading'         // (R) — a markdown file or module README
  | 'case-study'      // (P) sub-section within a Phase 1–3 module
  | 'design-drill'    // (P) full Phase 4–5 design with the 45-min timer
  | 'mock-interview'  // (P) Phase 6 timed full round
  | 'review';         // (V) revisit / weekly retro

export interface ScheduleItem {
  type: ItemType;
  id: string;                  // stable slug; resolves into content.json / designs.json
  title: string;               // human-readable
  estimatedMinutes: number;    // sum of stages for design-drills (= 45)
  prerequisite?: string[];     // other item ids that must be 'done' first
  /** Only present on design-drills — the 5-stage breakdown the timer uses. */
  stages?: DesignStage[];
  /** Only present on readings — the markdown path relative to repo root. */
  source?: string;
}

export interface DesignStage {
  /** 'R' | 'E' | 'S' | 'H' | 'A' | 'D' | 'E2' | 'D2' — RESHADED letters */
  key: string;
  label: string;               // "Requirements", "Estimation", ...
  minutes: number;             // matches templates/answer-template.md
}

export interface ScheduleDay {
  day: number;                 // 1..60
  dateOffset: number;          // = day - 1, used to compute calendar dates client-side
  phase: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
  phaseTitle: string;          // "Framework", "Building Blocks", ...
  theme: string;               // raw "Topics" column ("Caching", "URL Shortener")
  items: ScheduleItem[];
  /** Total time as parsed from the "Time" column. Falls back to sum(items). */
  totalMinutes: number;
  /** Raw markdown row for fallback display + debugging. */
  rawRow: string;
}

export type Schedule = ScheduleDay[];
```

The "triple-tier" mapping is enforced in `type`:
- Phase 0 readings → `'reading'`, `source` points at the actual md file.
- Phase 1–3 (R) → `'reading'` for the module README, plus zero-or-more
  `'case-study'` items per `(P)` task (the future content of each module's
  `case-studies/` directory).
- Phase 4–5 (P) → `'design-drill'` with the full 8-stage RESHADED breakdown
  attached (§6.1).
- Phase 6 (P) → `'mock-interview'`. Phase 6 (V) → `'review'`.

### 3.3 Parser pseudo-code — `web/scripts/extract-schedule.mjs`

Mirror the style of `extract-content.mjs` (same imports, same `REPO_ROOT`).
Wire into the existing `predev` / `prebuild` scripts in `web/package.json`
so it runs on every dev/build alongside content extraction. Recommended:
merge into `extract-content.mjs` — one pre-build script is simpler.

```js
const PHASE_TITLES = {
  P0: 'Framework',
  P1: 'Building Blocks',
  P2: 'Distributed Concepts',
  P3: 'Design Patterns',
  P4: 'Classic Starter',
  P5: 'Classic Advanced',
  P6: 'Mock Interviews',
};

const RESHADED_STAGES = [
  { key: 'R',  label: 'Requirements',     minutes: 5  },
  { key: 'E',  label: 'Estimation',       minutes: 5  },
  { key: 'S',  label: 'Storage',          minutes: 3  },
  { key: 'H',  label: 'High-level Design',minutes: 10 },
  { key: 'A',  label: 'API Design',       minutes: 5  },
  { key: 'D',  label: 'Detailed Design',  minutes: 12 },
  { key: 'E2', label: 'Evaluation',       minutes: 3  },
  { key: 'D2', label: 'Deployment',       minutes: 2  },
]; // total: 45 — matches templates/answer-template.md:1–160 and how-to-approach.md:11–18

function parseSchedule(md, allReadings, allDesigns, allModules) {
  const days = [];
  for (const table of extractTables(md)) {           // 9 tables, one per week
    for (const row of tableRows(table)) {
      const [dayCell, phaseCell, topicCell, tasksCell, timeCell] = row;
      const day = Number(dayCell.trim());
      if (!Number.isFinite(day)) continue;

      const phase = phaseCell.trim();                // "P0".."P6"
      const theme = topicCell.trim();
      const tasks = splitTasks(tasksCell);           // splits on ", (" boundaries
      const items = [];

      for (const task of tasks) {
        const marker = task.match(/^\((R|P|V)\)\s*/)?.[1];
        const body   = task.replace(/^\((R|P|V)\)\s*/, '').trim();

        if (marker === 'V') {
          items.push(makeReview(phase, theme, body));
          continue;
        }
        if (marker === 'R') {
          items.push(resolveReading(phase, theme, body, allReadings, allModules));
          continue;
        }
        if (marker === 'P') {
          if (phase === 'P4' || phase === 'P5') {
            items.push(makeDesignDrill(phase, theme, body, allDesigns));
          } else if (phase === 'P6') {
            items.push(makeMockInterview(theme, body));
          } else {
            items.push(makeCaseStudy(phase, theme, body, allModules));
          }
        }
      }

      const totalMinutes = parseTime(timeCell) ?? items.reduce((s, i) => s + i.estimatedMinutes, 0);
      days.push({
        day,
        dateOffset: day - 1,
        phase,
        phaseTitle: PHASE_TITLES[phase],
        theme,
        items,
        totalMinutes,
        rawRow: row.join(' | '),
      });
    }
  }
  days.sort((a, b) => a.day - b.day);
  assertNoGaps(days, 1, 60);
  return days;
}
```

### 3.4 Cross-reference resolution (3-tier fuzzy)

Schedule task prose is freeform. Resolution attempts, in order:

**Tier 1 — Exact filename / slug match.** Strip trailing punctuation and
lower-case. If `body` contains `how-to-think.md`, `estimation-cheatsheet.md`,
`requirements-gathering.md`, `answer-template.md`, return a `reading` item
whose `source` is the matched repo-relative path.

**Tier 2 — Module title match.** Within the phase, look up modules by
folder slug (e.g. `01-url-shortener`, `03-caching`). Compare against `theme`
column first, then against the body. Match the most specific (longest
overlapping token sequence).

**Tier 3 — Title-contains fuzzy.** Lower-case, strip `(P)` / `(R)` / `(V)`
markers and minutes. Compare body tokens against `design.title` /
`module.title`. If multiple candidates tie, prefer the one whose folder
prefix number is lowest (i.e. earlier in the phase ordering).

If all three tiers fail, the parser **logs a warning** and emits the item
with `id: null` so the home page can still render the title. A `null` id
on any day in range 1..60 must **fail the build** in CI (mirror dsa-zth's
recommendation in §3.2 of its design doc).

### 3.5 What if profile drifts past Day 60?

The current `daily-schedule.md` stops at Day 60. Behavior beyond:
- **60-day track (hours=2)** — `HeroDay` flips to "Day 61 · Maintenance"
  and the home shows a synthesized plan: 1 random Phase 5 design from
  `redo` queue + 1 mock + 1 weakest-pattern revisit.
- **90-day track (hours=1)** — Spread each schedule day across 1.5
  calendar days. `currentScheduleDay = floor(daysSinceStart * 60 / 90)`.
  Document this rather than maintain a parallel schedule.
- **Intensive track (hours=4)** — Compress: skip the (V) review rows and
  collapse two adjacent (R)-only days into one. The parser exposes a
  `--track=intensive` flag that produces an alternate `schedule.intensive.json`;
  the client picks the right one based on `profile.hours`. **Open question
  — defer until we see one user actually request it (see §10).**

---

## 4. Recommender logic (`lib/journey.ts`)

Mirrors dsa-zth's `journey.ts` 1:1. New file
`web/src/lib/journey.ts`:

### 4.1 `daysSinceStart` & `currentScheduleDay`

```ts
export function daysSinceStart(profile: UserProfile | null, now = new Date()): number {
  if (!profile) return 0;
  const start = new Date(profile.startDate + 'T00:00:00');
  const ms = now.getTime() - start.getTime();
  const day = Math.floor(ms / 86_400_000) + 1;
  return Math.max(1, day);
}

export function currentScheduleDay(profile: UserProfile | null): number {
  if (!profile) return 0;
  const day = daysSinceStart(profile);
  const offset = (profile.effectiveStartDay ?? 1) - 1;
  return day + offset;
}
```

### 4.2 `getTodayPlan(day, progress)` — algorithm

```ts
export interface ResolvedScheduleItem extends ScheduleItem {
  status: ProgressStatus;     // unseen / review / struggled / done
  href: string;
  prerequisiteSatisfied: boolean;
}

export function getTodayPlan(
  day: number,
  progress: ProgressState,
  schedule: Schedule,
  style: StudyStyle = 'mixed',
): ResolvedScheduleItem[] {
  const sd = schedule.find(d => d.day === day);
  if (!sd) return [];
  const resolved = sd.items.map(item => ({
    ...item,
    status: statusOf(progress, item.id),
    href: hrefForItem(item),
    prerequisiteSatisfied: (item.prerequisite ?? []).every(
      pid => statusOf(progress, pid) === 'done'
    ),
  }));
  return orderForStyle(resolved, style);
}

function orderForStyle(items, style) {
  if (style === 'designs-first') {
    return [...items].sort(byTypePriority(['design-drill', 'mock-interview', 'case-study', 'reading', 'review']));
  }
  if (style === 'theory-first') {
    return [...items].sort(byTypePriority(['reading', 'case-study', 'review', 'design-drill', 'mock-interview']));
  }
  return items; // 'mixed' — keep the schedule order verbatim
}
```

### 4.3 `getResumeItem(progress)` — last-touched

```ts
export function getResumeItem(progress: ProgressState): { id: string; touchedAt: number } | null {
  const entries = Object.entries(progress.touched ?? {});
  if (entries.length === 0) return null;
  const [id, touchedAt] = entries.sort((a, b) => b[1] - a[1])[0];
  if (statusOf(progress, id) === 'done') return null;  // don't resume something finished
  return { id, touchedAt };
}
```

### 4.4 `getUpNext(day, lookahead = 3)`

```ts
export function getUpNext(day: number, schedule: Schedule, lookahead = 3): ScheduleDay[] {
  return schedule.filter(d => d.day > day && d.day <= day + lookahead);
}
```

`<UpNext>` renders the first 2 (cards) and adds a "see more →" link to
`/progress` if there's a 3rd.

### 4.5 `getOverdueRedo(progress, now)`

```ts
export function getOverdueRedo(progress: ProgressState, now = Date.now()): RedoEntry[] {
  return buildRedoQueue(progress, now).filter(e => e.dueIn <= 0);
}
```

`buildRedoQueue` is the existing `progress.ts` helper. `dueIn ≤ 0` ⇒
overdue or due today. The home `<RedoStrip>` shows up to 3; the full
`/redo` page shows them all.

### 4.6 `getNextRecommendation` — the persistent CTA

Single source of truth for the primary CTA across home, `/study` empty
state, and `/designs` empty state. Identical signature & hierarchy to
dsa-zth:

```ts
export type RecommendationKind =
  | 'redo'             // an overdue (or due-today) review item
  | 'today-design'     // an unfinished design-drill assigned to today
  | 'today-reading'    // an unfinished reading / case-study
  | 'today-mock'       // an unfinished Phase 6 mock
  | 'tomorrow-first'   // first item of tomorrow (today fully done)
  | 'phase-0-start'    // no profile or Day 0 — funnel to /study/p0-how-to-think
  | 'all-done';        // past Day 60 with empty queue

export function getNextRecommendation(
  profile: UserProfile | null,
  progress: ProgressState,
  schedule: Schedule,
  now: Date = new Date(),
): NextRecommendation;
```

Hierarchy:

1. **No profile / Day 0** → `phase-0-start`, route to
   `/study/p0-how-to-think`. Copy: "Set up your profile to start" (no
   profile) or "Day 1 begins here" (profile present, just hasn't ticked
   anything).
2. **Overdue redo** → `redo`. Pre-empts everything else, *including* the
   LevelBanner (open question #3 below — answer: yes).
3. **Today's first unfinished assignment**, ordered by `studyStyle`. The
   recommender kind reflects the item type (`today-design` for
   `design-drill`, `today-reading` for `reading|case-study`,
   `today-mock` for `mock-interview`).
4. **Today fully done** → `tomorrow-first`. Reads the first item of
   `day+1`. Reason copy: "Day N complete · Day N+1 starts with this".
5. **Past Day 60 with empty queue** → `all-done`. Route to `/review`.

---

## 5. Spaced repetition for designs

The existing dsa-zth code uses one constant — `REDO_INTERVAL_DAYS = [1, 3,
7, 14]` — for all items. System design has a **bimodal** redo cost:

- Re-reading a Phase 1 concept (consistent hashing, load balancing types)
  takes 10–15 minutes — same shape as a DSA problem redo.
- Re-designing YouTube takes **60–90 minutes** — you cannot meaningfully
  redo it on a 1-day cadence. Doing so causes the redo queue to balloon and
  the user to bounce.

### 5.1 `[1, 3, 7, 14]` for concepts (Phase 0–3)

Applies to `ScheduleItem.type ∈ {'reading', 'case-study'}` and any item
marked `'struggled'` whose original `estimatedMinutes < 30`.

```ts
export const REDO_INTERVAL_DAYS_CONCEPT = [1, 3, 7, 14];
```

### 5.2 `[7, 21, 60]` for designs (Phase 4–5) — rationale

Applies to `ScheduleItem.type ∈ {'design-drill', 'mock-interview'}` and any
`'struggled'` item whose `estimatedMinutes >= 30`.

```ts
export const REDO_INTERVAL_DAYS_DESIGN = [7, 21, 60];
```

**Rationale:**
- A 45-min design takes a real session to redo. Anything < 7 days is
  pointless because you remember the solution path. The win comes from
  *forgetting enough that you have to re-derive*.
- 60 days = the full course length. The third redo of a Day-33 design
  lands around Day 93, naturally past the interview for most learners and
  appropriate for long-term retention only.
- A user who designs YouTube on Day 46 sees it return on Day 53, then Day
  74, then Day 134 (which is post-course — typically dropped or rolled
  into ad-hoc weekly practice on `/review`).

### 5.3 Adaptive interval lookup

```ts
export function intervalsFor(item: ScheduleItem): number[] {
  if (item.type === 'design-drill' || item.type === 'mock-interview') {
    return REDO_INTERVAL_DAYS_DESIGN;
  }
  return REDO_INTERVAL_DAYS_CONCEPT;
}
```

`buildRedoQueue` is updated to take an `intervalsFor` callback so it can
look up the right schedule per item.

### 5.4 Graduation rule (4 successes)

After **4 successful redos in a row** (status flipping from `review` /
`struggled` back to `done` without an intervening `struggled` mark), an
item graduates out of the queue. For designs, this is effectively 4
sessions over ~6 months → comfortable interview readiness. Mirrors
dsa-zth.

### 5.5 Interaction with the daily plan

If `getOverdueRedo()` returns anything, the recommender returns `'redo'`
**before** today's items. Visually, `<RedoStrip>` floats above `<TodayPlan>`.

**Per-item-type cap**: never show more than **2 design redos** at once on
the home page (a 90-min item × 2 already eats most of a 4-hour day). If
the queue contains 5 overdue designs, surface the 2 most overdue and
collapse the rest behind "see all 5 on /redo →".

---

## 6. The 45-minute Design Timer (`<DesignTimer>`)

The single genuinely new thing vs dsa-zth's `ProblemTimer`. Embedded on
**every** design-drill page (`/designs/[slug]`) and every mock-interview
page (`/mocks/[id]`). Hooked to the 8-stage RESHADED framework from
`how-to-approach.md:11–18` and `templates/answer-template.md:1–160`.

### 6.1 5-stage breakdown — exactly mirrors `answer-template.md`

The "5-stage" label in the prompt collapses RESHADED's 8 letters into 5
visible phases on the timer UI (because the template groups them):

| UI stage | RESHADED letters | Minutes | Source |
|---|---|---|---|
| 1. Requirements & Estimation | R + E | 10 | `answer-template.md:7–53` |
| 2. High-level Design + API | H + A | 15 | `answer-template.md:55–92` |
| 3. Detailed Design | S + D | 15 | `answer-template.md:94–131` |
| 4. Evaluation | E (eval) | 3 | `answer-template.md:133–151` |
| 5. Deployment / Wrap-up | D (deploy) | 2 | `answer-template.md:153–160` |
| **Total** |  | **45** | matches `how-to-approach.md:21` |

The build-time parser stores all 8 RESHADED letters (`stages` in
`ScheduleItem`) for fine-grained progress tracking; the `<DesignTimer>` UI
collapses adjacent stages into the 5 groups above for readability. A
"show all 8 stages" toggle reveals the granular view.

### 6.2 Component shape

```tsx
// web/src/components/timer/DesignTimer.tsx
export interface DesignTimerProps {
  designId: string;             // for persistence
  stages: DesignStage[];        // from schedule.json
  onStageComplete?: (stage: DesignStage) => void;
  onSessionComplete?: (transcript: StageTranscript[]) => void;
}

export interface StageTranscript {
  stageKey: string;
  startedAt: number;
  endedAt: number;
  /** Did the user advance manually before the stage timer expired? */
  advancedEarly: boolean;
  /** Free-form notes captured in the inline notepad next to the timer. */
  notes: string;
}
```

### 6.3 Auto-advance & skip behavior

- **Visible state:** big stage label ("Requirements & Estimation"), the
  RESHADED letter(s) being measured, a countdown bar (mm:ss), an
  inline notepad (autosaved to localStorage), and 3 buttons:
  `[Skip stage]` / `[I'm done — next →]` / `[Pause]`.
- **When timer expires:** modal pops up:
  > "Time on **Requirements & Estimation** (10 min) is up.
  > Ready for **High-level Design + API** (15 min)?
  > `[Yes, advance]` `[+2 more minutes]` `[End session early]`"
- **Manual `[I'm done]`:** records `advancedEarly: true` and proceeds to
  the next stage immediately. Encouraged — strong candidates often finish
  stage 1 in 7 min and want stage 2 to start.
- **`[Skip stage]`:** records the stage as skipped (zero time spent) and
  flags it in the post-session transcript. The recommender will not mark
  the design `done` if more than 2 stages were skipped.
- **End of stage 5:** auto-trigger the **retrospective prompt**:
  > "How did this design go? `[💪 strong]` `[🤔 shaky]` `[😵 struggled]`"
  > Result feeds back into `ProgressState`:
  > `strong → done`, `shaky → review`, `struggled → struggled`.

### 6.4 Persisting stage progress per design

```ts
// shape stored at localStorage key `design:${designId}:session:${isoDate}`
{
  designId: 'p4-url-shortener',
  startedAt: 1707000000000,
  endedAt: 1707002700000,
  stages: [
    { stageKey: 'R+E', startedAt: ..., endedAt: ..., advancedEarly: false, notes: '...' },
    { stageKey: 'H+A', startedAt: ..., endedAt: ..., advancedEarly: true,  notes: '...' },
    ...
  ],
  retro: 'shaky',
}
```

Sessions accumulate. The 3rd-tab "Design Lab" notepad from
`setup.md:29` is *replaced* by the inline notepad — every session's notes
are findable via `/progress/<designId>` which lists past attempts.

### 6.5 Interaction with redo queue

Completing a design-drill session with `retro === 'shaky'` or
`'struggled'` automatically schedules the **next redo** using
`REDO_INTERVAL_DAYS_DESIGN[0] = 7`. A `'strong'` retro skips a level
(7-day → 21-day), so consistently confident designs graduate faster.

---

## 7. `/review` ISO-week journaling

A new route, `/review`, that surfaces every Sunday (and is also the
landing page for the `all-done` recommendation in §4.6).

### 7.1 Prompts (3 per week)

Mirror dsa-zth's retrospective intent but worded for system design:

1. **Trade-off** — *"Which trade-off surprised you most this week? Did
   anything flip your priors about CAP / latency-vs-consistency / cost?"*
2. **Forgetting curve** — *"Which design from this week did you find
   yourself most fuzzy on? Schedule it for redo."*
3. **Building block** — *"Which Phase 1–3 building block (LB, cache, MQ,
   etc.) finally clicked? Which one is still vague?"*

If the user has unfinished prompts from the previous week, those surface
above the current week's set.

### 7.2 Storage shape

`localStorage` key: `journal`. Value:

```ts
type Journal = Record<string, JournalEntry>;
// key is ISO-week, e.g. '2025-W12'

interface JournalEntry {
  weekISO: string;          // '2025-W12'
  weekStartDate: string;    // '2025-03-17'
  responses: {
    tradeoff: string;
    forgetting: string;
    buildingBlock: string;
  };
  /** Items the user explicitly chose to redo from this week's retro. */
  scheduledRedos: string[]; // item ids
  /** Optional free-form follow-up. */
  notes: string;
  createdAt: number;
  updatedAt: number;
}
```

### 7.3 Surfacing past entries

`/review` shows a sidebar of past weeks (W1, W2, …) and a heatmap-style
strip indicating completeness (filled square = all 3 prompts answered).
Clicking a past week renders the entry read-only with an "edit" toggle.
This is the seed of the user's personal "what I learned" log — a useful
artifact when the interview actually arrives.

---

## 8. `/redo`, `/progress`, `/search` pages — adaptations

### 8.1 `/redo` — filter by type

Hierarchy on the page:

```
Overdue (red strip)
  ├─ Designs    (sorted by overdueBy desc) — max 5, then "see all →"
  └─ Concepts   (sorted by overdueBy desc) — max 5, then "see all →"
Due this week
  ├─ Designs
  └─ Concepts
Graduated (collapsed) — items past 4 successes
```

Each row has the type pill (`reading` / `case-study` / `design-drill` /
`mock-interview`), the item title, `overdueBy` days, and an `[Open →]`
button that routes to the right page and **auto-starts the timer** for
design-drills.

### 8.2 `/progress` — per-phase stats + design coverage matrix

Two-pane layout:

**Left pane — phase progress bars.** One bar per phase, with breakdown:
- Phase 0: `3/3` readings done.
- Phase 4: `5/10 designs sketched · 2 mastered · 3 review · 0 struggled`.

**Right pane — design coverage matrix.** A 5-column table:

| Design | Sketched | Compared with solution | 1st redo (7d) | 2nd redo (21d) | 3rd redo (60d) |
|---|---|---|---|---|---|
| URL Shortener | ✓ Day 33 | ✓ Day 33 | ✓ Day 40 | ⏳ due Day 54 | — |
| Pastebin | ✓ Day 34 | ✓ Day 34 | due Day 41 | — | — |
| Rate Limiter | ✓ Day 35 | ✓ Day 35 | ✓ Day 42 (struggled) | ⏳ due Day 49 | — |
| Key-Value Store | — | — | — | — | — |
| ... |

This matrix is the **dashboard the user shows their interviewer
preparation buddy** — "here's what I've covered, here's what's stale."

### 8.3 `/search` — filter by phase, difficulty, company

Three filter facets, all combinable:
- **Phase** (P0–P6 chips, multi-select).
- **Difficulty** (Easy / Medium / Hard — sourced from each design's README
  `## Difficulty:` line, e.g. `phase-4-classic-starter/01-url-shortener/README.md:9`).
- **Company** (multi-select — sourced from each design's `## Companies That Ask This`
  line, e.g. `phase-4-classic-starter/08-chat-system/README.md:22`).

The extractor needs to parse these two lines per design and emit them into
`designs.json`. Search results card-render the same `<DesignCard>` used
elsewhere with `difficulty` and `companies[]` chips.

---

## 9. Implementation roadmap (Round 2-4 cross-reference)

| Component | File | Round | Depends on |
|---|---|---|---|
| `extract-content.mjs` (extended) | `web/scripts/extract-content.mjs` | 3 | none |
| `schedule.json` | `web/src/generated/schedule.json` | 3 | extract-content.mjs |
| `designs.json` (difficulty + companies) | `web/src/generated/designs.json` | 3 | extract-content.mjs |
| `UserProfile` schema (8 fields) | `web/src/lib/profile.ts` | 4a | none |
| `ProfileProvider` normalize() | `web/src/components/ProfileProvider.tsx` | 4a | profile schema |
| `ProgressProvider` + `[7,21,60]` | `web/src/components/ProgressProvider.tsx` | 4a | none |
| `journey.ts` (`currentScheduleDay`, `getNextRecommendation`, etc.) | `web/src/lib/journey.ts` | 4a | schedule.json |
| 2-step `ProfileOnboarding` | `web/src/components/ProfileOnboarding.tsx` | 4a | profile schema |
| `HeroDay` | `web/src/components/home/HeroDay.tsx` | 4b | ProfileProvider |
| `TodayPlan` | `web/src/components/home/TodayPlan.tsx` | 4b | schedule.json + ProgressProvider + journey.ts |
| `ResumeCTA` | `web/src/components/home/ResumeCTA.tsx` | 4b | journey.ts |
| `UpNext` | `web/src/components/home/UpNext.tsx` | 4b | schedule.json |
| `RedoStrip` | `web/src/components/home/RedoStrip.tsx` | 4b | journey.ts |
| `LevelBanner` | `web/src/components/home/LevelBanner.tsx` | 4b | ProfileProvider |
| `CourseMap` | `web/src/components/home/CourseMap.tsx` | 4b | existing `<PhaseCard>` |
| `page.tsx` rewrite | `web/src/app/page.tsx` | 4b | all of the above |
| `DesignTimer` | `web/src/components/timer/DesignTimer.tsx` | 4b | schedule.json (for `stages`) |
| Inline notepad | `web/src/components/timer/StageNotepad.tsx` | 4b | DesignTimer |
| Retrospective modal | `web/src/components/timer/RetroPrompt.tsx` | 4b | DesignTimer + ProgressProvider |
| Diagnostic flow (5 prompts) | `web/src/app/diagnostic/page.tsx` | 4c | ProfileProvider |
| `/review` page | `web/src/app/review/page.tsx` | 4c | localStorage `journal` |
| `/redo` filtered page | `web/src/app/redo/page.tsx` | 4c | journey.ts |
| `/progress` matrix | `web/src/app/progress/page.tsx` | 4c | designs.json + ProgressProvider |
| `/search` facets | `web/src/app/search/page.tsx` | 4c | designs.json |

### 9.1 Order of implementation (each step independently mergeable)

1. **Step 1 — Schedule parser & types.** Add `ScheduleDay` types; write
   `extract-schedule.mjs` (or merge into `extract-content.mjs`); wire into
   `pre{dev,build}`; verify `scheduleDay(33)` matches Day 33 markdown.
   *CI signal:* fail build if any day in 1..60 has zero items or a `null`
   item id.
2. **Step 2 — Profile schema extension.** Extend `UserProfile`, add
   `normalize()`, add `currentScheduleDay` + `getNextRecommendation`. No
   visible UI change yet.
3. **Step 3 — Home page v1.** `HeroDay`, `TodayPlan`, `ResumeCTA`,
   `CourseMap`. Rewrite `page.tsx`. Uses only Round-4a fields.
4. **Step 4 — UpNext + RedoStrip.** Add to home; add State A / State B /
   State C copy.
5. **Step 5 — Onboarding v2.** 2-step modal, 8 fields. New
   `priorExperienceLabel` / `studyStyleLabel` helpers.
6. **Step 6 — DesignTimer.** Embed on every `/designs/[slug]` page. Hook
   to retrospective. Hook retrospective to redo intervals.
7. **Step 7 — Diagnostic mode.** New `/diagnostic` route. Persist
   `effectiveStartDay`. Wire LevelBanner amber variant.
8. **Step 8 — `/review`, `/redo`, `/progress`, `/search` upgrades.**
9. **Stretch / future.**
   - Streaks (we'll track `state.heatmap` in `progress.ts`).
   - Export progress JSON for device switching.
   - "Catch-up mode" if user is N days behind (triage 3 days into 1).

### 9.2 Acceptance criteria (per step)

- **Step 1 done when:** `schedule.json` exists, contains 60 days, every
  item has a non-null `id`, and `scheduleDay(33)` matches the Day 33
  markdown row by hand inspection.
- **Step 3 done when:** a new user with `level=intermediate, hours=2,
  startDate=today-32d` lands on the home and sees Day 33 (URL Shortener)
  with the full RESHADED stage list on the design-drill row and a working
  Resume CTA.
- **Step 5 done when:** a fresh browser (cleared localStorage) walks
  through the 2-step modal and the saved profile contains all 8 fields.
- **Step 6 done when:** opening `/designs/p4-url-shortener` starts the
  45-min timer at stage 1, advances on `[I'm done]`, fires the retro at
  stage 5 completion, and the resulting `'shaky'` retro creates a redo
  entry due in 7 days.
- **Step 7 done when:** switching `priorExperience` from
  `'component-level'` to `'led-design'` in `/profile` surfaces the
  Diagnostic CTA in the LevelBanner without a reload; completing the
  diagnostic with 4 green sets `effectiveStartDay = 25` and shifts the
  home `<HeroDay>` to Day 25 + `daysSinceStart`.

---

## 10. Open questions

1. **Does "skip to Phase 3" via diagnostic actually skip, or just hide?**
   Suggestion: it only hides the early phases in `<CourseMap>` and reorders
   the home; the study browser still lists Phase 0–2 so the user can dip
   back in. Matches dsa-zth's stance. *Defer to user.*
2. **Behaviour on Day 61+ for 90-day learners.** Proposal:
   `currentScheduleDay = floor(daysSinceStart * 60 / 90)`. Simpler than
   maintaining a parallel schedule, but means a 90-day learner's "Day 33"
   lands on calendar day 49.
3. **Should redo items pre-empt the LevelBanner?** Recommended: **yes** —
   when overdue, `<RedoStrip>` is the first row below `<HeroDay>` and
   `<LevelBanner>` falls below. The recommender returns `'redo'` first.
4. **Intensive (4-hour) track** — do we generate `schedule.intensive.json`
   at build time or just trust the user to skip (V) rows? Recommend:
   defer the alternate JSON until a real intensive learner asks for it.
5. **Triple-tier vs dual-tier on `/progress`** — design coverage matrix is
   only meaningful for Phase 4–5. Do we surface a parallel "concept
   coverage" view for Phase 1–3 case-studies (when they exist)?
   Recommended: yes, but as a second tab on `/progress`, ship after Step 8.
6. **Long-form redo (`[7, 21, 60]`) — let the user override per item?**
   E.g. a learner who feels Twitter is shaky might want it back at +3 days
   not +7. Proposal: allow `progress.redoOverride[itemId] = days`. Defer
   the UI surface until we observe demand.
7. **Mock-interview format on Phase 6 days** — current schedule only says
   "Mock Interview 1, 2, 3". Do we ship a *prompt library* (e.g. 30
   prompts of varying difficulty) and have `/mocks` randomly pick one
   matching the user's weakest phase? Proposal: yes, but this is a Round
   5+ deliverable; for Round 4b the `mock-interview` items just route to
   `/mocks` which shows the static list.
8. **Time-zone safety in `daysSinceStart`.** Current proposal uses local
   `Date` math. Fine for now. If a traveling user crosses date lines,
   off-by-one is acceptable.
9. **Companies / Difficulty extraction reliability** — `phase-4-*/README.md`
   and `phase-5-*/README.md` both use the lines `## Difficulty: <X>` and
   `## Companies That Ask This` followed by a paragraph. Cross-check all
   20 designs at build time to confirm the format is consistent; if not,
   normalize before emitting `designs.json`.
10. **Phase 1–3 `case-studies/` directories are currently empty.** Until
    they are populated with actual case-study markdown files, the parser
    emits a `case-study` item with `id: case-study-placeholder-<module>`
    and a "Coming soon — practice the (P) task on paper" CTA. *Open
    question — do we instead synthesize a default case-study from the
    `(P)` task prose in `daily-schedule.md`?* Proposal: yes; the prose is
    descriptive enough ("design schema for a social network",
    `daily-schedule.md:27`) to render as a 1-section markdown stub.

---

*End of doc. Implementation can begin at Step 1 in §9.1.*
