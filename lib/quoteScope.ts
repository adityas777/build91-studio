import {
  PROJECT_TYPES,
  STAGES,
  type AssetOption,
  type ProjectTypeId,
  type StageId,
} from './solutionsBundles';
import { type ScaleInputs, summarizeScale } from './quotePricing';

/* ───────────────────────────────────────────────────────────────────────
   Quote scope (timeline + scope-preview helpers)
   ───────────────────────────────────────────────────────────────────────
   Pure functions only. Generates the recommended production timeline
   and the scope-preview phrasing used in the email body.

   No pricing. All money lives in `lib/quotePricing.ts`.
   ─────────────────────────────────────────────────────────────────────── */

/* ── Timeline recommendation ───────────────────────────────────────── */

/** "Heavy" bundle/project flag — drives slightly longer timeline ranges. */
function isHeavyProject(
  type: ProjectTypeId,
  scale: ScaleInputs,
  assetCount: number,
): boolean {
  if (assetCount >= 6) return true;
  switch (type) {
    case 'high-rise':
      return (
        (scale.towers ?? 0) >= 3 ||
        (scale.avgUnitsPerTower ?? 0) * (scale.towers ?? 0) >= 200
      );
    case 'plotted':
      return (scale.plots ?? 0) >= 200 || (scale.plotAreaAcres ?? 0) >= 10;
    case 'villa-community':
      return (scale.villas ?? 0) >= 100 || (scale.modelVillas ?? 0) >= 4;
    case 'commercial':
    case 'retail':
      return (
        (scale.buildingUnits ?? 0) >= 200 ||
        (scale.plotAreaAcres ?? 0) >= 5
      );
    case 'warehousing':
      return (
        (scale.buildingUnits ?? 0) >= 20 ||
        (scale.plotAreaAcres ?? 0) >= 10
      );
  }
}

/** Production timeline range given stage + project-shape signals. */
export function recommendTimeline(input: {
  type: ProjectTypeId;
  stage: StageId;
  scale: ScaleInputs;
  assetCount: number;
}): string {
  const heavier = isHeavyProject(input.type, input.scale, input.assetCount);
  switch (input.stage) {
    case 'pre-launch':
      return heavier ? '6–8 weeks' : '4–6 weeks';
    case 'launch':
      return heavier ? '5–7 weeks' : '4–5 weeks';
    case 'sustenance':
      return 'Ongoing monthly cadence';
    case 'possession':
      return heavier ? '5–7 weeks' : '4–6 weeks';
    case 'resale':
      return heavier ? '4–5 weeks' : '3–4 weeks';
  }
}

/* ── Scope preview (phrasing only) ──────────────────────────────────── */

export type ScopePreview = {
  intro: string;
  assets: AssetOption[];
  timeline: string;
  closing: string;
};

export function generateScopePreview(input: {
  type: ProjectTypeId;
  stage: StageId;
  scale: ScaleInputs;
  selectedAssetIds: string[];
}): ScopePreview {
  const { type, stage, scale, selectedAssetIds } = input;
  const projectType = PROJECT_TYPES[type];
  const stageBundle = STAGES[stage];

  const assets = projectType.assetOptions.filter((opt) =>
    selectedAssetIds.includes(opt.id),
  );

  const scaleClause = summarizeScale(type, scale);
  const intro = `Based on a ${stageBundle.label.toLowerCase()} ${typeNounFor(type)} (${scaleClause}), here's what we'd build:`;

  const timeline = recommendTimeline({
    type,
    stage,
    scale,
    assetCount: assets.length,
  });

  const closing =
    "We'll send a tailored proposal within 24 hours — sequencing and milestones included.";

  return { intro, assets, timeline, closing };
}

function typeNounFor(type: ProjectTypeId): string {
  switch (type) {
    case 'high-rise':
      return 'high-rise';
    case 'plotted':
      return 'plotted layout';
    case 'villa-community':
      return 'villa community';
    case 'commercial':
      return 'commercial project';
    case 'retail':
      return 'retail project';
    case 'warehousing':
      return 'warehousing / logistics asset';
  }
}
