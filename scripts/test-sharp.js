import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'public', 'images', 'clients', 'laxmi-developer.png');

console.log('Reading metadata of:', file);
sharp(file).metadata()
  .then(meta => {
    console.log('Metadata:', meta);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
