'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProfile } from '../ProfileProvider';
import { useProgress } from '../ProgressProvider';
import { scheduleDay } from '@/lib/content';
import {
  currentScheduleDay,
  hrefForItem,
  resolveScheduleItems,
  TOTAL_TRACK_DAYS,
} from '@/lib/journey';
import { STATUS_DOT_COLOR, STATUS_LABEL } from '@/lib/statusColors';

export function TodayPlan() {
  const { profile, hydrated: profileHydrated } = useProfile();
  const { getStatus, hydrated: progressHydrated } = useProgress();
  const day = useMemo(() => currentScheduleDay(profile), [profile]);
  const today = useMemo(() => scheduleDay(day), [day]);

  if (!profileHydrated) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 h-40 animate-pulse bg-slate-50 dark:bg-slate-900" />
    );
  }

  if (!profile) {
    return (
      <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
        <div className="text-xs uppercase font-semibold tracking-wide text-brand-700 dark:text-brand-300">
          What a typical day looks like (Day 33)
        </div>
        <h2 className="text-lg font-semibold">Phase 4 · URL Shortener</h2>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
          <li>· (R) Module README (10m)</li>
          <li>· (R) problem.md — requirements + scope (10m)</li>
          <li>· (P) Full design from scratch · 45-min RESHADED</li>
          <li>· (V) Compare with solution.md (30m)</li>
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ~3.5 hours · set up your profile to start tracking
        </p>
      </section>
    );
  }

  if (!today) {
    if (day > TOTAL_TRACK_DAYS) {
      return (
        <section className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-6 space-y-2">
          <div className="text-xs uppercase font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
            🎉 Track complete
          </div>
          <h2 className="text-lg font-semibold">
            You&apos;ve cleared all {TOTAL_TRACK_DAYS} days.
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Stay sharp with weekly mocks on the{' '}
            <Link href="/review" className="underline">
              weekly review
            </Link>{' '}
            page and revisit anything in your{' '}
            <Link href="/redo" className="underline">
              redo queue
            </Link>
            .
          </p>
        </section>
      );
    }
    return (
      <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2">
        <h2 className="text-lg font-semibold">No schedule entry for Day {day}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Free study day — work on items from your redo queue or pick a topic
          from the course map below.
        </p>
      </section>
    );
  }

  const items = resolveScheduleItems(today, profile.studyStyle ?? 'mixed');
  const completed = progressHydrated
    ? items.filter((i) => getStatus(i.id) === 'done').length
    : 0;
  const totalMinutes = items.reduce((s, i) => s + (i.timeMinutes ?? 0), 0);

  return (
    <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase font-semibold tracking-wide text-brand-700 dark:text-brand-300">
            Today · Day {today.day} · {today.phaseTitle}
          </div>
          <h2 className="text-lg font-semibold mt-0.5">
            {today.modules.length > 0
              ? today.modules
                  .map((m) =>
                    m
                      .split('-')
                      .map((w) => w[0]?.toUpperCase() + w.slice(1))
                      .join(' '),
                  )
                  .join(' + ')
              : today.phaseTitle}
          </h2>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {completed}/{items.length} done
          {totalMinutes > 0 ? ` · ~${Math.round((totalMinutes / 60) * 10) / 10}h` : ''}
        </div>
      </header>

      <ul className="space-y-1.5">
        {items.length === 0 ? (
          <li className="text-sm text-slate-500 dark:text-slate-400 italic">
            {today.rawDescription || 'Free study day.'}
          </li>
        ) : (
          items.map((item) => {
            const status = progressHydrated ? getStatus(item.id) : 'unseen';
            const checked = status === 'done';
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 group rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 -mx-2 px-2 py-1.5"
              >
                <span
                  className={`shrink-0 inline-block w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLOR[status] ?? STATUS_DOT_COLOR.unseen}`}
                  aria-hidden
                  title={STATUS_LABEL[status]}
                />
                <Link
                  href={hrefForItem(item.id)}
                  className={`flex-1 text-sm truncate ${checked ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'} group-hover:text-brand-700 dark:group-hover:text-brand-300`}
                >
                  {item.marker ? (
                    <span className="text-slate-400 dark:text-slate-500 mr-2">
                      {item.marker}
                    </span>
                  ) : null}
                  {item.title}
                </Link>
                {item.timeMinutes ? (
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {item.timeMinutes}m
                  </span>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
