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
  return <PortfolioPageClient />;
}
