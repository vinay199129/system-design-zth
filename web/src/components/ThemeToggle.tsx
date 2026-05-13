'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'sd-zth:theme';

type Theme = 'light' | 'dark';

function getInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = getInitial();
    setTheme(initial);
    applyTheme(initial);
    setHydrated(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  };

  if (!hydrated) {
    return (
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 dark:border-slate-600"
      />
    );
  }

  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggle}
      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
    >
      <span aria-hidden className="text-base leading-none">
        {isDark ? '☀' : '☾'}
      </span>
    </button>
  );
}
