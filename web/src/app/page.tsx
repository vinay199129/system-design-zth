import Link from 'next/link';
import { HeroDay } from '@/components/home/HeroDay';
import { TodayPlan } from '@/components/home/TodayPlan';
import { ResumeCTA } from '@/components/home/ResumeCTA';
import { UpNext } from '@/components/home/UpNext';
import { RedoStrip } from '@/components/home/RedoStrip';
import { LevelBanner } from '@/components/home/LevelBanner';
import { CourseMap } from '@/components/home/CourseMap';
import { TOTAL_DESIGNS, TOTAL_TRACK_DAYS } from '@/lib/journey';
import { TOTAL_PATTERNS } from '@/lib/phases';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HeroDay />

      <ResumeCTA />

      <RedoStrip />

      <LevelBanner />

      <TodayPlan />

      <UpNext />

      <CourseMap />

      {/* Quick links — useful for first-time visitors */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          New here?
        </h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
          <Bullet href="/study/guide-how-to-think">
            <strong>How to Think</strong> — the RESHADED framework for every
            design round. Read first.
          </Bullet>
          <Bullet href="/study/guide-daily-schedule">
            <strong>Daily Schedule</strong> — see the full {TOTAL_TRACK_DAYS}
            -day plan.
          </Bullet>
          <Bullet href="/designs">
            <strong>{TOTAL_DESIGNS} designs · 24 building blocks</strong> —
            filter by phase, difficulty, company, or concept.
          </Bullet>
          <Bullet href="/patterns">
            <strong>{TOTAL_PATTERNS} patterns</strong> — 9 building blocks +
            7 distributed concepts + 8 design patterns. Recognising them is
            the biggest senior-round unlock.
          </Bullet>
        </ul>
      </section>
    </div>
  );
}

function Bullet({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 hover:shadow transition"
      >
        <div className="leading-relaxed">{children}</div>
      </Link>
    </li>
  );
}
