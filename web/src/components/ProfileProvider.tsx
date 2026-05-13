'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  DEFAULT_PROFILE,
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
