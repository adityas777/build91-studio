import { spawn } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(PROJECT_ROOT, 'public');

// Dynamically resolve ffmpeg-static path
let ffmpegPath = 'ffmpeg'; // Default fallback to global
try {
  const ffmpegStatic = await import('ffmpeg-static');
  if (ffmpegStatic.default) {
    ffmpegPath = ffmpegStatic.default;
  }
} catch (e) {
  console.log('Could not load ffmpeg-static devDependency, will attempt to use global ffmpeg.');
}

const VIDEOS_TO_COMPRESS = [
  // ─── HERO REELS (Critical) ──────────────────────────────────────────
  {
    relDir: 'video',
    name: 'hero-reel-desktop.mp4',
    isMobile: false,
    isMutedLoop: true,
  },
  {
    relDir: 'video',
    name: 'herobanner_fast.mp4', // Mobile Hero
    isMobile: true,
    isMutedLoop: true,
  },
  // ─── SCROLL REVEAL (Slides) ─────────────────────────────────────────
  {
    relDir: 'video/scroll-reveal',
    name: 'group1_desktop.mp4',
    isMobile: false,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group1_mobile.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group2_desktop.mp4',
    isMobile: false,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group2_mobile.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group3_desktop.mp4',
    isMobile: false,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group3_mobile.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group4_desktop.mp4',
    isMobile: false,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group4_mobile.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group5_desktop.mp4',
    isMobile: false,
    isMutedLoop: true,
  },
  {
    relDir: 'video/scroll-reveal',
    name: 'group5_mobile.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  // ─── ASSET REEL LOOPS & PROJECT PREVIEWS ────────────────────────────
  {
    relDir: 'video/projects',
    name: 'Drone 360 with landmarks highlight01.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/projects',
    name: '3d-walkthrough.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/projects',
    name: '3d-interior.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/projects',
    name: '3d-exterior.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/projects',
    name: 'cinematic-film.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/projects',
    name: 'plot-superimposition.mp4',
    isMobile: true,
    isMutedLoop: true,
  },
  {
    relDir: 'video/projects',
    name: 'vertical-reel.mp4',
    isMobile: true,
    isMutedLoop: false, // Keep audio for reels
  }
];

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args);
    let stderr = '';

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}\nStderr: ${stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function compressFile(target) {
  const dirPath = join(PUBLIC_DIR, target.relDir);
  const originalPath = join(dirPath, target.name);
  const backupPath = join(dirPath, target.name + '.bak');

  if (!existsSync(originalPath) && !existsSync(backupPath)) {
    console.log(`  ⚠ Skipping: file not found at ${originalPath}`);
    return;
  }

  // Backup original file once
  if (!existsSync(backupPath)) {
    console.log(`  [Backup] Renaming original to ${target.name}.bak`);
    renameSync(originalPath, backupPath);
  }

  const inputPath = backupPath;
  const outputMp4Path = originalPath;
  const outputWebmPath = originalPath.replace(/\.mp4$/i, '.webm');

  // Skip if both optimized files already exist
  const force = process.argv.includes('--force');
  if (existsSync(outputMp4Path) && existsSync(outputWebmPath) && !force) {
    console.log(`  [Skip] Both optimized MP4 and WebM already exist for ${target.name}`);
    return;
  }

  // Determine scaling width (e.g. mobile/small loops scaled to 720p max, desktop to 720p max)
  const scaleWidth = target.isMobile ? '720' : '1280';

  console.log(`  [Processing] ${target.name} (Scale: ${scaleWidth}px, Muted: ${target.isMutedLoop})`);

  // ─── COMPRESS MP4 ───────────────────────────────────────────────────
  console.log(`    → Compressing MP4...`);
  const mp4Args = [
    '-y',
    '-i', inputPath,
    '-vf', `scale=${scaleWidth}:-2,fps=30`,
    '-c:v', 'libx264',
    '-crf', '26', // Higher CRF = smaller size (recommended web values: 24-28)
    '-preset', 'slow',
    '-movflags', '+faststart',
    '-pix_fmt', 'yuv420p',
  ];

  if (target.isMutedLoop) {
    mp4Args.push('-an'); // Strip audio
  } else {
    mp4Args.push('-c:a', 'aac', '-b:a', '96k'); // Compress audio
  }

  mp4Args.push(outputMp4Path);
  await runFfmpeg(mp4Args);

  // ─── GENERATE WEBM ──────────────────────────────────────────────────
  console.log(`    → Generating WebM...`);
  const webmArgs = [
    '-y',
    '-i', inputPath,
    '-vf', `scale=${scaleWidth}:-2,fps=30`,
    '-c:v', 'libvpx-vp9',
    '-crf', '35', // WebM VP9 CRF 32-38 yields high compression
    '-b:v', '0',
    '-deadline', 'good',
    '-cpu-used', '2',
  ];

  if (target.isMutedLoop) {
    webmArgs.push('-an'); // Strip audio
  } else {
    webmArgs.push('-c:a', 'libvorbis', '-b:a', '96k'); // Compress audio for webm
  }

  webmArgs.push(outputWebmPath);
  await runFfmpeg(webmArgs);

  // ─── LOG SIZE REPORT ────────────────────────────────────────────────
  const origSize = (await stat(backupPath)).size;
  const newMp4Size = (await stat(outputMp4Path)).size;
  const newWebmSize = (await stat(outputWebmPath)).size;

  console.log(`    ✓ Done:`);
  console.log(`      • Original: ${(origSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`      • New MP4:  ${(newMp4Size / (1024 * 1024)).toFixed(2)} MB (-${((1 - newMp4Size / origSize) * 100).toFixed(1)}%)`);
  console.log(`      • New WebM: ${(newWebmSize / (1024 * 1024)).toFixed(2)} MB (-${((1 - newWebmSize / origSize) * 100).toFixed(1)}%)`);
}

async function main() {
  const singleFile = process.argv[2];
  if (singleFile) {
    const match = VIDEOS_TO_COMPRESS.find(v => v.name.toLowerCase() === singleFile.toLowerCase());
    if (!match) {
      console.error(`Error: "${singleFile}" is not in the configuration list.`);
      process.exit(1);
    }
    console.log(`Compressing single configured file: ${match.name}`);
    await compressFile(match);
  } else {
    console.log('Starting compression of all configured video assets sequentially. This might take several minutes...\n');
    console.log('Tip: You can pass a specific filename to compress only one file. E.g: node scripts/compress-videos.mjs herobanner_fast.mp4\n');
    
    // Process only the critical Hero background banners first to demonstrate, then list the rest
    console.log('--- Phase 1: Hero Banner Banners ---');
    await compressFile(VIDEOS_TO_COMPRESS[0]);
    await compressFile(VIDEOS_TO_COMPRESS[1]);
    
    console.log('\n--- Phase 2: Carousel & Scroll reveal videos ---');
    for (let i = 2; i < VIDEOS_TO_COMPRESS.length; i++) {
      await compressFile(VIDEOS_TO_COMPRESS[i]);
    }
  }

  console.log('\nAll video assets successfully compressed!');
}

main().catch((err) => {
  console.error('Error running video compression:', err);
  process.exit(1);
});
