import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://sono-global.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/flights`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/hotels`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    const packages = await db.package.findMany({
      where: { visible: true },
      select: { id: true, createdAt: true },
    });

    const packageRoutes: MetadataRoute.Sitemap = packages.map((pkg) => ({
      url: `${base}/packages/${pkg.id}`,
      lastModified: pkg.createdAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...packageRoutes];
  } catch {
    return staticRoutes;
  }
}
