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

// Source of truth: scripts/faq-backup.json. Edit that file, then run this
// script to push it to S3. (It used to hold its own inline copy, which meant
// re-running reverted S3 to stale content — now the JSON drives everything,
// and the local fallback in components/FaqSection.tsx should mirror it too.)
const backupPath = path.resolve(process.cwd(), 'scripts/faq-backup.json');

if (!fs.existsSync(backupPath)) {
  console.error(`ERROR: FAQ source file not found at ${backupPath}`);
  process.exit(1);
}

let FAQS;
try {
  FAQS = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
} catch (err) {
  console.error(`ERROR: Could not parse ${backupPath}: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(FAQS) || FAQS.length === 0) {
  console.error('ERROR: FAQ source must be a non-empty JSON array.');
  process.exit(1);
}

async function seed() {
  console.log(
    `Seeding ${FAQS.length} FAQs from ${backupPath} to S3 bucket "${bucketName}"...`
  );

  const faqJson = JSON.stringify(FAQS, null, 2);
  const s3Key = 'faq/faq.json';

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: faqJson,
    ContentType: 'application/json'
  });

  try {
    await client.send(command);
    console.log(`Successfully uploaded FAQ configuration to s3://${bucketName}/${s3Key}`);
  } catch (err) {
    console.error('Failed to upload FAQ data to S3:', err.message);
    process.exit(1);
  }
}

seed().catch(err => {
  console.error('Seed process failed:', err);
  process.exit(1);
});
