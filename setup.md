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

- **Python 3.8+** -- only needed if you want to rebuild the dashboard from source
- **Git** -- only needed if you want to version-control your notes

## How to Use the Dashboard

1. Open `dashboard.html` (or visit the [live site](https://vinay199129.github.io/system-design-zth/))
2. Set up your profile (name, target company, experience level)
3. Use the **Study** tab to read modules in order
4. Use the **Designs** tab to track your progress on case studies
5. Use the **Design Lab** to take notes alongside problem statements
6. Use the **Timer** for 45-minute mock interview practice
7. Use the **Redo Queue** for spaced repetition on weak designs

## Rebuilding the Dashboard

If you modify any markdown content and want to regenerate the dashboard:

```bash
python build_dashboard.py
```

This reads all `.md` files from phase folders and embeds them into `dashboard.html` and `index.html`.

## No Coding Required

Unlike DSA prep, system design is about thinking and communication, not writing code. You should be able to:

1. Draw architecture diagrams on a whiteboard
2. Explain trade-offs verbally
3. Do back-of-envelope math quickly
4. Navigate between high-level and detailed views

The skills you practice are design skills, not programming skills.
