# System Design ZTH — Web App

Next.js 15 + Tailwind CSS static site for the System Design Zero to Hero curriculum,
deployed to GitHub Pages at https://vinay199129.github.io/system-design-zth/.

## Local development

```bash
cd web
npm install
npm run dev
```

The app runs at http://localhost:3000. In dev mode `basePath` is empty so
URLs look like `/profile`, `/study`, `/designs`, etc.

## Production build

```bash
npm run build
```

Produces a static export in `web/out/`. In production the site is served
from `/system-design-zth/`, so links are rewritten by Next.js automatically.

## Architecture

- **App Router** (`src/app`) with static export (`output: 'export'`).
- **Tailwind CSS** for styling, slate palette + custom `brand` (indigo).
- **State**: localStorage only, no backend.
  - `ProfileProvider` — user profile (name, target, hours, level, start) +
    optional new fields: `priorExperience`, `targetDate`, `studyStyle`.
  - `ProgressProvider` — per-item status (done / review / struggled / unseen)
    and daily activity heatmap.
- **Theme**: light / dark toggle, persisted in `localStorage` under
  `sd-zth:theme`. A `<script>` injected via `ThemeBootstrap` applies the
  theme before React hydrates so there's no flash.

## Routes

| Path           | What                                                            |
| -------------- | --------------------------------------------------------------- |
| `/`            | Home — HeroDay + TodayPlan + UpNext + RedoStrip + CourseMap.    |
| `/study/[id]`  | Markdown study sections (Phase 0-3 modules, root docs).         |
| `/designs`     | Filterable index of 20 case-study designs (Phase 4-5).          |
| `/designs/[id]`| A single case study with problem.md + solution.md + drill timer.|
| `/patterns`    | List of the 24 building blocks / concepts / patterns.           |
| `/case-studies`| Phase 1-3 case studies (when filled).                           |
| `/redo`        | Spaced-repetition queue: concepts `[1,3,7,14]`, designs `[7,21,60]`. |
| `/review`      | ISO-week journaling.                                            |
| `/progress`    | Overall + per-module stats + design coverage matrix.            |
| `/profile`     | Profile view + edit form.                                       |
| `/legacy/…`    | (Reserved) for any future legacy assets that need URL preservation. |

## Domain entities

System design is a **triple-tier** domain (vs DSA's dual-tier study + problem):

1. **study-section** — concept reading (Phase 0-3 module READMEs, root docs).
2. **case-study** — Phase 1-3 `case-studies/` entries that apply a concept to a real system.
3. **design-drill** — full Phase 4-5 design exercise (45-90 min mock).

The redo queue accepts all three; the daily plan composes them; the timer is
specialised for design-drills (5 RESHADED stages, see
`templates/answer-template.md`).

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on push to `main` and
deploys the `web/out` directory to GitHub Pages. The legacy single-file
`dashboard.html` from before this revamp has been deleted; old bookmarks pointing
at `/system-design-zth/dashboard.html` will 404. Use the new routes instead.

> **One-time setup**: In repo Settings → Pages, set "Source" to
> **GitHub Actions** (currently "Deploy from a branch").
