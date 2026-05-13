'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useProgress } from '@/components/ProgressProvider';
import { StatusDots } from '@/components/StatusPill';
import type { Design, Difficulty } from '@/generated/types';
import { STATUS_DOT_COLOR } from '@/lib/statusColors';

interface DesignsBrowserProps {
  designs: Design[];
  /** Phase 4 and Phase 5 — the two phases that have case-study designs. */
  phases: Array<{ id: string; title: string }>;
  /** Pre-aggregated company list (e.g., "Google, Meta, Amazon"). */
  companies: string[];
  /** Pre-aggregated concept list (e.g., "Sharding", "Fan-out"). */
  concepts: string[];
}

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['done', 'review', 'struggled', 'unseen'] as const;

const DIFF_CLASSES: Record<Difficulty, string> = {
  Easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  Hard: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

const DIFF_SHORT: Record<Difficulty, string> = {
  Easy: 'Easy',
  Medium: 'Med',
  Hard: 'Hard',
};

export function DesignsBrowser({
  designs,
  phases,
  companies,
  concepts,
}: DesignsBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hydrate filter state from URL on mount. Keep all URL-sync logic identical
  // to dsa-zth's ProblemsBrowser — same query-string keys, same replace flow.
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [phaseFilter, setPhaseFilter] = useState<string>(
    () => searchParams.get('phase') ?? 'all',
  );
  const [diffFilter, setDiffFilter] = useState<'all' | Difficulty>(
    () => (searchParams.get('difficulty') as 'all' | Difficulty) ?? 'all',
  );
  const [companyFilter, setCompanyFilter] = useState<string>(
    () => searchParams.get('company') ?? 'all',
  );
  const [conceptFilter, setConceptFilter] = useState<string>(
    () => searchParams.get('concept') ?? 'all',
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | (typeof STATUSES)[number]
  >(() => (searchParams.get('status') as 'all' | (typeof STATUSES)[number]) ?? 'all');

  // Sync filters → URL (replace, no history bloat).
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (phaseFilter !== 'all') params.set('phase', phaseFilter);
    if (diffFilter !== 'all') params.set('difficulty', diffFilter);
    if (companyFilter !== 'all') params.set('company', companyFilter);
    if (conceptFilter !== 'all') params.set('concept', conceptFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [query, phaseFilter, diffFilter, companyFilter, conceptFilter, statusFilter, router, pathname]);

  const { getStatus, counts, hydrated } = useProgress();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return designs.filter((d) => {
      if (phaseFilter !== 'all' && d.phaseId !== phaseFilter) return false;
      if (diffFilter !== 'all' && d.difficulty !== diffFilter) return false;
      if (companyFilter !== 'all') {
        const cs = (d.companies ?? '').toLowerCase();
        if (!cs.includes(companyFilter.toLowerCase())) return false;
      }
      if (conceptFilter !== 'all') {
        const cs = (d.concepts ?? '').toLowerCase();
        if (!cs.includes(conceptFilter.toLowerCase())) return false;
      }
      if (statusFilter !== 'all') {
        const s = getStatus(d.id);
        if (s !== statusFilter) return false;
      }
      if (q) {
        const hay = `${d.title} ${d.pattern ?? ''} ${d.moduleTitle} ${d.companies ?? ''} ${d.concepts ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [designs, query, phaseFilter, diffFilter, companyFilter, conceptFilter, statusFilter, getStatus]);

  const totalCounts = hydrated
    ? counts(designs.map((d) => d.id))
    : { done: 0, review: 0, struggled: 0, unseen: designs.length };

  const reset = () => {
    setQuery('');
    setPhaseFilter('all');
    setDiffFilter('all');
    setCompanyFilter('all');
    setConceptFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <label className="text-xs space-y-1 lg:col-span-2">
            <span className="block text-slate-600 dark:text-slate-400">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="title, company, concept…"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <FilterSelect
            label="Phase"
            value={phaseFilter}
            onChange={setPhaseFilter}
            options={[
              { value: 'all', label: 'All phases' },
              ...phases.map((p) => ({ value: p.id, label: p.title })),
            ]}
          />
          <FilterSelect
            label="Difficulty"
            value={diffFilter}
            onChange={(v) => setDiffFilter(v as 'all' | Difficulty)}
            options={[
              { value: 'all', label: 'All difficulties' },
              ...DIFFICULTIES.map((d) => ({ value: d, label: DIFF_SHORT[d] })),
            ]}
          />
          <FilterSelect
            label="Company"
            value={companyFilter}
            onChange={setCompanyFilter}
            options={[
              { value: 'all', label: 'All companies' },
              ...companies.map((c) => ({ value: c, label: c })),
            ]}
          />
          <FilterSelect
            label="Concept"
            value={conceptFilter}
            onChange={setConceptFilter}
            options={[
              { value: 'all', label: 'All concepts' },
              ...concepts.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
        <div className="grid sm:grid-cols-1 lg:grid-cols-6 gap-3">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as typeof statusFilter)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'done', label: 'Got it' },
              { value: 'review', label: 'Review' },
              { value: 'struggled', label: 'Struggled' },
              { value: 'unseen', label: 'Unseen' },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong>{filtered.length}</strong> of {designs.length}
            </span>
            <StatusDots counts={totalCounts} total={designs.length} />
          </div>
          <button
            type="button"
            onClick={reset}
            className="underline hover:text-brand-600 dark:hover:text-brand-300"
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No designs match those filters.
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d) => {
            const status = hydrated ? getStatus(d.id) : 'unseen';
            return (
              <li key={d.id}>
                <Link
                  href={`/designs/${d.slug}`}
                  className="block h-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase font-semibold tracking-wide text-brand-700 dark:text-brand-300 truncate">
                      {d.phaseId.toUpperCase()} · {d.moduleTitle}
                    </span>
                    <span
                      className={`inline-block w-2 h-2 rounded-full shrink-0 ${STATUS_DOT_COLOR[status] ?? STATUS_DOT_COLOR.unseen}`}
                      title={`Status: ${status}`}
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-1 font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {d.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                    {d.difficulty ? (
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${DIFF_CLASSES[d.difficulty]}`}
                      >
                        {DIFF_SHORT[d.difficulty]}
                      </span>
                    ) : null}
                    {d.pattern ? (
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">
                        {d.pattern}
                      </span>
                    ) : null}
                    {d.timeLimit ? (
                      <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-500">
                        {d.timeLimit}m
                      </span>
                    ) : null}
                  </div>
                  {d.companies ? (
                    <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {d.companies}
                    </div>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="text-xs space-y-1">
      <span className="block text-slate-600 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
