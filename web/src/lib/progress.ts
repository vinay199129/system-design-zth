export type ProgressStatus = 'done' | 'review' | 'struggled' | 'unseen';

export interface ProgressState {
  /** Map of itemId -> status. Items without an entry are implicitly 'unseen'. */
  items: Record<string, Exclude<ProgressStatus, 'unseen'>>;
  /** ms timestamp of the last status change per item. */
  touched: Record<string, number>;
  /**
   * Current spaced-repetition interval index per item.
   * Updated on every "done" tap. Reset to 0 on "review" / "struggled".
   * Indexes into REDO_INTERVAL_DAYS (or DESIGN_REDO_INTERVAL_DAYS for design-drills).
   */
  intervalIdx: Record<string, number>;
  /** Per-day activity heatmap (ISO yyyy-mm-dd → count). */
  heatmap: Record<string, number>;
  /**
   * Per-item type marker so the redo queue knows whether to use the short or
   * the long cadence. Items default to the short ([1, 3, 7, 14]) cadence.
   */
  itemKind?: Record<string, 'study-section' | 'case-study' | 'design-drill'>;
}

export const PROGRESS_STORAGE_KEY = 'sd-zth:progress';

export const DEFAULT_PROGRESS: ProgressState = {
  items: {},
  touched: {},
  intervalIdx: {},
  heatmap: {},
  itemKind: {},
};

/**
 * Spaced repetition cadence for study-section and case-study items.
 * The same numbers dsa-zth used for LeetCode-style problems.
 */
export const REDO_INTERVAL_DAYS = [1, 3, 7, 14];

/**
 * Long-form cadence for full design drills (Phase 4-5). One 45-min sketch is
 * expensive, so we space the re-runs farther apart per design doc §5.
 */
export const DESIGN_REDO_INTERVAL_DAYS = [7, 21, 60];

function intervalsForItem(
  state: ProgressState,
  itemId: string,
): number[] {
  const kind = state.itemKind?.[itemId];
  if (kind === 'design-drill') return DESIGN_REDO_INTERVAL_DAYS;
  return REDO_INTERVAL_DAYS;
}

export function statusOf(
  state: ProgressState,
  itemId: string,
): ProgressStatus {
  return state.items[itemId] ?? 'unseen';
}

/**
 * Apply a status change for an item. Returns a new state object so callers can
 * persist + re-render via setState.
 */
export function setStatus(
  state: ProgressState,
  itemId: string,
  status: ProgressStatus,
  kind?: 'study-section' | 'case-study' | 'design-drill',
): ProgressState {
  const items = { ...state.items };
  const touched = { ...state.touched };
  const intervalIdx = { ...state.intervalIdx };
  const itemKind = { ...(state.itemKind ?? {}) };
  const now = Date.now();

  if (kind) itemKind[itemId] = kind;

  if (status === 'unseen') {
    delete items[itemId];
    delete touched[itemId];
    delete intervalIdx[itemId];
    delete itemKind[itemId];
  } else {
    items[itemId] = status;
    touched[itemId] = now;
    if (status === 'review' || status === 'struggled') {
      // start (or reset) spaced-repetition tracking
      intervalIdx[itemId] = 0;
    } else if (status === 'done') {
      // graduate one notch; if past the last interval, drop from queue
      if (intervalIdx[itemId] !== undefined) {
        const intervals = intervalsForItem({ ...state, itemKind }, itemId);
        const next = intervalIdx[itemId] + 1;
        if (next >= intervals.length) {
          delete intervalIdx[itemId];
        } else {
          intervalIdx[itemId] = next;
        }
      }
    }
  }
  return { ...state, items, touched, intervalIdx, itemKind };
}

export function countByStatus(
  state: ProgressState,
  itemIds: string[],
): Record<ProgressStatus, number> {
  const counts: Record<ProgressStatus, number> = {
    done: 0,
    review: 0,
    struggled: 0,
    unseen: 0,
  };
  for (const id of itemIds) {
    counts[statusOf(state, id)]++;
  }
  return counts;
}

export function markActivity(state: ProgressState): ProgressState {
  // Local-date key (matches heatmap rendering, avoids UTC rollover bug).
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return {
    ...state,
    heatmap: { ...state.heatmap, [today]: (state.heatmap[today] ?? 0) + 1 },
  };
}

// ---------------------------------------------------------------------------
// Redo queue helpers
// ---------------------------------------------------------------------------
export interface RedoEntry {
  itemId: string;
  status: Exclude<ProgressStatus, 'unseen'>;
  touchedAt: number;
  daysSinceTouched: number;
  intervalIdx: number;
  intervalDays: number;
  dueIn: number; // negative = overdue, 0 = due today, positive = days until due
  kind: 'study-section' | 'case-study' | 'design-drill';
}

/**
 * Build the redo queue. An item is in the queue if it's currently marked
 * "review" or "struggled" — i.e. the user has explicitly said "I want to see
 * this again". Graduated items (past last interval) drop out.
 *
 * design-drill items use [7, 21, 60] day intervals; everything else uses
 * [1, 3, 7, 14].
 */
export function buildRedoQueue(state: ProgressState, now = Date.now()): RedoEntry[] {
  const dayMs = 86400000;
  const entries: RedoEntry[] = [];
  for (const [id, status] of Object.entries(state.items)) {
    if (status !== 'review' && status !== 'struggled') continue;
    const touchedAt = state.touched[id] ?? now;
    const daysSinceTouched = Math.floor((now - touchedAt) / dayMs);
    const idx = state.intervalIdx[id] ?? 0;
    const intervals = intervalsForItem(state, id);
    const intervalDays = intervals[Math.min(idx, intervals.length - 1)];
    const dueIn = intervalDays - daysSinceTouched;
    const kind =
      (state.itemKind?.[id] ?? 'study-section') as RedoEntry['kind'];
    entries.push({
      itemId: id,
      status,
      touchedAt,
      daysSinceTouched,
      intervalIdx: idx,
      intervalDays,
      dueIn,
      kind,
    });
  }
  // Sort: most overdue first
  entries.sort((a, b) => a.dueIn - b.dueIn);
  return entries;
}
