import type { Metadata, Viewport } from 'next';
import { ProfileProvider } from '@/components/ProfileProvider';
import { ProgressProvider } from '@/components/ProgressProvider';
import { ProfileOnboarding } from '@/components/ProfileOnboarding';
import { Header } from '@/components/Header';
import { ThemeBootstrap } from '@/components/ThemeBootstrap';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://vinay199129.github.io/system-design-zth'),
  title: {
    default: 'System Design Zero to Hero — 60-day Interview Prep',
    template: '%s — System Design Zero to Hero',
  },
  description:
    'Free 60-day structured system design interview prep: 20 classic FAANG case-study designs, 24 patterns (9 building blocks + 7 distributed concepts + 8 design patterns), the RESHADED framework, and progress tracking. From load balancers to leading a senior design round.',
  keywords: [
    'system design',
    'system design interview',
    'RESHADED',
    'distributed systems',
    'coding interview',
    'FAANG',
    'crash course',
    'interview prep',
    '60-day plan',
  ],
  authors: [{ name: 'Vinay Bhadauria' }],
  openGraph: {
    title: 'System Design Zero to Hero — 60-day Interview Prep',
    description:
      'Free interactive 60-day system design course with 20 designs, 24 building-block patterns, and built-in progress tracking.',
    type: 'website',
    url: 'https://vinay199129.github.io/system-design-zth/',
    siteName: 'System Design Zero to Hero',
    images: [
      {
        url: 'og-image.svg',
        width: 1200,
        height: 630,
        alt: 'System Design Zero to Hero — 60-day interview prep',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'System Design Zero to Hero — 60-day Interview Prep',
    description:
      '20 designs · 24 patterns · RESHADED · spaced repetition · Mermaid diagrams.',
    images: ['og-image.svg'],
  },
  icons: {
    icon: [{ url: 'favicon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ProfileProvider>
          <ProgressProvider>
            <Header />
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
              {children}
            </main>
            <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-8">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-3 justify-between">
                <span>
                  System Design Zero to Hero · open source ·{' '}
                  <a
                    href="https://github.com/vinay199129/system-design-zth"
                    className="hover:text-brand-600 dark:hover:text-brand-100"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </span>
                <span>All progress stored locally in your browser.</span>
              </div>
            </footer>
            <ProfileOnboarding />
          </ProgressProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
