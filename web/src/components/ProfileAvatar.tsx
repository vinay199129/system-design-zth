'use client';

import Link from 'next/link';
import { useProfile } from './ProfileProvider';
import { profileInitials } from '@/lib/profile';

export function ProfileAvatar() {
  const { profile } = useProfile();
  const initials = profileInitials(profile);

  return (
    <Link
      href="/profile"
      title={profile?.name ? `Profile: ${profile.name}` : 'Set up your profile'}
      aria-label="Profile"
      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-100 text-sm font-semibold border border-brand-200 dark:border-brand-800 hover:bg-brand-200 dark:hover:bg-brand-900/70 transition-colors"
    >
      {initials || (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </Link>
  );
}

