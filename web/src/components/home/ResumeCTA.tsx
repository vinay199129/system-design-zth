'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProfile } from '../ProfileProvider';
import { useProgress } from '../ProgressProvider';
import { getNextRecommendation } from '@/lib/journey';

export function ResumeCTA() {
  const { profile, hydrated: profileHydrated } = useProfile();
  const { state, hydrated: progressHydrated } = useProgress();

  const rec = useMemo(() => {
    if (!profileHydrated || !progressHydrated) return null;
    return getNextRecommendation(profile, state);
  }, [profile, state, profileHydrated, progressHydrated]);

  if (!rec) {
    return (
      <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  const isAllDone = rec.kind === 'all-done';
  const isRedo = rec.kind === 'redo';

  return (
    <Link
      href={rec.href}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition group ${
        isRedo
          ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50'
          : isAllDone
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            : 'border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          {isRedo ? 'Review first' : isAllDone ? 'Track complete' : 'Continue'}
        </div>
        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
          {rec.title}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
          {rec.reason}
        </div>
      </div>
      <span
        className="shrink-0 text-brand-700 dark:text-brand-300 text-xl group-hover:translate-x-0.5 transition-transform"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}
