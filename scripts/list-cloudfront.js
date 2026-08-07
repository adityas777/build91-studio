const { CloudFrontClient, ListDistributionsCommand } = require("@aws-sdk/client-cloudfront");
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split(/\r?\n/).forEach(line => {
    if (line.trim().startsWith("#") || !line.includes("=")) return;
    const parts = line.split("=");
    const key = parts[0].trim();
    let value = parts.slice(1).join("=").trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY;
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_KEY;
process.env.AWS_REGION = process.env.AWS_REGION || "us-east-1";

async function run() {
  const client = new CloudFrontClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  try {
    const data = await client.send(new ListDistributionsCommand({}));
    if (data.DistributionList && data.DistributionList.Items) {
      data.DistributionList.Items.forEach(d => {
        console.log(`ID: ${d.Id}`);
        console.log(`DomainName: ${d.DomainName}`);
        console.log(`Aliases: ${d.Aliases ? JSON.stringify(d.Aliases.Items) : 'None'}`);
        console.log(`Enabled: ${d.Enabled}`);
        console.log(`Comment: ${d.Comment}`);
        console.log('---');
      });
    } else {
      console.log('No distributions found.');
    }
  } catch (err) {
    console.error('Error listing CloudFront distributions:', err);
  }
}
run();
