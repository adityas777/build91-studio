import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { BlogPost, FALLBACK_BLOGS } from '@/lib/blogData';
import { fetchLinkedInPosts } from '@/lib/linkedin';

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

async function getStaticBlogs(): Promise<BlogPost[]> {
  const bucketName = process.env.PORTFOLIO_BUCKET_NAME;

  if (!bucketName) {
    console.warn('PORTFOLIO_BUCKET_NAME is missing. Falling back to local blog data.');
    return FALLBACK_BLOGS;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: 'blogs/blogs.json',
    });

    const response = await s3Client.send(command);
    const bodyContents = await response.Body?.transformToString();

    if (!bodyContents) {
      throw new Error('Blogs body returned from S3 is empty.');
    }

    return JSON.parse(bodyContents);
  } catch (error: any) {
    console.error('Error fetching S3 blogs. Falling back to local blog data:', error);
    return FALLBACK_BLOGS;
  }
}

export async function GET() {
  // Static articles always come first and are never affected by LinkedIn's
  // availability; live LinkedIn posts (if any) are appended after them.
  const [staticBlogs, linkedInPosts] = await Promise.all([
    getStaticBlogs(),
    fetchLinkedInPosts(),
  ]);

  return NextResponse.json([...staticBlogs, ...linkedInPosts], {
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      'CDN-Cache-Control': 's-maxage=300',
    },
  });
}
