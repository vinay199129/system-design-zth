'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { StudySection } from '@/generated/types';
import { useProgress } from './ProgressProvider';

interface StudySidebarProps {
  groups: Array<{
    phaseId: string;
    phaseTitle: string;
    sections: StudySection[];
  }>;
  /** Slug of the currently visible section, if any. */
  activeSlug?: string | null;
}

const PHASE_BADGE_CLASSES: Record<string, string> = {
  guide:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  p0: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  p1: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
  p2: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  p3: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  p4: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  p5: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  p6: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  templates:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const PHASE_LABEL: Record<string, string> = {
  guide: 'Guides',
  p0: 'Phase 0',
  p1: 'Phase 1',
  p2: 'Phase 2',
  p3: 'Phase 3',
  p4: 'Phase 4',
  p5: 'Phase 5',
  p6: 'Phase 6',
  templates: 'Templates',
};

export function StudySidebar({ groups, activeSlug }: StudySidebarProps) {
  const { getStatus, hydrated } = useProgress();
  const [query, setQuery] = useState('');

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        sections: g.sections.filter((s) =>
          s.title.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.sections.length > 0);
  }, [groups, query]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const g of groups) {
      initial[g.phaseId] =
        activeSlug != null && g.sections.some((s) => s.slug === activeSlug);
    }
    return initial;
  });

  const isOpen = (phaseId: string) => {
    if (query.trim()) return true;
    return !!expanded[phaseId];
  };

  const toggle = (phaseId: string) =>
    setExpanded((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));

  return (
    <nav
      aria-label="Study sections"
      className="text-sm space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-2 scrollbar-thin z-0"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sections…"
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      {filteredGroups.length === 0 ? (
        <p className="px-2 py-3 text-xs text-slate-500 dark:text-slate-400">
          No sections match &quot;{query}&quot;.
        </p>
      ) : (
        filteredGroups.map((g) => {
          const open = isOpen(g.phaseId);
          const done = hydrated
            ? g.sections.filter((s) => getStatus(s.id) === 'done').length
            : 0;
          const total = g.sections.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const badgeClasses =
            PHASE_BADGE_CLASSES[g.phaseId] ?? PHASE_BADGE_CLASSES.guide;
          const label = PHASE_LABEL[g.phaseId] ?? g.phaseTitle;
          return (
            <div
              key={g.phaseId}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(g.phaseId)}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                aria-expanded={open}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0 ${badgeClasses}`}
                    >
                      {label}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {g.phaseTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    <span className="tabular-nums">
                      {done}/{total}
                    </span>
                    <span
                      aria-hidden
                      className="inline-block text-slate-400 dark:text-slate-600 leading-none"
                    >
                      {open ? '▾' : '▸'}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 h-0.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
              {open ? (
                <ul className="border-t border-slate-200 dark:border-slate-800 py-1.5 px-1.5 space-y-0.5">
                  {g.sections.map((s) => {
                    const active = s.slug === activeSlug;
                    const status = hydrated ? getStatus(s.id) : 'unseen';
                    return (
                      <li key={s.id}>
                        <Link
                          href={`/study/${s.slug}`}
                          className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs leading-snug ${
                            active
                              ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-800 dark:text-brand-100 font-medium ring-1 ring-brand-200 dark:ring-brand-800'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="line-clamp-2">{s.title}</span>
                          <StatusBullet status={status} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })
      )}
    </nav>
  );
}

function StatusBullet({ status }: { status: string }) {
  const cls =
    status === 'done'
      ? 'bg-emerald-500'
      : status === 'review'
        ? 'bg-amber-500'
        : status === 'struggled'
          ? 'bg-rose-500'
          : 'bg-transparent border border-slate-300 dark:border-slate-600';
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${cls}`}
      aria-hidden
    />
  );
}
