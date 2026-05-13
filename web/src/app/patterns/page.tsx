import Link from 'next/link';
import { studySections } from '@/lib/content';
import { PHASES } from '@/lib/phases';

export const metadata = {
  title: 'Patterns',
};

/**
 * 24 patterns total: 9 Phase 1 building blocks + 7 Phase 2 distributed
 * concepts + 8 Phase 3 design patterns. Each card links to that module's
 * study section.
 *
 * Note: we surface these from `studySections` (which contains a row per
 * module README) rather than `designs[].pattern` — that field would only be
 * populated if every Phase 4/5 solution declared a `**Pattern**:` line, which
 * is not the current convention.
 */
export default function PatternsPage() {
  const phasesToShow = (['p1', 'p2', 'p3'] as const)
    .map((id) => PHASES.find((p) => p.id === id)!)
    .filter(Boolean);

  type Pattern = { id: string; slug: string; title: string; phaseId: string };
  const grouped: Array<{ phaseId: string; phaseTitle: string; patterns: Pattern[] }> =
    phasesToShow.map((phase) => ({
      phaseId: phase.id,
      phaseTitle: phase.title,
      patterns: studySections
        .filter(
          (s) =>
            s.phaseId === phase.id && s.moduleId && s.id !== `${phase.id}-intro`,
        )
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ id: s.id, slug: s.slug, title: s.title, phaseId: s.phaseId })),
    }));

  const total = grouped.reduce((n, g) => n + g.patterns.length, 0);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Patterns{' '}
          <span className="text-slate-500 dark:text-slate-400 text-base font-normal">
            · {total}
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          {total} patterns span Phase 1 building blocks, Phase 2 distributed
          concepts, and Phase 3 design patterns. Each card opens the
          module&apos;s study section — with its &ldquo;Why&rdquo;, &ldquo;How
          it works&rdquo;, trade-offs, Recognition Signals, and Anti-signals.
        </p>
      </header>

      {grouped.map(({ phaseId, phaseTitle, patterns }) => (
        <section key={phaseId} className="space-y-3">
          <header className="flex items-baseline gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-lg font-semibold">{phaseTitle}</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {patterns.length} pattern{patterns.length === 1 ? '' : 's'}
            </span>
          </header>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
            {patterns.map((p, i) => (
              <li key={p.id}>
                <Link
                  href={`/study/${p.slug}`}
                  className="block h-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow transition"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                    {phaseId.toUpperCase()} · {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {p.title}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
