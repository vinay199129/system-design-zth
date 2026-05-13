import type { MetadataRoute } from 'next';
import { caseStudies, designs, studySections } from '@/lib/content';

const SITE_URL = 'https://vinay199129.github.io/system-design-zth';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/study',
    '/designs',
    '/case-studies',
    '/patterns',
    '/redo',
    '/review',
    '/progress',
    '/profile',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.7,
  }));

  const studyRoutes: MetadataRoute.Sitemap = studySections.map((s) => ({
    url: `${SITE_URL}/study/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const designRoutes: MetadataRoute.Sitemap = designs.map((d) => ({
    url: `${SITE_URL}/designs/${d.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((c) => ({
    url: `${SITE_URL}/case-studies/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...studyRoutes, ...designRoutes, ...caseStudyRoutes];
}
