import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

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

export async function GET() {
  const bucketName = process.env.PORTFOLIO_BUCKET_NAME;
  
  if (!bucketName) {
    console.error('PORTFOLIO_BUCKET_NAME is missing in environment variables.');
    return NextResponse.json({ error: 'PORTFOLIO_BUCKET_NAME environment variable is not configured.' }, { status: 500 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: 'faq/faq.json',
    });

    const response = await s3Client.send(command);
    const bodyContents = await response.Body?.transformToString();

    if (!bodyContents) {
      throw new Error('FAQ body returned from S3 is empty.');
    }

    const faqs = JSON.parse(bodyContents);

    // Return list with caching headers (cache 5 mins, revalidate in background)
    return NextResponse.json(faqs, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 's-maxage=300'
      }
    });
  } catch (error: any) {
    console.error('Error fetching S3 FAQ assets:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch FAQ data from S3' }, { status: 500 });
  }
}
