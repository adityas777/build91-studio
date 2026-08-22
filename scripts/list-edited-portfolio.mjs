import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('s3_downloads/build91-portfolio-assets/portfolio');

console.log('=== CURRENT FILES IN s3_downloads/build91-portfolio-assets/portfolio ===');

const categories = fs.readdirSync(baseDir);
for (const cat of categories) {
  const catDir = path.join(baseDir, cat);
  if (!fs.statSync(catDir).isDirectory()) continue;
  const files = fs.readdirSync(catDir);
  console.log(`\n📁 [${cat}] (${files.length} files):`);
  files.forEach(f => {
    const full = path.join(catDir, f);
    const size = (fs.statSync(full).size / 1024 / 1024).toFixed(2);
    console.log(`   - ${f} (${size} MB)`);
  });
}
