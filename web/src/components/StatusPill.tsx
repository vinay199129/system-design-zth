import type { ProgressStatus } from '@/lib/progress';
import { STATUS_DOT_COLOR, STATUS_PILL, STATUS_LABEL } from '@/lib/statusColors';

interface StatusDotsProps {
  counts: Record<ProgressStatus, number>;
  total: number;
}

/**
 * Status indicator row matching interview-prep-hub style.
 * Shows colored dots with counts for done / review / struggled, plus unseen total.
 */
export function StatusDots({ counts, total }: StatusDotsProps) {
  const unseenCount = total - counts.done - counts.review - counts.struggled;
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
      <span className="inline-flex items-center gap-1" title="Got it">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {counts.done}
      </span>
      <span className="inline-flex items-center gap-1" title="Review later">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
        {counts.review}
      </span>
      <span className="inline-flex items-center gap-1" title="Struggled">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
        {counts.struggled}
      </span>
      <span className="inline-flex items-center gap-1" title="Unseen">
        <span className="inline-block w-1.5 h-1.5 rounded-full border border-slate-400 dark:border-slate-600" />
        {unseenCount} unseen
      </span>
    </div>
  );
}

interface StatusPillProps {
  status: ProgressStatus;
  onClick?: () => void;
}

export function StatusPill({ status, onClick }: StatusPillProps) {
  const classes = STATUS_PILL[status];
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${classes} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {STATUS_LABEL[status]}
    </Tag>
  );
}

// keep both also available for use as bullets if someone imports it elsewhere
export { STATUS_DOT_COLOR };

