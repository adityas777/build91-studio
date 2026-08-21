import fs from 'fs';
import { ACMClient, DescribeCertificateCommand } from '@aws-sdk/client-acm';

const lines = fs.readFileSync('.env.local', 'utf-8').split(/\r?\n/);
for (const line of lines) {
  if (line.trim().startsWith('#') || !line.includes('=')) continue;
  const eqIdx = line.indexOf('=');
  const key = line.slice(0, eqIdx).trim();
  let val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
  if (!process.env[key]) process.env[key] = val;
}

const client = new ACMClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const certArn = 'arn:aws:acm:us-east-1:533267081620:certificate/456a4078-d60b-465e-ae2a-7c607ddf0987';

const desc = await client.send(new DescribeCertificateCommand({ CertificateArn: certArn }));

console.log('Status:', desc.Certificate.Status);
console.log('\n--- DNS Validation Records (add these to your DNS) ---');
for (const opt of desc.Certificate.DomainValidationOptions || []) {
  console.log(`\nDomain: ${opt.DomainName}`);
  if (opt.ResourceRecord) {
    console.log(`  CNAME Name:  ${opt.ResourceRecord.Name}`);
    console.log(`  CNAME Value: ${opt.ResourceRecord.Value}`);
  } else {
    console.log('  (DNS record not yet available, try again in a moment)');
  }
}
