import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load environment variables from .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    if (line.trim().startsWith('#') || !line.includes('=')) continue;
    const parts = line.split('=');
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

const bucketName = process.env.PORTFOLIO_BUCKET_NAME;
const region = process.env.AWS_REGION || 'us-east-1';

if (!bucketName) {
  console.error('ERROR: PORTFOLIO_BUCKET_NAME environment variable is not defined.');
  process.exit(1);
}

const client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

// Mapping of portfolio collections to their local files
const MAPPING = {
  interiors: [
    { file: 'extracted_image_12.png', isHero: true },
    { file: 'extracted_image_11.png' },
    { file: 'extracted_image_14.jpeg' },
    { file: 'extracted_image_4.jpeg' },
    { file: 'extracted_image_13.jpeg' },
    { file: 'extracted_image_1.jpeg' },
    { file: 'extracted_image_9.png' },
    { file: 'extracted_image_16.jpeg' },
    { file: 'extracted_image_10.png' },
    { file: 'extracted_image_18.jpeg' },
    { file: 'extracted_image_20.jpeg' },
    { file: 'extracted_image_21.jpeg' },
  ],
  exteriors: [
    { file: 'extracted_image_6.jpeg', isHero: true },
    { file: 'extracted_image_15.jpeg' },
    { file: 'extracted_image_17.jpeg' },
    { file: 'extracted_image_3.jpeg' },
  ],
  elevations: [
    { file: 'extracted_image_7.png', isHero: true },
    { file: 'extracted_image_2.jpeg' },
    { file: 'extracted_image_19.jpeg' },
  ],
  amenities: [
    { file: 'extracted_image_8.jpeg', isHero: true },
  ],
  isometric: [
    { file: 'extracted_image_13.jpeg', isHero: true },
  ]
};

async function uploadFile(localPath, s3Key) {
  const extension = path.extname(localPath).toLowerCase();
  const contentType = extension === '.png' ? 'image/png' : 'image/jpeg';
  const fileStream = fs.createReadStream(localPath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileStream,
    ContentType: contentType,
  });

  await client.send(command);
  console.log(`Successfully uploaded ${path.basename(localPath)} -> s3://${bucketName}/${s3Key}`);
}

async function seed() {
  console.log(`Starting S3 seed process for bucket: "${bucketName}" in region: "${region}"...`);
  const localDir = path.resolve(process.cwd(), 'public/images/portfolio');

  if (!fs.existsSync(localDir)) {
    console.error(`ERROR: Local portfolio directory not found at: ${localDir}`);
    process.exit(1);
  }

  for (const [collectionId, items] of Object.entries(MAPPING)) {
    console.log(`\nUploading collection "${collectionId}"...`);
    for (const item of items) {
      const localFilePath = path.join(localDir, item.file);
      if (!fs.existsSync(localFilePath)) {
        console.warn(`WARNING: File not found locally: ${localFilePath}. Skipping.`);
        continue;
      }

      // If it is the hero, we rename it by appending '-hero' to easily identify it in the S3 API listing.
      let s3FileName = item.file;
      if (item.isHero) {
        const ext = path.extname(item.file);
        const nameWithoutExt = path.basename(item.file, ext);
        s3FileName = `${nameWithoutExt}-hero${ext}`;
      }

      const s3Key = `portfolio/${collectionId}/${s3FileName}`;
      try {
        await uploadFile(localFilePath, s3Key);
      } catch (err) {
        console.error(`Failed to upload ${item.file}:`, err);
      }
    }
  }

  console.log('\nS3 portfolio seeding finished successfully!');
}

seed().catch(err => {
  console.error('Seed process failed with error:', err);
  process.exit(1);
});
