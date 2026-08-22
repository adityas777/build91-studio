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

const bucketName = process.env.PORTFOLIO_BUCKET_NAME;
const region = process.env.AWS_REGION || 'us-east-1';

console.log('Using bucket:', bucketName, 'in region:', region);

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_KEY,
  },
});

async function listAll() {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: 'portfolio/',
  });

  const res = await s3.send(command);
  const contents = res.Contents || [];
  console.log(`\nTotal objects in S3 bucket (${bucketName}):`, contents.length);
  
  const grouped = {};
  for (const item of contents) {
    const key = item.Key;
    const parts = key.split('/');
    const cat = parts[1] || 'root';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(parts.slice(2).join('/'));
  }

  for (const [cat, files] of Object.entries(grouped)) {
    console.log(`\n📁 Category "${cat}" (${files.length} items):`);
    files.forEach(f => console.log(`   - ${f}`));
  }
}

listAll().catch(console.error);
