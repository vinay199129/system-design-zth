/**
 * Shared status colour tokens — used by StatusControl, StatusPill,
 * ProblemsBrowser, redo/page, study/[slug] sidebar, /progress, and home cards.
 *
 * Keep these in sync with the `done | review | struggled | unseen` semantics
 * in `progress.ts`.
 */
import type { ProgressStatus } from './progress';

export const STATUS_DOT_COLOR: Record<ProgressStatus, string> = {
  done: 'bg-emerald-500',
  review: 'bg-amber-500',
  struggled: 'bg-rose-500',
  unseen: 'bg-transparent border border-slate-300 dark:border-slate-600',
};

export const STATUS_LABEL: Record<ProgressStatus, string> = {
  done: 'Got it',
  review: 'Review',
  struggled: 'Struggled',
  unseen: 'Unseen',
};

/** Soft card backgrounds used on /progress stat tiles. */
export const STATUS_SOFT_BG: Record<ProgressStatus, string> = {
  done: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100',
  review:
    'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100',
  struggled:
    'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100',
  unseen:
    'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100',
};

/** Pill chip variants — used by problem-card "Got it"/"Review"/"Struggled" labels. */
export const STATUS_PILL: Record<ProgressStatus, string> = {
  done: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800',
  review:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800',
  struggled:
    'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800',
  unseen:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

/** Button outlines used by StatusControl for selectable status options. */
export const STATUS_BUTTON_OUTLINE: Record<
  Exclude<ProgressStatus, 'unseen'>,
  string
> = {
  done: 'border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
  review:
    'border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/30',
  struggled:
    'border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/30',
};

/** Ring/active shading applied when a StatusControl button is the current state. */
export const STATUS_BUTTON_ACTIVE: Record<
  Exclude<ProgressStatus, 'unseen'>,
  string
> = {
  done: 'bg-emerald-100 dark:bg-emerald-900/40 ring-2 ring-emerald-500',
  review: 'bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-500',
  struggled: 'bg-rose-100 dark:bg-rose-900/40 ring-2 ring-rose-500',
};
