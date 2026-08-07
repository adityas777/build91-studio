# Build91 Studio — Performance Analysis & Optimization Plan

This document analyzes the current loading performance of the Build91 Studio website, focusing on the homepage and critical user paths, identifies specific performance bottlenecks, and provides an actionable optimization plan to address them.

---

## Executive Summary

The Build91 Studio homepage is a premium, media-rich landing page featuring cinematic background videos, scroll-driven interactive sections, dynamic client marquees, and live API integrations. However, the page currently suffers from **severe asset weight bloat**, which degrades load times, increases Largest Contentful Paint (LCP) latency, and consumes high cellular bandwidth.

### Core Findings
1. **Critical Video Bloat:** The homepage loads or references over **250 MB** of video files. Individual background assets (such as the Hero reels) exceed **40 MB**, which is 10x-20x the industry standard for web delivery.
2. **Unoptimized Logo Images:** The client logo marquee uses uncompressed PNGs totaling **~2.5 MB** for small logo cards that render at under 300px wide.
3. **Picsum Photos Dependency:** The placeholder logic depends on `picsum.photos` seed URLs, causing visual latency (due to redirects and runtime generation), preventing browser preloading, and affecting LCP.
4. **No Modern Formats:** Videos are served exclusively in MP4 (H.264), ignoring WebM (VP9/AV1), which provides 30-50% better compression.
5. **Blocking Server-Side Fetches:** The server-side rendering of sections like `SelectedWork` (Instagram Reels API) and `StatsBar` (Google Places API) performs fetches that can block the initial response and increase Time to First Byte (TTFB).

---

## 1. Quantitative Asset Weight Audit

Below is a detailed inventory of the media assets driving the home page and their impact.

### Video Assets (Current vs. Target)

| Asset Location & Use | Filename | Current Size | Recommended Target | Performance Impact |
| :--- | :--- | :--- | :--- | :--- |
| **VideoHero** (Desktop) | `hero-reel-desktop.mp4` | **40.5 MB** | **2.5 - 4 MB** | High visual delay on load. High LCP. |
| **VideoHero** (Mobile) | `herobanner_fast.mp4` | **41.6 MB** | **1.5 - 2.5 MB** | Extreme cellular data drag. Slow start. |
| **AssetReel** (Drone 360) | `Drone 360 with landmarks highlight01.mp4` | **13.1 MB** | **500 KB** (4s loop) | Stutter during horizontal swiping. |
| **AssetReel** (Interior) | `3d-interior.mp4` | **2.4 MB** | **500 KB** (4s loop) | Buffering lag. |
| **AssetReel** (Walkthrough) | `3d-walkthrough.mp4` | **4.4 MB** | **500 KB** (4s loop) | Buffering lag. |
| **AssetReel** (Cinematic) | `cinematic-film.mp4` | **14.6 MB** | **500 KB** (4s loop) | Stutter during horizontal swiping. |
| **AssetReel** (Superimpos) | `plot-superimposition.mp4` | **3.7 MB** | **500 KB** (4s loop) | Buffering lag. |
| **AssetReel** (Vert Reel) | `vertical-reel.mp4` | **8.2 MB** | **800 KB** (15s cut) | Stutter during horizontal swiping. |
| **ScrollPinReveal** (Slide 1 D) | `group1_desktop.mp4` | **11.6 MB** | **1.5 - 2 MB** | Lag when scrolling into the pin section. |
| **ScrollPinReveal** (Slide 1 M) | `group1_mobile.mp4` | **11.0 MB** | **800 KB - 1.2 MB** | Mobile rendering lag under sticky pin. |
| **ScrollPinReveal** (Slide 2 D) | `group2_desktop.mp4` | **12.2 MB** | **1.5 - 2 MB** | Delay during scroll transition. |
| **ScrollPinReveal** (Slide 2 M) | `group2_mobile.mp4` | **11.8 MB** | **800 KB - 1.2 MB** | Mobile delay during scroll transition. |
| **ScrollPinReveal** (Slide 4 D) | `group4_desktop.mp4` | **33.5 MB** | **1.5 - 2 MB** | Severe lag when mounting slide 4. |
| **ScrollPinReveal** (Slide 4 M) | `group4_mobile.mp4` | **33.0 MB** | **800 KB - 1.2 MB** | Severe lag on mobile scroll transition. |
| **ScrollPinReveal** (Slide 5 D) | `group5_desktop.mp4` | **15.6 MB** | **1.5 - 2 MB** | Delay during final scroll transition. |
| **ScrollPinReveal** (Slide 5 M) | `group5_mobile.mp4` | **14.4 MB** | **800 KB - 1.2 MB** | Mobile delay during final transition. |

### Image Assets (Current vs. Target)

| Image Asset | Format | Current Size | Recommended Target | Performance Impact |
| :--- | :--- | :--- | :--- | :--- |
| `laxmi-developer.png` | PNG | **713 KB** | **15 KB** (WebP/SVG) | Large network payload for a logo. |
| `partner-01.png` | PNG | **837 KB** | **15 KB** (WebP/SVG) | Large network payload for a logo. |
| `partner-08.png` | PNG | **386 KB** | **12 KB** (WebP/SVG) | Slow marquee rendering. |
| `partner-09.png` | PNG | **187 KB** | **10 KB** (WebP/SVG) | Slow marquee rendering. |
| `partner-04.png` | PNG | **174 KB** | **10 KB** (WebP/SVG) | Slow marquee rendering. |
| `western-arch.png` | PNG | **199 KB** | **12 KB** (WebP/SVG) | Slow marquee rendering. |
| **Picsum Posters** | Dynamic Redirect | **N/A** (Slow HTTP) | **30-50 KB** (Local WebP) | High LCP visual delay; CLS shift risk. |

---

## 2. Detailed Performance Bottlenecks

### A. Video Asset Compression Failure
The comments inside [VideoHero.tsx](file:///c:/Users/pglap/OneDrive/Desktop/Build%2091%20STUDIO%20FINAL/build91-studio-2/components/VideoHero.tsx#L27-L40), [lib/assetReel.ts](file:///c:/Users/pglap/OneDrive/Desktop/Build%2091%20STUDIO%20FINAL/build91-studio-2/lib/assetReel.ts#L18-L21), and [lib/instagram-fallback.ts](file:///c:/Users/pglap/OneDrive/Desktop/Build%2091%20STUDIO%20FINAL/build91-studio-2/lib/instagram-fallback.ts#L25-L30) contain specific rules and guidelines for compression (such as using FFmpeg with slow presets, CRF 22-24, and resolutions capped at 720p or 1080p).
However, **the actual files placed in the repository bypass these guidelines**:
- The active hero video `herobanner_fast.mp4` (41.6 MB) is over 15x the recommended target of ~1.5 - 2.5 MB.
- High-bitrate video loops choke the browser network buffer, delaying the loading of styles, fonts, and scripts.

### B. Single Video Format (Lack of WebM)
Currently, all components declare video sources using only MP4:
```html
<video>
  <source src={videoSrc} type="video/mp4" />
</video>
```
WebM (VP9/AV1) is supported by over 97% of modern browsers (Chrome, Edge, Firefox, Safari 14+). Serving WebM first with an MP4 fallback allows the browser to fetch a file that is up to **50% smaller** for the same visual quality.

### C. Client Logo Wall Weight & Format
The marquee in `ClientLogoWall` uses a white card layout to normalize various developer logos. However, several logos are stored as high-resolution PNGs with large files (e.g. `laxmi-developer.png` at 713 KB).
- Even with Next.js image optimization active in production, using uncompressed raw source files increases local development time, cold-start image generation overhead, and cache footprint.
- Transforming these logos to WebP or SVG format will reduce the total weight of the logo strip from **2.5 MB** to **under 150 KB**.

### D. Visual Latency from picsum.photos
The `AssetReel` and `FALLBACK_REELS` components use picsum.photos URLs (e.g., `https://picsum.photos/seed/.../720/900`) for video posters.
- Picsum does not resolve instantly; it triggers HTTP 302 redirects to unsplash CDNs.
- Because these URLs are generated at runtime, the browser cannot run pre-connect or pre-load optimizations on the final image URLs.
- If picsum.photos has slow response times, the video elements will show a blank box or background color, resulting in high Largest Contentful Paint (LCP) times.

### E. Blocking Server-Side Fetches in ISR
Both the `SelectedWork` (Instagram) and `StatsBar` (Google Places Rating) are async Server Components that await external API responses.
- Even though ISR caching (4h for IG, 24h for Google) saves subsequent users from waiting, the user who triggers the regeneration (or a user hitting a cold instance) will experience a delay.
- The default fetch timeout is set to 4000ms. In the worst-case scenario, the server blocks for up to **4 seconds** trying to fetch these API responses before returning a single byte of HTML, severely degrading TTFB (Time to First Byte).

---

## 3. Actionable Optimization Initiatives

We can implement these optimizations in phases to dramatically improve page load speed and user experience.

### Initiative 1: Video Re-Encoding and Compression (Critical)
We must run an optimization pipeline using FFmpeg on all video assets in `/public/video/`.

#### Guidelines:
1. **Resolution Limits:** Limit background and carousel video widths to `1280px` (720p is often enough for mobile/small cards).
2. **Aggressive CRF Tuning:** Use Constant Rate Factor (CRF) between `24` and `28` to maintain visual clarity while shedding data weight.
3. **Muted Preset:** Strip audio channels (`-an`) on all background looping videos that don't need audio.

#### Execution Commands (Examples):
```bash
# Compress Hero Desktop (target ~3 MB)
ffmpeg -i raw_hero.mov -an -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 26 -preset slow -movflags +faststart -pix_fmt yuv420p hero-reel.mp4

# Compress Hero Mobile (target ~1.5 MB)
ffmpeg -i raw_hero_mobile.mov -an -vf "scale=1080:-2,fps=30" -c:v libx264 -crf 26 -preset slow -movflags +faststart -pix_fmt yuv420p hero-reel-mobile.mp4

# Generate Modern WebM Format (to be loaded as primary source)
ffmpeg -i raw_hero.mov -an -vf "scale=1920:-2,fps=30" -c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good hero-reel.webm
```

---

### Initiative 2: Support WebM Formats in React Components
Modify `<video>` components to support multiple sources. The browser will automatically choose the first format it supports (WebM), falling back to MP4.

#### Code Modification (Example for `VideoHero.tsx`):
```tsx
<video
  key={videoSrc}
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  poster={posterSrc}
  className="h-full w-full object-cover"
>
  {/* Check if WebM version exists and load it first */}
  <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
  <source src={videoSrc} type="video/mp4" />
</video>
```
*Note: This change should be propagated to `ScrollPinReveal.tsx`, `AssetReel.tsx`, `InstagramReelCard.tsx`, and `SelfHostedReelCard.tsx`.*

---

### Initiative 3: Static Local WebP Poster Images
Replace all `picsum.photos` calls with high-performance, compressed, local WebP images stored in `/public/images/posters/`.

1. **Download/Capture Poster Frames:** Extract the first frame of each video loop.
2. **Encode to WebP:** Compress the frames to WebP format using Sharp or squoosh (target size < 50 KB).
3. **Update Data Files:** Update paths in `lib/assetReel.ts` and `lib/instagram-fallback.ts`:
```typescript
// Before:
poster: poster('aerial-360') // Seeded picsum url

// After:
poster: '/images/posters/aerial-360.webp' // High speed local asset
```

---

### Initiative 4: Compress Client Logos
Optimize the client logos located in `public/images/clients/`.
1. Run the existing logo cleanup script to strip white backgrounds:
   ```bash
   node scripts/clean-client-logos.mjs
   ```
2. Convert all raw PNG files in `/public/images/clients/` to optimized `.webp` files using `sharp` (which is already in `devDependencies`).
3. Update `lib/clients.ts` to reference the WebP formats. This will drop the total logo payload from 2.5 MB to **under 100 KB** combined.

---

### Initiative 5: Non-Blocking Server Streaming (`<Suspense>`)
To prevent external API calls (Instagram Graph API, Google Places API) from blocking the server-side HTML render, wrap these components in Next.js `<Suspense>` boundaries with fallback skeletons.

#### Code Modification (`app/page.tsx`):
```tsx
import { Suspense } from 'react';
import { StatsBarSkeleton, SelectedWorkSkeleton } from '@/components/Skeletons';

// In the page structure:
<Suspense fallback={<StatsBarSkeleton />}>
  <StatsBar />
</Suspense>

// and:
<Suspense fallback={<SelectedWorkSkeleton />}>
  <SelectedWork />
</Suspense>
```
This guarantees that the main shell of the page (including the VideoHero and AssetReel) is sent to the client instantly, yielding a near-zero TTFB. The dynamic rating and Instagram grids will stream in as soon as their fetches resolve.

---

## Next Steps

1. **Verify Asset Optimization Tools:** Ensure `sharp` and `ffmpeg` are available for compressing assets.
2. **Review with Senior/Stakeholders:** Present this audit to the senior team.
3. **Execute in Phases:**
   - **Phase A (Low Risk, High Impact):** Static Local Posters (Initiative 3) + Logo Compression (Initiative 4).
   - **Phase B (High Impact):** Video Re-encoding (Initiative 1) + WebM support (Initiative 2).
   - **Phase C (Infrastructure):** Suspense boundaries for server fetches (Initiative 5).
