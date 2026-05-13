'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';

/**
 * 5-stage RESHADED timer for a 45-minute design drill. The stage breakdown
 * matches what the task spec calls out — a simpler 5-stage variant of the
 * 8-stage RESHADED template in `templates/answer-template.md`.
 *
 * Stages: Requirements (10m) → Estimation (5m) → High-Level Design (15m)
 *       → Deep Dive (10m) → Trade-offs (5m). Total = 45 minutes.
 *
 * State (current stage index + elapsed) persists to localStorage so a
 * refresh doesn't kill a session.
 */

export interface DesignStage {
  key: string;
  label: string;
  minutes: number;
}

export const RESHADED_STAGES: DesignStage[] = [
  { key: 'R', label: 'Requirements', minutes: 10 },
  { key: 'E', label: 'Estimation', minutes: 5 },
  { key: 'H', label: 'High-Level Design', minutes: 15 },
  { key: 'D', label: 'Deep Dive', minutes: 10 },
  { key: 'T', label: 'Trade-offs', minutes: 5 },
];

export const TOTAL_DRILL_MINUTES = RESHADED_STAGES.reduce(
  (s, st) => s + st.minutes,
  0,
);

const HISTORY_KEY = 'sd-zth:design-drill-history';

interface DrillHistoryEntry {
  itemId: string;
  totalSeconds: number;
  perStageSeconds: number[];
  endedAt: number;
}

interface DesignDrillTimerProps {
  itemId: string;
}

function formatMS(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function DesignDrillTimer({ itemId }: DesignDrillTimerProps) {
  const stateKey = `sd-zth:design-drill-state:${itemId}`;
  const [persisted, setPersisted, hydrated] = useLocalStorage<{
    startedAt: number | null;
    accumulated: number;
    stageIdx: number;
    perStageSeconds: number[];
  }>(stateKey, {
    startedAt: null,
    accumulated: 0,
    stageIdx: 0,
    perStageSeconds: RESHADED_STAGES.map(() => 0),
  });

  const [history, setHistory, historyHydrated] = useLocalStorage<
    Record<string, DrillHistoryEntry[]>
  >(HISTORY_KEY, {});

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
  const stage = RESHADED_STAGES[persisted.stageIdx];
  const elapsed = elapsedSeconds();

  // Live elapsed for the *current* stage = (current run elapsed) - sum of
  // previously-stored stage seconds. Mostly cosmetic since the user advances
  // stages manually, but it lets us color the row red when over budget.
  const priorStageSeconds = persisted.perStageSeconds
    .slice(0, persisted.stageIdx)
    .reduce((s, v) => s + v, 0);
  const currentStageSeconds = Math.max(0, elapsed - priorStageSeconds);
  const stageOverrun = stage && currentStageSeconds > stage.minutes * 60;
  const totalOverrun = elapsed > TOTAL_DRILL_MINUTES * 60;

  const start = () => {
    setPersisted({
      ...persisted,
      startedAt: Date.now(),
    });
  };

  const pause = () => {
    if (persisted.startedAt === null) return;
    const extra = Date.now() - persisted.startedAt;
    setPersisted({
      ...persisted,
      startedAt: null,
      accumulated: persisted.accumulated + extra,
    });
  };

  const advanceStage = () => {
    // Record elapsed for the stage we're leaving.
    const next = [...persisted.perStageSeconds];
    next[persisted.stageIdx] = currentStageSeconds;
    if (persisted.stageIdx >= RESHADED_STAGES.length - 1) {
      // Finishing the last stage = save run.
      finish(next);
      return;
    }
    setPersisted({
      ...persisted,
      stageIdx: persisted.stageIdx + 1,
      perStageSeconds: next,
    });
  };

  const finish = (perStageSeconds: number[]) => {
    const seconds = elapsedSeconds();
    if (seconds > 0) {
      const entry: DrillHistoryEntry = {
        itemId,
        totalSeconds: seconds,
        perStageSeconds,
        endedAt: Date.now(),
      };
      setHistory({
        ...history,
        [itemId]: [...(history[itemId] ?? []), entry],
      });
    }
    setPersisted({
      startedAt: null,
      accumulated: 0,
      stageIdx: 0,
      perStageSeconds: RESHADED_STAGES.map(() => 0),
    });
  };

  const reset = () => {
    setPersisted({
      startedAt: null,
      accumulated: 0,
      stageIdx: 0,
      perStageSeconds: RESHADED_STAGES.map(() => 0),
    });
  };

  if (!hydrated || !historyHydrated) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 h-40 animate-pulse bg-slate-50 dark:bg-slate-900" />
    );
  }

  const itemHistory = history[itemId] ?? [];

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            RESHADED Drill · 45m
          </div>
          <div
            className={`mt-0.5 text-2xl font-mono ${totalOverrun ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}
            aria-live="polite"
          >
            {formatMS(elapsed)}
            <span className="text-sm font-sans text-slate-400 ml-2">
              / {TOTAL_DRILL_MINUTES}:00
            </span>
          </div>
        </div>
        {stage ? (
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-brand-700 dark:text-brand-300 font-semibold">
              Stage {persisted.stageIdx + 1}/{RESHADED_STAGES.length}
            </div>
            <div className="text-sm font-medium">{stage.label}</div>
            <div
              className={`text-xs font-mono ${stageOverrun ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {formatMS(currentStageSeconds)} / {stage.minutes}:00
            </div>
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
          onClick={advanceStage}
          disabled={!isRunning && persisted.accumulated === 0}
          className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium disabled:opacity-40"
        >
          {persisted.stageIdx >= RESHADED_STAGES.length - 1
            ? 'Finish & save'
            : `Next: ${RESHADED_STAGES[persisted.stageIdx + 1].label} →`}
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

      <ul className="mt-3 grid grid-cols-5 gap-1.5 text-[10px] text-center">
        {RESHADED_STAGES.map((s, idx) => {
          const done = idx < persisted.stageIdx;
          const active = idx === persisted.stageIdx;
          return (
            <li
              key={s.key}
              className={`rounded px-1 py-1 border ${
                active
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-700 text-brand-800 dark:text-brand-200 font-semibold'
                  : done
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="font-bold text-base leading-none">{s.key}</div>
              <div className="mt-0.5 leading-tight">{s.label}</div>
              <div className="text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                {s.minutes}m
              </div>
            </li>
          );
        })}
      </ul>

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
                  <span className="font-mono">{formatMS(h.totalSeconds)}</span>
                </li>
              ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
