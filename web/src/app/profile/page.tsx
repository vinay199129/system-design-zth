'use client';

import { useState } from 'react';
import { useProfile } from '@/components/ProfileProvider';
import { useProgress } from '@/components/ProgressProvider';
import { ProfileForm } from '@/components/ProfileForm';
import {
  daysSinceStart,
  hoursLabel,
  levelLabel,
  profileInitials,
} from '@/lib/profile';
import { TOTAL_DAYS } from '@/lib/phases';

export default function ProfilePage() {
  const { profile, setProfile, clear, hydrated } = useProfile();
  const { state: progress, reset: resetProgress } = useProgress();
  const [editing, setEditing] = useState(false);

  if (!hydrated) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }

  if (!profile || editing) {
    return (
      <section className="max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile ? 'Edit your profile' : 'Set up your profile'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Everything stays in your browser. No accounts, no sync.
        </p>
        <ProfileForm
          initial={profile}
          onSave={(p) => {
            setProfile(p);
            setEditing(false);
          }}
          onCancel={profile ? () => setEditing(false) : undefined}
          showCancel={Boolean(profile)}
          submitLabel={profile ? 'Save changes' : 'Start learning'}
        />
      </section>
    );
  }

  const day = daysSinceStart(profile);
  const itemCount = Object.keys(progress.items).length;

  return (
    <section className="space-y-6 max-w-2xl">
      <header className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-100 flex items-center justify-center text-lg font-semibold border border-brand-200 dark:border-brand-800">
          {profileInitials(profile)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.name}
          </h1>
          {profile.target && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Targeting{' '}
              <span className="font-medium text-brand-700 dark:text-brand-200">
                {profile.target}
              </span>
            </p>
          )}
        </div>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        <Stat label="Day" value={`${Math.min(day, TOTAL_DAYS)} / ${TOTAL_DAYS}`} />
        <Stat label="Items tracked" value={itemCount.toString()} />
        <Stat label="Daily pace" value={hoursLabel(profile.hours)} />
        <Stat label="Experience" value={levelLabel(profile.level)} />
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm space-y-1">
        <Row label="Started" value={profile.startDate} />
        <Row label="Target interview" value={profile.target || '—'} />
        <Row label="Target date" value={profile.targetDate || '—'} />
        <Row
          label="Prior experience"
          value={profile.priorExperience ?? '—'}
        />
        <Row label="Study style" value={profile.studyStyle ?? '—'} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm hover:bg-brand-700"
        >
          Edit profile
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset all progress? Your profile will be kept.')) {
              resetProgress();
            }
          }}
          className="px-4 py-2 rounded-md border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/30"
        >
          Reset progress
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                'Delete your profile and all progress? This cannot be undone.',
              )
            ) {
              resetProgress();
              clear();
            }
          }}
          className="px-4 py-2 rounded-md border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/30"
        >
          Delete everything
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}
