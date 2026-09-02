#!/usr/bin/env node
/**
 * optimize-blog-images.mjs
 * ─────────────────────────────────────────────────────────────────────
 * One-off (and re-runnable) preprocessor for the blog article images
 * flagged by PageSpeed Insights ("Improve image delivery", ~3.5 MB of
 * potential savings on /blogs).
 *
 * Why this exists:
 *   /public/images/blogs/*.png are lossless PNG encodings of photographic
 *   content (interior/exterior renders) — PNG is a poor fit for that kind
 *   of content, since photos compress far better as JPEG. Several files in
 *   this exact folder (page_18/20/22) are ALREADY JPEG bytes saved under a
 *   .png filename — that's a proven-working pattern in this deployment
 *   (browsers sniff actual image bytes for <img> loads regardless of the
 *   declared extension/Content-Type), so this script follows the same
 *   convention rather than introducing a new one.
 *
 *   footer-render.png and Build91Logo_circle.png get the same treatment
 *   (resize + recompress) since both were flagged too.
 *
 * What it does:
 *   • Backs up each original to a sibling raw/ folder (one time, so
 *     re-runs / threshold tuning stay idempotent)
 *   • Resizes to a sane max width (2x the largest real display size) if
 *     larger — withoutEnlargement, so smaller sources are untouched
 *   • Re-encodes as mozjpeg (quality tuned per use) for anything without
 *     an alpha channel; Build91Logo_circle.png keeps PNG since it has
 *     transparency
 *   • Overwrites the file IN PLACE, same filename/extension — so nothing
 *     elsewhere (lib/blogData.ts, the S3-seeded blogs.json, JSON-LD) needs
 *     to change
 *
 * Run:  node scripts/optimize-blog-images.mjs
 * ─────────────────────────────────────────────────────────────────────
 */

import sharp from 'sharp';
import { readdir, mkdir, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');
const BLOGS_DIR = join(IMAGES_DIR, 'blogs');

// Largest real display width across the Blogs grid/reader is ~930px
// (modal cover image); 2x covers retina without hauling along dead weight.
const BLOG_MAX_WIDTH = 1400;
const BLOG_JPEG_QUALITY = 80;

// Decorative 7%-opacity footer backdrop — visual fidelity barely matters.
const FOOTER_MAX_WIDTH = 1200;
const FOOTER_JPEG_QUALITY = 60;

// Used as a small avatar (48-84px) and as the SITE.logo OG/favicon source —
// 512px covers both with headroom. Has transparency, so stays PNG.
const LOGO_MAX_WIDTH = 512;

// Tiny pre-existing icons — not worth touching.
const SKIP_FILES = new Set(['page_11_img_6.png', 'page_24_img_15.png', 'page_31_img_17.png']);

async function backupOnce(dir, file) {
  const rawDir = join(dir, 'raw');
  if (!existsSync(rawDir)) await mkdir(rawDir, { recursive: true });
  const dst = join(rawDir, file);
  if (!existsSync(dst)) {
    await copyFile(join(dir, file), dst);
    return true;
  }
  return false;
}

async function optimizeJpegLike(dir, file, maxWidth, quality) {
  const rawPath = join(dir, 'raw', file);
  const sourcePath = existsSync(rawPath) ? rawPath : join(dir, file);
  const outPath = join(dir, file);

  const before = (await stat(join(dir, file))).size;

  await sharp(sourcePath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .flatten({ background: '#0A0E2A' }) // in case any source has stray alpha
    .jpeg({ quality, mozjpeg: true })
    .toFile(outPath + '.tmp');

  const { renameSync } = await import('node:fs');
  renameSync(outPath + '.tmp', outPath);

  const after = (await stat(outPath)).size;
  return { before, after };
}

async function optimizePng(dir, file, maxWidth) {
  const rawPath = join(dir, 'raw', file);
  const sourcePath = existsSync(rawPath) ? rawPath : join(dir, file);
  const outPath = join(dir, file);

  const before = (await stat(join(dir, file))).size;

  await sharp(sourcePath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(outPath + '.tmp');

  const { renameSync } = await import('node:fs');
  renameSync(outPath + '.tmp', outPath);

  const after = (await stat(outPath)).size;
  return { before, after };
}

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;

  console.log('Optimizing blog article images...\n');
  const entries = await readdir(BLOGS_DIR);
  for (const file of entries) {
    if (!file.toLowerCase().endsWith('.png') || SKIP_FILES.has(file)) continue;
    const full = join(BLOGS_DIR, file);
    if (!(await stat(full)).isFile()) continue;

    const backedUp = await backupOnce(BLOGS_DIR, file);
    const { before, after } = await optimizeJpegLike(BLOGS_DIR, file, BLOG_MAX_WIDTH, BLOG_JPEG_QUALITY);
    totalBefore += before;
    totalAfter += after;
    console.log(
      `  ${backedUp ? 'backup+' : ''}optimized  ${file.padEnd(22)} ${fmtKB(before).padStart(7)} → ${fmtKB(after).padStart(7)}  (-${(100 - (after / before) * 100).toFixed(0)}%)`
    );
  }

  console.log('\nOptimizing footer background...\n');
  {
    const file = 'footer-render.png';
    const backedUp = await backupOnce(IMAGES_DIR, file);
    const { before, after } = await optimizeJpegLike(IMAGES_DIR, file, FOOTER_MAX_WIDTH, FOOTER_JPEG_QUALITY);
    totalBefore += before;
    totalAfter += after;
    console.log(
      `  ${backedUp ? 'backup+' : ''}optimized  ${file.padEnd(22)} ${fmtKB(before).padStart(7)} → ${fmtKB(after).padStart(7)}  (-${(100 - (after / before) * 100).toFixed(0)}%)`
    );
  }

  console.log('\nOptimizing Build91 avatar logo...\n');
  {
    const file = 'Build91Logo_circle.png';
    const backedUp = await backupOnce(IMAGES_DIR, file);
    const { before, after } = await optimizePng(IMAGES_DIR, file, LOGO_MAX_WIDTH);
    totalBefore += before;
    totalAfter += after;
    console.log(
      `  ${backedUp ? 'backup+' : ''}optimized  ${file.padEnd(22)} ${fmtKB(before).padStart(7)} → ${fmtKB(after).padStart(7)}  (-${(100 - (after / before) * 100).toFixed(0)}%)`
    );
  }

  console.log(
    `\nTotal: ${fmtKB(totalBefore)} → ${fmtKB(totalAfter)}  (saved ${fmtKB(totalBefore - totalAfter)}, -${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}%)`
  );
  console.log('\nDone. Restart the dev server to see updated images.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
