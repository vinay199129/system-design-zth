import { renderMarkdown } from '@/lib/markdown';
import { MermaidInit } from './MermaidInit';

interface MarkdownProps {
  markdown: string;
  className?: string;
  /** If provided, strips the leading `# Title` heading matching this string. */
  stripLeadingTitle?: string;
}

/**
 * Server component that renders markdown to HTML at build time.
 *
 * The output is wrapped in Tailwind's `prose` classes for typography, with a
 * couple of opinionated overrides for our dark-themed code blocks (shiki
 * emits dual-theme spans which we toggle via the `.dark` class on <html>).
 *
 * Includes a tiny `<MermaidInit/>` client island that finds Mermaid diagrams
 * embedded as `pre.mermaid` and renders them after hydration.
 */
export async function Markdown({
  markdown,
  className = '',
  stripLeadingTitle,
}: MarkdownProps) {
  const html = await renderMarkdown(markdown, { stripLeadingTitle });
  return (
    <>
      <div
        className={`prose prose-slate dark:prose-invert prose-brand max-w-none lg:max-w-[72ch] xl:max-w-[78ch] ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <MermaidInit />
    </>
  );
}

