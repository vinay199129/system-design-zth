'use client';

import { useEffect } from 'react';

/**
 * Mounts on every page that renders Markdown content. Finds every
 * <pre class="mermaid"> block (emitted by `rehypeMermaidExtract`) and runs
 * Mermaid to render an inline SVG in its place.
 *
 * Re-runs when the theme changes so the diagrams pick up dark/light colors.
 */
export function MermaidInit() {
  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const blocks = Array.from(document.querySelectorAll<HTMLElement>('pre.mermaid'));
      if (blocks.length === 0) return;

      // Mermaid mutates the node; restore the original source on each run so
      // theme changes can re-render the same blocks.
      for (const el of blocks) {
        if (!el.dataset.mermaidSource) {
          el.dataset.mermaidSource = el.textContent ?? '';
        } else {
          el.textContent = el.dataset.mermaidSource;
          el.removeAttribute('data-processed');
        }
      }

      const mermaidMod = await import('mermaid');
      if (cancelled) return;
      const mermaid = mermaidMod.default;

      const isDark = document.documentElement.classList.contains('dark');
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: isDark ? 'dark' : 'default',
        themeVariables: isDark
          ? {
              primaryColor: '#312e81',          // brand-900
              primaryTextColor: '#e0e7ff',      // brand-100
              primaryBorderColor: '#6366f1',    // brand-500
              lineColor: '#94a3b8',             // slate-400
              secondaryColor: '#1e293b',        // slate-800
              tertiaryColor: '#0f172a',         // slate-900
              background: '#0f172a',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }
          : {
              primaryColor: '#eef2ff',          // brand-50
              primaryTextColor: '#3730a3',      // brand-800
              primaryBorderColor: '#6366f1',    // brand-500
              lineColor: '#64748b',             // slate-500
              secondaryColor: '#f1f5f9',        // slate-100
              tertiaryColor: '#f8fafc',         // slate-50
              background: '#ffffff',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            },
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
        sequence: { useMaxWidth: true },
        gantt: { useMaxWidth: true },
      });

      try {
        await mermaid.run({ querySelector: 'pre.mermaid' });
      } catch (err) {
        // Render errors are common in user content; log without breaking the page.
        // eslint-disable-next-line no-console
        console.warn('[mermaid] render failed', err);
      }
    };

    render();

    // Re-render on theme changes (the ThemeToggle adds/removes .dark on <html>)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          render();
          return;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
