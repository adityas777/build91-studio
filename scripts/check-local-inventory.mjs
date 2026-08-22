import fs from 'fs';
import path from 'path';

function getFolderInventory(baseDir) {
  const categories = ['interiors', 'exteriors', 'amenities', 'isometric', 'elevations'];
  const inventory = {};
  for (const cat of categories) {
    const catDir = path.join(baseDir, 'portfolio', cat);
    inventory[cat] = [];
    if (fs.existsSync(catDir)) {
      const files = fs.readdirSync(catDir);
      for (const f of files) {
        const full = path.join(catDir, f);
        const stat = fs.statSync(full);
        inventory[cat].push({ name: f, size: stat.size, mtime: stat.mtime });
      }
    }
  }
  return inventory;
}

const dir1 = path.resolve('s3_downloads/build91-portfolio-assets');
const dir2 = path.resolve('s3_downloads/build91-studio-prod-portfoliobucketbucket-bsmmcecr');

console.log('=== Folder 1: s3_downloads/build91-portfolio-assets ===');
const inv1 = getFolderInventory(dir1);
for (const [cat, files] of Object.entries(inv1)) {
  console.log(`[${cat}]: ${files.length} files`);
}

console.log('\n=== Folder 2: s3_downloads/build91-studio-prod-portfoliobucketbucket-bsmmcecr ===');
const inv2 = getFolderInventory(dir2);
for (const [cat, files] of Object.entries(inv2)) {
  console.log(`[${cat}]: ${files.length} files`);
}

// Let's check if there are differences between dir1 and dir2
console.log('\n=== DIFFERENCES BETWEEN DIR1 AND DIR2 ===');
for (const cat of Object.keys(inv1)) {
  const f1 = new Set(inv1[cat].map(f => f.name));
  const f2 = new Set(inv2[cat].map(f => f.name));
  
  const in1Not2 = [...f1].filter(x => !f2.has(x));
  const in2Not1 = [...f2].filter(x => !f1.has(x));
  
  if (in1Not2.length > 0 || in2Not1.length > 0) {
    console.log(`\nCategory: ${cat}`);
    if (in1Not2.length > 0) console.log(`  In build91-portfolio-assets only:`, in1Not2);
    if (in2Not1.length > 0) console.log(`  In build91-studio-prod only:`, in2Not1);
  }
}
