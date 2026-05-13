'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import {
  DEFAULT_PROFILE,
  normaliseProfile,
  PROFILE_STORAGE_KEY,
  type UserProfile,
} from '@/lib/profile';
import { useLocalStorage } from '@/lib/useLocalStorage';

interface ProfileContextValue {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  hydrated: boolean;
  clear: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileValue, hydrated] = useLocalStorage<UserProfile | null>(
    PROFILE_STORAGE_KEY,
    DEFAULT_PROFILE,
  );

  const setProfile = useCallback(
    (next: UserProfile | null) => setProfileValue(next),
    [setProfileValue],
  );

  // One-shot fix for profiles saved by a pre-fix client where `startDate` was
  // stamped using UTC date instead of local date — see normaliseProfile().
  const normalisedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || normalisedRef.current || !profile) return;
    const fixed = normaliseProfile(profile);
    if (fixed !== profile) {
      normalisedRef.current = true;
      setProfileValue(fixed);
    } else {
      normalisedRef.current = true;
    }
  }, [hydrated, profile, setProfileValue]);

  const clear = useCallback(() => setProfileValue(null), [setProfileValue]);

  const value = useMemo(
    () => ({ profile, setProfile, hydrated, clear }),
    [profile, setProfile, hydrated, clear],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
