# System Design Zero to Hero -- FAANG Interview Prep

> 60-day structured system design course: from building blocks to designing YouTube, Uber, and Google Search.

## Quick Start

The course ships as a Next.js app under [`web/`](web/) (live at https://vinay199129.github.io/system-design-zth/) and a parallel set of source markdown files at the repo root.

**To use the live site**: go to https://vinay199129.github.io/system-design-zth/ and follow the day-by-day plan it surfaces.

**To run locally**:

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

**To read the source content directly** (no web UI):

1. Start with [system-design-primer.md](system-design-primer.md) — the 4-question framework, latency numbers, 6 building blocks, 8 canonical question templates.
2. Read [how-to-think.md](how-to-think.md) — RESHADED framework + Pattern Identification Workout (10 prompts with hidden answers).
3. Follow [daily-schedule.md](daily-schedule.md) — day-by-day plan with time estimates.
4. Reference [plan.md](plan.md) — full course blueprint.
5. Use [templates/answer-template.md](templates/answer-template.md) — 45-minute structured answer framework + self-scoring rubric.

## Project Map

```
system-design-zth/
|-- README.md                  <- YOU ARE HERE (start point)
|-- system-design-primer.md    <- 4-question framework + latency numbers + 8 templates
|-- how-to-think.md            <- RESHADED framework + Pattern Identification Workout
|-- plan.md                    <- Full course blueprint with theory
|-- progress.md                <- Master checklist tracker
|-- daily-schedule.md          <- Day-by-day plan with time estimates
|-- estimation-reference.md    <- Back-of-envelope numbers + Jeff Dean latency table
|-- redo-queue.md              <- Designs to revisit (weakness tracker)
|-- setup.md                   <- Environment setup guide
|
|-- web/                       <- Next.js 15 app (the live site)
|   |-- src/                   <- React + Tailwind, App Router, static export
|   |-- scripts/               <- extract-content.mjs (parses all source .md)
|   '-- public/                <- favicon, static assets
|
|-- .audit/                    <- 5 audit reports + signals append script
|-- .github/workflows/         <- deploy.yml (Pages deploy on push to main)
|
|-- templates/
|   '-- answer-template.md     <- 45-minute structured answer framework
|
|-- phase-0-framework/
|   |-- README.md              <- Phase overview
|   |-- how-to-approach.md     <- RESHADED step-by-step
|   |-- estimation-cheatsheet.md <- Calculations & formulas
|   '-- requirements-gathering.md <- Interview question templates
|
|-- phase-1-building-blocks/   <- Core components (Days 4-15)
|   |-- 01-dns-networking/     <- README + case-studies/
|   |-- 02-load-balancing/
|   |-- 03-caching/
|   |-- 04-databases-sql/
|   |-- 05-databases-nosql/
|   |-- 06-message-queues/
|   |-- 07-blob-storage-cdn/
|   |-- 08-api-design/
|   '-- 09-proxies-gateways/
|
|-- phase-2-distributed-concepts/ <- Distributed systems (Days 16-24)
|   |-- 01-scalability/
|   |-- 02-partitioning-sharding/
|   |-- 03-replication/
|   |-- 04-consistency-models/
|   |-- 05-rate-limiting/
|   |-- 06-unique-id-generation/
|   '-- 07-distributed-consensus/
|
|-- phase-3-design-patterns/   <- Architecture patterns (Days 25-32)
|   |-- 01-fan-out/
|   |-- 02-event-sourcing-cqrs/
|   |-- 03-pub-sub/
|   |-- 04-circuit-breaker-retry/
|   |-- 05-saga-pattern/
|   |-- 06-sharding-strategies/
|   |-- 07-cache-patterns/
|   '-- 08-answer-template/
|
|-- phase-4-classic-starter/   <- Starter designs (Days 33-44)
|   |-- 01-url-shortener/      <- README + problem.md + solution.md
|   |-- 02-pastebin/
|   |-- 03-rate-limiter/
|   |-- 04-key-value-store/
|   |-- 05-unique-id-generator/
|   |-- 06-web-crawler/
|   |-- 07-notification-system/
|   |-- 08-chat-system/
|   |-- 09-news-feed/
|   '-- 10-typeahead/
|
|-- phase-5-classic-advanced/  <- Advanced designs (Days 45-54)
|   |-- 01-instagram/
|   |-- 02-youtube/
|   |-- 03-twitter/
|   |-- 04-uber/
|   |-- 05-dropbox/
|   |-- 06-google-search/
|   |-- 07-distributed-cache/
|   |-- 08-payment-system/
|   |-- 09-ticket-booking/
|   '-- 10-google-maps/
|
'-- phase-6-mock-interviews/   <- Mocks + review (Days 55-60)
    '-- README.md
```

## How Each Module Works

Every building block / concept module (Phase 1-3) contains:

| File | Purpose |
|------|---------|
| README.md | Why this matters · How it works · Trade-offs · Mermaid diagrams · First-time Recognition Signals · Anti-signals · Intuition · Worked Example · Further Reading |
| case-studies/ | Real production systems applying this concept (Memcached @ Facebook, Twitter fan-out, etc.) |

Every design problem module (Phase 4-5) contains:

| File | Purpose |
|------|---------|
| README.md | Overview, learning objectives, common pitfalls, time budget, related designs |
| problem.md | Problem statement, hints, structured thinking prompts |
| solution.md | Full design: API, DB schema, architecture diagrams, trade-offs, Recognition Signals, Anti-signals, Further Reading, Variant Prompts |

### Workflow for Each Design

```
1. Read the building blocks (Phase 1-2) for the relevant concepts
2. Open problem.md -- read requirements, try designing YOURSELF first
3. If stuck > 25 min -> read Hint 1, try again 10 min
4. If still stuck -> read Hint 2, try again 10 min
5. If still stuck -> read solution.md, study the architecture
6. After designing: write your own notes on trade-offs and alternatives
7. Mark status on the site or in progress.md
8. Next day: re-design without looking (spaced repetition via /redo)
```

## Prerequisites

- Basic understanding of web applications (client-server model)
- Familiarity with databases (SQL basics)
- No coding required -- this is an architecture course
- See [setup.md](setup.md) for recommended tools

## Timeline Options

| Track | Duration | Daily Hours | Best For |
|-------|----------|-------------|----------|
| Intensive | 60 days | 3-4 hrs | Engineers with some exposure |
| Extended | 90 days | 1.5-2 hrs | Complete beginners to system design |

See [daily-schedule.md](daily-schedule.md) for the full day-by-day plan.

## Fair Use & Disclaimer

This repository is an educational resource for personal interview preparation. It is not affiliated with, endorsed by, or sponsored by any company mentioned herein (including but not limited to Google, Amazon, Meta, Apple, Netflix, or Microsoft).

- System design concepts presented here are based on publicly available knowledge, research papers, and engineering blog posts.
- Architecture diagrams and solutions are original work created for educational demonstration. Multiple valid designs exist for every system.
- Pattern names and frameworks (e.g., "Fan-out", "CQRS", "Saga") are widely-used industry terminology and are not proprietary to any single source.

If you are a content creator or platform representative and believe any material here infringes on your rights, please [open an issue](https://github.com/vinay199129/system-design-zth/issues) and it will be addressed promptly.

## Credits & Acknowledgments

Created by [Vinay Bhadauria](https://github.com/vinay199129)

- Portfolio: [vinay199129.github.io/portfolio](https://vinay199129.github.io/portfolio/)
- GitHub: [github.com/vinay199129](https://github.com/vinay199129)

### Inspirations & References

This course draws on ideas and approaches from the broader system design education community:

- [System Design Primer](https://github.com/donnemartin/system-design-primer) -- Comprehensive system design resource
- [Designing Data-Intensive Applications](https://dataintensive.net/) by Martin Kleppmann -- Foundational distributed systems theory
- [ByteByteGo](https://bytebytego.com/) by Alex Xu -- System design interview guides
- [Grokking the System Design Interview](https://www.designgurus.io/course/grokking-the-system-design-interview) -- Pattern-based interview prep
- [Engineering blogs](https://github.com/kilimchoi/engineering-blogs) -- Real-world architecture insights from top companies

### Built With

- Next.js 15 + React 19 + TypeScript + Tailwind CSS — the live site at [`web/`](web/), statically exported
- `@tailwindcss/typography` — long-form markdown styling
- Mermaid 11 — architecture diagrams rendered in-browser
- Shiki — build-time syntax highlighting
- `unified` + `remark-gfm` + `rehype-slug` — markdown → HTML pipeline
- GitHub Actions + GitHub Pages — CI + hosting
- GitHub Copilot — AI-assisted content generation and review

## Also See

- [DSA Zero to Hero](https://vinay199129.github.io/dsa-zth/) -- 60-day DSA interview prep (companion course)

## License

This project is licensed under the MIT License -- see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this material for personal or commercial purposes, provided the copyright notice and license are included.

## Contributing

Contributions are welcome! If you find errors, want to add designs, or improve explanations:

1. Fork the repository
2. Create a feature branch (`git checkout -b fix/improve-url-shortener`)
3. Commit your changes
4. Open a pull request

Please keep contributions focused on educational accuracy and clarity.

---

System Design Zero to Hero &copy; 2026 [Vinay Bhadauria](https://github.com/vinay199129)
[Portfolio](https://vinay199129.github.io/portfolio/) &middot; [GitHub](https://github.com/vinay199129/system-design-zth) &middot; [MIT License](LICENSE)
