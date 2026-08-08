import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:\\Users\\pglap\\.gemini\\antigravity-ide\\brain\\7fa02602-2ad4-4d22-85ba-4189b9b2064f';
const DEST_DIR = path.join(__dirname, '..', 'public', 'images', 'services');

// Ensure destination folder exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// 1-to-1 Mapping of pillars to artifact media files
const MAPPING = {
  'project-showcase': 'media__1786185848314.jpg', // Plot layout D 131
  '3d-visualization': 'media__1786185856272.jpg', // Luxury Bedroom render
  'virtual-experiences': 'media__1786185877357.jpg', // Serenity Heights interactive dashboard
  'marketing-stack': 'media__1786185863776.jpg', // Pool side clubhouse render
  'digital-launchpad': 'media__1786185870444.jpg', // BharatAwas property search portal
};

async function processImages() {
  console.log('--- Starting Services Image Copy & Compression ---');
  
  for (const [pillarId, fileName] of Object.entries(MAPPING)) {
    const srcPath = path.join(ARTIFACT_DIR, fileName);
    const destPath = path.join(DEST_DIR, `${pillarId}.webp`);
    
    if (!fs.existsSync(srcPath)) {
      console.error(`Error: Source file not found: ${srcPath}`);
      continue;
    }
    
    console.log(`Processing: ${fileName} -> ${pillarId}.webp`);
    try {
      await sharp(srcPath)
        .webp({ quality: 85 })
        .toFile(destPath);
      console.log(`Successfully saved optimized WebP: ${destPath}`);
    } catch (err) {
      console.error(`Failed to process ${fileName}:`, err);
    }
  }
  
  console.log('--- Finished Processing ---');
}

processImages();
