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

export const PRICING_VERSION = 'v2-draft';
export const QUOTE_VALIDITY_DAYS = 30;
export const GST_RATE = 0.18;

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

/** Plot-count range options used by Plotted Land. Values are midpoints
 *  of the displayed range so pricing reflects "typical" project size. */
const PLOT_RANGE_OPTIONS = [
  { value: 25, label: '0–50' },
  { value: 125, label: '50–200' },
  { value: 300, label: '200–400' },
  { value: 500, label: '400–600' },
  { value: 800, label: '600+' },
];

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
      control: 'range',
      default: 300,
      options: PLOT_RANGE_OPTIONS,
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

// Location-intelligence variants — sub-option prices
const PRICE_LOC_INTEL = {
  'site-based': 75000,
  'google-maps': 40000,
  'drone-route': 60000,
};
const PRICE_LOC_CATCHMENT = {
  'site-based': 90000,
  'google-maps': 50000,
  'drone-route': 75000,
};
const PRICE_LOC_LOGISTICS = {
  'site-based': 95000,
  'google-maps': 55000,
  'drone-route': 80000,
};

// Showcase video — 3D superimposition / brand credentials base prices
const PRICE_SUPERIMPOSITION_BASE = 75000;
const PRICE_BRAND_CREDENTIALS_BASE = 50000;

// Microsite — % of other selected asset prices
const MICROSITE_PERCENT = 0.15;

// Showcase video — % of dependent assets when sub-option selected
const SHOWCASE_DEPENDENCY_PERCENT = 0.20;

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
  priceMap: Record<string, number>,
): number {
  const subs = ctx.subOptionsByAsset[assetId] ?? [];
  return subs.reduce((sum, sub) => sum + (priceMap[sub] ?? 0), 0);
}

// Common — superimposition cost = base + scale factor.
function superimpositionCost(ctx: PricingContext): number {
  const s = ctx.scale;
  const towers = s.towers ?? 0;
  const units = s.plots ?? s.villas ?? s.buildingUnits ?? 0;
  const area = s.plotAreaAcres ?? 0;
  return PRICE_SUPERIMPOSITION_BASE + towers * 50000 + units * 800 + area * 10000;
}

// Common — brand credentials cost = base + scale-derived factor.
function brandCredentialsCost(ctx: PricingContext): number {
  const s = ctx.scale;
  const scaleFactor =
    (s.towers ?? 0) +
    (s.buildingUnits ?? 0) +
    (s.villas ?? 0) +
    (s.plots ?? 0) / 10 +
    (s.plotAreaAcres ?? 0);
  return PRICE_BRAND_CREDENTIALS_BASE + Math.round(scaleFactor * 8000);
}

// Microsite — 15% of OTHER selected asset prices. Microsite-variants
// (microsite-leasing, microsite-ipc) share the formula but read their
// own id when filtering.
function micrositeFormula(
  ctx: PricingContext,
  selfId: string,
): number {
  const others = ctx.selectedAssetIds.filter((id) => id !== selfId);
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
    const area = (s.plotAreaAcres ?? 0) * 20000;
    const units =
      (s.towers ?? 0) * 25000 +
      (s.buildingUnits ?? 0) * 8000 +
      (s.villas ?? 0) * 4000 +
      (s.plots ?? 0) * 500;
    return Math.max(125000, 150000 + area + units);
  },

  // PDF brochures — modest base + amenity factor
  'pdf-brochure': (ctx) => 50000 + (ctx.scale.amenities ?? 0) * 5000,
  'pdf-leasing-kit': (ctx) =>
    75000 +
    (ctx.scale.buildingUnits ?? 0) * 5000 +
    (ctx.scale.amenities ?? 0) * 3000,
  'pdf-spec-sheet': (ctx) =>
    75000 +
    (ctx.scale.plotAreaAcres ?? 0) * 8000 +
    (ctx.scale.buildingUnits ?? 0) * 3000,

  // Showcase video — compound from sub-options
  'showcase-video': (ctx) => {
    const subs = ctx.subOptionsByAsset['showcase-video'] ?? [];
    let total = 0;
    if (subs.includes('3d-walkthrough')) {
      const threeDId = threeDSetIdFor(ctx.type);
      if (threeDId && ctx.selectedAssetIds.includes(threeDId)) {
        total += Math.round(computeAssetPrice(threeDId, ctx) * SHOWCASE_DEPENDENCY_PERCENT);
      }
    }
    if (subs.includes('location-highlights')) {
      const locId = locationAssetIdFor(ctx.type);
      if (locId && ctx.selectedAssetIds.includes(locId)) {
        total += Math.round(computeAssetPrice(locId, ctx) * SHOWCASE_DEPENDENCY_PERCENT);
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
    const area = (s.plotAreaAcres ?? 0) * 10000;
    const amenities = (s.amenities ?? 0) * 25000;
    if (ctx.type === 'villa-community') {
      return 200000 + (s.modelVillas ?? 0) * 100000 + amenities + area;
    }
    // plotted land
    return 200000 + (s.plots ?? 0) * 1000 + amenities + area;
  },
  '3d-high-rise': (ctx) => {
    const s = ctx.scale;
    return (
      100000 +
      (s.towers ?? 0) * 175000 +
      (s.amenities ?? 0) * 30000 +
      (s.plotAreaAcres ?? 0) * 8000
    );
  },
  '3d-commercial': (ctx) => {
    const s = ctx.scale;
    return (
      150000 +
      (s.buildingUnits ?? 0) * 60000 +
      (s.amenities ?? 0) * 35000 +
      (s.plotAreaAcres ?? 0) * 10000
    );
  },
  '3d-retail': (ctx) => {
    const s = ctx.scale;
    return (
      150000 +
      (s.buildingUnits ?? 0) * 50000 +
      (s.amenities ?? 0) * 30000 +
      (s.plotAreaAcres ?? 0) * 10000
    );
  },
  '3d-warehouse': (ctx) => {
    const s = ctx.scale;
    return (
      200000 +
      (s.plotAreaAcres ?? 0) * 25000 +
      (s.buildingUnits ?? 0) * 40000
    );
  },

  // Isometrics
  'isometric-high-rise': (ctx) => {
    const s = ctx.scale;
    return 50000 + (s.towers ?? 0) * 40000 + (s.amenities ?? 0) * 10000;
  },
  'isometric-fitout': (ctx) => {
    const s = ctx.scale;
    return 75000 + (s.buildingUnits ?? 0) * 20000;
  },
  'isometric-leasing': (ctx) => {
    const s = ctx.scale;
    return 50000 + (s.buildingUnits ?? 0) * 18000;
  },
  'isometric-warehouse': (ctx) => {
    const s = ctx.scale;
    return 75000 + (s.plotAreaAcres ?? 0) * 15000;
  },

  // Interactive Plotted Kit — by plots/villas count + amenities
  'interactive-plotted-kit': (ctx) => {
    const s = ctx.scale;
    const units = (s.plots ?? 0) + (s.villas ?? 0);
    return 150000 + units * 500 + (s.amenities ?? 0) * 10000;
  },
};

/** Compute a single asset's price under the given context. */
export function computeAssetPrice(
  assetId: string,
  ctx: PricingContext,
): number {
  const pricer = ASSET_PRICERS[assetId];
  return pricer ? pricer(ctx) : 0;
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
