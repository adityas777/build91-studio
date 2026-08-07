import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENTS_DIR = join(__dirname, '..', 'public', 'images', 'clients');

async function main() {
  if (!existsSync(CLIENTS_DIR)) {
    console.error(`Clients directory does not exist at: ${CLIENTS_DIR}`);
    process.exit(1);
  }

  const entries = await readdir(CLIENTS_DIR);
  const pngs = [];
  for (const e of entries) {
    const full = join(CLIENTS_DIR, e);
    const s = await stat(full);
    if (s.isFile() && e.toLowerCase().endsWith('.png') && e !== 'laxmi-developer.png' && e !== 'western-arch.png') {
      // process all PNG files
      pngs.push(e);
    }
  }
  // also add raw developer logos
  pngs.push('laxmi-developer.png');
  pngs.push('western-arch.png');

  console.log(`Found ${pngs.length} PNG logos to convert to WebP...`);

  for (const file of pngs) {
    const inPath = join(CLIENTS_DIR, file);
    const outPath = join(CLIENTS_DIR, file.replace(/\.png$/i, '.webp'));

    try {
      const img = sharp(inPath);
      const meta = await img.metadata();
      
      // If image is wider than 600px, resize it to 600px width keeping aspect ratio
      if (meta.width && meta.width > 600) {
        img.resize({ width: 600, withoutEnlargement: true });
      }

      const info = await img
        .webp({ quality: 80, effort: 6 })
        .toFile(outPath);
      
      const oldSize = (await stat(inPath)).size;
      const newSize = info.size;
      const pct = ((1 - newSize / oldSize) * 100).toFixed(1);

      console.log(`  ✓ Converted ${file} -> ${file.replace(/\.png$/i, '.webp')} (${(oldSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB, -${pct}%)`);
    } catch (err) {
      console.error(`  ✗ Failed converting ${file}: ${err.message}`);
    }
  }

  console.log('\nAll logos successfully converted to optimized WebP!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
