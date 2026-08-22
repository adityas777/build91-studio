import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PortfolioPageClient } from '@/components/PortfolioPageClient';

const VALID_CATEGORIES: Record<string, { title: string; desc: string; heroName: string }> = {
  interiors: {
    title: '3D Interior Visualization & Renders | Build91 Studio',
    desc: 'Explore photorealistic 3D interior renderings of living spaces, master suites, kitchens, penthouses, and clubhouses crafted by Build91 Studio.',
    heroName: 'Interior 3D Visualization',
  },
  exteriors: {
    title: '3D Exterior Architectural Rendering | Build91 Studio',
    desc: 'High-end 3D exterior architectural visualizations, master plans, tower elevations, and villa facades by Build91 Studio.',
    heroName: 'Exterior 3D Rendering',
  },
  amenities: {
    title: '3D Amenities & Clubhouse CGI Visuals | Build91 Studio',
    desc: 'Immersive 3D renders of community amenities, clubhouses, swimming pools, fitness centers, and landscape decks.',
    heroName: 'Amenities & Clubhouses',
  },
  isometric: {
    title: 'Isometric & 3D Cutaway Floor Plans | Build91 Studio',
    desc: 'Clear 3D spatial cutaway floor plans and isometric layouts for luxury real estate marketing by Build91 Studio.',
    heroName: 'Isometric Cutaway Plans',
  },
};

export function generateStaticParams() {
  return [
    { category: 'interiors' },
    { category: 'exteriors' },
    { category: 'amenities' },
    { category: 'isometric' },
  ];
}

type Props = {
  params: { category: string } | Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCat = resolvedParams.category?.toLowerCase() || '';
  
  // Normalize singular to plural
  const normalized = rawCat === 'interior' ? 'interiors' : rawCat === 'exterior' ? 'exteriors' : rawCat === 'amenity' ? 'amenities' : rawCat;

  const data = VALID_CATEGORIES[normalized];
  if (!data) return { title: 'Portfolio | Build91 Studio' };

  return {
    title: data.title,
    description: data.desc,
    alternates: {
      canonical: `/portfolio/${normalized}`,
    },
    openGraph: {
      title: data.title,
      description: data.desc,
      url: `https://studio.build91.in/portfolio/${normalized}`,
    },
  };
}

export default async function PortfolioCategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const rawCat = resolvedParams.category?.toLowerCase() || '';
  
  // Handle singular alias redirects
  if (rawCat === 'interior') redirect('/portfolio/interiors');
  if (rawCat === 'exterior') redirect('/portfolio/exteriors');
  if (rawCat === 'amenity') redirect('/portfolio/amenities');

  if (!VALID_CATEGORIES[rawCat]) {
    notFound();
  }

  return (
    <>
      <PortfolioPageClient initialCategory={rawCat} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${VALID_CATEGORIES[rawCat].heroName} - Build91 Studio`,
            description: VALID_CATEGORIES[rawCat].desc,
            url: `https://studio.build91.in/portfolio/${rawCat}`,
            provider: {
              '@type': 'Organization',
              name: 'Build91 Studio',
              url: 'https://studio.build91.in',
            },
          }),
        }}
      />
    </>
  );
}
