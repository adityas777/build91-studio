import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:\\Users\\pglap\\.gemini\\antigravity-ide\\brain\\7fa02602-2ad4-4d22-85ba-4189b9b2064f';
const DEST_DIR = path.join(__dirname, '..', 'public', 'video');

// Ensure destination folder exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Map the images to their target destination assets
const POSTERS = [
  {
    src: 'media__1786189595399.jpg', // Desktop / landscape office view
    dest: 'StudioTeam-poster.webp'
  },
  {
    src: 'media__1786189607367.jpg', // Mobile / portrait office view
    dest: 'StudioTeam-poster-mobile.webp'
  }
];

async function processPosters() {
  console.log('--- Starting About Studio Posters Copy & Compression ---');
  
  for (const poster of POSTERS) {
    const srcPath = path.join(ARTIFACT_DIR, poster.src);
    const destPath = path.join(DEST_DIR, poster.dest);
    
    if (!fs.existsSync(srcPath)) {
      console.error(`Error: Source file not found: ${srcPath}`);
      continue;
    }
    
    console.log(`Processing: ${poster.src} -> ${poster.dest}`);
    try {
      await sharp(srcPath)
        .webp({ quality: 85 })
        .toFile(destPath);
      console.log(`Successfully saved poster: ${destPath}`);
    } catch (err) {
      console.error(`Failed to process ${poster.src}:`, err);
    }
  }
  
  console.log('--- Finished Processing ---');
}

processPosters();
