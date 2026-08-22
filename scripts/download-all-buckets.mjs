import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

// Load .env.local for AWS credentials
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split(/\r?\n/).forEach(line => {
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const parts = line.split('=');
    const key = parts[0].trim();
    let value = parts.slice(1).join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

const region = process.env.AWS_REGION || 'us-east-1';
const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_KEY,
  },
});

const BUCKETS_TO_DOWNLOAD = [
  'build91-portfolio-assets',
  'build91-studio-prod-portfoliobucketbucket-bsmmcecr'
];

// Target base directory
const BASE_OUTPUT_DIR = path.resolve(process.cwd(), 's3_downloads');

async function getAllObjects(bucketName) {
  let continuationToken = undefined;
  let allObjects = [];
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: continuationToken
    }));
    if (res.Contents) allObjects.push(...res.Contents);
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);
  return allObjects;
}

async function downloadObject(bucketName, key, targetPath) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const response = await s3.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  }));

  const writeStream = fs.createWriteStream(targetPath);
  await pipeline(response.Body, writeStream);
}

async function downloadBucket(bucketName) {
  console.log(`\n======================================================`);
  console.log(`Fetching object list for bucket: "${bucketName}"...`);
  console.log(`======================================================`);

  const objects = await getAllObjects(bucketName);
  const validFiles = objects.filter(o => o.Key && !o.Key.endsWith('/') && o.Size > 0);
  const totalBytes = validFiles.reduce((acc, o) => acc + o.Size, 0);

  console.log(`Found ${validFiles.length} files (${(totalBytes / 1024 / 1024).toFixed(2)} MB) to download.\n`);

  const bucketOutputDir = path.join(BASE_OUTPUT_DIR, bucketName);
  let downloadedCount = 0;
  let downloadedBytes = 0;

  // Process in parallel batches of 5
  const CONCURRENCY = 5;
  for (let i = 0; i < validFiles.length; i += CONCURRENCY) {
    const batch = validFiles.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (fileObj) => {
      const targetFilePath = path.join(bucketOutputDir, fileObj.Key);
      
      // Check if file already exists and has the same size
      if (fs.existsSync(targetFilePath)) {
        const stat = fs.statSync(targetFilePath);
        if (stat.size === fileObj.Size) {
          downloadedCount++;
          downloadedBytes += fileObj.Size;
          console.log(`[${downloadedCount}/${validFiles.length}] (Cached) ${fileObj.Key}`);
          return;
        }
      }

      const startTime = Date.now();
      try {
        await downloadObject(bucketName, fileObj.Key, targetFilePath);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        downloadedCount++;
        downloadedBytes += fileObj.Size;
        console.log(`[${downloadedCount}/${validFiles.length}] (${duration}s, ${(fileObj.Size / 1024 / 1024).toFixed(2)} MB) ${fileObj.Key}`);
      } catch (err) {
        console.error(`[ERROR] Failed downloading ${fileObj.Key}:`, err.message);
      }
    }));
  }

  console.log(`\n✅ Finished downloading "${bucketName}" -> ${bucketOutputDir}`);
}

async function main() {
  if (!fs.existsSync(BASE_OUTPUT_DIR)) {
    fs.mkdirSync(BASE_OUTPUT_DIR, { recursive: true });
  }

  console.log(`Target download folder: ${BASE_OUTPUT_DIR}`);

  for (const bucket of BUCKETS_TO_DOWNLOAD) {
    try {
      await downloadBucket(bucket);
    } catch (err) {
      console.error(`Failed to process bucket ${bucket}:`, err.message);
    }
  }

  console.log(`\n🎉 ALL S3 BUCKETS DOWNLOADED SUCCESSFULLY!`);
  console.log(`Local Path: ${BASE_OUTPUT_DIR}`);
}

main().catch(console.error);
