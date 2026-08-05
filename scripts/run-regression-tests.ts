import { totalFor, type PricingContext } from "../lib/quotePricing";

const ctx: PricingContext = {
  type: "high-rise",
  scale: {
    towers: 2,
    avgUnitsPerTower: 20, // 40 units total
    amenities: 6,
    plotAreaAcres: 1
  },
  selectedAssetIds: [
    "location-intelligence",
    "aerial-360-3d",
    "pdf-brochure",
    "showcase-video",
    "microsite",
    "3d-high-rise",
    "isometric-high-rise"
  ],
  subOptionsByAsset: {
    "location-intelligence": ["site-based", "google-maps", "drone-route"],
    "showcase-video": ["3d-walkthrough", "location-highlights", "3d-superimposition", "brand-credentials"]
  }
};

const totals = totalFor(ctx);
console.log("=== Baseline Regression Test ===");
console.log(`Towers: ${ctx.scale.towers}`);
console.log(`Units/Tower: ${ctx.scale.avgUnitsPerTower}`);
console.log(`Total units: ${(ctx.scale.towers ?? 0) * (ctx.scale.avgUnitsPerTower ?? 0)}`);
console.log(`Amenities: ${ctx.scale.amenities}`);
console.log(`Plot Area: ${ctx.scale.plotAreaAcres} acre\n`);

console.log("Line Items:");
totals.items.forEach(item => {
  console.log(` - ${item.id}: ₹${item.price.toLocaleString("en-IN")}`);
});

console.log(`\nSubtotal: ₹${totals.total.toLocaleString("en-IN")}`);
console.log(`GST: ₹${totals.gst.toLocaleString("en-IN")}`);

// Expected baseline range for 2 towers, 20 units/tower, 6 amenities, 1 acre
// Calibrated to align with baseline total of ~₹2,069,310 +/- 5% tolerance
const MIN_EXPECTED = 1950000;
const MAX_EXPECTED = 2150000;

console.log(`\nExpected Range: ₹${MIN_EXPECTED.toLocaleString("en-IN")} - ₹${MAX_EXPECTED.toLocaleString("en-IN")}`);

if (totals.total < MIN_EXPECTED || totals.total > MAX_EXPECTED) {
  console.error(`\nFAIL: Calculated total ₹${totals.total} is OUTSIDE expected range!`);
  process.exit(1);
} else {
  console.log("\nPASS: Total is within expected baseline range.");
  process.exit(0);
}
