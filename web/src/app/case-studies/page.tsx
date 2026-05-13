import Link from 'next/link';
import {
  caseStudies,
  caseStudiesByPhase,
} from '@/lib/content';
import { PHASES } from '@/lib/phases';

export const metadata = {
  title: 'Case Studies',
  description:
    '24 real production-system case studies (Cloudflare DNS, Memcached @ Facebook, Discord ScyllaDB, GitLab 2017 outage, Twitter Snowflake, etc.) applying the Phase 1-3 building blocks and patterns.',
};

/**
 * Index of all case-studies/* files extracted from Phase 1-3 modules.
 * One entry per real-world system discussed (e.g. "Cloudflare 1.1.1.1
 * Anycast DNS" under Phase 1's DNS module).
 */
export default function CaseStudiesPage() {
  const grouped = caseStudiesByPhase();
  const total = caseStudies.length;

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Case Studies{' '}
          <span className="text-slate-500 dark:text-slate-400 text-base font-normal">
            · {total}
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          Real production systems walked through against the Phase 1-3 building
          blocks. Each one ties theory to a publicly documented architecture
          (blog post, paper, or postmortem) with concrete numbers, the
          surprising failure mode, and the lessons you can borrow in an
          interview.
        </p>
      </header>

      {(['p1', 'p2', 'p3'] as const).map((phaseId) => {
        const items = grouped[phaseId] ?? [];
        if (items.length === 0) return null;
        const phase = PHASES.find((p) => p.id === phaseId);
        return (
          <section key={phaseId} className="space-y-3">
            <header className="flex items-baseline gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-lg font-semibold">{phase?.title}</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {items.length} case stud{items.length === 1 ? 'y' : 'ies'}
              </span>
            </header>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
              {items.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/case-studies/${c.slug}`}
                    className="block h-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow transition"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                      {c.moduleTitle}
                    </div>
                    <div className="mt-1 font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                      {c.title}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
