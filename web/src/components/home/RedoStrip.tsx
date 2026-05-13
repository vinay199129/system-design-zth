'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProgress } from '../ProgressProvider';
import { findDesignById, findStudySectionById } from '@/lib/content';

export function RedoStrip() {
  const { redoQueue, hydrated } = useProgress();

  const overdue = useMemo(() => {
    if (!hydrated) return [];
    return redoQueue()
      .filter((e) => e.dueIn <= 0)
      .slice(0, 5);
  }, [redoQueue, hydrated]);

  if (!hydrated || overdue.length === 0) return null;

  return (
    <section className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase font-semibold tracking-wide text-rose-700 dark:text-rose-300">
            ⚠ Review queue · {overdue.length} due
          </div>
          <p className="text-sm text-rose-900 dark:text-rose-100 mt-0.5">
            Knock these out first before today&apos;s plan.
          </p>
        </div>
        <Link
          href="/redo"
          className="text-xs underline text-rose-700 dark:text-rose-300 hover:opacity-80"
        >
          See full queue →
        </Link>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {overdue.map((e) => {
          const design = findDesignById(e.itemId);
          const section = findStudySectionById(e.itemId);
          const title = design?.title ?? section?.title ?? e.itemId;
          const href = design
            ? `/designs/${design.slug}`
            : section
              ? `/study/${section.slug}`
              : '/redo';
          const overdueLabel = e.dueIn === 0 ? 'today' : `${-e.dueIn}d`;
          return (
            <Link
              key={e.itemId}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-3 py-1 text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60"
            >
              <span className="font-medium text-rose-900 dark:text-rose-100 truncate max-w-[200px]">
                {title}
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                · {overdueLabel}
              </span>
            </Link>
          );
        })}
      </ul>
    </section>
  );
}
