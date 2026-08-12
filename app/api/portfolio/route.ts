import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';


const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(!isLambda && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  } : {})
});

// Title and description metadata for each collection.
const COLLECTION_METADATA: Record<string, { title: string; description: string }> = {
  interiors: {
    title: 'Interiors',
    description: 'Exquisite living room interior designs that blend modern elegance with timeless sophistication. Spaces that embody luxury and style, tailored to your unique taste and lifestyle.'
  },
  exteriors: {
    title: 'Exteriors',
    description: 'Our Exterior portfolio showcases a collection of realistic and detailed projects that highlight our dedication to precision and creativity in every design.'
  },
  elevations: {
    title: 'Elevations',
    description: 'Highly detailed 3D elevations illustrating structural facades, building orientations, and material distributions with pinpoint accuracy.'
  },
  amenities: {
    title: 'Amenities',
    description: 'Immersive spaces designed for communities, detailing pool decks, clubhouses, green areas, and lifestyle facilities with CGI photorealism.'
  },
  isometric: {
    title: 'Isometric',
    description: 'Fascinating 3D spatial cutaway plans offering a complete overview of layouts, room arrangements, and design proportions.'
  }
};

export async function GET() {
  const bucketName = process.env.PORTFOLIO_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!bucketName) {
    console.error('PORTFOLIO_BUCKET_NAME is missing in environment variables.');
    return NextResponse.json({ error: 'PORTFOLIO_BUCKET_NAME environment variable is not configured.' }, { status: 500 });
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'portfolio/',
    });

    const response = await s3Client.send(command);
    const contents = response.Contents || [];

    // Initialize collections structure matching the existing page.tsx schema
    const collections: Record<string, { id: string; title: string; description: string; heroImage: string; images: string[] }> = {};
    for (const key of Object.keys(COLLECTION_METADATA)) {
      collections[key] = {
        id: key,
        title: COLLECTION_METADATA[key].title,
        description: COLLECTION_METADATA[key].description,
        heroImage: '',
        images: []
      };
    }

    // Process S3 objects and group by collection subfolder
    for (const item of contents) {
      if (!item.Key) continue;
      
      const parts = item.Key.split('/');
      // Expecting path to be portfolio/[collectionId]/[filename]
      if (parts.length < 3) continue; 
      
      const collectionId = parts[1].toLowerCase();
      const fileName = parts.slice(2).join('/');
      
      // Skip direct folder objects (directories in S3)
      if (!fileName || fileName.endsWith('/')) continue;

      if (collections[collectionId]) {
        // Correctly encode special characters in filenames (e.g. spaces) while keeping slashes intact
        const encodedKey = item.Key.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
        collections[collectionId].images.push(imageUrl);
      }
    }

    // Set the heroImage for each collection
    for (const key of Object.keys(collections)) {
      const collection = collections[key];
      if (collection.images.length > 0) {
        // Look for an image containing "hero" in its path (e.g., hero.jpg, image_hero.png)
        const hero = collection.images.find(url => {
          const lowerUrl = url.toLowerCase();
          return lowerUrl.includes('/hero.') || lowerUrl.includes('_hero.') || lowerUrl.includes('-hero.');
        });
        
        // Fallback to the first image if no explicit hero image is found
        collection.heroImage = hero || collection.images[0];
      } else {
        // Fallback if the folder in S3 is currently empty
        collection.heroImage = '';
      }
    }

    // Return the collections. Configure edge caching for 5 minutes (300s) and background revalidation (600s).
    return NextResponse.json(collections, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 's-maxage=300'
      }
    });
  } catch (error: any) {
    console.error('Error fetching S3 portfolio assets:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch portfolio assets from S3' }, { status: 500 });
  }
}
