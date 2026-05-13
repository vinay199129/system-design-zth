import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/Markdown';
import { StatusControl } from '@/components/StatusControl';
import { DesignDrillTimer } from '@/components/DesignDrillTimer';
import { designs, findDesign } from '@/lib/content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return designs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const design = findDesign(slug);
  if (!design) return { title: 'Not found' };
  return { title: design.title };
}

/**
 * Per-design page — shows the README intro, problem statement, embedded
 * 45-minute RESHADED stage timer, and (optionally) the reference solution.
 */
export default async function DesignPage({ params }: PageProps) {
  const { slug } = await params;
  const design = findDesign(slug);
  if (!design) notFound();

  const idx = designs.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? designs[idx - 1] : null;
  const next = idx >= 0 && idx < designs.length - 1 ? designs[idx + 1] : null;

  return (
    <article className="max-w-4xl space-y-6">
      <header className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          {design.phaseTitle} · {design.moduleTitle}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {design.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400">
          {design.difficulty ? (
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
              {design.difficulty}
            </span>
          ) : null}
          {design.companies ? <span>Companies: {design.companies}</span> : null}
          {design.concepts ? <span>Concepts: {design.concepts}</span> : null}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Status:
          </span>
          <StatusControl itemId={design.id} compact />
        </div>
      </header>

      <DesignDrillTimer itemId={design.id} />

      {design.readmeMarkdown ? (
        <section>
          <Markdown markdown={design.readmeMarkdown} stripLeadingTitle={design.title} />
        </section>
      ) : null}

      {design.problemMarkdown ? (
        <details className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4" open>
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-slate-100">
            problem.md — requirements & scope
          </summary>
          <div className="mt-4">
            <Markdown markdown={design.problemMarkdown} />
          </div>
        </details>
      ) : null}

      {design.solutionMarkdown ? (
        <details className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-slate-100">
            solution.md — reference architecture (open after your own sketch)
          </summary>
          <div className="mt-4">
            <Markdown markdown={design.solutionMarkdown} />
          </div>
        </details>
      ) : null}

      <nav
        aria-label="Design navigation"
        className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-3 text-sm"
      >
        {prev ? (
          <Link
            href={`/designs/${prev.slug}`}
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
            href={`/designs/${next.slug}`}
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
  );
}
