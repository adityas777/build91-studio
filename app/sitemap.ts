import { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url || 'https://studio.build91.in';

  const routes = [
    '',
    '/about',
    '/services',
    '/portfolio',
    '/blogs',
    '/quote',
    '/contact',
    '/privacy',
    '/terms',
    '/shipping-policy',
    '/refund-policy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1.0 : route === '/quote' ? 0.9 : 0.8,
  }));
}
