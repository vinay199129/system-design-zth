'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { compareWeekKeys, currentIsoWeek, type IsoWeek } from '@/lib/week';

interface WeeklyEntry {
  weekKey: string;
  startDate: string;
  endDate: string;
  wins: string;
  struggles: string;
  patterns: string;
  focus: string;
  savedAt: number;
}

type EntriesMap = Record<string, WeeklyEntry>;

const STORAGE_KEY = 'sd-zth:weekly-reviews';

export default function ReviewPage() {
  const [entries, setEntries, hydrated] = useLocalStorage<EntriesMap>(STORAGE_KEY, {});
  const thisWeek = useMemo(() => currentIsoWeek(), []);
  const [showEditFor, setShowEditFor] = useState<string | null>(null);

  const sortedKeys = hydrated
    ? Object.keys(entries).sort((a, b) => compareWeekKeys(b, a))
    : [];
  const thisEntry = hydrated ? entries[thisWeek.key] : undefined;
  const editingKey = showEditFor ?? (thisEntry ? null : thisWeek.key);

  const saveEntry = (
    week: IsoWeek,
    draft: Omit<WeeklyEntry, 'weekKey' | 'savedAt' | 'startDate' | 'endDate'>,
  ) => {
    const entry: WeeklyEntry = {
      weekKey: week.key,
      startDate: week.startDate,
      endDate: week.endDate,
      ...draft,
      savedAt: Date.now(),
    };
    setEntries({ ...entries, [week.key]: entry });
    setShowEditFor(null);
  };

  const deleteEntry = (key: string) => {
    const next = { ...entries };
    delete next[key];
    setEntries(next);
  };

  return (
    <section className="space-y-6 max-w-3xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Weekly review</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Capture what you learned this week. Spending five minutes here every
          Sunday compounds — patterns you couldn&apos;t see at the start of the
          week become obvious in retrospect.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wide text-brand-700 dark:text-brand-300">
              This week · {thisWeek.key}
            </div>
            <h2 className="font-semibold mt-0.5">
              {thisWeek.startDate} → {thisWeek.endDate}
            </h2>
          </div>
          {hydrated && thisEntry && editingKey !== thisWeek.key ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEditFor(thisWeek.key)}
                className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Edit
              </button>
            </div>
          ) : null}
        </div>

        {!hydrated ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading your reviews…
          </p>
        ) : editingKey === thisWeek.key || !thisEntry ? (
          <ReviewForm
            initial={thisEntry}
            onSubmit={(draft) => saveEntry(thisWeek, draft)}
            onCancel={thisEntry ? () => setShowEditFor(null) : undefined}
          />
        ) : (
          <EntryView entry={thisEntry} />
        )}
      </div>

      {sortedKeys.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <ul className="space-y-3">
            {sortedKeys.map((key) => {
              if (key === thisWeek.key) return null;
              const e = entries[key];
              return (
                <li
                  key={key}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2"
                >
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs uppercase font-semibold tracking-wide text-slate-600 dark:text-slate-400">
                        {e.weekKey}
                      </div>
                      <h3 className="font-medium mt-0.5">
                        {e.startDate} → {e.endDate}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEditFor(key)}
                        className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {showEditFor === key ? 'Cancel' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this week's entry?")) deleteEntry(key);
                        }}
                        className="text-xs px-2 py-1 rounded border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {showEditFor === key ? (
                    <ReviewForm
                      initial={e}
                      onSubmit={(draft) =>
                        saveEntry(
                          {
                            key: e.weekKey,
                            startDate: e.startDate,
                            endDate: e.endDate,
                            year: 0,
                            week: 0,
                          },
                          draft,
                        )
                      }
                      onCancel={() => setShowEditFor(null)}
                    />
                  ) : (
                    <EntryView entry={e} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function ReviewForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: WeeklyEntry;
  onSubmit: (draft: { wins: string; struggles: string; patterns: string; focus: string }) => void;
  onCancel?: () => void;
}) {
  const [wins, setWins] = useState(initial?.wins ?? '');
  const [struggles, setStruggles] = useState(initial?.struggles ?? '');
  const [patterns, setPatterns] = useState(initial?.patterns ?? '');
  const [focus, setFocus] = useState(initial?.focus ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      wins: wins.trim(),
      struggles: struggles.trim(),
      patterns: patterns.trim(),
      focus: focus.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field
        label="Wins"
        hint="Designs you sketched cleanly, trade-offs that clicked, concepts that finally made sense."
      >
        <textarea
          value={wins}
          onChange={(e) => setWins(e.target.value)}
          rows={3}
          placeholder="Nailed sharding for the URL shortener. Got RESHADED through in under 45 min on Pastebin…"
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </Field>
      <Field
        label="Struggles"
        hint="What tripped you up? Where did you spend too much time?"
      >
        <textarea
          value={struggles}
          onChange={(e) => setStruggles(e.target.value)}
          rows={3}
          placeholder="Got stuck on hot-shard mitigation. Confused myself on leader vs multi-leader replication…"
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </Field>
      <Field
        label="Patterns mastered"
        hint="Comma-separated patterns / building blocks you feel confident about."
      >
        <input
          value={patterns}
          onChange={(e) => setPatterns(e.target.value)}
          placeholder="Consistent Hashing, Fan-out on Write, Pub/Sub"
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </Field>
      <Field
        label="Focus for next week"
        hint="One or two things you'll deliberately practise."
      >
        <textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          rows={2}
          placeholder="Drill estimation templates daily. Re-read consistency models notes."
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="px-4 py-1.5 rounded-md bg-brand-600 text-white text-xs hover:bg-brand-700"
        >
          Save review
        </button>
      </div>
    </form>
  );
}

function EntryView({ entry }: { entry: WeeklyEntry }) {
  return (
    <dl className="grid sm:grid-cols-2 gap-4 text-sm">
      <Snippet label="Wins" body={entry.wins} />
      <Snippet label="Struggles" body={entry.struggles} />
      <Snippet label="Patterns mastered" body={entry.patterns} />
      <Snippet label="Focus next week" body={entry.focus} />
    </dl>
  );
}

function Snippet({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap text-slate-800 dark:text-slate-200">
        {body || (
          <span className="text-slate-400 dark:text-slate-600 italic">—</span>
        )}
      </dd>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      {hint ? (
        <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
          {hint}
        </span>
      ) : (
        <span className="block mb-1" />
      )}
      {children}
    </label>
  );
}
