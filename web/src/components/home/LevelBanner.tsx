'use client';

import { useMemo } from 'react';
import { useProfile } from '../ProfileProvider';
import { getLevelBanner } from '@/lib/journey';

export function LevelBanner() {
  const { profile, hydrated } = useProfile();
  const banner = useMemo(() => getLevelBanner(profile), [profile]);

  if (!hydrated || !profile || banner.kind === null) return null;

  const styles =
    banner.kind === 'time-pressure'
      ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100'
      : banner.kind === 'phase-0-essential'
        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
        : 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100';

  const label =
    banner.kind === 'time-pressure'
      ? 'Time check'
      : banner.kind === 'phase-0-essential'
        ? 'A note for beginners'
        : 'Diagnostic available';

  return (
    <section className={`rounded-lg border p-3 sm:p-4 ${styles}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </div>
      <p className="text-sm mt-0.5">{banner.message}</p>
    </section>
  );
}
