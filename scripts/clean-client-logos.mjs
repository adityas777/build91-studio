#!/usr/bin/env node
/**
 * clean-client-logos.mjs
 * ─────────────────────────────────────────────────────────────────────
 * One-off (and re-runnable) preprocessor for /public/images/clients/*.png
 *
 * Why this exists:
 *   Partner logos arrive as mixed-quality PNGs — some transparent-bg,
 *   some with baked-in white backgrounds. When we want to render them
 *   in original brand colors on a dark website section, the white-bg
 *   ones show up as ugly white boxes.
 *
 *   This script strips near-white pixels to transparent so every logo
 *   reads cleanly on dark backgrounds, regardless of source quality.
 *
 * What it does:
 *   • For each PNG in /public/images/clients/
 *   • Backs the original up to /public/images/clients/raw/ (one time)
 *   • Replaces near-white pixels (luminosity >= THRESHOLD) with alpha=0
 *   • Overwrites the file in place — Next.js Image picks up cleaned versions
 *
 * Tweak THRESHOLD if some logos still show a white halo (lower = more
 * aggressive removal but risks eating cream/ivory brand colors).
 *
 * Run:  node scripts/clean-client-logos.mjs
 * ─────────────────────────────────────────────────────────────────────
 */

import sharp from 'sharp';
import { readdir, mkdir, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENTS_DIR = join(__dirname, '..', 'public', 'images', 'clients');
const RAW_BACKUP_DIR = join(CLIENTS_DIR, 'raw');

/** Pixels at/above this luminosity per channel get turned transparent.
 *  240 catches off-white/anti-aliased edges; lower to 235 if a logo
 *  still has a halo, raise to 245 if cream brand colors get eaten. */
const THRESHOLD = 240;

/** Pixels within FEATHER of THRESHOLD get partial transparency, so the
 *  resulting alpha mask isn't aliased to a hard edge. */
const FEATHER = 12;

async function ensureBackupDir() {
  if (!existsSync(RAW_BACKUP_DIR)) {
    await mkdir(RAW_BACKUP_DIR, { recursive: true });
  }
}

async function backupOnce(file) {
  const src = join(CLIENTS_DIR, file);
  const dst = join(RAW_BACKUP_DIR, file);
  if (!existsSync(dst)) {
    await copyFile(src, dst);
    return true;
  }
  return false;
}

async function cleanLogo(file) {
  const inPath = join(CLIENTS_DIR, file);
  const backupPath = join(RAW_BACKUP_DIR, file);

  // Always work from the original (backup), so re-runs are idempotent and
  // tuning THRESHOLD doesn't compound on already-processed pixels.
  const sourcePath = existsSync(backupPath) ? backupPath : inPath;

  const img = sharp(sourcePath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  if (channels !== 4) {
    throw new Error(`Expected 4 channels for ${file}, got ${channels}`);
  }

  let modified = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue; // already transparent — skip

    // Per-channel near-white check (handles colored brand inks safely
    // — only pixels where ALL channels are near-white get touched).
    const lo = Math.min(r, g, b);

    if (lo >= THRESHOLD) {
      data[i + 3] = 0;
      modified++;
    } else if (lo >= THRESHOLD - FEATHER) {
      // Soft feather: linearly fade alpha 255→0 across FEATHER band so
      // edges stay anti-aliased instead of looking like cutout cardboard
      const t = (lo - (THRESHOLD - FEATHER)) / FEATHER;
      data[i + 3] = Math.round(a * (1 - t));
      modified++;
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(inPath);

  return { file, width, height, pixelsModified: modified };
}

async function main() {
  if (!existsSync(CLIENTS_DIR)) {
    console.error(`No clients directory at ${CLIENTS_DIR}`);
    process.exit(1);
  }

  await ensureBackupDir();

  const entries = await readdir(CLIENTS_DIR);
  const pngs = [];
  for (const e of entries) {
    const full = join(CLIENTS_DIR, e);
    const s = await stat(full);
    if (s.isFile() && e.toLowerCase().endsWith('.png')) pngs.push(e);
  }

  if (pngs.length === 0) {
    console.log('No PNGs to process.');
    return;
  }

  console.log(
    `Processing ${pngs.length} logos in ${CLIENTS_DIR}\n` +
      `Backups (one-time): ${RAW_BACKUP_DIR}\n` +
      `Threshold: ${THRESHOLD} · Feather: ${FEATHER}\n`,
  );

  for (const file of pngs) {
    try {
      const backedUp = await backupOnce(file);
      const result = await cleanLogo(file);
      const tag = backedUp ? 'backup+cleaned' : 're-cleaned   ';
      console.log(
        `  ✓ ${tag}  ${result.file.padEnd(22)} ` +
          `${String(result.width).padStart(4)}×${String(result.height).padEnd(4)} ` +
          `· ${result.pixelsModified.toLocaleString()} px → transparent`,
      );
    } catch (err) {
      console.error(`  ✗ failed  ${file}: ${err.message}`);
    }
  }

  console.log('\nDone. Refresh the dev server to see updated logos.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
