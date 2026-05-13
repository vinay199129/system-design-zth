'use client';

import { useProgress } from '@/components/ProgressProvider';
import { designs } from '@/lib/content';
import { PHASES } from '@/lib/phases';

export default function ProgressPage() {
  const { counts, hydrated } = useProgress();

  if (!hydrated) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }

  const allIds = designs.map((d) => d.id);
  const totalDesigns = allIds.length;
  const totals = counts(allIds);
  const tracked = totals.done + totals.review + totals.struggled;
  const percent =
    totalDesigns > 0 ? Math.round((totals.done / totalDesigns) * 100) : 0;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Overall view of where you are across all phases.
        </p>
      </header>

      <div className="grid sm:grid-cols-4 gap-3">
        <Stat label="Sketched" value={totals.done} accent="emerald" />
        <Stat label="Review" value={totals.review} accent="amber" />
        <Stat label="Struggled" value={totals.struggled} accent="rose" />
        <Stat label="Unseen" value={totalDesigns - tracked} accent="slate" />
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Overall completion
            </div>
            <div className="text-2xl font-semibold mt-1">
              {percent}%
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                {totals.done} / {totalDesigns} designs sketched
              </span>
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">By phase</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PHASES.map((phase) => {
            const phaseDesigns = designs.filter(
              (d) => d.phaseId === phase.id,
            );
            const ids = phaseDesigns.map((d) => d.id);
            const c = counts(ids);
            const total = phaseDesigns.length;
            const pct = total > 0 ? Math.round((c.done / total) * 100) : 0;
            return (
              <div
                key={phase.id}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
              >
                <div className="flex justify-between items-baseline">
                  <div className="font-medium">{phase.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {total > 0 ? `${c.done} / ${total}` : '—'}
                  </div>
                </div>
                {total > 0 ? (
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                ) : (
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    No design drills (study sections only)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'emerald' | 'amber' | 'rose' | 'slate';
}) {
  const classes = {
    emerald:
      'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100',
    amber:
      'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100',
    rose:
      'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100',
    slate:
      'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100',
  }[accent];
  return (
    <div className={`rounded-lg border p-4 ${classes}`}>
      <div className="text-xs uppercase tracking-wide opacity-75">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
