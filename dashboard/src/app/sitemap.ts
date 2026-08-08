import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

/*
  Only indexable routes belong here. /app is excluded deliberately: it is disallowed in
  robots.ts and carries noIndex, and listing it would contradict both.
*/
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
