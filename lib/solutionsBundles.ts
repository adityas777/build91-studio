import {
  Building,
  Map as MapIcon,
  Home,
  Briefcase,
  ShoppingBag,
  Warehouse,
  Rocket,
  Flag,
  Megaphone,
  KeyRound,
  RotateCcw,
  // Asset icons
  LayoutGrid,
  Compass,
  Boxes,
  SquareStack,
  Box,
  Plane,
  FileText,
  Film,
  MonitorPlay,
  Shapes,
  type LucideIcon,
} from 'lucide-react';

/* ───────────────────────────────────────────────────────────────────────
   SolutionsBundles — feeds both the SolutionsRouter (home + services
   page) and the QuoteWizard (Phase 2, /quote).
   ─────────────────────────────────────────────────────────────────────── */

export type ProjectTypeId =
  | 'high-rise'
  | 'plotted'
  | 'villa-community'
  | 'commercial'
  | 'retail'
  | 'warehousing';

export type StageId =
  | 'pre-launch'
  | 'launch'
  | 'sustenance'
  | 'possession'
  | 'resale';

/* ── Asset options — structured items for the wizard's step-3 selector ── */

export type AssetSubOption = {
  id: string;
  label: string;
  /** Optional helper line shown under the sub-option label. */
  detail?: string;
};

export type AssetOption = {
  id: string;
  label: string;
  /** Sub-line detail shown beneath the label in router + wizard. */
  detail: string;
  icon: LucideIcon;
  /** When present, the user can multi-select these inside the card.
   *  Selecting the main asset requires at least one sub-option. */
  subOptions?: AssetSubOption[];
};

/* Shared sub-option lists — re-used across the three location-intel
 * variants and showcase-video so updates land in one place. */

const LOCATION_INTEL_SUBS: AssetSubOption[] = [
  { id: 'site-based', label: 'Site-based location highlights' },
  { id: 'google-maps', label: 'Google Maps-based highlights' },
  { id: 'drone-route', label: 'Drone video route highlight' },
];

const SHOWCASE_VIDEO_SUBS: AssetSubOption[] = [
  {
    id: '3d-walkthrough',
    label: '3D walkthrough',
    detail: 'Priced as +20% of 3D Set (when selected)',
  },
  {
    id: 'location-highlights',
    label: 'Location highlights',
    detail: 'Priced as +20% of Location Intelligence (when selected)',
  },
  {
    id: '3d-superimposition',
    label: '3D superimposition',
    detail: 'Available only inside the showcase video',
  },
  {
    id: 'brand-credentials',
    label: 'Brand credentials',
    detail: 'Story, heritage and certifications',
  },
];

/* Shared assets re-used across multiple project types. Define once, reuse
 * everywhere — single source of truth keeps copy consistent. */

const ASSET_LOCATION_INTELLIGENCE: AssetOption = {
  id: 'location-intelligence',
  label: 'Location Intelligence',
  detail:
    'Maps, aerial view and a narrated film of the neighbourhood — connectivity, landmarks, catchment.',
  icon: Compass,
  subOptions: LOCATION_INTEL_SUBS,
};

const ASSET_AERIAL_360_3D: AssetOption = {
  id: 'aerial-360-3d',
  label: 'Aerial 360°',
  detail:
    'Drone-captured 360° panoramas of the site — buyers explore from the sky. (3D superimposition is offered inside Showcase Video.)',
  icon: Plane,
};

const ASSET_PDF_BROCHURE: AssetOption = {
  id: 'pdf-brochure',
  label: 'PDF Brochure',
  detail:
    'Interactive digital brochure for WhatsApp, email and download — your full pitch in one tap.',
  icon: FileText,
};

const ASSET_SHOWCASE_VIDEO: AssetOption = {
  id: 'showcase-video',
  label: 'Project Showcase Video',
  detail:
    'Cinematic project film with motion design, special effects and brand storytelling.',
  icon: Film,
  subOptions: SHOWCASE_VIDEO_SUBS,
};

const ASSET_MICROSITE: AssetOption = {
  id: 'microsite',
  label: 'Project Microsite',
  detail:
    "One immersive URL — aerial, 3D, video, brochure, contact forms — your sales team's launchpad.",
  icon: MonitorPlay,
};

/* ── Per-type asset bundles (the spec the user dictated) ──────────────── */

// Plotted Land + Villa Community share the same 7-asset menu per user spec.
const LAND_ASSETS: AssetOption[] = [
  {
    id: 'interactive-plotted-kit',
    label: 'Interactive Plotted Development Kit',
    detail:
      'Aerial 360° with plot superimposition, dynamic live inventory and plot-size filtering.',
    icon: LayoutGrid,
  },
  ASSET_LOCATION_INTELLIGENCE,
  {
    id: '3d-land',
    label: '3D Set — Amenities, Exteriors, Villa Homes',
    detail:
      'Renders, virtual tours and video walkthroughs of the community life buyers buy into.',
    icon: Box,
  },
  ASSET_AERIAL_360_3D,
  ASSET_PDF_BROCHURE,
  ASSET_SHOWCASE_VIDEO,
  ASSET_MICROSITE,
];

const HIGH_RISE_ASSETS: AssetOption[] = [
  ASSET_LOCATION_INTELLIGENCE,
  {
    id: 'isometric-high-rise',
    label: 'Isometric Views',
    detail:
      'Cutaway iso renders of the full tower stack — clarity that plans and elevations alone can\'t deliver.',
    icon: Boxes,
  },
  {
    id: '3d-high-rise',
    label: '3D Set — Elevation, Amenities, Exteriors, 2–4 Units',
    detail:
      'Renders, virtual tours and video walkthroughs across 2–4 unit typologies plus the shared lifestyle stack.',
    icon: Box,
  },
  ASSET_AERIAL_360_3D,
  ASSET_PDF_BROCHURE,
  ASSET_SHOWCASE_VIDEO,
  ASSET_MICROSITE,
];

const COMMERCIAL_ASSETS: AssetOption[] = [
  ASSET_LOCATION_INTELLIGENCE,
  {
    id: 'isometric-fitout',
    label: 'Isometric Views & Fit-out Scenarios',
    detail:
      'Iso views plus fit-out / floorplate scenario renders — occupiers see themselves in the space.',
    icon: SquareStack,
  },
  {
    id: '3d-commercial',
    label: '3D Set — Elevation/Facade, Lobby & Atrium',
    detail:
      'Renders, virtual tours and video walkthroughs of statement facade and shared zones.',
    icon: Box,
  },
  ASSET_AERIAL_360_3D,
  ASSET_PDF_BROCHURE,
  ASSET_SHOWCASE_VIDEO,
  ASSET_MICROSITE,
];

const RETAIL_ASSETS: AssetOption[] = [
  {
    id: 'location-catchment',
    label: 'Location Intelligence with Catchment',
    detail:
      'Maps, aerial view and video overlaid with footfall catchment, anchor pull and brand-mix logic.',
    icon: Compass,
    subOptions: LOCATION_INTEL_SUBS,
  },
  {
    id: 'isometric-leasing',
    label: 'Isometric Leasing Plan',
    detail:
      'Iso layout renders of mall floors or strip blocks — engineered for leasing-side decisions.',
    icon: SquareStack,
  },
  {
    id: '3d-retail',
    label: '3D Set — Facade, Atrium, Food Court, Anchor Zones',
    detail:
      'Renders, virtual tours and video walkthroughs of the spaces brands actually lease.',
    icon: Box,
  },
  ASSET_AERIAL_360_3D,
  {
    id: 'pdf-leasing-kit',
    label: 'PDF Leasing Kit',
    detail:
      'Brand-side brochure with floorplates, footfall projections and anchor map.',
    icon: FileText,
  },
  ASSET_SHOWCASE_VIDEO,
  {
    id: 'microsite-leasing',
    label: 'Leasing Microsite',
    detail:
      'Brand-side portal — floorplate availability, footfall data, enquiry capture in one URL.',
    icon: MonitorPlay,
  },
];

const WAREHOUSING_ASSETS: AssetOption[] = [
  {
    id: 'location-logistics',
    label: 'Location Intelligence — Highways, Ports, ICDs',
    detail:
      'Maps, aerial and film overlaid with NH access, port proximity, ICD distances and route efficiency.',
    icon: Compass,
    subOptions: LOCATION_INTEL_SUBS,
  },
  {
    id: 'isometric-warehouse',
    label: 'Isometric Site Plan with Engineering Callouts',
    detail:
      'Iso site-plan renders with clear-height, dock count, eaves height, FAR and load capacity called out.',
    icon: Boxes,
  },
  {
    id: '3d-warehouse',
    label: '3D Set — Facade, Dock Yard, Mezzanine, Office Block',
    detail:
      'Renders, virtual tours and walkthroughs of operational and admin zones.',
    icon: Box,
  },
  ASSET_AERIAL_360_3D,
  {
    id: 'pdf-spec-sheet',
    label: 'PDF Spec Sheet',
    detail:
      'Engineering-led brochure for IPCs and 3PL occupiers — specs, certifications, fit-out support.',
    icon: FileText,
  },
  ASSET_SHOWCASE_VIDEO,
  {
    id: 'microsite-ipc',
    label: 'IPC / Leasing Microsite',
    detail:
      'Spec-forward microsite optimised for IPC and 3PL distribution.',
    icon: MonitorPlay,
  },
];

/* ── Bundle types (discriminated union) ───────────────────────────────── */

type BundleBase = {
  id: string;
  icon: LucideIcon;
  label: string;
  blurb: string;
  quoteParam: string;
};

export type ProjectTypeBundle = BundleBase & {
  kind: 'project-type';
  assetOptions: AssetOption[];
};

export type StageBundle = BundleBase & {
  kind: 'stage';
  /** Informational list shown in router only — stages don't drive the
   *  wizard's asset selector (that's keyed off project type). */
  assets: string[];
};

export type Bundle = ProjectTypeBundle | StageBundle;

/* ── 6 project types ──────────────────────────────────────────────────── */

export const PROJECT_TYPES: Record<ProjectTypeId, ProjectTypeBundle> = {
  'high-rise': {
    kind: 'project-type',
    id: 'high-rise',
    icon: Building,
    label: 'High-Rise Apartments',
    blurb:
      'Statement towers where the facade, the views and the lifestyle all need to sell at once.',
    assetOptions: HIGH_RISE_ASSETS,
    quoteParam: 'high-rise',
  },
  plotted: {
    kind: 'project-type',
    id: 'plotted',
    icon: MapIcon,
    label: 'Plotted Land',
    blurb:
      'Layouts where buyers buy *location intelligence* first — then a parcel they can imagine.',
    assetOptions: LAND_ASSETS,
    quoteParam: 'plotted',
  },
  'villa-community': {
    kind: 'project-type',
    id: 'villa-community',
    icon: Home,
    label: 'Villa Community',
    blurb:
      'Low-density living that sells on craft, privacy and the community story.',
    assetOptions: LAND_ASSETS,
    quoteParam: 'villa-community',
  },
  commercial: {
    kind: 'project-type',
    id: 'commercial',
    icon: Briefcase,
    label: 'Commercial',
    blurb:
      'Office and mixed-use towers pitched to occupiers, investors and IPCs together.',
    assetOptions: COMMERCIAL_ASSETS,
    quoteParam: 'commercial',
  },
  retail: {
    kind: 'project-type',
    id: 'retail',
    icon: ShoppingBag,
    label: 'Retail',
    blurb:
      'Malls, high streets and strip retail — selling footfall potential to brands and leasing teams.',
    assetOptions: RETAIL_ASSETS,
    quoteParam: 'retail',
  },
  warehousing: {
    kind: 'project-type',
    id: 'warehousing',
    icon: Warehouse,
    label: 'Warehousing / Logistics',
    blurb:
      'Industrial assets where highway access, clear-height and dock count *are* the marketing.',
    assetOptions: WAREHOUSING_ASSETS,
    quoteParam: 'warehousing',
  },
};

/* ── 5 lifecycle stages ───────────────────────────────────────────────── */

export const STAGES: Record<StageId, StageBundle> = {
  'pre-launch': {
    kind: 'stage',
    id: 'pre-launch',
    icon: Rocket,
    label: 'Pre-Launch Teaser',
    blurb:
      'You\'re 90 days out. The job is intrigue, not specifics — make the market lean in.',
    assets: [
      'Aerial location reveal film',
      'Signature teaser film (30–60s)',
      'Vertical reels for Insta / WhatsApp',
      'One-page teaser landing site',
      'Pre-registration capture form',
    ],
    quoteParam: 'pre-launch',
  },
  launch: {
    kind: 'stage',
    id: 'launch',
    icon: Flag,
    label: 'Launch',
    blurb:
      'Launch day is a stage. The full sales kit goes live — no surprises, no missing assets.',
    assets: [
      'Full project microsite',
      'Cinematic walkthrough',
      'Complete 3D set — interiors, exteriors, amenities',
      'Signature project film',
      'Social launch kit (graphics + reels)',
      'Digital brochure / e-book',
    ],
    quoteParam: 'launch',
  },
  sustenance: {
    kind: 'stage',
    id: 'sustenance',
    icon: Megaphone,
    label: 'Sustenance',
    blurb:
      'Launch is over. Now the funnel needs constant fuel for 6–18 months.',
    assets: [
      'Vertical reels — fresh hooks monthly',
      'Refreshed interior render set',
      'Brochure / microsite content updates',
      'Performance-tuned social kit',
      'Email + WhatsApp creative cadence',
    ],
    quoteParam: 'sustenance',
  },
  possession: {
    kind: 'stage',
    id: 'possession',
    icon: KeyRound,
    label: 'Possession / Handover',
    blurb:
      'The building is real. Switch from renders to actuals — and re-target NRIs & resale buyers.',
    assets: [
      'Drone capture of the finished project',
      'Real-shoot films — lifestyle & community',
      'NRI-targeted walkthroughs',
      'Refreshed website with built imagery',
      'Resale / referral microsite module',
    ],
    quoteParam: 'possession',
  },
  resale: {
    kind: 'stage',
    id: 'resale',
    icon: RotateCcw,
    label: 'Resale',
    blurb:
      'Unit-by-unit sales after handover — the channel-partner enablement phase.',
    assets: [
      'Unit-specific renders & virtual tours',
      'Broker enablement kit (decks, reels, scripts)',
      '360° tours by inventory',
      'Microsite refresh with availability layer',
    ],
    quoteParam: 'resale',
  },
};

/* ── "Other / custom" — quote-wizard-only escape hatch ────────────────── */

/** Wizard project type including the catch-all. The 'other' branch skips
 *  Stage/Scale/Assets entirely — no auto-quote, lead goes straight to the
 *  studio for manual review. Deliberately NOT in PROJECT_TYPES /
 *  PROJECT_TYPE_ORDER so SolutionsRouter chips stay untouched. */
export type WizardProjectTypeId = ProjectTypeId | 'other';

export const OTHER_PROJECT_TYPE = {
  id: 'other',
  icon: Shapes,
  label: 'Other',
  blurb:
    'Any specific requirement — smaller or different projects, or specific services such as 3D Renders & Walkthroughs, Virtual Tours.',
  quoteParam: 'other',
} as const;

/* ── Helpers ──────────────────────────────────────────────────────────── */

export const PROJECT_TYPE_ORDER: ProjectTypeId[] = [
  'high-rise',
  'plotted',
  'villa-community',
  'commercial',
  'retail',
  'warehousing',
];

export const STAGE_ORDER: StageId[] = [
  'pre-launch',
  'launch',
  'sustenance',
  'possession',
  'resale',
];

/** Resolve a quote-param string back to a ProjectTypeId (or null). */
export function projectTypeFromParam(p: string | null): ProjectTypeId | null {
  if (!p) return null;
  const match = PROJECT_TYPE_ORDER.find((id) => PROJECT_TYPES[id].quoteParam === p);
  return match ?? null;
}

/** Resolve a quote-param string back to a StageId (or null). */
export function stageFromParam(p: string | null): StageId | null {
  if (!p) return null;
  const match = STAGE_ORDER.find((id) => STAGES[id].quoteParam === p);
  return match ?? null;
}

/** Build a deep-link to the Quote wizard with chip context pre-filled. */
export function quoteHref(opts: { type?: ProjectTypeId; stage?: StageId }) {
  const params = new URLSearchParams();
  if (opts.type) params.set('type', PROJECT_TYPES[opts.type].quoteParam);
  if (opts.stage) params.set('stage', STAGES[opts.stage].quoteParam);
  const qs = params.toString();
  return qs ? `/quote?${qs}` : '/quote';
}
