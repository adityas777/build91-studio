import type { Metadata } from 'next';
import { BlogsPageClient } from '@/components/BlogsPageClient';

export const metadata: Metadata = {
  title: 'Blogs & Insights | Real Estate Marketing Tips',
  description: 'Read the latest guides on biophilic interiors, 3D visualization trends, and digital real estate launchpad strategies from Build91 Studio Raipur & Bengaluru.',
  alternates: {
    canonical: '/blogs',
  },
};

export default function BlogsPage() {
  return <BlogsPageClient />;
}
