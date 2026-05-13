'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProfile } from '../ProfileProvider';
import { scheduleAround } from '@/lib/content';
import { currentScheduleDay, TOTAL_TRACK_DAYS } from '@/lib/journey';

export function UpNext() {
  const { profile, hydrated } = useProfile();
  const day = useMemo(() => currentScheduleDay(profile), [profile]);

  if (!hydrated || !profile || day === 0) return null;
  if (day >= TOTAL_TRACK_DAYS) return null;

  const upcoming = scheduleAround(day, 0, 3).slice(1, 4);
  if (upcoming.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
        Up next
      </h2>
      <ul className="grid sm:grid-cols-3 gap-3">
        {upcoming.map((d) => {
          const label =
            d.modules.length > 0
              ? d.modules
                  .map((m) =>
                    m
                      .split('-')
                      .map((w) => w[0]?.toUpperCase() + w.slice(1))
                      .join(' '),
                  )
                  .join(' + ')
              : d.phaseTitle;
          return (
            <li key={d.day}>
              <Link
                href="/study"
                className="block rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:shadow transition"
              >
                <div className="text-xs uppercase font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                  Day {d.day}
                </div>
                <div className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 truncate">
                  {label}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {d.problems.length > 0
                    ? `${d.problems.length} design${d.problems.length === 1 ? '' : 's'}`
                    : `${d.tasks.length} task${d.tasks.length === 1 ? '' : 's'}`}
                  {d.totalTimeHours > 0 ? ` · ~${d.totalTimeHours}h` : ''}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
