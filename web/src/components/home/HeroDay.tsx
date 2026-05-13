'use client';

import { useMemo } from 'react';
import { useProfile } from '../ProfileProvider';
import { useProgress } from '../ProgressProvider';
import { designs } from '@/lib/content';
import {
  currentScheduleDay,
  TOTAL_TRACK_DAYS,
} from '@/lib/journey';
import { daysUntilTarget } from '@/lib/profile';
import { TOTAL_PATTERNS } from '@/lib/phases';

export function HeroDay() {
  const { profile, hydrated: profileHydrated } = useProfile();
  const { counts, hydrated: progressHydrated } = useProgress();

  const day = useMemo(() => currentScheduleDay(profile), [profile]);
  const targetCountdown = useMemo(() => daysUntilTarget(profile), [profile]);

  if (!profileHydrated) {
    return (
      <section className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  if (!profile) {
    return (
      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-300">
          {TOTAL_TRACK_DAYS}-day track · 20 designs · {TOTAL_PATTERNS} patterns
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          System Design Zero to Hero
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          A structured, hands-on path from{' '}
          <em>what is a load balancer?</em> to{' '}
          <em>leading a 45-minute design round</em>. Set up your profile to
          start.
        </p>
      </section>
    );
  }

  const ids = designs.map((d) => d.id);
  const c = progressHydrated
    ? counts(ids)
    : { done: 0, review: 0, struggled: 0, unseen: ids.length };
  const totalDone = c.done;
  const pct = designs.length
    ? Math.round((totalDone / designs.length) * 100)
    : 0;
  const displayDay = Math.min(day, TOTAL_TRACK_DAYS);

  return (
    <section className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-300">
        Welcome back, {profile.name.split(' ')[0]}
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
        Day {displayDay} of {TOTAL_TRACK_DAYS}
      </h1>
      <div className="text-slate-600 dark:text-slate-300 max-w-3xl space-x-3 text-sm">
        <span>
          <strong>{pct}%</strong> complete · {totalDone}/{designs.length} designs sketched
        </span>
        {targetCountdown !== null && (
          <span>
            ·{' '}
            <span
              className={
                targetCountdown < TOTAL_TRACK_DAYS - day
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-emerald-700 dark:text-emerald-300'
              }
            >
              {targetCountdown >= 0
                ? `${targetCountdown}d until target`
                : `target was ${Math.abs(targetCountdown)}d ago`}
            </span>
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden max-w-md">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
