'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  hoursLabel,
  levelLabel,
  priorExperienceLabel,
  studyStyleLabel,
  type DailyHours,
  type ExperienceLevel,
  type PriorExperience,
  type StudyStyle,
  type UserProfile,
} from '@/lib/profile';

interface ProfileFormProps {
  initial: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onCancel?: () => void;
  submitLabel?: string;
  showCancel?: boolean;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * One-shot settings form (used by /profile). Shows every field in a single
 * column. ProfileOnboarding renders the same fields split across 2 steps.
 */
export function ProfileForm({
  initial,
  onSave,
  onCancel,
  submitLabel = 'Save profile',
  showCancel = false,
}: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [target, setTarget] = useState(initial?.target ?? '');
  const [level, setLevel] = useState<ExperienceLevel>(
    initial?.level ?? 'intermediate',
  );
  const [hours, setHours] = useState<DailyHours>(initial?.hours ?? '2');
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO());
  const [priorExperience, setPriorExperience] = useState<PriorExperience>(
    initial?.priorExperience ?? 'component-level',
  );
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');
  const [studyStyle, setStudyStyle] = useState<StudyStyle>(
    initial?.studyStyle ?? 'mixed',
  );

  useEffect(() => {
    setName(initial?.name ?? '');
    setTarget(initial?.target ?? '');
    setLevel(initial?.level ?? 'intermediate');
    setHours(initial?.hours ?? '2');
    setStartDate(initial?.startDate ?? todayISO());
    setPriorExperience(initial?.priorExperience ?? 'component-level');
    setTargetDate(initial?.targetDate ?? '');
    setStudyStyle(initial?.studyStyle ?? 'mixed');
  }, [initial]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    onSave({
      name: trimmed || 'Learner',
      target: target.trim(),
      level,
      hours,
      startDate,
      priorExperience,
      targetDate: targetDate || undefined,
      studyStyle,
    });
  };

  const inputBase =
    'w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Your name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Vinay"
          autoFocus
          className={inputBase}
        />
      </Field>

      <Field label="Target interview / company (optional)">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g., Google L5 system design round"
          className={inputBase}
        />
      </Field>

      <Field label="Interview / target date (optional)">
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className={inputBase}
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Leave blank if open-ended. Sets the &quot;days until target&quot; countdown.
        </p>
      </Field>

      <Field label="Self-rated experience level">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
          className={inputBase}
        >
          <option value="beginner">{levelLabel('beginner')}</option>
          <option value="intermediate">{levelLabel('intermediate')}</option>
          <option value="advanced">{levelLabel('advanced')}</option>
        </select>
      </Field>

      <Field label="Prior system-design experience">
        <select
          value={priorExperience}
          onChange={(e) => setPriorExperience(e.target.value as PriorExperience)}
          className={inputBase}
        >
          <option value="none">{priorExperienceLabel('none')}</option>
          <option value="component-level">
            {priorExperienceLabel('component-level')}
          </option>
          <option value="system-level">
            {priorExperienceLabel('system-level')}
          </option>
          <option value="led-design">{priorExperienceLabel('led-design')}</option>
        </select>
      </Field>

      <Field label="Daily study hours">
        <select
          value={hours}
          onChange={(e) => setHours(e.target.value as DailyHours)}
          className={inputBase}
        >
          <option value="1">{hoursLabel('1')}</option>
          <option value="2">{hoursLabel('2')}</option>
          <option value="4">{hoursLabel('4')}</option>
        </select>
      </Field>

      <Field label="How do you prefer to learn?">
        <select
          value={studyStyle}
          onChange={(e) => setStudyStyle(e.target.value as StudyStyle)}
          className={inputBase}
        >
          <option value="theory-first">{studyStyleLabel('theory-first')}</option>
          <option value="mixed">{studyStyleLabel('mixed')}</option>
          <option value="designs-first">{studyStyleLabel('designs-first')}</option>
        </select>
      </Field>

      <Field label="Start date">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputBase}
        />
      </Field>

      <div className="rounded-md bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <strong className="text-slate-900 dark:text-slate-100">
          How your data is stored:
        </strong>{' '}
        Everything you enter stays in <code>localStorage</code> on this device.
        No accounts, no servers, no tracking. Clearing your browser data will
        reset your progress.
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm hover:bg-brand-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
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
