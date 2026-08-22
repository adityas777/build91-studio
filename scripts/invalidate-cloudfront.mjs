import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
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

const client = new CloudFrontClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_KEY,
  },
});

async function invalidate(distId = 'EHMMA0293SF') {
  console.log(`Creating CloudFront invalidation for Distribution ${distId} (studio.build91.in)...`);
  const res = await client.send(
    new CreateInvalidationCommand({
      DistributionId: distId,
      InvalidationBatch: {
        CallerReference: `inv-${Date.now()}`,
        Paths: {
          Quantity: 2,
          Items: ['/api/portfolio*', '/portfolio*'],
        },
      },
    })
  );
  console.log(`Invalidation submitted! ID: ${res.Invalidation?.Id}, Status: ${res.Invalidation?.Status}`);
}

invalidate().catch((err) => {
  console.error('Failed to create invalidation:', err);
  process.exit(1);
});
