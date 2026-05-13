'use client';

import Link from 'next/link';
import { useProgress } from './ProgressProvider';
import { StatusDots } from './StatusPill';
import { ACCENT_CLASSES, type Phase } from '@/lib/phases';
import { designs as allDesigns } from '@/lib/content';

interface PhaseCardProps {
  phase: Phase;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  const { counts, hydrated } = useProgress();
  const phaseDesigns = allDesigns.filter((d) => d.phaseId === phase.id);
  const ids = phaseDesigns.map((d) => d.id);
  const total = phaseDesigns.length || phase.designCount;
  const statusCounts = hydrated
    ? counts(ids)
    : { done: 0, review: 0, struggled: 0, unseen: total };
  const accent = ACCENT_CLASSES[phase.accent];

  return (
    <Link
      href={phase.href}
      className={`block rounded-lg border p-5 hover:shadow transition ${accent.cardBg} ${accent.cardBorder}`}
    >
      <div className={`text-xs font-semibold uppercase tracking-wide ${accent.label}`}>
        {phase.shortLabel} · {phase.days}
      </div>
      <h3 className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
        {phase.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
        {phase.description}
      </p>
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {total > 0
          ? `${total} design${total === 1 ? '' : 's'} · ${phase.modules} module${phase.modules === 1 ? '' : 's'}`
          : `${phase.modules} module${phase.modules === 1 ? '' : 's'}`}
      </div>
      {total > 0 ? <StatusDots counts={statusCounts} total={total} /> : null}
    </Link>
  );
}
