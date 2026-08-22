import { S3Client, ListBucketsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

async function checkAllBuckets() {
  const bucketsRes = await s3.send(new ListBucketsCommand({}));
  console.log('--- ALL S3 BUCKETS IN AWS ACCOUNT ---');
  for (const b of bucketsRes.Buckets || []) {
    console.log(`Bucket: ${b.Name} (Created: ${b.CreationDate})`);
    if (b.Name.includes('portfolio') || b.Name.includes('build91')) {
      try {
        const objs = await s3.send(new ListObjectsV2Command({ Bucket: b.Name, MaxKeys: 10 }));
        console.log(`  -> Key count (first page): ${objs.KeyCount}, total size: ${objs.Contents?.reduce((a,c)=>a+c.Size,0)} bytes`);
        (objs.Contents || []).forEach(o => console.log(`     * ${o.Key} (${o.Size} bytes, LastModified: ${o.LastModified})`));
      } catch (e) {
        console.log(`  -> Error reading ${b.Name}: ${e.message}`);
      }
    }
  }
}

checkAllBuckets().catch(console.error);
