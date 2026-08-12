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

// Seed data corresponding to the original FaqSection.tsx hardcoded values
const FAQS = [
  {
    question: "What Is 3D Rendering in Interior Design?",
    answer: "Interior design rendering is the process of creating 2D or 3D digital models of interior spaces. These models are then enhanced with textures, lighting, and other details to create realistic visualizations of how a space will look once it’s completed. Interior rendering is an essential tool for architects, interior designers, and real estate developers to help visualize their designs and communicate their vision to clients and stakeholders.",
    keywords: "what is 3d rendering interior design process digital models visualisations layout plans"
  },
  {
    question: "What is the Cost of 3D Rendering Services for Interior Design?",
    answer: "Please [talk to us to get a quote](/quote). Our pricing typically depends on the area required to render and the type of drawings required. We work on carpet area and a per sqft rate. There are different rate slabs. We offer 3D Interior and Exterior renders, 2D interior drawings, Pano 360° walkthroughs, cut-sections and 3D floor plans. Views and revisions are unlimited for a given design. For large projects such as townships, resorts and tall buildings - it's a case to case basis.",
    keywords: "cost price rates pricing sqft carpet area rates views revisions charges quotation"
  },
  {
    question: "How Long Do 3D Interior Design Rendering Services Take?",
    answer: "The time it takes for a 3d interior design company to create renderings can vary depending on the complexity of the project and the level of detail required. Simple projects with minimal details may take 1-2 weeks, whilst more complex projects with intricate designs, customized furniture or a lack of design materials can take longer to create. Generally, factors that can affect the time it takes to complete an interior render include the number of revisions required, the size of the space, amount of customized furniture and time taken to receive feedback from the client when required.",
    keywords: "how long time duration timeline delivery turnaround weeks feedback speed schedule"
  },
  {
    question: "Can You Work with My Existing Designs and Ideas?",
    answer: "Absolutely. We can integrate your design ideas, sketches, or blueprints to create accurate 3D renderings that align with your vision. Our team is experienced in collaborating with interior designers and clients to bring existing ideas to life.",
    keywords: "existing designs ideas sketches blueprints drawings layouts collaboration matching integration"
  },
  {
    question: "What If I Need Revisions?",
    answer: "We understand that design is a collaborative process. We offer a structured revision process to ensure that the final renderings meet your exact expectations. Minor adjustments are usually included in our pricing, and our team will provide clear guidance on revision limits.",
    keywords: "revisions changes edit modifications corrections revision limits adjust review process"
  },
  {
    question: "How Do You Ensure the Renderings Are Accurate?",
    answer: "Our team uses high-quality software and works closely with you to gather precise measurements, material preferences, and style details. We also offer a review stage where you can confirm that everything looks accurate before finalizing.",
    keywords: "accuracy precise check measures material details software review quality quality check"
  },
  {
    question: "What Makes Your Renderings Different from Competitors?",
    answer: "We pride ourselves on producing photorealistic images with exceptional attention to detail. Our renderings are crafted to captivate viewers and help your spaces stand out in the market, all while providing personalized service and quick turnaround times.",
    keywords: "difference competitors benefit stand out photorealistic speed quality personal unique"
  },
  {
    question: "How Can 3D Renderings Help Increase My Sales?",
    answer: "High-quality 3D renderings showcase your designs in a visually engaging way, making it easier for clients to envision themselves in the space. This emotional connection can lead to faster decision-making and increased sales, as clients are more likely to be drawn to realistic, detailed presentations of your work.",
    keywords: "sales help increase lead conversion conversion speed decision making return of investment marketing"
  },
  {
    question: "Do you also do 2D Drawings?",
    answer: "Yes we do! You can get 2D elevation drawings which shows the vertical layout of a room’s features. It typically includes the overall dimensions, placement of furnishings (like the bed and side tables), wall treatments, lighting fixtures, and finish specifications (e.g., paint colors, textures, or materials). Checkout some samples in our [Portfolio](/portfolio).",
    keywords: "2d drawings elevation vertical layout dimensions furnishings materials plans samples"
  }
];

async function seed() {
  console.log(`Seeding FAQ JSON to S3 bucket: "${bucketName}"...`);
  
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
    
    // Also save a local backup copy in the scripts folder
    const backupPath = path.resolve(process.cwd(), 'scripts/faq-backup.json');
    fs.writeFileSync(backupPath, faqJson, 'utf8');
    console.log(`Saved local FAQ backup to: ${backupPath}`);
  } catch (err) {
    console.error('Failed to upload FAQ data to S3:', err.message);
    process.exit(1);
  }
}

seed().catch(err => {
  console.error('Seed process failed:', err);
  process.exit(1);
});
