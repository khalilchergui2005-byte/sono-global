import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/staff/', '/account/', '/checkout/'],
      },
    ],
    sitemap: 'https://sono-global.com/sitemap.xml',
  };
}
