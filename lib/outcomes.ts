/* ───────────────────────────────────────────────────────────────────────
   Outcomes — the data behind OutcomeWidgets (atlabs-style bento)
   ───────────────────────────────────────────────────────────────────────
   ⚠️  Every number below is a placeholder benchmark drawn from studio
   norms. Replace each with studio-confirmed values before going live.
   Tagged `// CONFIRM:` where attention is required.

   The OutcomeWidgets section's whole credibility rests on these being
   true — if a buyer pings a stat and we can't back it up, the section
   actively hurts. Treat this file as a contract.
   ─────────────────────────────────────────────────────────────────────── */

/* ── Widget 1: India network map ───────────────────────────────────── */

export type LaunchCity = {
  name: string;
  /** Normalized coordinates inside the widget's 100×120 viewBox.
   *  Roughly matches relative position of the city on the Indian peninsula.
   *  x: 0 (far west) → 100 (far east)
   *  y: 0 (north)    → 120 (south)
   */
  x: number;
  y: number;
  /** Affects pulse priority — higher = more important to highlight. */
  weight?: 1 | 2 | 3;
};

// CONFIRM: actual cities where Build91 has shipped launches in the past
// 12 months. Coordinates are approximate (used only for SVG dot layout,
// not real geocoding) — adjust by eye until the constellation feels
// recognisably "Indian".
export const LAUNCH_CITIES: LaunchCity[] = [
  { name: 'Delhi NCR', x: 48, y: 28, weight: 3 },
  { name: 'Jaipur', x: 40, y: 38, weight: 1 },
  { name: 'Ahmedabad', x: 30, y: 48, weight: 2 },
  { name: 'Mumbai', x: 28, y: 60, weight: 3 },
  { name: 'Pune', x: 35, y: 64, weight: 2 },
  { name: 'Raipur', x: 60, y: 60, weight: 3 },
  { name: 'Hyderabad', x: 48, y: 72, weight: 3 },
  { name: 'Bengaluru', x: 42, y: 88, weight: 3 },
  { name: 'Chennai', x: 56, y: 92, weight: 2 },
  { name: 'Kochi', x: 38, y: 102, weight: 1 },
  { name: 'Kolkata', x: 74, y: 52, weight: 2 },
  { name: 'Lucknow', x: 56, y: 38, weight: 1 },
];

/* ── Widget 2: Countdown bar — launch-to-live sprint ────────────── */

// CONFIRM: studio's actual benchmark for a full asset brief → microsite-live
// turnaround on a launch package. The bar visualises a Day 0 → Day N walk,
// stepping through the micro-milestones listed below.
export const AVG_LAUNCH_DAYS = 30;

export type LaunchMilestone = {
  /** Day in the sprint when this micro-milestone fires. */
  day: number;
  /** Short label rendered as the bar's animated subtitle. */
  label: string;
};

// CONFIRM: rename or re-pace any milestone whose copy or day-position the
// studio wants to phrase differently. Renderer picks the milestone with
// the largest `day` <= the current Day-N, so gaps stay on the previous
// milestone until the next one fires.
export const LAUNCH_MILESTONES: ReadonlyArray<LaunchMilestone> = [
  { day: 0, label: 'Brief & Planning' },
  { day: 1, label: 'CAD Setup' },
  { day: 3, label: 'Drone Shoot' },
  { day: 5, label: 'Footage Edit' },
  { day: 7, label: 'Plot Mapping' },
  { day: 9, label: '3D Modeling' },
  { day: 13, label: 'Amenity Animation' },
  { day: 15, label: 'Route Intelligence' },
  { day: 17, label: 'Aerial Compositing' },
  { day: 19, label: 'Walkthrough Build' },
  { day: 21, label: '3D Superimposition' },
  { day: 24, label: 'Master Edit' },
  { day: 26, label: 'QA Review' },
  { day: 28, label: 'Feedback Fixes' },
  { day: 30, label: 'Final Delivery' },
];

/* ── Widget 3: Bookings supported (count-up) ────────────────────── */

// CONFIRM: aggregate booking value backed by Build91-built creative
// in the last 12-18 months. Quoted in ₹ crore.
export const BOOKINGS_SUPPORTED_CR = 500;

/* ── Widget 4: Asset attribution — "What gets buyers to walk in" ──── */

export type AssetAttribution = {
  /** Public-facing label shown in the legend and aria description. */
  label: string;
  /** Percentage points (the 7 values MUST sum to 100 — renderer assumes it). */
  value: number;
  /** Hex colour for the bar segment + legend dot. */
  color: string;
};

// CONFIRM: every percentage below is a top-heavy Pareto placeholder
// derived from studio intuition, ORDERED PER STUDIO DIRECTION (interactive
// at the top, brochure at the tail). Replace with measured attribution
// once microsite analytics has 6-12 weeks of clean data.
//
// Methodology note when published with real numbers:
//   "First-meaningful-engagement attributed to the asset most-clicked /
//    longest-viewed during the buyer's first session, mapped to the
//    booking event that followed within 30 days. Sample: 120+ launches."
//
// Sum must equal 100 (renderer asserts this in dev mode).
export const WALK_IN_ATTRIBUTION: AssetAttribution[] = [
  { label: 'Interactive Digital Experience', value: 30, color: '#E0B872' }, // gold
  { label: 'Location Intelligence',          value: 19, color: '#F3D690' }, // gold-soft
  { label: 'Aerial 360',                     value: 15, color: '#7C3AED' }, // violet-glow
  { label: 'Project Showcase',               value: 12, color: '#A78BFA' }, // violet-soft
  { label: '3D Walkthrough',                 value: 10, color: '#5B21B6' }, // violet-deep
  { label: 'Virtual Tours',                  value: 8,  color: '#6B7FCC' }, // cool blue (new accent)
  { label: 'Digital Brochure',               value: 6,  color: '#3E3A5C' }, // muted gray-violet (tail)
];

/** Sample-size strap rendered under the legend ("Across X we've measured"). */
export const WALK_IN_SAMPLE_SIZE = '120+ launches';

/* ── Widget 5: Live ticker — currently in flight ─────────────────── */

// CONFIRM: rotate to reflect what's actually in production this month.
// 5-7 short status lines work best. Keep under ~64 characters each.
export const LIVE_TICKER_STATUS: string[] = [
  '3 microsites in production this week',
  '2 aerial shoots scheduled across South India',
  '5 walkthroughs in the render farm',
  'New launch microsite went live — Bengaluru',
  '1 brand film in colour grade',
  '4 plotted-township kits in storyboard',
];
