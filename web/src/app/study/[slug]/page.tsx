import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/Markdown';
import { StatusControl } from '@/components/StatusControl';
import { StudySidebar } from '@/components/StudySidebar';
import { findStudySection, studySections } from '@/lib/content';
import type { StudySection as StudySectionType } from '@/generated/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return studySections.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const section = findStudySection(slug);
  if (!section) return { title: 'Not found' };
  return { title: section.title };
}

function groupSections(): Array<{
  phaseId: string;
  phaseTitle: string;
  sections: StudySectionType[];
}> {
  const map = new Map<
    string,
    { phaseId: string; phaseTitle: string; sections: StudySectionType[] }
  >();
  for (const s of studySections) {
    const existing = map.get(s.phaseId);
    if (existing) {
      existing.sections.push(s);
    } else {
      map.set(s.phaseId, {
        phaseId: s.phaseId,
        phaseTitle: s.phaseTitle,
        sections: [s],
      });
    }
  }
  return [...map.values()];
}

export default async function StudySectionPage({ params }: PageProps) {
  const { slug } = await params;
  const section = findStudySection(slug);
  if (!section) notFound();

  const groups = groupSections();
  const flat = studySections;
  const idx = flat.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <StudySidebar groups={groups} activeSlug={slug} />

      <article className="min-w-0">
        <header className="space-y-2 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            {section.phaseTitle}
            {section.moduleTitle && section.moduleTitle !== section.title
              ? ` · ${section.moduleTitle}`
              : ''}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {section.title}
          </h1>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Mark when done:
            </span>
            <StatusControl itemId={section.id} compact />
          </div>
        </header>

        <Markdown markdown={section.markdown} stripLeadingTitle={section.title} />

        <nav
          aria-label="Section navigation"
          className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-3 text-sm"
        >
          {prev ? (
            <Link
              href={`/study/${prev.slug}`}
              className="flex-1 min-w-0 rounded-lg border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">
                ← Previous
              </div>
              <div className="font-medium truncate">{prev.title}</div>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/study/${next.slug}`}
              className="flex-1 min-w-0 rounded-lg border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-right"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Next →
              </div>
              <div className="font-medium truncate">{next.title}</div>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </nav>
      </article>
    </div>
  );
}
