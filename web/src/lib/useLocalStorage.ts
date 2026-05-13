'use client';

import { useCallback, useEffect, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * useLocalStorage — persists state to localStorage and stays in sync across tabs.
 * Returns [value, setValue, hydrated].
 *
 * `hydrated` is false on first render (SSR / pre-hydration) and true once we've
 * read from localStorage. Components should treat `hydrated === false` as
 * "still loading" to avoid flashes of default state.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStorage(key, initialValue));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated || !isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [key, value, hydrated]);

  useEffect(() => {
    if (!isBrowser) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore parse error */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) =>
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next,
      );
    },
    [],
  );

  return [value, update, hydrated];
}
