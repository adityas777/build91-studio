import {
  PROJECT_TYPES,
  type AssetOption,
  type ProjectTypeId,
} from './solutionsBundles';

/* ───────────────────────────────────────────────────────────────────────
   Quote Pricing — formula-based engine
   ───────────────────────────────────────────────────────────────────────
   Per-asset prices are computed by functions, not tier lookups. This
   lets the engine express:
     • Type-specific scale inputs (towers, plots, villas, plot area, etc.)
     • Multi-select sub-options inside assets (location-intel variants,
       showcase-video components)
     • Compound dependencies between assets (microsite reads other
       selected asset prices; showcase-video reads 3D set + location)

   Edit `PRICE_*` constants to tune rates without touching formula shape.

   Currency : INR
   GST      : Exclusive (NOT added to customer-facing total)
   Drone    : Capture quoted by location — mentioned ONCE on the reveal
              screen only.
   Reveal   : Customer sees ONLY the final total after contact submit
   ─────────────────────────────────────────────────────────────────────── */

export const PRICING_VERSION = 'v3-draft'; // Bumped to v3 for pricing revisions (Task 10)
export const QUOTE_VALIDITY_DAYS = 30; // Placeholder pending calibration against real project costs (Task 10)
export const GST_RATE = 0.18; // Standard GST rate

/** Today's date in ISO format. Computed at call-time so the pricing
 *  snapshot in any quote reflects when it was generated. */
export function effectiveDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── Scale inputs per project type ──────────────────────────────────── */

/**
 * Type-specific scale shapes. The wizard's Scale step renders a
 * type-aware form that collects these. Pricing formulas read from the
 * generic `Record<string, number>` representation so adding fields
 * later doesn't require rewriting the pricer signatures.
 */
export type ScaleField = {
  key: string;
  label: string;
  /** Stepper = +/- buttons around a numeric display. Range = chip select. */
  control: 'stepper' | 'range';
  /** Pre-filled value when the user first lands on the Scale step. */
  default: number;
  /** Min / max bounds for steppers. */
  min?: number;
  max?: number;
  /** Increment / decrement size for steppers. Defaults to 1. */
  step?: number;
  /** Decimal handling for steppers (acres etc.). */
  decimal?: boolean;
  /** Predefined options for `control: 'range'` chips. `value` is the
   *  representative midpoint fed to the pricing engine. */
  options?: { value: number; label: string }[];
  /** Helper / suffix shown next to the field. */
  unit?: string;
  /** Description shown on the ⓘ tooltip. */
  hint?: string;
};

export const SCALE_FIELDS_BY_TYPE: Record<ProjectTypeId, ScaleField[]> = {
  'high-rise': [
    {
      key: 'towers',
      label: 'Number of towers',
      control: 'stepper',
      default: 2,
      min: 1,
      max: 50,
      step: 1,
      unit: 'towers',
    },
    {
      key: 'avgUnitsPerTower',
      label: 'Avg units per tower',
      control: 'stepper',
      default: 20,
      min: 1,
      max: 500,
      step: 5,
      unit: 'units',
    },
    {
      key: 'amenities',
      label: 'Amenities count',
      control: 'stepper',
      default: 6,
      min: 0,
      max: 50,
      step: 1,
      unit: 'amenities',
    },
    {
      key: 'plotAreaAcres',
      label: 'Total plot area',
      control: 'stepper',
      default: 1,
      min: 0.1,
      max: 100,
      step: 0.5,
      decimal: true,
      unit: 'acres',
    },
  ],
  plotted: [
    {
      key: 'plotAreaAcres',
      label: 'Total plot area',
      control: 'stepper',
      default: 20,
      min: 1,
      max: 500,
      step: 1,
      decimal: true,
      unit: 'acres',
    },
    {
      key: 'plots',
      label: 'Total no. of plots',
      control: 'stepper',
      default: 100,
      min: 1,
      max: 2000,
      step: 10,
      unit: 'plots',
    },
    {
      key: 'amenities',
      label: 'Amenities count',
      control: 'stepper',
      default: 6,
      min: 0,
      max: 50,
      step: 1,
      unit: 'amenities',
    },
  ],
  'villa-community': [
    {
      key: 'plotAreaAcres',
      label: 'Total plot area',
      control: 'stepper',
      default: 20,
      min: 1,
      max: 500,
      step: 1,
      decimal: true,
      unit: 'acres',
    },
    {
      key: 'villas',
      label: 'Total no. of villas',
      control: 'stepper',
      default: 50,
      min: 1,
      max: 500,
      step: 10,
      unit: 'villas',
    },
    {
      key: 'amenities',
      label: 'Amenities count',
      control: 'stepper',
      default: 6,
      min: 0,
      max: 50,
      step: 1,
      unit: 'amenities',
    },
    {
      key: 'modelVillas',
      label: 'Model villa typologies',
      control: 'stepper',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
      unit: 'models',
      hint: 'Distinct villa designs you want rendered',
    },
  ],
  commercial: [
    {
      key: 'plotAreaAcres',
      label: 'Total plot area',
      control: 'stepper',
      default: 2,
      min: 0.1,
      max: 100,
      step: 0.5,
      decimal: true,
      unit: 'acres',
    },
    {
      key: 'buildingUnits',
      label: 'Total building units',
      control: 'stepper',
      default: 10,
      min: 1,
      max: 500,
      step: 1,
      unit: 'units',
    },
    {
      key: 'amenities',
      label: 'Amenities count',
      control: 'stepper',
      default: 6,
      min: 0,
      max: 50,
      step: 1,
      unit: 'amenities',
    },
  ],
  retail: [
    {
      key: 'plotAreaAcres',
      label: 'Total plot area',
      control: 'stepper',
      default: 2,
      min: 0.1,
      max: 100,
      step: 0.5,
      decimal: true,
      unit: 'acres',
    },
    {
      key: 'buildingUnits',
      label: 'Total building units',
      control: 'stepper',
      default: 20,
      min: 1,
      max: 500,
      step: 5,
      unit: 'units',
    },
    {
      key: 'amenities',
      label: 'Amenities count',
      control: 'stepper',
      default: 6,
      min: 0,
      max: 50,
      step: 1,
      unit: 'amenities',
    },
  ],
  warehousing: [
    {
      key: 'plotAreaAcres',
      label: 'Total plot area',
      control: 'stepper',
      default: 20,
      min: 1,
      max: 500,
      step: 1,
      decimal: true,
      unit: 'acres',
    },
    {
      key: 'buildingUnits',
      label: 'Total building units',
      control: 'stepper',
      default: 4,
      min: 1,
      max: 100,
      step: 1,
      unit: 'units',
    },
  ],
};

/** Pre-fill the scale form with each field's default so the user can
 *  go straight to Continue without typing — or adjust with +/-. */
export function defaultScaleInputsFor(type: ProjectTypeId): ScaleInputs {
  const inputs: ScaleInputs = {};
  for (const f of SCALE_FIELDS_BY_TYPE[type]) {
    inputs[f.key] = f.default;
  }
  return inputs;
}

export type ScaleInputs = Record<string, number>;

/** All required fields are present and > 0 (or >= 0 for amenities). */
export function isScaleComplete(
  type: ProjectTypeId,
  scale: ScaleInputs,
): boolean {
  const fields = SCALE_FIELDS_BY_TYPE[type];
  return fields.every((f) => {
    const v = scale[f.key];
    if (v === undefined || v === null || Number.isNaN(v)) return false;
    const min = f.min ?? 1;
    return v >= min;
  });
}

/** One-line summary used in the email + outcome footer. */
export function summarizeScale(
  type: ProjectTypeId,
  scale: ScaleInputs,
): string {
  return SCALE_FIELDS_BY_TYPE[type]
    .map((f) => {
      const v = scale[f.key];
      if (v === undefined) return null;
      const display = f.decimal ? v : Math.round(v);
      return `${display} ${f.unit ?? ''}`.trim();
    })
    .filter(Boolean)
    .join(' · ');
}

/* ── Drone-involved assets ─────────────────────────────────────────── */

export const DRONE_INVOLVED_ASSETS = new Set<string>([
  'aerial-360-3d',
  'interactive-plotted-kit',
  'location-intelligence',
  'location-catchment',
  'location-logistics',
  'showcase-video',
]);

/* ── Pricing constants (tune these — they're the "knobs") ──────────── */

// Named pricing constants and rates (Task 3 & 10)
// Note: Placeholder pending calibration against real project costs (Task 10)
const PRICE_AERIAL_BASE = 150000; // Placeholder pending calibration against real project costs
const PRICE_AERIAL_ACRE_RATE = 20000; // Placeholder pending calibration against real project costs
const PRICE_AERIAL_TOWER = 25000; // Placeholder pending calibration against real project costs
const PRICE_AERIAL_UNIT = 8000; // Placeholder pending calibration against real project costs
const PRICE_AERIAL_VILLA = 4000; // Placeholder pending calibration against real project costs
const PRICE_AERIAL_PLOT = 500; // Placeholder pending calibration against real project costs
const PRICE_AERIAL_HR_UNIT = 150; // Placeholder pending calibration against real project costs (Task 1)

const PRICE_INTERACTIVE_BASE = 150000; // Placeholder pending calibration against real project costs
const PRICE_INTERACTIVE_AMENITY = 10000; // Placeholder pending calibration against real project costs
const PRICE_INTERACTIVE_PLOT = 500; // Placeholder pending calibration against real project costs
const PRICE_INTERACTIVE_VILLA = 500; // Placeholder pending calibration against real project costs
const PRICE_INTERACTIVE_UNIT = 500; // Placeholder pending calibration against real project costs

const RATE_SUPERIMPOSE_TOWER = 50000; // Placeholder pending calibration against real project costs
const RATE_SUPERIMPOSE_ACRE = 10000; // Placeholder pending calibration against real project costs
const RATE_SUPERIMPOSE_PLOT = 800; // Placeholder pending calibration against real project costs
const RATE_SUPERIMPOSE_VILLA = 800; // Placeholder pending calibration against real project costs
const RATE_SUPERIMPOSE_UNIT = 800; // Placeholder pending calibration against real project costs
const RATE_SUPERIMPOSE_HR_UNIT = 150; // Placeholder pending calibration against real project costs (Task 1)

const PRICE_SUPERIMPOSITION_BASE = 75000; // Placeholder pending calibration against real project costs
const PRICE_BRAND_CREDENTIALS_BASE = 50000; // Placeholder pending calibration against real project costs

const MICROSITE_PERCENT = 0.15; // Placeholder pending calibration against real project costs
const SHOWCASE_DEPENDENCY_PERCENT = 0.20; // Placeholder pending calibration against real project costs

// Standalone fallbacks for showcase-video sub-options (Task 8)
const PRICE_SHOWCASE_WALKTHROUGH_STANDALONE = 120000; // Placeholder pending calibration against real project costs
const PRICE_SHOWCASE_LOC_STANDALONE = 40000; // Placeholder pending calibration against real project costs

// Per-asset minimum price floors (Task 5)
const ASSET_MIN_PRICES: Record<string, number> = {
  'location-intelligence': 50000, // Placeholder pending calibration against real project costs
  'location-catchment': 60000, // Placeholder pending calibration against real project costs
  'location-logistics': 65000, // Placeholder pending calibration against real project costs
  'aerial-360-3d': 125000, // Placeholder pending calibration against real project costs
  'pdf-brochure': 40000, // Placeholder pending calibration against real project costs
  'pdf-leasing-kit': 60000, // Placeholder pending calibration against real project costs
  'pdf-spec-sheet': 60000, // Placeholder pending calibration against real project costs
  'showcase-video': 100000, // Placeholder pending calibration against real project costs
  microsite: 50000, // Placeholder pending calibration against real project costs
  'microsite-leasing': 50000, // Placeholder pending calibration against real project costs
  'microsite-ipc': 60000, // Placeholder pending calibration against real project costs
  '3d-land': 150000, // Placeholder pending calibration against real project costs
  '3d-high-rise': 200000, // Placeholder pending calibration against real project costs
  '3d-commercial': 200000, // Placeholder pending calibration against real project costs
  '3d-retail': 200000, // Placeholder pending calibration against real project costs
  '3d-warehouse': 180000, // Placeholder pending calibration against real project costs
  'isometric-high-rise': 45000, // Placeholder pending calibration against real project costs
  'isometric-fitout': 60000, // Placeholder pending calibration against real project costs
  'isometric-leasing': 45000, // Placeholder pending calibration against real project costs
  'isometric-warehouse': 60000, // Placeholder pending calibration against real project costs
  'interactive-plotted-kit': 120000, // Placeholder pending calibration against real project costs
};

// Location intelligence pricing functions of scale (Task 4)
type ScalePricer = (scale: ScaleInputs) => number;

const PRICE_LOC_INTEL: Record<string, ScalePricer> = {
  'site-based': (scale) => 75000 + (scale.plotAreaAcres ?? 0) * 2000, // Placeholder pending calibration against real project costs
  'google-maps': (scale) => 40000 + (scale.plotAreaAcres ?? 0) * 1000, // Placeholder pending calibration against real project costs
  'drone-route': (scale) => 60000 + (scale.plotAreaAcres ?? 0) * 1500, // Placeholder pending calibration against real project costs
};

const PRICE_LOC_CATCHMENT: Record<string, ScalePricer> = {
  'site-based': (scale) => 90000 + (scale.plotAreaAcres ?? 0) * 2500, // Placeholder pending calibration against real project costs
  'google-maps': (scale) => 50000 + (scale.plotAreaAcres ?? 0) * 1200, // Placeholder pending calibration against real project costs
  'drone-route': (scale) => 75000 + (scale.plotAreaAcres ?? 0) * 1800, // Placeholder pending calibration against real project costs
};

const PRICE_LOC_LOGISTICS: Record<string, ScalePricer> = {
  'site-based': (scale) => 95000 + (scale.plotAreaAcres ?? 0) * 3000, // Placeholder pending calibration against real project costs
  'google-maps': (scale) => 55000 + (scale.plotAreaAcres ?? 0) * 1500, // Placeholder pending calibration against real project costs
  'drone-route': (scale) => 80000 + (scale.plotAreaAcres ?? 0) * 2000, // Placeholder pending calibration against real project costs
};

/* ── Sub-option price helpers ──────────────────────────────────────── */

export const LOC_INTEL_SUB_OPTIONS = [
  { id: 'site-based', label: 'Site-based location highlights' },
  { id: 'google-maps', label: 'Google Maps-based highlights' },
  { id: 'drone-route', label: 'Drone video route highlight' },
] as const;

export const SHOWCASE_VIDEO_SUB_OPTIONS = [
  {
    id: '3d-walkthrough',
    label: '3D walkthrough',
    detail: '+ 20% of 3D Set cost (when 3D Set selected)',
  },
  {
    id: 'location-highlights',
    label: 'Location highlights',
    detail: '+ 20% of Location Intelligence cost (when selected)',
  },
  {
    id: '3d-superimposition',
    label: '3D superimposition',
    detail: 'Available only in Showcase Video',
  },
  {
    id: 'brand-credentials',
    label: 'Brand credentials',
    detail: 'Story / heritage / certifications',
  },
] as const;

/* ── Pricing context + engine ──────────────────────────────────────── */

export type PricingContext = {
  type: ProjectTypeId;
  scale: ScaleInputs;
  selectedAssetIds: string[];
  subOptionsByAsset: Record<string, string[]>;
};

type AssetPricer = (ctx: PricingContext) => number;

/** 3D-set asset id varies by project type. Used by showcase-video's
 *  "3d-walkthrough" sub-option (+20% of 3D set price) and by the
 *  wizard's dependency-cascade logic. */
export function threeDSetIdFor(type: ProjectTypeId): string | null {
  switch (type) {
    case 'high-rise':
      return '3d-high-rise';
    case 'plotted':
    case 'villa-community':
      return '3d-land';
    case 'commercial':
      return '3d-commercial';
    case 'retail':
      return '3d-retail';
    case 'warehousing':
      return '3d-warehouse';
  }
}

/** Location-intel asset id varies by project type. Used by showcase
 *  video's "location-highlights" sub-option and by the wizard's
 *  dependency-cascade logic. */
export function locationAssetIdFor(type: ProjectTypeId): string | null {
  switch (type) {
    case 'retail':
      return 'location-catchment';
    case 'warehousing':
      return 'location-logistics';
    default:
      return 'location-intelligence';
  }
}

/** All location-intelligence asset variants. */
export const LOCATION_INTEL_ASSET_IDS: ReadonlySet<string> = new Set([
  'location-intelligence',
  'location-catchment',
  'location-logistics',
]);

function sumSubOptionPrices(
  ctx: PricingContext,
  assetId: string,
  priceMap: Record<string, ScalePricer>,
): number {
  const subs = ctx.subOptionsByAsset[assetId] ?? [];
  return subs.reduce((sum, sub) => {
    const pricer = priceMap[sub];
    return sum + (pricer ? pricer(ctx.scale) : 0);
  }, 0);
}

interface CostTier {
  upTo: number;
  rate: number;
}

/** Utility to compute tiered costs for diminishing rates (Task 6) */
export function tieredCost(count: number, tiers: CostTier[]): number {
  let cost = 0;
  let remaining = count;
  let previousUpTo = 0;
  
  for (const tier of tiers) {
    if (remaining <= 0) break;
    const tierSize = tier.upTo - previousUpTo;
    const countInTier = Math.min(remaining, tierSize);
    cost += countInTier * tier.rate;
    remaining -= countInTier;
    previousUpTo = tier.upTo;
  }
  return cost;
}

// Common — superimposition cost = base + scale factor.
function superimpositionCost(ctx: PricingContext): number {
  const s = ctx.scale;
  const towers = s.towers ?? 0;
  const area = s.plotAreaAcres ?? 0;
  
  // Split combined units terms into separate coefficients with named constants (Task 3)
  const plotsCost = tieredCost(s.plots ?? 0, [
    { upTo: 100, rate: RATE_SUPERIMPOSE_PLOT },
    { upTo: Infinity, rate: RATE_SUPERIMPOSE_PLOT * 0.6 }
  ]);
  const villasCost = tieredCost(s.villas ?? 0, [
    { upTo: 50, rate: RATE_SUPERIMPOSE_VILLA },
    { upTo: Infinity, rate: RATE_SUPERIMPOSE_VILLA * 0.6 }
  ]);
  const unitsCost = tieredCost(s.buildingUnits ?? 0, [
    { upTo: 50, rate: RATE_SUPERIMPOSE_UNIT },
    { upTo: Infinity, rate: RATE_SUPERIMPOSE_UNIT * 0.6 }
  ]);
  
  // Task 1: Use avgUnitsPerTower (density term)
  const hrUnitsCost = ctx.type === 'high-rise' ? (s.towers ?? 0) * (s.avgUnitsPerTower ?? 0) * RATE_SUPERIMPOSE_HR_UNIT : 0;
  
  const towersCost = tieredCost(towers, [
    { upTo: 2, rate: RATE_SUPERIMPOSE_TOWER },
    { upTo: Infinity, rate: RATE_SUPERIMPOSE_TOWER * 0.7 }
  ]);
  const areaCost = tieredCost(area, [
    { upTo: 10, rate: RATE_SUPERIMPOSE_ACRE },
    { upTo: Infinity, rate: RATE_SUPERIMPOSE_ACRE * 0.7 }
  ]);
  
  const totalUnitsCost = plotsCost + villasCost + unitsCost + hrUnitsCost;
  
  return PRICE_SUPERIMPOSITION_BASE + towersCost + totalUnitsCost + areaCost;
}

// Common — brand credentials cost = base + scale-derived factor. (Task 9 & Task 1)
function brandCredentialsCost(ctx: PricingContext): number {
  const s = ctx.scale;
  let scaleFactor = 0;
  switch (ctx.type) {
    case 'high-rise':
      scaleFactor =
        (s.towers ?? 0) * 1.5 +
        ((s.towers ?? 0) * (s.avgUnitsPerTower ?? 0)) / 100 +
        (s.plotAreaAcres ?? 0);
      break;
    case 'plotted':
      scaleFactor = (s.plots ?? 0) / 10 + (s.plotAreaAcres ?? 0);
      break;
    case 'villa-community':
      scaleFactor = (s.villas ?? 0) + (s.plotAreaAcres ?? 0);
      break;
    case 'commercial':
    case 'retail':
      scaleFactor = (s.buildingUnits ?? 0) + (s.plotAreaAcres ?? 0);
      break;
    case 'warehousing':
      scaleFactor = (s.buildingUnits ?? 0) + (s.plotAreaAcres ?? 0);
      break;
    default:
      scaleFactor = (s.plotAreaAcres ?? 0);
  }
  return PRICE_BRAND_CREDENTIALS_BASE + Math.round(scaleFactor * 8000);
}

// Sibling microsites to filter out to prevent double-counting (Task 7)
const MICROSITE_IDS = new Set(['microsite', 'microsite-leasing', 'microsite-ipc']);

function micrositeFormula(
  ctx: PricingContext,
  selfId: string,
): number {
  const others = ctx.selectedAssetIds.filter((id) => !MICROSITE_IDS.has(id));
  const otherTotal = others.reduce(
    (sum, id) => sum + computeAssetPrice(id, ctx),
    0,
  );
  return Math.round(otherTotal * MICROSITE_PERCENT);
}

/* ── ASSET_PRICERS — the heart of the engine ───────────────────────── */

const ASSET_PRICERS: Record<string, AssetPricer> = {
  // Location intel + variants (multi-select sub-options)
  'location-intelligence': (ctx) =>
    sumSubOptionPrices(ctx, 'location-intelligence', PRICE_LOC_INTEL),
  'location-catchment': (ctx) =>
    sumSubOptionPrices(ctx, 'location-catchment', PRICE_LOC_CATCHMENT),
  'location-logistics': (ctx) =>
    sumSubOptionPrices(ctx, 'location-logistics', PRICE_LOC_LOGISTICS),

  // Aerial 360° with 3D superimposition — universal asset, scale-based
  'aerial-360-3d': (ctx) => {
    const s = ctx.scale;
    const area = tieredCost(s.plotAreaAcres ?? 0, [
      { upTo: 10, rate: PRICE_AERIAL_ACRE_RATE },
      { upTo: Infinity, rate: PRICE_AERIAL_ACRE_RATE * 0.6 }
    ]);
    
    // Split combined units terms into separate coefficients with named constants (Task 3)
    const towersCost = (s.towers ?? 0) * PRICE_AERIAL_TOWER;
    const unitsCost = (s.buildingUnits ?? 0) * PRICE_AERIAL_UNIT;
    const villasCost = (s.villas ?? 0) * PRICE_AERIAL_VILLA;
    const plotsCost = (s.plots ?? 0) * PRICE_AERIAL_PLOT;
    
    // Task 1: Use avgUnitsPerTower (density term)
    const hrUnitsCost = ctx.type === 'high-rise' ? (s.towers ?? 0) * (s.avgUnitsPerTower ?? 0) * PRICE_AERIAL_HR_UNIT : 0;
    
    const units = towersCost + unitsCost + villasCost + plotsCost + hrUnitsCost;
    
    return Math.round(PRICE_AERIAL_BASE + area + units);
  },

  // PDF brochures — modest base + amenity factor
  'pdf-brochure': (ctx) => {
    const amenitiesCost = tieredCost(ctx.scale.amenities ?? 0, [
      { upTo: 5, rate: 5000 },
      { upTo: Infinity, rate: 3000 }
    ]);
    return 50000 + amenitiesCost;
  },
  'pdf-leasing-kit': (ctx) => {
    const unitsCost = tieredCost(ctx.scale.buildingUnits ?? 0, [
      { upTo: 10, rate: 5000 },
      { upTo: Infinity, rate: 3000 }
    ]);
    const amenitiesCost = tieredCost(ctx.scale.amenities ?? 0, [
      { upTo: 5, rate: 3000 },
      { upTo: Infinity, rate: 1500 }
    ]);
    return 75000 + unitsCost + amenitiesCost;
  },
  'pdf-spec-sheet': (ctx) => {
    const areaCost = tieredCost(ctx.scale.plotAreaAcres ?? 0, [
      { upTo: 10, rate: 8000 },
      { upTo: Infinity, rate: 4000 }
    ]);
    const unitsCost = tieredCost(ctx.scale.buildingUnits ?? 0, [
      { upTo: 10, rate: 3000 },
      { upTo: Infinity, rate: 1500 }
    ]);
    return 75000 + areaCost + unitsCost;
  },

  // Showcase video — compound from sub-options
  'showcase-video': (ctx) => {
    const subs = ctx.subOptionsByAsset['showcase-video'] ?? [];
    let total = 0;
    if (subs.includes('3d-walkthrough')) {
      const threeDId = threeDSetIdFor(ctx.type);
      if (threeDId && ctx.selectedAssetIds.includes(threeDId)) {
        total += Math.round(computeAssetPrice(threeDId, ctx) * SHOWCASE_DEPENDENCY_PERCENT);
      } else {
        total += PRICE_SHOWCASE_WALKTHROUGH_STANDALONE; // Task 8 fallback
      }
    }
    if (subs.includes('location-highlights')) {
      const locId = locationAssetIdFor(ctx.type);
      if (locId && ctx.selectedAssetIds.includes(locId)) {
        total += Math.round(computeAssetPrice(locId, ctx) * SHOWCASE_DEPENDENCY_PERCENT);
      } else {
        total += PRICE_SHOWCASE_LOC_STANDALONE; // Task 8 fallback
      }
    }
    if (subs.includes('3d-superimposition')) {
      total += superimpositionCost(ctx);
    }
    if (subs.includes('brand-credentials')) {
      total += brandCredentialsCost(ctx);
    }
    return total;
  },

  // Microsite variants — % of other selections
  microsite: (ctx) => micrositeFormula(ctx, 'microsite'),
  'microsite-leasing': (ctx) => micrositeFormula(ctx, 'microsite-leasing'),
  'microsite-ipc': (ctx) => micrositeFormula(ctx, 'microsite-ipc'),

  // 3D sets — type-specific
  '3d-land': (ctx) => {
    const s = ctx.scale;
    const area = tieredCost(s.plotAreaAcres ?? 0, [
      { upTo: 10, rate: 10000 },
      { upTo: Infinity, rate: 6000 }
    ]);
    const amenities = tieredCost(s.amenities ?? 0, [
      { upTo: 5, rate: 25000 },
      { upTo: Infinity, rate: 15000 }
    ]);
    if (ctx.type === 'villa-community') {
      const villas = tieredCost(s.modelVillas ?? 0, [
        { upTo: 3, rate: 100000 },
        { upTo: Infinity, rate: 60000 }
      ]);
      return 200000 + villas + amenities + area;
    }
    // plotted land
    const plots = tieredCost(s.plots ?? 0, [
      { upTo: 100, rate: 1000 },
      { upTo: Infinity, rate: 500 }
    ]);
    return 200000 + plots + amenities + area;
  },
  '3d-high-rise': (ctx) => {
    const s = ctx.scale;
    const towers = tieredCost(s.towers ?? 0, [
      { upTo: 2, rate: 175000 },
      { upTo: Infinity, rate: 110000 }
    ]);
    // Task 1: Use avgUnitsPerTower (density term)
    const density = tieredCost((s.towers ?? 0) * (s.avgUnitsPerTower ?? 0), [
      { upTo: 100, rate: 1200 },
      { upTo: Infinity, rate: 700 }
    ]);
    const amenities = tieredCost(s.amenities ?? 0, [
      { upTo: 5, rate: 30000 },
      { upTo: Infinity, rate: 15000 }
    ]);
    const area = tieredCost(s.plotAreaAcres ?? 0, [
      { upTo: 5, rate: 8000 },
      { upTo: Infinity, rate: 4000 }
    ]);
    return 100000 + towers + density + amenities + area;
  },
  '3d-commercial': (ctx) => {
    const s = ctx.scale;
    const units = tieredCost(s.buildingUnits ?? 0, [
      { upTo: 10, rate: 60000 },
      { upTo: Infinity, rate: 35000 }
    ]);
    const amenities = tieredCost(s.amenities ?? 0, [
      { upTo: 5, rate: 35000 },
      { upTo: Infinity, rate: 18000 }
    ]);
    const area = tieredCost(s.plotAreaAcres ?? 0, [
      { upTo: 5, rate: 10000 },
      { upTo: Infinity, rate: 5000 }
    ]);
    return 150000 + units + amenities + area;
  },
  '3d-retail': (ctx) => {
    const s = ctx.scale;
    const units = tieredCost(s.buildingUnits ?? 0, [
      { upTo: 10, rate: 50000 },
      { upTo: Infinity, rate: 30000 }
    ]);
    const amenities = tieredCost(s.amenities ?? 0, [
      { upTo: 5, rate: 30000 },
      { upTo: Infinity, rate: 15000 }
    ]);
    const area = tieredCost(s.plotAreaAcres ?? 0, [
      { upTo: 5, rate: 10000 },
      { upTo: Infinity, rate: 5000 }
    ]);
    return 150000 + units + amenities + area;
  },
  '3d-warehouse': (ctx) => {
    const s = ctx.scale;
    const area = tieredCost(s.plotAreaAcres ?? 0, [
      { upTo: 20, rate: 25000 },
      { upTo: Infinity, rate: 15000 }
    ]);
    const units = tieredCost(s.buildingUnits ?? 0, [
      { upTo: 5, rate: 40000 },
      { upTo: Infinity, rate: 25000 }
    ]);
    return 200000 + area + units;
  },

  // Isometrics
  'isometric-high-rise': (ctx) => {
    const s = ctx.scale;
    const towers = tieredCost(s.towers ?? 0, [
      { upTo: 2, rate: 40000 },
      { upTo: Infinity, rate: 25000 }
    ]);
    const amenities = tieredCost(s.amenities ?? 0, [
      { upTo: 5, rate: 10000 },
      { upTo: Infinity, rate: 5000 }
    ]);
    return 50000 + towers + amenities;
  },
  'isometric-fitout': (ctx) => {
    const s = ctx.scale;
    const units = tieredCost(s.buildingUnits ?? 0, [
      { upTo: 5, rate: 20000 },
      { upTo: Infinity, rate: 12000 }
    ]);
    return 75000 + units;
  },
  'isometric-leasing': (ctx) => {
    const s = ctx.scale;
    const units = tieredCost(s.buildingUnits ?? 0, [
      { upTo: 5, rate: 18000 },
      { upTo: Infinity, rate: 10000 }
    ]);
    return 50000 + units;
  },
  'isometric-warehouse': (ctx) => {
    const s = ctx.scale;
    const area = tieredCost(s.plotAreaAcres ?? 0, [
      { upTo: 10, rate: 15000 },
      { upTo: Infinity, rate: 8000 }
    ]);
    return 75000 + area;
  },

  // Interactive Plotted Kit — by plots/villas count + amenities
  'interactive-plotted-kit': (ctx) => {
    const s = ctx.scale;
    // Task 3: Split combined units terms into separate coefficients
    const plotsCost = tieredCost(s.plots ?? 0, [
      { upTo: 100, rate: PRICE_INTERACTIVE_PLOT },
      { upTo: Infinity, rate: PRICE_INTERACTIVE_PLOT * 0.6 }
    ]);
    const villasCost = tieredCost(s.villas ?? 0, [
      { upTo: 50, rate: PRICE_INTERACTIVE_VILLA },
      { upTo: Infinity, rate: PRICE_INTERACTIVE_VILLA * 0.6 }
    ]);
    const unitsCost = tieredCost(s.buildingUnits ?? 0, [
      { upTo: 50, rate: PRICE_INTERACTIVE_UNIT },
      { upTo: Infinity, rate: PRICE_INTERACTIVE_UNIT * 0.6 }
    ]);
    const units = plotsCost + villasCost + unitsCost;
    
    const amenities = tieredCost(s.amenities ?? 0, [
      { upTo: 5, rate: PRICE_INTERACTIVE_AMENITY },
      { upTo: Infinity, rate: PRICE_INTERACTIVE_AMENITY * 0.5 }
    ]);
    return PRICE_INTERACTIVE_BASE + units + amenities;
  },
};

/** Compute a single asset's price under the given context. */
export function computeAssetPrice(
  assetId: string,
  ctx: PricingContext,
): number {
  const pricer = ASSET_PRICERS[assetId];
  if (!pricer) return 0;
  const rawPrice = pricer(ctx);
  // Apply a floor using a per-asset minimum constant (Task 5)
  if (rawPrice <= 0) return 0;
  const minPrice = ASSET_MIN_PRICES[assetId] ?? 0;
  return Math.max(minPrice, rawPrice);
}

/* ── Aggregates + line items ───────────────────────────────────────── */

export type LineItem = {
  id: string;
  label: string;
  detail: string;
  price: number;
  isDroneInvolved: boolean;
};

export function lineItemsFor(ctx: PricingContext): LineItem[] {
  const assets = PROJECT_TYPES[ctx.type].assetOptions.filter((a) =>
    ctx.selectedAssetIds.includes(a.id),
  );
  return assets.map((a) => ({
    id: a.id,
    label: a.label,
    detail: a.detail,
    price: computeAssetPrice(a.id, ctx),
    isDroneInvolved: DRONE_INVOLVED_ASSETS.has(a.id),
  }));
}

export type QuoteTotals = {
  items: LineItem[];
  /** Customer-facing total. GST-EXCLUSIVE (= subtotal). */
  total: number;
  /** Informational GST amount — fine-print only, NEVER added. */
  gst: number;
  requiresDroneShoot: boolean;
};

export function totalFor(ctx: PricingContext): QuoteTotals {
  const items = lineItemsFor(ctx);
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const droneItems = items.filter((i) => i.isDroneInvolved);
  return {
    items,
    total: subtotal,
    gst,
    requiresDroneShoot: droneItems.length > 0,
  };
}

export function requiresDroneShoot(assetIds: string[]): boolean {
  return assetIds.some((id) => DRONE_INVOLVED_ASSETS.has(id));
}

/* ── Display formatting ────────────────────────────────────────────── */

export type DisplayStyle = 'lakh' | 'full';

export function formatINR(amount: number, style: DisplayStyle = 'lakh'): string {
  if (amount === 0) return '₹0';
  if (style === 'full') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    const txt = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1);
    return `₹${txt} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function quoteValidUntil(from: Date = new Date()): string {
  const until = new Date(from.getTime() + QUOTE_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  return until.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function assetsForType(typeId: ProjectTypeId): AssetOption[] {
  return PROJECT_TYPES[typeId].assetOptions;
}
