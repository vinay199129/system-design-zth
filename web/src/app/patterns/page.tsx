import Link from 'next/link';
import { allPatterns, designs } from '@/lib/content';

export const metadata = {
  title: 'Patterns',
};

/**
 * 24 patterns total: 9 Phase 1 building blocks + 7 Phase 2 distributed
 * concepts + 8 Phase 3 design patterns. Each pattern card filters the
 * designs index to drills that exercise that pattern.
 */
export default function PatternsPage() {
  const patterns = allPatterns();
  const countFor = (p: string) =>
    designs.filter((d) => d.pattern === p).length;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Patterns{' '}
          <span className="text-slate-500 dark:text-slate-400 text-base font-normal">
            · {patterns.length}
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          24 patterns span Phase 1 building blocks, Phase 2 distributed
          concepts, and Phase 3 design patterns. Click any pattern to filter
          the designs index to the case studies that drill it.
        </p>
      </header>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
        {patterns.map((p, i) => {
          const count = countFor(p);
          return (
            <li key={p}>
              <Link
                href={`/designs?pattern=${encodeURIComponent(p)}`}
                className="block rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow transition"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                  Pattern {String(i + 1).padStart(2, '0')}
                </div>
                <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                  {p}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {count} design{count === 1 ? '' : 's'}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
