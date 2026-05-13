'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useProfile } from './ProfileProvider';
import {
  hoursLabel,
  priorExperienceLabel,
  studyStyleLabel,
  type DailyHours,
  type ExperienceLevel,
  type PriorExperience,
  type StudyStyle,
} from '@/lib/profile';

/**
 * Two-step onboarding modal (per learner-journey-design.md §1.4).
 *   Step 1 — Who & when:   name, target, targetDate, startDate
 *   Step 2 — Design exp:   level, priorExperience, hours, studyStyle
 *
 * Shows automatically once profile state is hydrated and there's no saved
 * profile. Closes after submission.
 */
export function ProfileOnboarding() {
  const { profile, setProfile, hydrated } = useProfile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!profile) setOpen(true);
  }, [hydrated, profile]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4 py-8"
    >
      <div className="w-full max-w-md max-h-full overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <h2
          id="onboarding-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Welcome to System Design Zero to Hero
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-4">
          A quick setup to personalise your 60-day system design interview
          prep. You can edit this anytime from your profile.
        </p>
        <OnboardingWizard
          onDone={() => setOpen(false)}
          onSave={(p) => {
            setProfile(p);
            setOpen(false);
          }}
        />
      </div>
    </div>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

interface DraftProfile {
  name: string;
  target: string;
  targetDate: string;
  startDate: string;
  level: ExperienceLevel;
  priorExperience: PriorExperience;
  hours: DailyHours;
  studyStyle: StudyStyle;
}

function OnboardingWizard({
  onSave,
}: {
  onDone: () => void;
  onSave: (p: import('@/lib/profile').UserProfile) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<DraftProfile>({
    name: '',
    target: '',
    targetDate: '',
    startDate: todayISO(),
    level: 'intermediate',
    priorExperience: 'component-level',
    hours: '2',
    studyStyle: 'mixed',
  });

  const inputBase =
    'w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

  const update = <K extends keyof DraftProfile>(key: K, value: DraftProfile[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.name.trim();
    // Adaptive default: 'none' priorExperience forces beginner level.
    const level =
      draft.priorExperience === 'none' ? ('beginner' as const) : draft.level;
    onSave({
      name: trimmed || 'Learner',
      target: draft.target.trim(),
      level,
      hours: draft.hours,
      startDate: draft.startDate,
      priorExperience: draft.priorExperience,
      targetDate: draft.targetDate || undefined,
      studyStyle: draft.studyStyle,
    });
  };

  // Live derived chip for step 2 — "finishes by <date>"
  const finishDate = (() => {
    const start = new Date(draft.startDate);
    if (Number.isNaN(start.getTime())) return null;
    const trackDays =
      draft.hours === '4' ? 45 : draft.hours === '1' ? 90 : 60;
    const finish = new Date(start);
    finish.setDate(finish.getDate() + trackDays - 1);
    return { trackDays, finishISO: finish.toISOString().slice(0, 10) };
  })();

  if (step === 1) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStep(2);
        }}
        className="space-y-4"
      >
        <StepBadge current={1} total={2} label="Who & when" />

        <Field label="Your name">
          <input
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g., Vinay"
            autoFocus
            className={inputBase}
          />
        </Field>

        <Field label="Target interview / company (optional)">
          <input
            value={draft.target}
            onChange={(e) => update('target', e.target.value)}
            placeholder="e.g., Google L5 system design round"
            className={inputBase}
          />
        </Field>

        <Field label="Interview / target date (optional)">
          <input
            type="date"
            value={draft.targetDate}
            onChange={(e) => update('targetDate', e.target.value)}
            className={inputBase}
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            When&apos;s your interview? Leave blank if open-ended.
          </p>
        </Field>

        <Field label="Start date">
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            className={inputBase}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm hover:bg-brand-700"
          >
            Next →
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <StepBadge current={2} total={2} label="Design experience" />

      <Field label="Self-rated level">
        <RadioGroup
          name="level"
          value={draft.level}
          onChange={(v) => update('level', v as ExperienceLevel)}
          options={[
            { value: 'beginner', label: 'Beginner — new to system design' },
            { value: 'intermediate', label: 'Intermediate — know basics' },
            { value: 'advanced', label: 'Advanced — refreshing for senior rounds' },
          ]}
        />
      </Field>

      <Field label="Prior system-design experience">
        <RadioGroup
          name="priorExperience"
          value={draft.priorExperience}
          onChange={(v) => update('priorExperience', v as PriorExperience)}
          options={[
            {
              value: 'none',
              label: priorExperienceLabel('none'),
              hint: "I've heard of REST and caches but never sketched a system.",
            },
            {
              value: 'component-level',
              label: priorExperienceLabel('component-level'),
              hint: "I've built API endpoints or microservices, but the whole-system view is new.",
            },
            {
              value: 'system-level',
              label: priorExperienceLabel('system-level'),
              hint: "I've designed services end-to-end at work, picked databases, owned an SLA.",
            },
            {
              value: 'led-design',
              label: priorExperienceLabel('led-design'),
              hint: "I've led architecture reviews and made cross-team trade-off calls.",
            },
          ]}
        />
      </Field>

      <Field label="Daily study hours">
        <RadioGroup
          name="hours"
          value={draft.hours}
          onChange={(v) => update('hours', v as DailyHours)}
          options={[
            { value: '1', label: hoursLabel('1') },
            { value: '2', label: hoursLabel('2') },
            { value: '4', label: hoursLabel('4') },
          ]}
        />
      </Field>

      <Field label="How do you prefer to learn?">
        <RadioGroup
          name="studyStyle"
          value={draft.studyStyle}
          onChange={(v) => update('studyStyle', v as StudyStyle)}
          options={[
            { value: 'theory-first', label: studyStyleLabel('theory-first') },
            { value: 'mixed', label: studyStyleLabel('mixed') },
            { value: 'designs-first', label: studyStyleLabel('designs-first') },
          ]}
        />
      </Field>

      {finishDate ? (
        <div className="rounded-md bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 p-3 text-xs text-slate-700 dark:text-slate-300">
          Track: <strong>{finishDate.trackDays} days</strong> ·{' '}
          ~{Math.round(finishDate.trackDays / 7)} weeks · finishes{' '}
          <strong>{finishDate.finishISO}</strong>.
        </div>
      ) : null}

      <div className="flex justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm hover:bg-brand-700"
        >
          Start learning
        </button>
      </div>
    </form>
  );
}

function StepBadge({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-brand-700 dark:text-brand-300 font-semibold">
      <span>
        Step {current} of {total}
      </span>
      <span aria-hidden className="text-slate-300 dark:text-slate-600">·</span>
      <span className="text-slate-700 dark:text-slate-300 normal-case font-medium">
        {label}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

interface RadioOption {
  value: string;
  label: string;
  hint?: string;
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: RadioOption[];
}) {
  return (
    <div className="space-y-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label
            key={o.value}
            className={`flex items-start gap-2 rounded-md border px-3 py-2 cursor-pointer text-sm transition ${
              active
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-700 ring-1 ring-brand-200 dark:ring-brand-800'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={active}
              onChange={() => onChange(o.value)}
              className="mt-0.5 accent-brand-600"
            />
            <span className="flex-1">
              <span className="block text-slate-900 dark:text-slate-100">
                {o.label}
              </span>
              {o.hint ? (
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {o.hint}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
