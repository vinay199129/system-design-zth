import { Suspense } from 'react';
import { DesignsBrowser } from '@/components/DesignsBrowser';
import { allCompanies, allConcepts, designs } from '@/lib/content';
import { PHASES } from '@/lib/phases';

export const metadata = {
  title: 'Designs',
};

/**
 * The 20 FAANG case-study designs from Phase 4 (starter) and Phase 5
 * (advanced). Renamed from dsa-zth's "Problems" page — the entity is a
 * 45-minute system-design drill, not a LeetCode problem.
 */
export default function DesignsPage() {
  const phaseList = PHASES.filter((p) =>
    designs.some((d) => d.phaseId === p.id),
  ).map((p) => ({ id: p.id, title: p.title }));

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Designs{' '}
          <span className="text-slate-500 dark:text-slate-400 text-base font-normal">
            · {designs.length} total
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          The 20 classic FAANG system design case studies. Filter by phase,
          difficulty, company, or concept. Each opens to the full RESHADED
          drill with the 45-minute stage timer.
        </p>
      </header>

      <Suspense fallback={<div className="text-sm text-slate-500">Loading filters…</div>}>
        <DesignsBrowser
          designs={designs}
          phases={phaseList}
          companies={allCompanies()}
          concepts={allConcepts()}
        />
      </Suspense>
    </section>
  );
}
