import {
  Building2,
  Box,
  Boxes,
  Compass,
  Megaphone,
  Rocket,
  PencilRuler,
  Sparkles,
  Camera,
  Film,
  Layers,
  LayoutGrid,
  Trees,
  Plane,
  PlaySquare,
  Monitor,
  MonitorPlay,
  Share2,
  Video,
  BookOpen,
  Link2,
  type LucideIcon,
} from 'lucide-react';

export const SITE = {
  name: 'Build91 Studio',
  tagline: 'The Complete Digital Sales Suite for Real Estate',
  description:
    'Build91 Studio transforms blueprints into immersive digital experiences — 3D visualization, virtual tours, microsites and marketing content for real estate developers across India, UAE & Australia.',
  url: 'https://studio.build91.in',
  email: 'studio@build91.in',
  phone: '+91 788 014 7772',
  phoneDisplay: '+91 788 014 7772',
  social: {
    // Confirmed real account (owner, 2026-06-10): build91studio_ — note the
    // trailing underscore. Every IG link on the site must read this constant.
    instagram: 'https://www.instagram.com/build_91/',
    facebook: 'https://facebook.com/build91studio',
    youtube: 'https://www.youtube.com/@build91_studio',
  },
  logo: '/images/Build91Logo_circle.png',
  offices: [
    {
      city: 'Raipur',
      country: 'India',
      address: 'Telibandha, Raipur, Chhattisgarh',
    },
    {
      city: 'Bengaluru',
      country: 'India',
      address: 'BTM Layout, Bengaluru, Karnataka',
    },
  ],
  reach: ['India', 'UAE', 'Australia'],
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/about', label: 'About' },
];

export type ServicePillar = {
  id: string;
  number: string;
  title: string;
  headline: string;
  blurb: string;
  icon: LucideIcon;
  accent: string;
  items: { title: string; description: string; icon: LucideIcon }[];
};

export const SERVICE_PILLARS: ServicePillar[] = [
  {
    id: 'project-showcase',
    number: '01',
    title: 'Project Showcase',
    headline: 'Sell the Vision',
    blurb:
      'Position the project before the pitch. Plot superimpositions, aerial 360°, isometric views, location intelligence and cinematic films — engineered to make buyers see the value.',
    icon: Building2,
    accent: 'from-violet-glow/40 to-violet-deep/20',
    items: [
      {
        title: 'Interactive Plotted Development Kit',
        description:
          'Aerial 360° with plot superimposition, dynamic live inventory and plot-size filtering — explore inventory like a game.',
        icon: LayoutGrid,
      },
      {
        title: 'Location Intelligence',
        description:
          'Site-based highlights, Google Maps stories and drone route films — connectivity, landmarks and catchment, told from above.',
        icon: Compass,
      },
      {
        title: 'Aerial 360°',
        description:
          'Drone-captured 360° panoramas that map connectivity, landmarks and convenience around the site.',
        icon: Plane,
      },
      {
        title: 'Isometric Views',
        description:
          'Cutaway iso renders — tower stacks, fit-out scenarios, leasing plans and engineering callouts that floor plans can’t deliver.',
        icon: Boxes,
      },
      {
        title: 'Project Showcase Video',
        description:
          'Cinematic project films with motion design, 3D superimposition and brand storytelling — fused into one statement piece.',
        icon: Film,
      },
    ],
  },
  {
    id: '3d-visualization',
    number: '02',
    title: '3D Visualization',
    headline: 'See It Before It’s Built',
    blurb:
      'Photoreal renders that translate architectural intent into images buyers can feel — interiors, exteriors and amenities, all crafted in-house.',
    icon: Box,
    accent: 'from-gold/30 to-violet-glow/20',
    items: [
      {
        title: '3D Interiors',
        description:
          'Photorealistic interiors across your unit typologies — spaces buyers can walk into mentally.',
        icon: Sparkles,
      },
      {
        title: '3D Exteriors',
        description:
          'Elevation and facade visualizations capturing the true character of materials and the surrounding context.',
        icon: PencilRuler,
      },
      {
        title: '3D Amenities',
        description:
          'Vibrant renderings of pools, clubhouses, atriums and food courts — the community life that closes the sale.',
        icon: Trees,
      },
      {
        title: 'Type-Specific 3D Sets',
        description:
          'The right render stack per project type — high-rise, plotted, villa, commercial, retail or warehousing.',
        icon: Box,
      },
    ],
  },
  {
    id: 'virtual-experiences',
    number: '03',
    title: 'Virtual Experiences',
    headline: 'Walk Through the Future',
    blurb:
      'Move buyers through your project from anywhere — cinematic walkthroughs, self-navigable 360° tours, immersive aerial views.',
    icon: Compass,
    accent: 'from-violet-glow/40 to-gold/20',
    items: [
      {
        title: '3D Walkthroughs',
        description:
          'Cinematic video journeys through the property that create the emotional pull a static render can’t.',
        icon: Camera,
      },
      {
        title: '3D Virtual Tours',
        description:
          'Interactive 360° tours buyers control themselves — explore at their own pace, on any device.',
        icon: PlaySquare,
      },
    ],
  },
  {
    id: 'marketing-stack',
    number: '04',
    title: 'Marketing Stack',
    headline: 'Fuel the Funnel',
    blurb:
      'The full performance suite — websites, social kits, vertical reels and digital brochures designed for conversion, not vanity.',
    icon: Megaphone,
    accent: 'from-violet-deep/30 to-violet-glow/20',
    items: [
      {
        title: 'Website Design',
        description:
          'High-conversion project websites built as digital sales offices — fast, beautiful, and on-message.',
        icon: Monitor,
      },
      {
        title: 'Social Media Visual Kit',
        description:
          'On-brand graphics, templates and content for Instagram, Facebook and LinkedIn — consistency at scale.',
        icon: Share2,
      },
      {
        title: 'Video Shorts & Reels',
        description:
          'Trend-driven vertical videos tuned for the algorithm and engineered for attention.',
        icon: Video,
      },
      {
        title: 'PDF Brochure / Leasing Kit / Spec Sheet',
        description:
          'Interactive digital brochures tuned per asset class — buyer brochures, retail leasing kits and warehousing spec sheets.',
        icon: BookOpen,
      },
    ],
  },
  {
    id: 'digital-launchpad',
    number: '05',
    title: 'Digital Launchpad',
    headline: 'One Link. Every Asset.',
    blurb:
      'The crown jewel — project microsites that unify interactive experiences, aerial views, 3D tours, films and brochures into a single immersive destination.',
    icon: Rocket,
    accent: 'from-gold/40 to-violet-glow/30',
    items: [
      {
        title: 'Project Microsite',
        description:
          'An all-in-one digital destination — aerial, 3D, video, content — converging into one URL, one complete experience.',
        icon: Link2,
      },
      {
        title: 'Leasing / IPC Microsite',
        description:
          'Occupier- and broker-facing portals for retail and logistics — floorplate availability, footfall data and enquiry capture.',
        icon: MonitorPlay,
      },
      {
        title: 'Unified Asset Hub',
        description:
          'A single shareable launchpad your sales team sends to every lead — no app, no friction, full immersion.',
        icon: Layers,
      },
    ],
  },
];

export const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Brief & Blueprint',
    description:
      'Discovery sessions, brand alignment and a study of the architectural intent. We listen first, draft second.',
  },
  {
    number: '02',
    title: 'Concept & Storyboard',
    description:
      'Mood, narrative and visual direction — every frame is mapped before a single pixel is rendered.',
  },
  {
    number: '03',
    title: 'Production & Rendering',
    description:
      'Digital Technology, Cinematic 3D, Drone Capture, Motion Design — produced in-house under one creative roof.',
  },
  {
    number: '04',
    title: 'Delivery & Launch',
    description:
      'Final assets, microsite go-live and post-launch optimization — built for the day your sales team turns it on.',
  },
];

export const VALUES = [
  {
    title: 'Craft',
    description:
      'Every frame, every render, every line of code is worked until it earns its place.',
  },
  {
    title: 'Innovation',
    description:
      'We bring tools, formats and ideas the real estate industry hasn’t seen yet.',
  },
  {
    title: 'Partnership',
    description:
      'We sit inside the sales conversation — not outside it. Your goals are our brief.',
  },
  {
    title: 'Speed',
    description:
      'Launch windows are unforgiving. We deliver to the calendar that closes deals.',
  },
];

// Mirrors the 6 confirmed types in lib/solutionsBundles.ts (plus a catch-all)
// so ContactForm leads categorize the same way as Quote-wizard leads.
export const PROJECT_TYPES = [
  'High-Rise Apartments',
  'Plotted Land',
  'Villa Community',
  'Commercial',
  'Retail',
  'Warehousing / Logistics',
  'Other',
];
