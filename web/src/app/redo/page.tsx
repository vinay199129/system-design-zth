'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProgress } from '@/components/ProgressProvider';
import { StatusControl } from '@/components/StatusControl';
import { designs, studySections } from '@/lib/content';
import {
  DESIGN_REDO_INTERVAL_DAYS,
  REDO_INTERVAL_DAYS,
} from '@/lib/progress';
import type { RedoEntry } from '@/lib/progress';

interface DisplayEntry extends RedoEntry {
  title: string;
  href: string;
  context: string;
}

/**
 * Spaced-repetition redo queue. Design drills (Phase 4-5 case studies) use
 * the long cadence (DESIGN_REDO_INTERVAL_DAYS = [7, 21, 60]); study sections
 * and case-study reviews use the short cadence ([1, 3, 7, 14]).
 */
export default function RedoPage() {
  const { redoQueue, hydrated } = useProgress();

  const items = useMemo(() => {
    if (!hydrated) return [] as DisplayEntry[];
    const out: DisplayEntry[] = [];
    for (const e of redoQueue()) {
      const design = designs.find((d) => d.id === e.itemId);
      if (design) {
        out.push({
          ...e,
          title: design.title,
          href: `/designs/${design.slug}`,
          context: `${design.phaseTitle} · ${design.moduleTitle}`,
        });
        continue;
      }
      const section = studySections.find((s) => s.id === e.itemId);
      if (section) {
        out.push({
          ...e,
          title: section.title,
          href: `/study/${section.slug}`,
          context: section.phaseTitle,
        });
        continue;
      }
      out.push({
        ...e,
        title: e.itemId,
        href: '/progress',
        context: 'Unknown item',
      });
    }
    return out;
  }, [redoQueue, hydrated]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Redo queue</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          Items you marked as <em>Struggled</em> or <em>Review</em> resurface
          here on a spaced-repetition schedule. Study sections + case studies
          use <strong>{REDO_INTERVAL_DAYS.join(' / ')}</strong> days; full
          design drills use the longer{' '}
          <strong>{DESIGN_REDO_INTERVAL_DAYS.join(' / ')}</strong> days (a
          45-minute sketch is expensive — fewer, deeper reps). Sketch again,
          mark <strong>Got it</strong>, and the item advances to the next
          interval. Graduates after the last successful pass.
        </p>
      </header>

      {!hydrated ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Loading your queue…
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <DueAndUpcoming items={items} />
      )}
    </section>
  );
}

function DueAndUpcoming({ items }: { items: DisplayEntry[] }) {
  const due = items.filter((i) => i.dueIn <= 0);
  const upcoming = items.filter((i) => i.dueIn > 0);
  return (
    <>
      <Section
        title="Due now"
        tone="rose"
        count={due.length}
        entries={due}
        emptyMessage="Nothing due today — nice work."
      />
      <Section
        title="Upcoming"
        tone="slate"
        count={upcoming.length}
        entries={upcoming}
        emptyMessage="No items waiting in the queue."
      />
    </>
  );
}

function Section({
  title,
  tone,
  count,
  entries,
  emptyMessage,
}: {
  title: string;
  tone: 'rose' | 'slate';
  count: number;
  entries: DisplayEntry[];
  emptyMessage: string;
}) {
  const headerClasses =
    tone === 'rose'
      ? 'text-rose-700 dark:text-rose-300'
      : 'text-slate-700 dark:text-slate-300';
  return (
    <div className="space-y-3">
      <h2 className={`text-lg font-semibold ${headerClasses}`}>
        {title}{' '}
        <span className="text-slate-500 dark:text-slate-400 font-normal text-base">
          · {count}
        </span>
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <EntryRow key={e.itemId} entry={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EntryRow({ entry }: { entry: DisplayEntry }) {
  const overdue = entry.dueIn < 0;
  const dueLabel =
    entry.dueIn === 0
      ? 'Due today'
      : entry.dueIn < 0
        ? `${-entry.dueIn}d overdue`
        : `Due in ${entry.dueIn}d`;
  const dueClasses = overdue
    ? 'text-rose-700 dark:text-rose-300'
    : entry.dueIn === 0
      ? 'text-amber-700 dark:text-amber-300'
      : 'text-slate-500 dark:text-slate-400';
  return (
    <li className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase font-semibold tracking-wide text-brand-700 dark:text-brand-300 truncate">
            {entry.context}
            {entry.kind === 'design-drill' ? ' · 45-min drill' : ''}
          </div>
          <Link
            href={entry.href}
            className="block mt-0.5 font-medium text-slate-900 dark:text-slate-100 hover:text-brand-700 dark:hover:text-brand-300 truncate"
          >
            {entry.title}
          </Link>
          <div className="mt-1.5 text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className={dueClasses}>{dueLabel}</span>
            <span className="text-slate-500 dark:text-slate-400">
              interval {entry.intervalDays}d · last touched {entry.daysSinceTouched}d
              ago
            </span>
            <span className="text-slate-500 dark:text-slate-400 capitalize">
              status: <strong className="font-medium">{entry.status}</strong>
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <StatusControl itemId={entry.itemId} compact />
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-8 text-center">
      <h3 className="font-medium text-slate-900 dark:text-slate-100">
        Your queue is empty
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        Mark designs as <em>Struggled</em> or <em>Review</em> as you sketch
        them and they&apos;ll show up here on a spaced-repetition schedule.
      </p>
      <div className="mt-4 flex justify-center gap-2 text-sm">
        <Link
          href="/designs"
          className="inline-flex items-center px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-700"
        >
          Browse designs
        </Link>
        <Link
          href="/study"
          className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Open study
        </Link>
      </div>
    </div>
  );
}
