import fs from 'fs';
import { ACMClient, RequestCertificateCommand, DescribeCertificateCommand } from '@aws-sdk/client-acm';

// Load .env.local
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

console.log('Requesting certificate for *.studio.build91.in ...');

const res = await client.send(new RequestCertificateCommand({
  DomainName: '*.studio.build91.in',
  SubjectAlternativeNames: ['studio.build91.in', 'www.studio.build91.in'],
  ValidationMethod: 'DNS',
}));

console.log('\nCertificate ARN:', res.CertificateArn);

// Wait a moment then fetch DNS validation records
await new Promise(r => setTimeout(r, 3000));

const desc = await client.send(new DescribeCertificateCommand({
  CertificateArn: res.CertificateArn,
}));

console.log('\n--- DNS Validation Records (add these to your DNS) ---');
for (const opt of desc.Certificate.DomainValidationOptions || []) {
  if (opt.ResourceRecord) {
    console.log(`\nDomain: ${opt.DomainName}`);
    console.log(`  CNAME Name:  ${opt.ResourceRecord.Name}`);
    console.log(`  CNAME Value: ${opt.ResourceRecord.Value}`);
  }
}
