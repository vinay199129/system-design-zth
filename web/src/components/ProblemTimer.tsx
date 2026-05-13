'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';

const HISTORY_KEY = 'sd-zth:timer-history';

interface TimerHistoryEntry {
  itemId: string;
  seconds: number;
  endedAt: number;
}

interface ProblemTimerProps {
  itemId: string;
  /** Suggested time in minutes (shows as the target). */
  targetMinutes?: number | null;
}

function formatHMS(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Per-problem stopwatch. Starts/stops via buttons, persists running state in
 * localStorage so a refresh doesn't lose your run. Saves completed runs to
 * a per-item history list.
 */
export function ProblemTimer({ itemId, targetMinutes }: ProblemTimerProps) {
  const stateKey = `sd-zth:timer-state:${itemId}`;
  const [persisted, setPersisted, hydrated] = useLocalStorage<{
    startedAt: number | null;
    accumulated: number;
  }>(stateKey, { startedAt: null, accumulated: 0 });

  const [history, setHistory, historyHydrated] = useLocalStorage<
    Record<string, TimerHistoryEntry[]>
  >(HISTORY_KEY, {});

  // Tick to force re-render every second when running.
  const [, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (persisted.startedAt !== null) {
      intervalRef.current = setInterval(() => setTick((n) => n + 1), 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    return undefined;
  }, [persisted.startedAt]);

  const elapsedSeconds = useCallback((): number => {
    if (persisted.startedAt === null) {
      return Math.floor(persisted.accumulated / 1000);
    }
    return Math.floor(
      (persisted.accumulated + (Date.now() - persisted.startedAt)) / 1000,
    );
  }, [persisted]);

  const isRunning = persisted.startedAt !== null;

  const start = () => {
    setPersisted({ startedAt: Date.now(), accumulated: persisted.accumulated });
  };

  const pause = () => {
    if (persisted.startedAt === null) return;
    const extra = Date.now() - persisted.startedAt;
    setPersisted({
      startedAt: null,
      accumulated: persisted.accumulated + extra,
    });
  };

  const stop = () => {
    const seconds = elapsedSeconds();
    if (seconds > 0) {
      const entry: TimerHistoryEntry = {
        itemId,
        seconds,
        endedAt: Date.now(),
      };
      setHistory({
        ...history,
        [itemId]: [...(history[itemId] ?? []), entry],
      });
    }
    setPersisted({ startedAt: null, accumulated: 0 });
  };

  const reset = () => {
    setPersisted({ startedAt: null, accumulated: 0 });
  };

  if (!hydrated || !historyHydrated) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 h-24 animate-pulse bg-slate-50 dark:bg-slate-900" />
    );
  }

  const elapsed = elapsedSeconds();
  const targetSec = targetMinutes ? targetMinutes * 60 : null;
  const overrun = targetSec !== null && elapsed > targetSec;
  const itemHistory = history[itemId] ?? [];

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Timer
          </div>
          <div
            className={`mt-0.5 text-2xl font-mono ${overrun ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}
            aria-live="polite"
          >
            {formatHMS(elapsed)}
          </div>
        </div>
        {targetMinutes ? (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            target {targetMinutes}m
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isRunning ? (
          <button
            type="button"
            onClick={pause}
            className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
          >
            {persisted.accumulated > 0 ? 'Resume' : 'Start'}
          </button>
        )}
        <button
          type="button"
          onClick={stop}
          disabled={elapsed === 0}
          className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          Save run
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={elapsed === 0}
          className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      {itemHistory.length > 0 ? (
        <details className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          <summary className="cursor-pointer select-none">
            Past runs ({itemHistory.length})
          </summary>
          <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {itemHistory
              .slice()
              .reverse()
              .map((h, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span>{new Date(h.endedAt).toLocaleString()}</span>
                  <span className="font-mono">{formatHMS(h.seconds)}</span>
                </li>
              ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
