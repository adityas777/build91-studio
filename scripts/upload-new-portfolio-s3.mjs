import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

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

const CATEGORIES = ['interiors', 'exteriors', 'isometric'];

async function cleanS3Folder(prefix) {
  console.log(`Cleaning S3 folder prefix: "${prefix}"...`);
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix
    });
    const listResponse = await client.send(listCommand);
    const objects = listResponse.Contents || [];

    if (objects.length === 0) {
      console.log(`No existing objects found under prefix "${prefix}".`);
      return;
    }

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: objects.map(obj => ({ Key: obj.Key }))
      }
    };

    await client.send(new DeleteObjectsCommand(deleteParams));
    console.log(`Successfully deleted ${objects.length} old objects under prefix "${prefix}".`);
  } catch (err) {
    console.error(`Error cleaning S3 prefix "${prefix}":`, err.message);
  }
}

async function uploadFile(localPath, s3Key) {
  const extension = path.extname(localPath).toLowerCase();
  const contentType = (extension === '.png') ? 'image/png' : 'image/jpeg';
  const fileStream = fs.createReadStream(localPath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileStream,
    ContentType: contentType,
  });

  await client.send(command);
  console.log(`Uploaded: ${path.basename(localPath)} -> s3://${bucketName}/${s3Key}`);
}

async function run() {
  console.log(`Starting PDF image upload to S3 bucket: "${bucketName}"...`);
  const srcBaseDir = path.resolve(process.cwd(), 'public/images/extracted_portfolio');

  for (const category of CATEGORIES) {
    const localCatDir = path.join(srcBaseDir, category);
    if (!fs.existsSync(localCatDir)) {
      console.warn(`Local directory not found for category "${category}": ${localCatDir}. Skipping.`);
      continue;
    }

    // 1. Clean existing S3 files for this category
    const s3Prefix = `portfolio/${category}/`;
    await cleanS3Folder(s3Prefix);

    // 2. Read local extracted files
    const files = fs.readdirSync(localCatDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.png' || ext === '.jpeg' || ext === '.jpg';
      })
      .sort(); // Sort so render_01 is always first

    if (files.length === 0) {
      console.log(`No images found in local folder: ${localCatDir}`);
      continue;
    }

    console.log(`Uploading ${files.length} new images for "${category}"...`);

    for (let i = 0; i < files.length; i++) {
      const fileName = files[i];
      const localFilePath = path.join(localCatDir, fileName);

      // Make the first image (render_01) the hero image by renaming it on S3
      let s3FileName = fileName;
      if (i === 0) {
        const ext = path.extname(fileName);
        const nameWithoutExt = path.basename(fileName, ext);
        s3FileName = `${nameWithoutExt}-hero${ext}`;
      }

      const s3Key = `${s3Prefix}${s3FileName}`;
      try {
        await uploadFile(localFilePath, s3Key);
      } catch (err) {
        console.error(`Failed to upload ${fileName}:`, err.message);
      }
    }
  }

  console.log('\nDynamic PDF portfolio upload process finished!');
}

run().catch(err => {
  console.error('Upload process failed:', err);
  process.exit(1);
});
