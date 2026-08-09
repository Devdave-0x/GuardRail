import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

/*
  Typed and generated rather than a static file, so the host follows SITE.url across
  preview and production instead of being duplicated as a literal here.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The dashboard and the API have nothing to rank for.
        disallow: ['/app', '/api/'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
