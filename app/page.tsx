import { Suspense } from 'react';
import { VideoHero } from '@/components/VideoHero';
import { AssetReel } from '@/components/AssetReel';
import { StatsBar } from '@/components/StatsBar';
import { StatsBarSkeleton, SelectedWorkSkeleton } from '@/components/Skeletons';
import { TrustStrip } from '@/components/TrustStrip';
import { ClientLogoWall } from '@/components/ClientLogoWall';
import { ScrollPinReveal, type ScrollPinSlide } from '@/components/ScrollPinReveal';
import { SolutionsRouter } from '@/components/SolutionsRouter';
import { SelectedWork } from '@/components/SelectedWork';
import { FaqSection } from '@/components/FaqSection';

import { GlobalPresence } from '@/components/GlobalPresence';
import { Testimonials } from '@/components/Testimonials';
import { OutcomeWidgets } from '@/components/OutcomeWidgets';
import { QuoteToolPromo } from '@/components/QuoteToolPromo';
import { CtaSplit } from '@/components/CtaSplit';

/**
 * Homepage — visual-first redesign with scroll-pinned cinematic sections.
 *
 * Order (v2.1 — Phases 1, 2, 5, 6 of V2_CONTENT_ROADMAP shipped):
 *   1.  VideoHero                — cinematic showreel, minimal text, one CTA
 *   2.  AssetReel           ★    — atlabs-style asset menu carousel (Phase 5)
 *   3.  StatsBar           ★+    — animated credentials strip, now with
 *                                   live Google rating cell (Phase 6 merged in)
 *   4.  TrustStrip          ★    — RERA / DGCA / in-house / NDA pills (Phase 1)
 *   5.  ClientLogoWall      ★    — developer & partner logos (Phase 1)
 *   6.  ScrollPinReveal · Services
 *   7.  SolutionsRouter     ★    — by-type & by-stage chip router (Phase 1)
 *   8.  SelectedWork       ★+   — 8 latest Instagram reels via Graph API,
 *                                   4h ISR cache, click-to-lightbox.
 *                                   (Replaced BentoPortfolio — same heading,
 *                                   live IG feed instead of local MP4s.)
 *      [ ScrollPinReveal · Process — TEMPORARILY REMOVED, see comment below ]
 *   9.  GlobalPresence           — cosmic globe, studios + client reach
 *   10. Testimonials             — large quote, fade-rotate
 *   11. OutcomeWidgets      ★    — atlabs-style animated bento (Phase 5)
 *   12. QuoteToolPromo      ★    — slim conversion band (Phase 2)
 *   13. CtaSplit                 — dark split contact section
 *
 * Future inserts (planned in roadmap, not yet built):
 *   • FeaturedCaseStudies after SelectedWork (Phase 3)
 *   • StudioBehindTheWork after GlobalPresence (Phase 3)
 *   • JournalStrip after Testimonials (Phase 4)
 *   • ScrollPinReveal · Process — restore when motion budget allows
 *
 * WhatsApp float is mounted globally in app/layout.tsx.
 *
 * NOTE: ServicesShowcase.tsx (bento), ProcessTimeline.tsx, and BentoPortfolio.tsx
 * are intentionally left on disk in case you want to swap back. They're no
 * longer imported. BentoPortfolio specifically remains as a rollback target if
 * the Instagram integration ever needs to be temporarily disabled.
 */

// ─── Asset checklist ──────────────────────────────────────────────────
// Per the media-tier analysis, every full-bleed scroll-pin slide takes a
// LANDSCAPE master (mediaSrc) and an optional PORTRAIT re-cut for mobile
// (mediaSrcMobile). If mediaSrcMobile is omitted, the desktop file is
// used everywhere — acceptable when the shot is center-framed and crops
// cleanly to 9:16. Until bespoke encodes exist, all paths point at the
// existing intro reel so the page still renders.
// ──────────────────────────────────────────────────────────────────────

const SERVICE_SLIDES: ScrollPinSlide[] = [
  {
    id: 'aerial',
    eyebrow: 'Project Showcase',
    title: (
      <>
        Drone &amp; <span className="text-accent-italic text-gradient">Aerial 360</span><span className="text-accent-italic text-white">°</span>
      </>
    ),
    body:
      'Cinematic skies and interactive aerial maps of every site — connectivity, landmarks and value told from above.',
    mediaSrc: '/video/scroll-reveal/group1_desktop.mp4',
    mediaSrcMobile: '/video/scroll-reveal/group1_mobile.mp4',
    posterTint: 'violet',
  },
  {
    id: 'viz',
    eyebrow: '3D Visualization',
    title: (
      <>
        Photoreal <span className="text-accent-italic text-gradient-gold">Renders</span>
      </>
    ),
    body:
      'Interiors, exteriors and amenities that look like photographs of buildings that already exist.',
    mediaSrc: '/video/scroll-reveal/group2_desktop.mp4',
    mediaSrcMobile: '/video/scroll-reveal/group2_mobile.mp4',
    posterTint: 'gold',
  },
  {
    id: 'walkthroughs',
    eyebrow: 'Virtual Experiences',
    title: (
      <>
        Cinematic <span className="text-accent-italic text-gradient">Walkthroughs</span>
      </>
    ),
    body:
      'Move buyers through the project from any device, anywhere — the emotional pull a render can’t deliver.',
    mediaSrc: '/video/scroll-reveal/group3_desktop.mp4',
    mediaSrcMobile: '/video/scroll-reveal/group3_mobile.mp4',
    posterTint: 'deep',
  },
  {
    id: 'marketing',
    eyebrow: 'Marketing Stack',
    title: (
      <>
        Films, Reels &amp; <span className="text-accent-italic text-gradient-gold">Sites</span>
      </>
    ),
    body:
      'The full performance suite — websites, social kits, vertical reels and digital brochures tuned for conversion.',
    mediaSrc: '/video/scroll-reveal/group4_desktop.mp4',
    mediaSrcMobile: '/video/scroll-reveal/group4_mobile.mp4',
    posterTint: 'cool',
  },
  {
    id: 'launchpad',
    eyebrow: 'Digital Launchpad',
    title: (
      <>
        Project <span className="text-accent-italic text-gradient-gold">Microsites</span>
      </>
    ),
    body:
      'One immersive URL. Every asset. Your sales team’s superpower — no app, no friction, full immersion.',
    mediaSrc: '/video/scroll-reveal/group5_desktop.mp4',
    mediaSrcMobile: '/video/scroll-reveal/group5_mobile.mp4',
    posterTint: 'gold',
  },
];

/* ───────────────────────────────────────────────────────────────────────
   TEMPORARILY REMOVED — "Our Process" ScrollPinReveal section
   ───────────────────────────────────────────────────────────────────────
   With AssetReel (Phase 5) now sitting under the hero and OutcomeWidgets
   below Testimonials, the home page already carries two cinematic, motion-
   heavy showcase moments. Adding a third ScrollPinReveal here made the
   middle of the page feel like one long pinned-scroll sequence — visual
   overkill at this stage.

   To restore later:
     1. Uncomment the PROCESS_SLIDES constant block below.
     2. Uncomment the <ScrollPinReveal id="process" ...> JSX block further
        down in <HomePage />.
   No other change needed. Asset paths in the slides already follow the
   /video/proc-*.mp4 naming convention; swap-in is content-only.
   ─────────────────────────────────────────────────────────────────────── */

/*
const PROCESS_SLIDES: ScrollPinSlide[] = [
  {
    id: 'brief',
    eyebrow: 'Brief & Blueprint',
    title: (
      <>
        Listen <span className="text-accent-italic text-gradient">first.</span>
      </>
    ),
    body:
      'Discovery sessions, brand alignment and a study of the architectural intent. We draft only after we understand.',
    mediaSrc: '/video/intro-reel-web.mp4', // REPLACE: /video/proc-brief.mp4 (1920×1080, sketches/mood)
    mediaSrcMobile: '/video/intro-reel-web.mp4', // REPLACE: /video/proc-brief-mobile.mp4 (1080×1920)
    posterTint: 'cool',
  },
  {
    id: 'concept',
    eyebrow: 'Concept & Storyboard',
    title: (
      <>
        Map every <span className="text-accent-italic text-gradient">frame.</span>
      </>
    ),
    body:
      'Mood, narrative and visual direction — every shot is storyboarded before a single pixel is rendered.',
    mediaSrc: '/video/intro-reel-web.mp4', // REPLACE: /video/proc-storyboard.mp4 (1920×1080)
    mediaSrcMobile: '/video/intro-reel-web.mp4', // REPLACE: /video/proc-storyboard-mobile.mp4 (1080×1920)
    posterTint: 'violet',
  },
  {
    id: 'production',
    eyebrow: 'Production & Rendering',
    title: (
      <>
        Built <span className="text-accent-italic text-gradient-gold">in-house.</span>
      </>
    ),
    body:
      'Digital tech, cinematic 3D, drone capture, motion design — produced under one creative roof, on one calendar.',
    mediaSrc: '/video/intro-reel-web.mp4', // REPLACE: /video/proc-production.mp4 (1920×1080)
    mediaSrcMobile: '/video/intro-reel-web.mp4', // REPLACE: /video/proc-production-mobile.mp4 (1080×1920)
    posterTint: 'deep',
  },
  {
    id: 'launch',
    eyebrow: 'Delivery & Launch',
    title: (
      <>
        Ship the <span className="text-accent-italic text-gradient-gold">moment.</span>
      </>
    ),
    body:
      'Final assets, microsite go-live, post-launch optimisation — built for the day your sales team turns it on.',
    mediaSrc: '/video/intro-reel-web.mp4', // REPLACE: /video/proc-launch.mp4 (1920×1080)
    mediaSrcMobile: '/video/intro-reel-web.mp4', // REPLACE: /video/proc-launch-mobile.mp4 (1080×1920)
    posterTint: 'gold',
  },
];
*/

export default function HomePage() {
  return (
    <>
      <VideoHero />

      {/* Phase 5 — atlabs-inspired capability menu, sits right under hero */}
      <AssetReel />

      <Suspense fallback={<StatsBarSkeleton />}>
        <StatsBar />
      </Suspense>

      {/* Phase 1 — Trust & Routing */}
      <TrustStrip />
      <ClientLogoWall />

      {/* What We Make — pinned scroll-reveal of services */}
      <ScrollPinReveal
        id="services"
        sectionEyebrow="Our Services"
        sectionHeading={
          <>
            Don&rsquo;t read about it.{' '}
            <span className="text-accent-italic text-gradient-gold">
              Watch it move.
            </span>
          </>
        }
        sectionDeck="Five visual disciplines under one roof — keep scrolling."
        slides={SERVICE_SLIDES}
      />

      {/* Find your fit — by-type / by-stage router → Quote tool (Phase 2) */}
      <SolutionsRouter framing="home" />

      {/* Selected Work — 8 latest IG reels via Graph API (4h ISR + KV-stored
          rotating token). Falls back silently to 6 hardcoded reels on any
          API failure. See lib/instagram.ts + lib/instagram-fallback.ts. */}
      <Suspense fallback={<SelectedWorkSkeleton />}>
        <SelectedWork />
      </Suspense>

      {/* ── Our Process — TEMPORARILY REMOVED ───────────────────────────
          Commented out alongside PROCESS_SLIDES above. AssetReel (top)
          and OutcomeWidgets (below Testimonials) already carry the page's
          motion-heavy moments; a third pinned scroll-reveal here made the
          middle of the home page feel like one long cinematic sequence.

          To restore: uncomment PROCESS_SLIDES near the top of this file
          AND the <ScrollPinReveal id="process" ...> block below.

          <ScrollPinReveal
            id="process"
            sectionEyebrow="Our Process"
            sectionHeading={
              <>
                From brief to{' '}
                <span className="text-accent-italic text-gradient-gold">
                  launch day.
                </span>
              </>
            }
            sectionDeck="A four-stage system designed for clarity, speed and creative control."
            slides={PROCESS_SLIDES}
          />
          ─────────────────────────────────────────────────────────────── */}

      {/* Global Presence — cosmic mood */}
      <section className="section-base section-cosmic overflow-hidden py-16 md:py-36">
        <div className="absolute inset-0 -z-10 starfield opacity-70" />
        <div className="pointer-events-none absolute left-1/4 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-glow/15 blur-[140px]" />
        <div className="container-page">
          <GlobalPresence />
        </div>
      </section>

      <Testimonials />

      {/* Phase 5 — atlabs-inspired animated bento — outcomes proof */}
      <OutcomeWidgets />

      {/* Phase 2 — Quote Engine entry-point band */}
      <QuoteToolPromo />

      <FaqSection />

      <CtaSplit />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeFaqJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
    </>
  );
}

const homeFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What happens if our architectural plans or material specs change midway through the 3D rendering process?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "We know that real estate development is dynamic and plans often evolve. If structural or material changes occur after we've started drafting the 3D models, we will pause and assess the impact. Minor material tweaks (like changing a wall color or floor texture) are typically covered in our standard revision cycles. However, significant structural changes (like moving load-bearing walls or altering the building facade) may require a 'change order.' We will always communicate any adjusted timelines or nominal fees upfront so there are no surprise costs before we proceed.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do we receive the raw source files upon project completion, or just the final renders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'By default, our deliverables are the final, high-resolution rendered assets (JPEGs, MP4 videos, and web packages for interactive tours) ready for your marketing campaigns. The raw source files (such as 3ds Max, SketchUp, or Unreal Engine files) and proprietary 3D assets remain the intellectual property of Build91 Studio. However, if your internal team requires the source files for future modifications, we can definitely negotiate an IP handover or extended licensing agreement at the start of the project.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can the interactive tools in your Digital Launchpad integrate with our CRM to track buyer behavior?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. While our standard Digital Launchpad is delivered as a high-performing standalone web experience, we can collaborate with your IT or marketing teams to embed tracking analytics and webhooks. This means you can track valuable buyer metrics—like how long they spent on a specific floor plan, which amenities they clicked on, and direct lead captures—straight into your existing CRM (like Salesforce, Zoho, or HubSpot).',
      },
    },
    {
      '@type': 'Question',
      name: 'Does our sales team need specialized hardware to showcase the 3D walkthroughs to clients?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not at all. We optimize our entire Digital Sales Suite to be universally accessible. Your interactive assets, 360° tours, and plotted developments are designed to run smoothly on standard iPads, touchscreen kiosks in your sales gallery, smart TVs, and everyday web browsers on mobile phones. If you specifically want an immersive Virtual Reality (VR) setup for your sales office, we can optimize the files for headsets like the Meta Quest, but standard devices are more than enough to close deals.',
      },
    },
    {
      '@type': 'Question',
      name: 'Our upcoming flagship project is strictly confidential. How do you ensure data security and prevent premature leaks?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Confidentiality is a cornerstone of our workflow, especially since we work on high-stakes project launches. We routinely execute strict Non-Disclosure Agreements (NDAs) before receiving any initial CAD files or design briefs. Internally, your project data is stored on secure, access-controlled servers, and our team members are bound by legal confidentiality clauses. Furthermore, we never publish your unreleased projects on our portfolio or social media without your explicit, written consent post-launch.',
      },
    },
    {
      '@type': 'Question',
      name: 'We are launching a massive township in just a few weeks. Can your team scale up for high-volume asset creation on a tight deadline?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Speed is one of our core values because we understand that launch windows are unforgiving. Because we house a multidisciplinary team of 3D artists, designers, and software developers under one roof, we can parallel-process different parts of your project. While we prefer standard lead times to ensure maximum photorealism, we can allocate dedicated 'squads' to your project to accommodate aggressive go-to-market timelines for large-scale townships or multi-tower developments.",
      },
    },
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Build91 Studio',
  url: 'https://studio.build91.in',
  description: 'The Complete Digital Sales Suite for Real Estate Developers.',
};
