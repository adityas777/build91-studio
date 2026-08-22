import fs from 'fs';
import path from 'path';

function scanDir(dir, maxDepth = 4, currentDepth = 0) {
  if (currentDepth > maxDepth || !fs.existsSync(dir)) return [];
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
          results.push(...scanDir(fullPath, maxDepth, currentDepth + 1));
        }
      } else {
        const stat = fs.statSync(fullPath);
        // Look for image files or files modified recently
        const ext = path.extname(entry.name).toLowerCase();
        if (['.png', '.jpeg', '.jpg', '.webp'].includes(ext)) {
          results.push({
            path: fullPath,
            size: stat.size,
            mtime: stat.mtime
          });
        }
      }
    }
  } catch (e) {}
  return results;
}

console.log('--- Checking possible local portfolio folders ---');

const checkDirs = [
  's3_downloads',
  'public/images',
  'public',
  '.'
];

for (const d of checkDirs) {
  const full = path.resolve(d);
  if (fs.existsSync(full)) {
    console.log(`\nScanning folder: ${full}`);
    const files = scanDir(full, 3);
    console.log(`Total image files: ${files.length}`);
    // Show most recently modified 10 files
    files.sort((a, b) => b.mtime - a.mtime);
    files.slice(0, 10).forEach(f => console.log(`  - [${f.mtime.toISOString()}] ${(f.size/1024/1024).toFixed(2)}MB: ${path.relative(process.cwd(), f.path)}`));
  }
}
