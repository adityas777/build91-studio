import { mkdir, rename, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(PROJECT_ROOT, 'public');
const BACKUPS_DIR = join(PROJECT_ROOT, 'backups');

async function scanAndMove(currentDir) {
  const entries = await readdir(currentDir);
  for (const entry of entries) {
    const fullPath = join(currentDir, entry);
    const s = await stat(fullPath);

    if (s.isDirectory()) {
      await scanAndMove(fullPath);
    } else if (s.isFile() && entry.endsWith('.bak')) {
      const relPath = relative(PUBLIC_DIR, fullPath);
      const destPath = join(BACKUPS_DIR, relPath);
      const destDir = dirname(destPath);

      if (!existsSync(destDir)) {
        await mkdir(destDir, { recursive: true });
      }

      console.log(`Moving backup: ${relPath} -> backups/${relPath}`);
      await rename(fullPath, destPath);
    }
  }
}

async function main() {
  if (!existsSync(PUBLIC_DIR)) {
    console.error('No public folder found.');
    return;
  }

  console.log('Scanning for media backup (.bak) files inside public/ ...');
  await scanAndMove(PUBLIC_DIR);
  console.log('Done moving media backups out of public/ to root backups/ directory!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
