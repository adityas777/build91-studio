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
  return (
    <>
      <BlogsPageClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogsJsonLd),
        }}
      />
    </>
  );
}

const blogsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Build91 Studio Insights & Articles',
  description: 'Read the latest guides on biophilic interiors, 3D visualization trends, and digital real estate launchpad strategies.',
  url: 'https://studio.build91.in/blogs',
  publisher: {
    '@type': 'Organization',
    name: 'Build91 Studio',
    url: 'https://studio.build91.in',
  },
  blogPost: [
    {
      '@type': 'BlogPosting',
      headline: 'Color Drenching: The 2025 Guide',
      description: 'How to envelop rooms in one hue for immersive, modern interiors. Color drenching treats walls, trim, and ceiling as one envelope.',
      author: { '@type': 'Person', name: 'Tanu Mathur' },
      datePublished: '2025-09-13',
      image: 'https://studio.build91.in/images/blogs/page_1_img_1.png',
      url: 'https://studio.build91.in/blogs',
    },
    {
      '@type': 'BlogPosting',
      headline: 'Top Interior Design Trends for 2025: Realistic 3D Render Inspirations',
      description: 'Discover the defining interior aesthetics of 2025 — from biophilic design and earthy palettes to AI-integrated spatial modeling.',
      author: { '@type': 'Person', name: 'Build91 Studio Editorial' },
      datePublished: '2025-09-10',
      image: 'https://studio.build91.in/images/blogs/page_1_img_1.png',
      url: 'https://studio.build91.in/blogs',
    },
    {
      '@type': 'BlogPosting',
      headline: 'Beyond the View: How Drone Cinematics & Location Intelligence Reshape Real Estate Sales',
      description: 'Explore how aerial drone 360 views, landmark proximity mapping, and interactive site intelligence convert high-intent homebuyers.',
      author: { '@type': 'Person', name: 'Build91 Studio Editorial' },
      datePublished: '2025-09-05',
      image: 'https://studio.build91.in/images/blogs/page_1_img_1.png',
      url: 'https://studio.build91.in/blogs',
    },
  ],
};
