import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_KEY,
  },
});

async function listBucket(name) {
  console.log(`\n================ BUCKET: ${name} ================`);
  let continuationToken = undefined;
  let allObjects = [];
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: name,
      Prefix: 'portfolio/',
      ContinuationToken: continuationToken
    }));
    if (res.Contents) allObjects.push(...res.Contents);
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  console.log(`Total portfolio objects: ${allObjects.length}`);
  const byCategory = {};
  for (const obj of allObjects) {
    const parts = obj.Key.split('/');
    const cat = parts[1] || 'root';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ file: parts.slice(2).join('/'), size: obj.Size, modified: obj.LastModified });
  }

  for (const [cat, files] of Object.entries(byCategory)) {
    console.log(`\nCategory: [${cat}] (${files.length} files)`);
    files.forEach(f => console.log(`  - ${f.file} (${(f.size/1024/1024).toFixed(2)} MB, mod: ${f.modified.toISOString()})`));
  }
}

async function run() {
  await listBucket('build91-portfolio-assets');
  await listBucket('build91-studio-prod-portfoliobucketbucket-bsmmcecr');
}

run().catch(console.error);
