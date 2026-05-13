/**
 * Static metadata for the System Design Zero to Hero phases.
 * Mirrors the folder structure phase-N-* at the repo root and the day ranges
 * defined in README.md:30-91.
 *
 * Item counts are approximate based on the current curriculum
 * (20 case-study designs across Phase 4-5 + 24 patterns).
 */

export type PhaseId = 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6';

export interface Phase {
  id: PhaseId;
  shortLabel: string;
  title: string;
  description: string;
  days: string;
  /** Phase 4-5 design count (case studies). Other phases count modules. */
  designCount: number;
  modules: number;
  accent: PhaseAccent;
  /** Hex colour, used by phase cards and progress strip. */
  color: string;
  href: string;
}

export type PhaseAccent =
  | 'indigo'
  | 'violet'
  | 'emerald'
  | 'orange'
  | 'amber'
  | 'cyan'
  | 'rose'
  | 'slate';

export const PHASES: Phase[] = [
  {
    id: 'p0',
    shortLabel: 'Phase 0',
    title: 'Framework',
    description:
      'How to think about system design: RESHADED, requirements gathering, back-of-the-envelope estimation.',
    days: 'Days 1-3',
    designCount: 0,
    modules: 4,
    accent: 'slate',
    color: '#8b949e',
    href: '/study/p0-intro',
  },
  {
    id: 'p1',
    shortLabel: 'Phase 1',
    title: 'Building Blocks',
    description:
      'DNS, load balancing, caching, SQL/NoSQL databases, queues, blob/CDN, API design, proxies & gateways.',
    days: 'Days 4-15',
    designCount: 0,
    modules: 9,
    accent: 'cyan',
    color: '#58a6ff',
    href: '/study/p1-intro',
  },
  {
    id: 'p2',
    shortLabel: 'Phase 2',
    title: 'Distributed Concepts',
    description:
      'Scalability, partitioning, replication, consistency, rate limiting, unique IDs, consensus.',
    days: 'Days 16-24',
    designCount: 0,
    modules: 7,
    accent: 'violet',
    color: '#bc8cff',
    href: '/study/p2-intro',
  },
  {
    id: 'p3',
    shortLabel: 'Phase 3',
    title: 'Design Patterns',
    description:
      'Fan-out, event sourcing & CQRS, pub/sub, circuit breaker, saga, sharding strategies, cache patterns, RESHADED answer template.',
    days: 'Days 25-32',
    designCount: 0,
    modules: 8,
    accent: 'orange',
    color: '#f0883e',
    href: '/study/p3-intro',
  },
  {
    id: 'p4',
    shortLabel: 'Phase 4',
    title: 'Starter Designs',
    description:
      '10 starter case studies: URL shortener, pastebin, rate limiter, key-value store, ID generator, web crawler, notifications, chat, news feed, typeahead.',
    days: 'Days 33-44',
    designCount: 10,
    modules: 10,
    accent: 'emerald',
    color: '#3fb950',
    href: '/study/p4-intro',
  },
  {
    id: 'p5',
    shortLabel: 'Phase 5',
    title: 'Advanced Designs',
    description:
      '10 advanced case studies: Instagram, YouTube, Twitter, Uber, Dropbox, Google Search, distributed cache, payment system, ticket booking, Google Maps.',
    days: 'Days 45-54',
    designCount: 10,
    modules: 10,
    accent: 'amber',
    color: '#d29922',
    href: '/study/p5-intro',
  },
  {
    id: 'p6',
    shortLabel: 'Phase 6',
    title: 'Mock Interviews',
    description:
      'Six 45-minute mock interviews — full RESHADED rounds, timed, against the rubric.',
    days: 'Days 55-60',
    designCount: 0,
    modules: 1,
    accent: 'rose',
    color: '#f85149',
    href: '/study/p6-intro',
  },
];

export const TOTAL_DESIGNS = PHASES.reduce((s, p) => s + p.designCount, 0);
export const TOTAL_DAYS = 60;
/**
 * "24 patterns" = 9 Phase 1 building blocks + 7 Phase 2 distributed concepts +
 * 8 Phase 3 design patterns. The number surfaces in branding text everywhere.
 */
export const TOTAL_PATTERNS = 9 + 7 + 8;

export const ACCENT_CLASSES: Record<
  PhaseAccent,
  {
    cardBg: string;
    cardBorder: string;
    label: string;
  }
> = {
  indigo: {
    cardBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    cardBorder: 'border-indigo-200 dark:border-indigo-900',
    label: 'text-indigo-800 dark:text-indigo-200',
  },
  violet: {
    cardBg: 'bg-violet-50 dark:bg-violet-950/40',
    cardBorder: 'border-violet-200 dark:border-violet-900',
    label: 'text-violet-800 dark:text-violet-200',
  },
  emerald: {
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    cardBorder: 'border-emerald-200 dark:border-emerald-900',
    label: 'text-emerald-800 dark:text-emerald-200',
  },
  orange: {
    cardBg: 'bg-orange-50 dark:bg-orange-950/40',
    cardBorder: 'border-orange-200 dark:border-orange-900',
    label: 'text-orange-800 dark:text-orange-200',
  },
  amber: {
    cardBg: 'bg-amber-50 dark:bg-amber-950/40',
    cardBorder: 'border-amber-200 dark:border-amber-900',
    label: 'text-amber-800 dark:text-amber-200',
  },
  cyan: {
    cardBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    cardBorder: 'border-cyan-200 dark:border-cyan-900',
    label: 'text-cyan-800 dark:text-cyan-200',
  },
  rose: {
    cardBg: 'bg-rose-50 dark:bg-rose-950/40',
    cardBorder: 'border-rose-200 dark:border-rose-900',
    label: 'text-rose-800 dark:text-rose-200',
  },
  slate: {
    cardBg: 'bg-slate-50 dark:bg-slate-900/60',
    cardBorder: 'border-slate-200 dark:border-slate-800',
    label: 'text-slate-800 dark:text-slate-200',
  },
};
