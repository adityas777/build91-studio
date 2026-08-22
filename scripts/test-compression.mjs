import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function testCompress() {
  const sampleFile = path.resolve('s3_downloads/build91-portfolio-assets/portfolio/isometric/1.- 2BHK jodi.png.png');
  const outFileWebp = path.resolve('s3_downloads/test_sample.webp');
  const outFileJpg = path.resolve('s3_downloads/test_sample.jpeg');

  const inStat = fs.statSync(sampleFile);
  console.log(`Original file: ${(inStat.size / 1024 / 1024).toFixed(2)} MB`);

  const meta = await sharp(sampleFile).metadata();
  console.log(`Original dimensions: ${meta.width} x ${meta.height}, format: ${meta.format}`);

  // Test WebP quality 85, max width 2560
  await sharp(sampleFile)
    .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toFile(outFileWebp);

  const outStatWebp = fs.statSync(outFileWebp);
  console.log(`Optimized WebP (Q85, max 2560px): ${(outStatWebp.size / 1024).toFixed(1)} KB (Reduction: ${((1 - outStatWebp.size / inStat.size) * 100).toFixed(2)}%)`);

  // Test JPEG quality 85, mozjpeg
  await sharp(sampleFile)
    .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(outFileJpg);

  const outStatJpg = fs.statSync(outFileJpg);
  console.log(`Optimized MozJPEG (Q85, max 2560px): ${(outStatJpg.size / 1024).toFixed(1)} KB (Reduction: ${((1 - outStatJpg.size / inStat.size) * 100).toFixed(2)}%)`);
}

testCompress().catch(console.error);
