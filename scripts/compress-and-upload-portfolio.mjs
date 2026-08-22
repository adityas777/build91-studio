import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

// 1. Load AWS Credentials from .env.local
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

const SOURCE_PORTFOLIO_DIR = path.resolve('s3_downloads/build91-portfolio-assets/portfolio');
const OPTIMIZED_OUTPUT_DIR = path.resolve('s3_downloads/compressed_portfolio');

async function compressAll() {
  console.log(`\n======================================================`);
  console.log(`1. Compressing Portfolio Renders with Sharp (WebP Q85, 2.5K max)`);
  console.log(`======================================================`);

  if (fs.existsSync(OPTIMIZED_OUTPUT_DIR)) {
    fs.rmSync(OPTIMIZED_OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OPTIMIZED_OUTPUT_DIR, { recursive: true });

  const categories = fs.readdirSync(SOURCE_PORTFOLIO_DIR);
  const compressedFiles = [];

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const cat of categories) {
    const catSrcDir = path.join(SOURCE_PORTFOLIO_DIR, cat);
    if (!fs.statSync(catSrcDir).isDirectory()) continue;

    const catOutDir = path.join(OPTIMIZED_OUTPUT_DIR, cat);
    fs.mkdirSync(catOutDir, { recursive: true });

    const files = fs.readdirSync(catSrcDir).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    });

    console.log(`\n📁 Processing Category: [${cat}] (${files.length} images)...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const srcPath = path.join(catSrcDir, file);
      const originalStat = fs.statSync(srcPath);
      totalOriginalBytes += originalStat.size;

      // Clean up filename (remove double extensions like .png.png, replace ext with .webp)
      let cleanName = file.replace(/(\.png|\.jpg|\.jpeg|\.webp)+$/gi, '');
      
      // Ensure hero tag for the first image of a category if no other image has it
      if (i === 0 && !files.some(f => f.includes('-hero'))) {
        if (!cleanName.includes('-hero')) {
          cleanName = `${cleanName}-hero`;
        }
      }

      const outFileName = `${cleanName}.webp`;
      const outPath = path.join(catOutDir, outFileName);

      const startTime = Date.now();
      try {
        const image = sharp(srcPath);
        const metadata = await image.metadata();

        await image
          .resize({
            width: 2560,
            height: 2560,
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({
            quality: 85,
            effort: 6
          })
          .toFile(outPath);

        const outStat = fs.statSync(outPath);
        totalOptimizedBytes += outStat.size;
        const reductionPct = ((1 - outStat.size / originalStat.size) * 100).toFixed(1);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`  ✓ ${file} -> ${outFileName} (${(originalStat.size/1024/1024).toFixed(1)}MB -> ${(outStat.size/1024).toFixed(1)}KB, -${reductionPct}%, ${duration}s)`);

        compressedFiles.push({
          category: cat,
          fileName: outFileName,
          localPath: outPath,
          s3Key: `portfolio/${cat}/${outFileName}`,
          size: outStat.size
        });
      } catch (err) {
        console.error(`  ✗ Error compressing ${file}:`, err.message);
      }
    }
  }

  const savedMB = ((totalOriginalBytes - totalOptimizedBytes) / 1024 / 1024).toFixed(1);
  const overallReduction = ((1 - totalOptimizedBytes / totalOriginalBytes) * 100).toFixed(1);
  console.log(`\n======================================================`);
  console.log(`🎉 Compression Complete!`);
  console.log(`Original Total:  ${(totalOriginalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Optimized Total: ${(totalOptimizedBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total Saved:     ${savedMB} MB (-${overallReduction}%)`);
  console.log(`======================================================`);

  return compressedFiles;
}

async function getAllS3Objects(bucketName, prefix = 'portfolio/') {
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

async function syncToBucket(bucketName, compressedFiles) {
  console.log(`\n======================================================`);
  console.log(`2. Uploading optimized files to S3 bucket: "${bucketName}"`);
  console.log(`======================================================`);

  // 1. Get existing S3 objects under portfolio/
  const existingS3 = await getAllS3Objects(bucketName, 'portfolio/');
  const existingKeys = new Set(existingS3.map(o => o.Key).filter(k => k && !k.endsWith('/')));

  // 2. Upload all optimized WebP files
  console.log(`Uploading ${compressedFiles.length} optimized files...`);
  for (const f of compressedFiles) {
    const body = fs.readFileSync(f.localPath);
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: f.s3Key,
      Body: body,
      ContentType: 'image/webp'
    }));
    existingKeys.delete(f.s3Key);
  }
  console.log(`All ${compressedFiles.length} files uploaded to ${bucketName}.`);

  // 3. Delete old / uncompressed files that are no longer needed
  if (existingKeys.size > 0) {
    const keysToDelete = Array.from(existingKeys).map(k => ({ Key: k }));
    console.log(`Deleting ${keysToDelete.length} uncompressed/old files from ${bucketName}...`);
    // Delete in batches of 500
    for (let i = 0; i < keysToDelete.length; i += 500) {
      const batch = keysToDelete.slice(i, i + 500);
      await s3.send(new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: { Objects: batch }
      }));
    }
    console.log(`Deleted ${keysToDelete.length} old files from ${bucketName}.`);
  }
}

async function updateLocalDownloadMirrors() {
  console.log(`\nUpdating local s3_downloads directories...`);
  for (const bucket of BUCKETS) {
    const destDir = path.resolve(`s3_downloads/${bucket}/portfolio`);
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
    fs.cpSync(OPTIMIZED_OUTPUT_DIR, destDir, { recursive: true });
    console.log(`  ✓ Updated s3_downloads/${bucket}/portfolio`);
  }
}

async function invalidateCloudFront() {
  const distId = 'EHMMA0293SF'; // studio.build91.in
  console.log(`\n3. Invalidating CloudFront cache for Distribution ${distId} (studio.build91.in)...`);
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
  console.log(`CloudFront Invalidation submitted: ID=${res.Invalidation?.Id}, Status=${res.Invalidation?.Status}`);
}

async function main() {
  const compressedFiles = await compressAll();

  for (const bucket of BUCKETS) {
    await syncToBucket(bucket, compressedFiles);
  }

  await updateLocalDownloadMirrors();
  await invalidateCloudFront();

  console.log(`\n🚀 ALL IMAGES OPTIMIZED, UPLOADED TO S3, AND CLOUDFRONT CACHE PURGED!`);
}

main().catch(err => {
  console.error('Workflow failed:', err);
  process.exit(1);
});
