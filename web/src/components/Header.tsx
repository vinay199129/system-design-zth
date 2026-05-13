'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { ProfileAvatar } from './ProfileAvatar';

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/study', label: 'Study' },
  { href: '/designs', label: 'Designs' },
  { href: '/case-studies', label: 'Cases' },
  { href: '/patterns', label: 'Patterns' },
  { href: '/redo', label: 'Redo' },
  { href: '/review', label: 'Weekly' },
  { href: '/progress', label: 'Progress' },
];

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname?.startsWith(href);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        <Link
          href="/"
          className="font-semibold text-brand-700 dark:text-brand-100 text-base sm:text-lg shrink-0"
        >
          System Design Zero to Hero
        </Link>
        <nav className="flex-1 flex gap-4 text-sm overflow-x-auto whitespace-nowrap scrollbar-thin -mx-1 px-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(item.href)
                  ? 'text-brand-700 dark:text-brand-100 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-100'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="shrink-0 flex items-center gap-2">
          <ThemeToggle />
          <ProfileAvatar />
        </div>
      </div>
    </header>
  );
}
