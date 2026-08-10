import { cache } from 'react';

export type LinkedInPost = {
  id: string;
  commentary: string;
  createdAt: string;
  image?: string;
  link?: string;
};

// Fallback mock posts in case LinkedIn API is not configured or fails
const FALLBACK_POSTS: LinkedInPost[] = [
  {
    id: 'post-mock-1',
    commentary: 'Transforming architectural drawings into photorealistic 3D experiences. See how we help real estate developers visualize amenities, facades, and interiors before laying the first brick. #RealEstate #3DVisualization #Architecture',
    createdAt: 'Aug 1, 2026',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    link: 'https://www.linkedin.com/company/build91studio',
  },
  {
    id: 'post-mock-2',
    commentary: 'A closer look at our latest 3D cut-sections. Giving prospective buyers full context of space stacking, interior partitions, and furnishing layouts is the ultimate sales accelerant. #RealEstateMarketing #3DArtist',
    createdAt: 'Jul 28, 2026',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    link: 'https://www.linkedin.com/company/build91studio',
  },
  {
    id: 'post-mock-3',
    commentary: 'How digital launchpads and interactive plotted development kits are changing the game for real estate sales teams. One link. Every asset. Complete immersion. #PropTech #DigitalLaunch',
    createdAt: 'Jul 15, 2026',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    link: 'https://www.linkedin.com/company/build91studio',
  },
];

export const fetchLinkedInPosts = cache(async (): Promise<LinkedInPost[]> => {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const orgId = process.env.LINKEDIN_ORGANIZATION_ID;

  if (!token || !orgId || token.includes('placeholder') || token.startsWith('Access token:')) {
    console.warn('[linkedin] Missing or placeholder credentials, falling back to mock posts');
    return FALLBACK_POSTS;
  }

  try {
    const res = await fetch(
      `https://api.linkedin.com/v2/posts?author=urn:li:organization:${orgId}&q=author&count=6`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        next: { revalidate: 14400 }, // Cache for 4 hours (similar to Instagram)
      }
    );

    if (!res.ok) {
      throw new Error(`LinkedIn API returned status ${res.status}`);
    }

    const data = await res.json();
    if (!data.elements || !Array.isArray(data.elements)) {
      return FALLBACK_POSTS;
    }

    return data.elements.map((el: any) => {
      const commentary = el.commentary || '';
      
      let createdAt = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (el.createdAt) {
        createdAt = new Date(el.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      let image = undefined;
      if (el.content) {
        if (el.content.multiImage && el.content.multiImage.images && el.content.multiImage.images[0]) {
          image = el.content.multiImage.images[0].url || undefined;
        } else if (el.content.media && el.content.media.thumbnails && el.content.media.thumbnails[0]) {
          image = el.content.media.thumbnails[0].url || undefined;
        }
      }

      if (!image) {
        image = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
      }

      const postUrl = el.id ? `https://www.linkedin.com/feed/update/${el.id}` : 'https://www.linkedin.com/company/build91studio';

      return {
        id: el.id || Math.random().toString(),
        commentary,
        createdAt,
        image,
        link: postUrl,
      };
    });
  } catch (err) {
    console.error('[linkedin] Failed to fetch LinkedIn posts:', err);
    return FALLBACK_POSTS;
  }
});
