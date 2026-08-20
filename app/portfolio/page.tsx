import type { Metadata } from 'next';
import { PortfolioPageClient } from '@/components/PortfolioPageClient';

export const metadata: Metadata = {
  title: 'Our Portfolio | Real Estate Renders & Tours',
  description: 'Explore Build91 Studio\'s premium 3D interior/exterior renders, drone 360 views, and immersive virtual walkthroughs across India, UAE, and Australia.',
  alternates: {
    canonical: '/portfolio',
  },
};

export default function PortfolioPage() {
  return (
    <>
      <PortfolioPageClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(portfolioJsonLd),
        }}
      />
    </>
  );
}

const portfolioJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Build91 Studio Selected Portfolio & 3D Visuals',
  description: "Explore Build91 Studio's premium 3D interior/exterior renders, drone 360 views, and immersive virtual walkthroughs across India, UAE, and Australia.",
  url: 'https://studio.build91.in/portfolio',
  provider: {
    '@type': 'Organization',
    name: 'Build91 Studio',
    url: 'https://studio.build91.in',
  },
  hasPart: [
    {
      '@type': 'CreativeWork',
      name: 'Interior 3D Visualization Collection',
      description: 'Living rooms, master bedrooms, kitchens, penthouses, and clubhouses rendered in photoreal lighting.',
    },
    {
      '@type': 'CreativeWork',
      name: 'Exterior 3D Rendering Collection',
      description: 'Tower elevations, villas, gated communities, facades, and aerial drone perspective superimpositions.',
    },
    {
      '@type': 'CreativeWork',
      name: 'Interactive 360° Virtual Tours & Walkthroughs',
      description: 'Self-guided 360 tours, cinema-grade architectural walkthrough films, and digital sales launchpads.',
    },
  ],
};
