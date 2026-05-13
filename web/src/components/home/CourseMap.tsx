'use client';

import { useState } from 'react';
import { PhaseCard } from '../PhaseCard';
import { PHASES } from '@/lib/phases';

/**
 * Demoted / collapsed-by-default 7-phase grid. The "Course map" header acts
 * as a toggle; expanded view renders <PhaseCard> for each phase.
 */
export function CourseMap() {
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide hover:text-brand-700 dark:hover:text-brand-300"
        aria-expanded={open}
      >
        <span>Course map · 7 phases · 20 designs</span>
        <span aria-hidden className="text-base">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PHASES.map((p) => (
            <PhaseCard key={p.id} phase={p} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
