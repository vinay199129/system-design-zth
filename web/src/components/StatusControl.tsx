'use client';

import { useProgress } from './ProgressProvider';
import type { ProgressStatus } from '@/lib/progress';
import {
  STATUS_BUTTON_ACTIVE,
  STATUS_BUTTON_OUTLINE,
  STATUS_LABEL,
} from '@/lib/statusColors';

interface StatusControlProps {
  itemId: string;
  /** When true, render compact pills instead of full-width buttons. */
  compact?: boolean;
}

type ActiveStatus = Exclude<ProgressStatus, 'unseen'>;

const ORDER: ActiveStatus[] = ['done', 'review', 'struggled'];

export function StatusControl({ itemId, compact = false }: StatusControlProps) {
  const { getStatus, setItemStatus, hydrated } = useProgress();
  const current = getStatus(itemId);

  if (!hydrated) {
    return (
      <div
        aria-hidden
        className="h-9 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse"
      />
    );
  }

  const size = compact
    ? 'px-2.5 py-1.5 text-[11px] min-h-[28px]'
    : 'px-3 py-1.5 text-xs min-h-[36px]';

  return (
    <div className="inline-flex flex-wrap gap-1.5" role="group" aria-label="Status">
      {ORDER.map((value) => {
        const active = current === value;
        const outline = STATUS_BUTTON_OUTLINE[value];
        const activeRing = active ? STATUS_BUTTON_ACTIVE[value] : '';
        return (
          <button
            key={value}
            type="button"
            onClick={() => setItemStatus(itemId, active ? 'unseen' : value)}
            className={`rounded-md border font-medium transition ${size} ${outline} ${activeRing}`}
            aria-pressed={active}
          >
            {STATUS_LABEL[value]}
          </button>
        );
      })}
    </div>
  );
}
