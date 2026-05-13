'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  buildRedoQueue,
  countByStatus,
  DEFAULT_PROGRESS,
  markActivity,
  PROGRESS_STORAGE_KEY,
  setStatus as applyStatus,
  statusOf,
  type ProgressState,
  type ProgressStatus,
  type RedoEntry,
} from '@/lib/progress';
import { useLocalStorage } from '@/lib/useLocalStorage';

interface ProgressContextValue {
  state: ProgressState;
  hydrated: boolean;
  getStatus: (itemId: string) => ProgressStatus;
  setItemStatus: (itemId: string, status: ProgressStatus) => void;
  cycleStatus: (itemId: string) => ProgressStatus;
  counts: (itemIds: string[]) => Record<ProgressStatus, number>;
  redoQueue: () => RedoEntry[];
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const STATUS_CYCLE: ProgressStatus[] = ['unseen', 'done', 'review', 'struggled'];

/** Ensure all required fields exist (handles legacy state shapes). */
function normalize(state: ProgressState | null | undefined): ProgressState {
  return {
    ...DEFAULT_PROGRESS,
    ...(state ?? {}),
    items: { ...(state?.items ?? {}) },
    touched: { ...(state?.touched ?? {}) },
    intervalIdx: { ...(state?.intervalIdx ?? {}) },
    heatmap: { ...(state?.heatmap ?? {}) },
  };
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [rawState, setRawState, hydrated] = useLocalStorage<ProgressState>(
    PROGRESS_STORAGE_KEY,
    DEFAULT_PROGRESS,
  );

  // Always work with a normalized copy so legacy users don't crash.
  const state = useMemo(() => normalize(rawState), [rawState]);

  const setState = useCallback(
    (next: ProgressState | ((prev: ProgressState) => ProgressState)) => {
      setRawState((prev) => {
        const normalizedPrev = normalize(prev);
        return typeof next === 'function'
          ? (next as (p: ProgressState) => ProgressState)(normalizedPrev)
          : next;
      });
    },
    [setRawState],
  );

  const getStatus = useCallback(
    (id: string) => statusOf(state, id),
    [state],
  );

  const setItemStatus = useCallback(
    (id: string, status: ProgressStatus) => {
      setState((prev) => markActivity(applyStatus(prev, id, status)));
    },
    [setState],
  );

  const cycleStatus = useCallback(
    (id: string): ProgressStatus => {
      const current = statusOf(state, id);
      const idx = STATUS_CYCLE.indexOf(current);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      setState((prev) => markActivity(applyStatus(prev, id, next)));
      return next;
    },
    [state, setState],
  );

  const counts = useCallback(
    (ids: string[]) => countByStatus(state, ids),
    [state],
  );

  const redoQueue = useCallback(() => buildRedoQueue(state), [state]);

  const reset = useCallback(() => setState(DEFAULT_PROGRESS), [setState]);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      getStatus,
      setItemStatus,
      cycleStatus,
      counts,
      redoQueue,
      reset,
    }),
    [state, hydrated, getStatus, setItemStatus, cycleStatus, counts, redoQueue, reset],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

