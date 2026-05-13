# Setup Guide

> System design is about architecture, not code. Your setup is minimal.

## What You Need

### Required

- **A browser** -- to view the interactive dashboard
- **Paper or whiteboard** -- practice drawing diagrams by hand (interview skill)

### Recommended

- **[Excalidraw](https://excalidraw.com/)** -- free online whiteboard for architecture diagrams
- **A notebook** -- for estimation calculations and quick notes
- **A timer** -- the dashboard has a built-in 45-minute phased timer

### Optional

- **Node.js 24+** -- only needed if you want to run the web app locally
- **Git** -- only needed if you want to version-control your notes

## How to Use the Site

1. Visit the [live site](https://vinay199129.github.io/system-design-zth/) or run it locally (see below)
2. Set up your profile (name, target company, experience level, prior experience, target date, study style)
3. Home page shows your day-by-day plan (HeroDay + TodayPlan + UpNext)
4. **/designs** -- filterable index of 20 case studies; click any to drill in with the 45-min RESHADED timer
5. **/study/[slug]** -- markdown for any building block / concept / pattern, with Mermaid diagrams
6. **/redo** -- spaced repetition: concepts on `[1, 3, 7, 14]` day intervals, designs on `[7, 21, 60]`
7. **/review** -- ISO-week journaling
8. **/progress** -- overall + per-phase stats + design coverage matrix

## Running Locally

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

For a production build (static export to `web/out/`):

```bash
npm run build
```

`npm run prebuild` runs `node scripts/extract-content.mjs` first, which parses all `.md` files at the repo root into `web/src/generated/{content,designs,schedule}.json`. Edit any `.md` and rebuild — content updates flow through.

## No Coding Required (to study)

Unlike DSA prep, system design is about thinking and communication, not writing code. You should be able to:

1. Draw architecture diagrams on a whiteboard
2. Explain trade-offs verbally
3. Do back-of-envelope math quickly
4. Navigate between high-level and detailed views

The skills you practice are design skills, not programming skills. Node.js is only required to run the web UI locally; the source content lives in plain `.md` files and is fully readable in any editor.
