import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

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

const sourceBucket = 'build91-portfolio-assets';
const destBucket = 'build91-studio-prod-portfoliobucketbucket-bsmmcecr';
const region = process.env.AWS_REGION || 'us-east-1';

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_KEY,
  },
});

async function getAllObjects(bucketName) {
  let continuationToken = undefined;
  let allObjects = [];
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'portfolio/',
      ContinuationToken: continuationToken
    }));
    if (res.Contents) allObjects.push(...res.Contents);
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);
  return allObjects;
}

async function sync() {
  console.log(`Syncing from "${sourceBucket}" to "${destBucket}" in region "${region}"...`);

  const sourceObjects = await getAllObjects(sourceBucket);
  const destObjects = await getAllObjects(destBucket);

  console.log(`Source object count: ${sourceObjects.length}`);
  console.log(`Destination object count: ${destObjects.length}`);

  const sourceKeyMap = new Map();
  for (const obj of sourceObjects) {
    if (!obj.Key || obj.Key.endsWith('/')) continue; // Skip directory markers
    sourceKeyMap.set(obj.Key, obj);
  }

  const destKeyMap = new Map();
  for (const obj of destObjects) {
    if (!obj.Key || obj.Key.endsWith('/')) continue;
    destKeyMap.set(obj.Key, obj);
  }

  // 1. Copy new or modified files
  let copiedCount = 0;
  for (const [key, srcObj] of sourceKeyMap.entries()) {
    const destObj = destKeyMap.get(key);
    if (!destObj || destObj.Size !== srcObj.Size) {
      console.log(`Copying: ${key} (${(srcObj.Size/1024/1024).toFixed(2)} MB)...`);
      // URL-encode the source key for S3 CopyObject API
      const copySource = `${sourceBucket}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
      
      const ext = path.extname(key).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpeg' || ext === '.jpg') contentType = 'image/jpeg';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.json') contentType = 'application/json';

      await s3.send(new CopyObjectCommand({
        CopySource: copySource,
        Bucket: destBucket,
        Key: key,
        ContentType: contentType,
        MetadataDirective: 'REPLACE'
      }));
      copiedCount++;
    }
  }
  console.log(`Finished copying ${copiedCount} objects.`);

  // 2. Delete destination objects that no longer exist in source
  const keysToDelete = [];
  for (const [key] of destKeyMap.entries()) {
    if (!sourceKeyMap.has(key)) {
      console.log(`Will delete obsolete object from dest: ${key}`);
      keysToDelete.push({ Key: key });
    }
  }

  if (keysToDelete.length > 0) {
    console.log(`Deleting ${keysToDelete.length} obsolete objects from "${destBucket}"...`);
    await s3.send(new DeleteObjectsCommand({
      Bucket: destBucket,
      Delete: { Objects: keysToDelete }
    }));
    console.log('Obsolete objects deleted successfully.');
  }

  console.log('\nSync completed successfully!');
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
