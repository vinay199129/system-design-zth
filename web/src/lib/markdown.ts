import rehypeShiki from '@shikijs/rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified, type Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Root, Heading, Text } from 'mdast';
import type { Root as HastRoot, Element as HastElement } from 'hast';

/**
 * remark plugin: drop the first top-level heading if it matches the page's
 * section title. Avoids the double-<h1> problem on study pages where the
 * page header already shows the title.
 */
function remarkStripLeadingHeading(matchTitle: string): Plugin<[], Root> {
  const normalized = matchTitle.trim().toLowerCase();
  return () => (tree: Root) => {
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type !== 'heading' || (node as Heading).depth !== 1) continue;
      const text = (node as Heading).children
        .filter((c): c is Text => c.type === 'text')
        .map((c) => c.value)
        .join('')
        .trim()
        .toLowerCase();
      if (
        text === normalized ||
        text.includes(normalized) ||
        normalized.includes(text)
      ) {
        tree.children.splice(i, 1);
      }
      break;
    }
  };
}

/**
 * rehype plugin: extract ```mermaid code blocks BEFORE shiki sees them, and
 * replace with <pre class="mermaid">SOURCE</pre>. The client-side MermaidInit
 * component then runs mermaid.run() on those nodes at hydration.
 */
function rehypeMermaidExtract(): Plugin<[], HastRoot> {
  return () => (tree: HastRoot) => {
    visit(tree, 'element', (node: HastElement) => {
      if (node.tagName !== 'pre') return;
      const codeChild = node.children.find(
        (c): c is HastElement => c.type === 'element' && c.tagName === 'code',
      );
      if (!codeChild) return;
      const cls = codeChild.properties?.className;
      const classes = Array.isArray(cls) ? cls : cls ? [cls] : [];
      if (!classes.some((c) => String(c) === 'language-mermaid')) return;
      const source = codeChild.children
        .filter((c): c is { type: 'text'; value: string } => c.type === 'text')
        .map((c) => c.value)
        .join('');
      node.tagName = 'pre';
      node.properties = { className: ['mermaid'] };
      node.children = [{ type: 'text', value: source }];
    });
  };
}

let processorPromise: Promise<ReturnType<typeof buildProcessor>> | null = null;

function buildProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeMermaidExtract())
    .use(rehypeShiki, {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    })
    .use(rehypeStringify, { allowDangerousHtml: true });
}

async function getProcessor() {
  if (!processorPromise) {
    processorPromise = Promise.resolve(buildProcessor());
  }
  return processorPromise;
}

export interface RenderMarkdownOptions {
  /** If provided, the leading `# heading` matching this title is removed. */
  stripLeadingTitle?: string;
}

/**
 * Render markdown to an HTML string. Runs at build time inside server
 * components, so there's no client runtime cost for shiki.
 */
export async function renderMarkdown(
  markdown: string,
  options: RenderMarkdownOptions = {},
): Promise<string> {
  const proc = options.stripLeadingTitle
    ? unified()
        .use(remarkParse)
        .use(remarkStripLeadingHeading(options.stripLeadingTitle))
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeSlug)
        .use(rehypeMermaidExtract())
        .use(rehypeShiki, {
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        })
        .use(rehypeStringify, { allowDangerousHtml: true })
    : await getProcessor();
  const file = await proc.process(markdown);
  return String(file);
}



