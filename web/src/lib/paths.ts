/**
 * Build the URL for an internal route that respects the `basePath` configured
 * in `next.config.mjs` (e.g. `/system-design-zth` in production).
 *
 * Use this for non-`<Link>` URLs and `<a href>` to assets in /public.
 * `<Link href="/foo">` already prepends basePath automatically.
 */
export function withBase(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  if (!path.startsWith('/')) return `${base}/${path}`;
  return `${base}${path}`;
}
