import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/Markdown';
import { StatusControl } from '@/components/StatusControl';
import { caseStudies, findCaseStudy } from '@/lib/content';
import { PHASES } from '@/lib/phases';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) return { title: 'Not found' };
  return {
    title: study.title,
    description: `Case study — ${study.title} (${study.phaseTitle} · ${study.moduleTitle}).`,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) notFound();

  const phase = PHASES.find((p) => p.id === study.phaseId);
  const moduleStudyHref = `/study/${study.phaseId}-${study.moduleId}`;

  const flat = caseStudies;
  const idx = flat.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <article className="min-w-0 max-w-3xl mx-auto">
      <header className="space-y-2 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          <Link href="/case-studies" className="hover:underline">
            Case studies
          </Link>
          {' · '}
          {phase?.title ?? study.phaseTitle}
          {' · '}
          <Link href={moduleStudyHref} className="hover:underline">
            {study.moduleTitle}
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {study.title}
        </h1>
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Mark when read:
          </span>
          <StatusControl itemId={study.id} compact />
        </div>
      </header>

      <Markdown markdown={study.markdown} stripLeadingTitle={study.title} />

      <nav
        aria-label="Case studies navigation"
        className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 grid sm:grid-cols-2 gap-3 text-sm"
      >
        {prev ? (
          <Link
            href={`/case-studies/${prev.slug}`}
            className="rounded border border-slate-200 dark:border-slate-800 p-3 hover:shadow"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ← Previous
            </div>
            <div className="font-medium">{prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/case-studies/${next.slug}`}
            className="rounded border border-slate-200 dark:border-slate-800 p-3 hover:shadow text-right"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Next →
            </div>
            <div className="font-medium">{next.title}</div>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
