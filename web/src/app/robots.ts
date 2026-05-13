import type { MetadataRoute } from 'next';

const SITE_URL = 'https://vinay199129.github.io/system-design-zth';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
