import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import fs from 'fs';
import path from 'path';

// 1. Load .env.local
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
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_KEY,
};

const s3 = new S3Client({ region, credentials });
const cf = new CloudFrontClient({ region, credentials });

const BUCKETS = [
  'build91-portfolio-assets',
  'build91-studio-prod-portfoliobucketbucket-bsmmcecr'
];

const LOCAL_PORTFOLIO_DIR = path.resolve('s3_downloads/build91-portfolio-assets/portfolio');

// Gather all local files under portfolio/
function getLocalFiles(dir, prefix = 'portfolio') {
  const fileList = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fileList.push(...getLocalFiles(fullPath, `${prefix}/${entry.name}`));
    } else {
      fileList.push({
        s3Key: `${prefix}/${entry.name}`,
        localPath: fullPath,
        size: fs.statSync(fullPath).size
      });
    }
  }
  return fileList;
}

async function getS3Objects(bucketName, prefix = 'portfolio/') {
  let continuationToken = undefined;
  let allObjects = [];
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken
    }));
    if (res.Contents) allObjects.push(...res.Contents);
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);
  return allObjects;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpeg' || ext === '.jpg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

async function syncLocalToBucket(bucketName, localFiles) {
  console.log(`\n=============================================================`);
  console.log(`Syncing local portfolio to S3 bucket: "${bucketName}"`);
  console.log(`=============================================================`);

  const s3Objects = await getS3Objects(bucketName, 'portfolio/');
  const s3Map = new Map();
  for (const o of s3Objects) {
    if (!o.Key || o.Key.endsWith('/')) continue;
    s3Map.set(o.Key, o);
  }

  const localMap = new Map();
  for (const f of localFiles) {
    localMap.set(f.s3Key, f);
  }

  // 1. Upload new / modified files
  let uploadCount = 0;
  for (const [key, localObj] of localMap.entries()) {
    const s3Obj = s3Map.get(key);
    if (!s3Obj || s3Obj.Size !== localObj.size) {
      console.log(`Uploading -> s3://${bucketName}/${key} (${(localObj.size/1024/1024).toFixed(2)} MB)`);
      const body = fs.readFileSync(localObj.localPath);
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: getContentType(localObj.localPath)
      }));
      uploadCount++;
    }
  }
  console.log(`Uploaded / verified ${uploadCount} files.`);

  // 2. Delete removed files
  const keysToDelete = [];
  for (const [key] of s3Map.entries()) {
    if (!localMap.has(key)) {
      console.log(`Deleting removed file -> s3://${bucketName}/${key}`);
      keysToDelete.push({ Key: key });
    }
  }

  if (keysToDelete.length > 0) {
    console.log(`Deleting ${keysToDelete.length} removed files from ${bucketName}...`);
    await s3.send(new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: keysToDelete }
    }));
    console.log(`Deleted ${keysToDelete.length} files successfully.`);
  } else {
    console.log(`No deletions needed for ${bucketName}.`);
  }
}

async function syncLocalCopies() {
  const prodLocalDir = path.resolve('s3_downloads/build91-studio-prod-portfoliobucketbucket-bsmmcecr/portfolio');
  console.log(`\nSyncing local mirror to: ${prodLocalDir}`);
  if (fs.existsSync(prodLocalDir)) {
    fs.rmSync(prodLocalDir, { recursive: true, force: true });
  }
  fs.cpSync(LOCAL_PORTFOLIO_DIR, prodLocalDir, { recursive: true });
  console.log(`Local mirror updated.`);
}

async function invalidateCloudFront() {
  const distId = 'EHMMA0293SF'; // studio.build91.in
  console.log(`\nInvalidating CloudFront cache on distribution ${distId} (studio.build91.in)...`);
  const res = await cf.send(new CreateInvalidationCommand({
    DistributionId: distId,
    InvalidationBatch: {
      CallerReference: `inv-${Date.now()}`,
      Paths: {
        Quantity: 2,
        Items: ['/api/portfolio*', '/portfolio*']
      }
    }
  }));
  console.log(`Invalidation submitted: ID=${res.Invalidation?.Id}, Status=${res.Invalidation?.Status}`);
}

async function main() {
  console.log(`Local source folder: ${LOCAL_PORTFOLIO_DIR}`);
  const localFiles = getLocalFiles(LOCAL_PORTFOLIO_DIR);
  console.log(`Found ${localFiles.length} local portfolio files to sync.`);

  for (const bucket of BUCKETS) {
    await syncLocalToBucket(bucket, localFiles);
  }

  await syncLocalCopies();
  await invalidateCloudFront();

  console.log(`\n🎉 ALL CHANGES PUSHED TO S3 & CLOUDFRONT CACHE PURGED!`);
}

main().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
