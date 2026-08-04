# Build91 Studio — v2 Content Roadmap

Implementation checklist for the 9 content initiatives chosen for the v2 branch.
Source: real-estate marketing audit + senior-UX placement plan, May 2026.
Updated: atlabs.ai-inspired patterns added (Asset Reel, Outcome Widgets).

> **Philosophy:** the current v2 site is 80% poetry, 20% proof. These
> initiatives flip the ratio. Each lives in a clearly chosen slot of the
> existing IA — only Journal and the Quote tool earn standalone routes.

---

## Proposed v2.1 Information Architecture

```
/                  → home + 6 new sections (TrustStrip, ClientLogoWall,
                     SolutionsRouter, FeaturedCaseStudies,
                     StudioBehindTheWork, JournalStrip)
/services          → + Solutions routing interstitial
/work              → + 3 case-study detail pages
/work/[slug]       ← NEW
/about             → + Compliance block + dual-hub narrative + named leaders
/contact           → unchanged
/quote             ← NEW (gated wizard, no public pricing)
/journal           ← NEW
/journal/[slug]    ← NEW
```

## Proposed home-page section order (final)

1. VideoHero
2. **AssetReel** *(new — atlabs-inspired video carousel)*
3. StatsBar
4. **TrustStrip** *(new — shipped Phase 1)*
5. **ClientLogoWall** *(new — shipped Phase 1)*
6. ScrollPinReveal · Services
7. **SolutionsRouter** *(new — shipped Phase 1)*
8. BentoPortfolio
9. **FeaturedCaseStudies** *(new)*
10. ScrollPinReveal · Process *(⚠️ **temporarily commented out** — see note below)*
11. GlobalPresence
12. **StudioBehindTheWork** *(new)*
13. Testimonials
14. **OutcomeWidgets** *(new — atlabs-inspired animated bento)*
15. **JournalStrip** *(new)*
16. **QuoteToolPromo** *(new, slim)*
17. CtaSplit

### ⚠️ ScrollPinReveal · Process — temporarily removed

With AssetReel (Phase 5) sitting at position #2 and OutcomeWidgets at #14,
the home page now carries two motion-heavy showcase moments. Keeping the
4-slide Process pinned scroll-reveal at position #10 between them made the
middle of the page feel like one long pinned-scroll sequence — visual
overkill. We removed it in the Phase 5 polish pass.

The Services pinned scroll-reveal at #6 stays — it carries the
"what we make" message that nothing else on the page substitutes for.

**To restore later** (once Case Studies + StudioBehindTheWork land and
the middle of the page has more textural variety to absorb it):

1. In `app/page.tsx`, uncomment the `PROCESS_SLIDES` constant block near
   the top of the file.
2. Uncomment the `<ScrollPinReveal id="process" ...>` JSX block between
   `<BentoPortfolio />` and the Global Presence `<section>`.
3. Bump the section-order comment back to include position #10.

No other code changes needed. Asset paths in the slides already follow
the `/video/proc-*.mp4` convention; swap-in is content-only.

### Pacing note — the post-Process zoom

The block from #9 → #12 is a deliberate **zoom from cinematic → planet → people → voices**:

- **#9 Process** — cinematic, abstract system
- **#10 GlobalPresence** — macro, cosmic, "where our clients & studios sit on Earth"
- **#11 StudioBehindTheWork** — human, warm, "who works here, why two cities, what gear"
- **#12 Testimonials** — first-person voices from the people we built for

This means **GlobalPresence and StudioBehindTheWork must not duplicate each other**:

- GlobalPresence answers **where** (Raipur as Studio, Bengaluru as Sales, clients across India / UAE / Australia)
- StudioBehindTheWork answers **why two cities** (metro craft × Tier-2 economics narrative) and **who** (named leaders, gear, day-in-the-studio)

When building StudioBehindTheWork, deliberately **skip the geography map** — GlobalPresence already owns that visual language. Lean into faces, gear, and the dual-hub *story*.

---

## Execution phases

- **Phase 1 — Trust & Routing:** ClientLogoWall, TrustStrip, SolutionsRouter *(✅ shipped)*
- **Phase 2 — Quote Engine:** QuoteWizard + URL-param handoff from SolutionsRouter *(✅ shipped — minus Slack webhook, awaiting key)*
- **Phase 2.5 — Pricing in the Quote Tool:** `lib/quotePricing.ts` source-of-truth + live on-screen quote + email pricing receipt *(✅ shipped — placeholder rates pending studio sign-off)*
- **Phase 3 — Proof & Story:** Case Studies, StudioBehindTheWork + About deepening
- **Phase 4 — SEO Engine:** Journal infra + first 3 posts
- **Phase 5 — Showcase polish (atlabs-inspired):** AssetReel below hero, OutcomeWidgets below testimonials *(✅ scaffolding shipped — placeholder video reuses `intro-reel-web.mp4`, OutcomeWidgets numbers are studio-norm placeholders awaiting confirmed values; both swap-in are content-only, no component changes needed)*
- **Phase 6 — Live trust signal:** Google rating merged INTO StatsBar as a 3rd cell *(✅ shipped — originally a standalone band at #2, restructured per studio direction to consolidate credentials into one strip; StatsBar now reads `4.9 ★ | 300+ | 120+` for Google Rating / Projects Delivered / Clients Served. Rating cell is clickable, links to Maps listing.)*
- **Phase 7 — Selected Work via Instagram Graph API:** Replace BentoPortfolio (self-hosted MP4 strip) with `<SelectedWork />` — 8-tile grid of latest reels pulled live from `graph.instagram.com`, 4h ISR cache, click-to-lightbox playback. Token stored in Vercel KV + auto-rotated weekly by `/api/cron/refresh-instagram-token` *(✅ shipped — pending: studio drops 6 fallback reels into `/public/reels-fallback/`, rotates the chat-exposed token in Meta dashboard, provisions Vercel KV store, sets `CRON_SECRET`. See `lib/instagram.ts` for the full design rationale.)*

---

# Initiatives

## 1. Client Logo Wall (segmented)

**Placement**

- Home: between `StatsBar` and Services scroll-pin
- About: denser variant inside Story section

**Checklist**

- [x] Collect logos: 11 logos copied from `1Studio Team/Marketing/Portfolio/RealEstate/Partner Logos`
- [ ] Define 4 segments: Grade-A Developers · Plotted & Township · Boutique Builders & Architects · Channel Partners *(deferred — v1 ships as single "Developers & Partners" segment; `lib/clients.ts` data model supports sharding when names are confirmed)*
- [ ] Optimise logos: SVG preferred, 120×60 viewbox, monochrome white version + brand-color version *(deferred — PNGs in use; revisit when client supplies SVGs)*
- [x] Decide grayscale-default / color-on-hover OR autoplay color sweep → **grayscale + 55% opacity at rest, full-color on hover**
- [x] Component: `components/ClientLogoWall.tsx`
- [x] Asset folder: `/public/images/clients/`
- [x] Mobile pattern: marquee with edge-fade masks (auto-fallback to grid under `prefers-reduced-motion`)
- [x] Desktop pattern: 5-col grid (2/3/4/5 responsive)
- [x] Wire into `app/page.tsx` (home position #4)
- [ ] Wire compact variant into `app/about/page.tsx` *(deferred to Phase 3 with About-page rewrite)*
- [x] Accessibility: each logo has `alt` = client name; marquee respects `prefers-reduced-motion`
- [ ] **TODO — rename `partner-01..09` in `lib/clients.ts` with real client names for SEO/a11y**

---

## 2. TrustStrip — RERA & Compliance

**Placement**

- Home: immediately after `StatsBar` (position #3)
- About: deeper "Compliance" section between Story and Team

**Checklist**

- [x] Draft 4 trust pills (icon + 1-line headline + sub-line):
  - [x] **RERA-Ready** · Every asset ships compliant
  - [x] **DGCA-Certified** · Licensed drone capture
  - [x] **In-House Studio** · Your IP stays in India
  - [x] **NDA Standard** · Pre-launch stays sealed
- [x] Component: `components/TrustStrip.tsx` — slim, 2×2 on mobile, 1×4 on desktop, subtle stagger-in
- [ ] About deep block: explainer paragraph + RERA-state quirks table (Maha/K/T/CGRERA) + sample disclaimer overlay screenshot *(deferred to Phase 3)*
- [ ] Asset: sample artistic-impression render with overlay (`/public/images/compliance/sample-disclaimer.jpg`) *(deferred — needs design pass)*
- [x] Deep-link target: each pill points to `/about#compliance` (anchor block built in Phase 3)
- [x] Wire into `app/page.tsx` (home position #3)
- [ ] Wire into `app/about/page.tsx` (between Story and Team) *(deferred to Phase 3 About rewrite)*

---

## 3. SolutionsRouter — "I'm launching a…" / "We're in [stage]…"

**Placement**

- Home: between Services scroll-pin and BentoPortfolio (position #6)
- Services page: interstitial below hero, above the 5 pillars

**Checklist**

- [x] Define **6** project types (per user confirm, trimmed from 8): High-Rise Apartments · Plotted Land · Villa Community · Commercial · Retail · Warehousing/Logistics
- [x] Define 5 stages: Pre-Launch Teaser · Launch · Sustenance · Possession/Handover · Resale
- [x] Map each chip → recommended bundle (asset list) — see `lib/solutionsBundles.ts`
- [ ] Add one example thumbnail per chip *(deferred — needs portfolio shot per type/stage; placeholder icons in use)*
- [x] Map each chip → CTA URL: `/quote?type={type}` or `/quote?stage={stage}` via `quoteHref()` helper
- [x] Component: `components/SolutionsRouter.tsx`
  - [x] Tabbed (Type / Stage) segmented control, chip-based, no wizard feel
  - [x] Expanded card per chip: bundle list, blurb, primary + secondary CTA
  - [x] Mobile: chips wrap onto multiple lines; expanded card slides under
- [x] Data: `lib/solutionsBundles.ts` — chip → bundle mapping (shared with Phase-2 Quote engine)
- [x] Wire into `app/page.tsx` (home position #6, after Services scroll-pin)
- [x] Wire into `app/services/page.tsx` (interstitial, below hero)
- [ ] Analytics: track which chip is clicked most → input for sales *(deferred — wire after analytics provider chosen)*

---

## 4. Quote Tool (`/quote`) — gated wizard, no public pricing

**Placement**

- New route: `/quote`
- Entry points:
  - Nav secondary CTA on desktop ("Get a Quote") next to "Let's Talk"
  - Home `QuoteToolPromo` band (position #13)
  - All SolutionsRouter chip CTAs deep-link here with pre-fill
  - WhatsApp float gets a "Get a Custom Quote" prompt on mobile after 30s scroll

**Wizard flow (single page, 5 steps, progress dots)** — shipped Phase 2

- [x] Step 1: Project type (6 cards, single-select — matches confirmed list: High-Rise · Plotted · Villa Community · Commercial · Retail · Warehousing). **Auto-advances** on selection.
- [x] Step 2: Project stage (5 cards, single-select). **Auto-advances** on selection.
- [x] Step 3: **Asset selection is now TYPE-AWARE** — each project type has its own 7-asset menu (per user spec). All pre-checked by default; user unchecks what they don't want. Multi-select → keeps explicit Continue button.
- [x] Step 4: Project scale (5 options, single-select). **Auto-advances** on selection.
- [x] Step 5: Contact (name, role, company, phone/WhatsApp, email) + optional **Project details** sub-section (project name, address/Maps link, CAD URL). Launch-window question REMOVED — already captured by Stage in Step 2.

**Per-type asset menus (the user-dictated spec, codified in `lib/solutionsBundles.ts`):**

- [x] **Plotted Land + Villa Community** (shared `LAND_ASSETS`): Interactive Plotted Development Kit · Location Intelligence · 3D for Amenities/Exteriors/Villa Homes · Aerial 360° w/ 3D Superimposition · PDF Brochure · Project Showcase Video · Project Microsite
- [x] **High-Rise Apartments** (`HIGH_RISE_ASSETS`): Location Intelligence · Isometric Views · 3D for Elevation/Amenities/Exteriors/2-4 Units · Aerial 360° w/ 3D · PDF Brochure · Showcase Video · Microsite
- [x] **Commercial** (`COMMERCIAL_ASSETS`): Location Intelligence · Isometric + Fit-out Scenarios · 3D for Elevation-Facade/Lobby-Atrium · Aerial 360° w/ 3D · PDF Brochure · Showcase Video · Microsite
- [x] **Retail** (`RETAIL_ASSETS` — own variant): Location Intelligence w/ Catchment · Isometric Leasing Plan · 3D for Facade/Atrium/Food-Court/Anchor · Aerial 360° w/ 3D · PDF Leasing Kit · Showcase Video · Leasing Microsite
- [x] **Warehousing/Logistics** (`WAREHOUSING_ASSETS` — own variant): Location Intelligence w/ Highways/Ports/ICDs · Isometric Site-Plan w/ Engineering Callouts · 3D for Facade/Dock Yard/Mezzanine/Office Block · Aerial 360° w/ 3D · PDF Spec Sheet · Showcase Video · IPC/Leasing Microsite

**Outcome screen — the magic moment** — shipped (simplified per QC)

- [x] **Stripped-down thank-you** — no repeated scope/asset/timeline display; user already saw all of that during the wizard. Just a confirmation badge, a personal "Thanks, {firstName}." headline, a one-line reassurance, two CTAs, and an email-sent confirmation footer.
- [x] Primary CTA: **"Book a 15-min demo"** → `https://calendar.app.google/kNy2VxLrEwPi9zMz5` (Google Calendar booking link, opens in new tab)
- [x] Secondary CTA: "Continue on WhatsApp" — wa.me prefilled with project type + lead name
- [x] **Email-to-studio integration** — Resend wired in `app/api/quote/route.ts`. Sends formatted HTML + plain-text email to `amitmathur@gmail.com` (overridable via `QUOTE_TO_EMAIL`) when `RESEND_API_KEY` is set. Email body includes project type, stage, scale, asset list, recommended timeline, contact details, optional project metadata. Graceful fallback: without the key, the wizard still succeeds and the submission is console-logged.
- [ ] Studio Slack/WhatsApp notification on every submit *(deferred — needs webhook URL)*
- [ ] Auto-reply email back to the lead *(deferred — same Resend integration can do this in ~10 LOC when needed)*

**Components & files** — shipped

- [x] `app/quote/page.tsx` — hero band + wizard mount, reads URL params for pre-fill (Next 15 async `searchParams` API)
- [x] `components/QuoteWizard.tsx` — single client component with useReducer state machine. Prefill computed at **`useReducer` init time** (NOT via `useEffect`) so Strict-Mode double-invocation can't race the dispatches. Includes debounced auto-advance helper.
- [x] `components/QuoteScopePreview.tsx` — simplified thank-you screen (no scope/asset list, just confirmation + CTAs)
- [x] `components/QuoteToolPromo.tsx` — slim conversion band on home (between Testimonials and CtaSplit)
- [x] `components/MobileInfoTooltip.tsx` — **NEW reusable popover tooltip**. Floating, absolutely-positioned, animated, dismisses on outside-tap / Escape / second-tap. Used across QuoteWizard (StepHeading, SelectableCard, AssetCard) AND SolutionsRouter BundleCard for uniform mobile UX. Replaces the earlier inline-accordion pattern that disturbed page alignment.
- [x] `lib/quoteScope.ts` — pure functions: `generateScopePreview()`, `recommendTimeline()`. Timeline matrix now keyed on **stage** (not the removed launch-window).
- [x] `lib/solutionsBundles.ts` — discriminated union `Bundle = ProjectTypeBundle | StageBundle`; project types carry structured `assetOptions: AssetOption[]`; added `projectTypeFromParam()` / `stageFromParam()` helpers for URL-param resolution.
- [x] `app/api/quote/route.ts` — POST handler with type-guarded payload validation (`ValidatedQuote` narrowing), structured logging, Resend email integration with graceful fallback, escaped HTML email body.
- [x] `.env.example` — documents `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `RESEND_FROM` with usage notes
- [x] `scripts/clean-client-logos.mjs` — already present from Phase 1; unrelated but still on disk for future logo additions

**UX rules**

- [x] No price visible anywhere — enforced by `lib/quoteScope.ts` which has no price math at all
- [x] First 4 steps are commitment-free; contact ask is step 5 (unlock pattern)
- [x] URL params `?type=&stage=` pre-fill steps so SolutionsRouter handoff skips already-known steps
- [x] **Single** progress indicator — dot progress bar with active-step label (the original "Step X of 5" eyebrow inside each step header was REMOVED per QC)
- [x] Back button preserves all state (reducer-held, no URL-hash needed)
- [x] Step transitions use framer-motion `AnimatePresence`, consistent at all breakpoints
- [x] **Scroll-reset on step change** — wizard scrolls to its own top on each forward/back nav. Skips first render so mount doesn't jump.
- [x] **Auto-advance on single-select steps** (Type, Stage, Scale). ~220ms delay so the user sees the violet selection-highlight register before the transition. Debounced via timer ref — rapid taps can't double-skip. Timer cleaned up on unmount.
- [x] **Mobile sub-text uses a real popover tooltip**, not inline expansion — `MobileInfoTooltip` floats above the ⓘ trigger with a down-arrow, dismisses on outside-tap / Escape, never disturbs surrounding card alignment. Applied uniformly: StepHeading, SelectableCard, AssetCard, SolutionsRouter BundleCard items. Desktop keeps sub-text inline as before.
- [x] **Tooltip-trigger alignment fix** — switched all rows containing the ⓘ from `items-center` to `items-start` + `shrink-0` on the icon. ⓘ now anchors to the title's top line regardless of label wrapping (was floating mid-wrap on long labels like "3D Set — Elevation, Amenities, Exteriors, 2-4 Units").
- [x] **Confidentiality reassurance** at top of step 5 — violet-tinted card with `ShieldCheck` icon and one-line NDA-standard copy.
- [x] **Project details collapsed by default** in step 5 — toggle button reveals project name / location / CAD-link fields. Auto-expands if any field already has content (back-nav case). Keeps mobile crisp.
- [x] **Required-field hint** — "Still needed: Email · Phone …" appears under the disabled "Get my proposal" button, listing exactly what's missing. No more silent dead-end on the submit button.

**Wiring**

- [x] Add `Get a Quote` secondary button to `Navigation.tsx` (desktop pill next to "Let's Talk"; mobile drawer above it)
- [x] Add `QuoteToolPromo` band to `app/page.tsx` (between Testimonials and CtaSplit, position #14 in current order, #16 in target order)
- [x] `SolutionsRouter` chip CTAs use `quoteHref()` → already deep-link to `/quote?type=...&stage=...`
- [ ] Update `WhatsAppFloat.tsx` to surface quote prompt after scroll threshold *(deferred — small follow-up)*

**Phase 2 follow-ups (small, do when ready)**

- [x] ~~Replace `/contact` link on the outcome screen's primary CTA with a Calendly/Cal.com 15-min booking URL~~ → done: now points to `https://calendar.app.google/kNy2VxLrEwPi9zMz5`
- [x] ~~Set up Resend and wire `/api/quote` to email the studio~~ → done: integration shipped, **needs `RESEND_API_KEY` in `.env.local` to actually deliver** (until then, every submission console-logs cleanly and the wizard succeeds)
- [ ] Auto-reply email back to the lead (same Resend integration, ~10 LOC)
- [ ] Set up Slack/Discord/WhatsApp webhook for instant studio notification on every submit
- [ ] Add Plausible / GA4 event tracking on wizard-step advance, asset toggle, submit success
- [ ] Rate-limit `/api/quote` (Upstash Redis or middleware) — important before publicising the form
- [ ] Verify a real sender domain in Resend (`quote@build91.in`) instead of the `onboarding@resend.dev` sandbox so emails don't end up in Promotions
- [ ] Update `WhatsAppFloat.tsx` to surface a quote prompt after scroll threshold (originally planned, still deferred)

**Phase 2 polish iterations (post-MVP QC fixes)**

The Quote Engine landed as MVP in the first pass and then went through three rounds of QC + fixes. Tracked here for institutional memory.

- **Round 1 (9-point QC)** — mobile sub-text behind ⓘ pattern, scroll-reset between steps, consolidated to single step indicator (removed redundant "Step X of 5" eyebrow), crisp mobile project-details (collapsible), removed duplicate launch-window question, added confidentiality disclaimer, wired Resend email integration, simplified thank-you screen, swapped scope-call CTA for Calendly 15-min demo link.
- **Round 2 (alignment + tooltip)** — built `MobileInfoTooltip` as a real floating popover (was inline accordion that disturbed alignment). Applied to all 4 trigger sites including SolutionsRouter on home. Fixed icon-position misalignment under wrapping titles by switching to `items-start` + `shrink-0`.
- **Round 3 (auto-advance + prefill bug)** — single-select steps (Type, Stage, Scale) now auto-advance ~220ms after selection (debounced). Prefill logic moved from `useEffect`-with-dispatches to `useReducer` init-time computation, eliminating a Strict-Mode race that could silently land users on the wrong step and block the submit button.

---

## 4.5 Pricing in the Quote Tool — Phase 2.5

**Strategic shift.** Phase 2 originally shipped with a "no on-screen pricing — proposal in 24h" model. Phase 2.5 evolved through several rounds to its current shape:

> **Pricing is revealed exactly once — on the outcome screen, AFTER the user has submitted contact + project info.** No per-step price ticking, no per-asset price chips, no quote summary before the reveal. The wizard becomes a scope-building flow whose reward is the quote.

Client-facing terminology: **"Quote"** (never "estimate").

**The pricing engine is formula-based, not tier-based.** Each project type has its own scale schema (towers, plots, villas, plot area, etc.); each asset has a pricer function that reads from the scale + other selections. Three assets carry compound pricing rules:
- **Showcase Video** → sub-options compound from 3D Set (+20% if selected), Location Intel (+20% if selected), 3D superimposition (formula on scale), brand credentials (formula on scale)
- **Microsite (all variants)** → 15% of OTHER selected asset prices
- **Interactive Plotted Kit** → base + (plots × per-plot) + (amenities × per-amenity)
- **Location Intelligence (all 3 variants)** → multi-select sub-options: site-based / Google Maps / drone-route — each with its own base rate

**Hard constants** (codified in `lib/quotePricing.ts`):

- [x] **Effective date is current** — not hardcoded. `effectiveDate()` returns `new Date()`-derived ISO string so every quote snapshot reflects when it was generated.
- [x] **`PRICING_VERSION = 'v2-draft'`** — bumped from v1 because the engine architecture changed (formula-based)
- [x] One-time pricing — no stage adjustments, no recurring / sustenance retainer pricing
- [x] **GST exclusive** — customer-facing total is GST-exclusive. GST appears ONLY as fine print: *"* Quotes are exclusive of GST (18%)"*. `total === subtotal` in the engine.
- [x] **Only the total** is shown to customers. Per-line prices are kept internal (studio email only)
- [x] Drone shoot mentioned **exactly once** — on the outcome screen with the final quote. No drone notes on individual asset cards or sticky bars
- [x] Quote validity: 30 days from submission
- [x] Currency: INR only; international support out of scope
- [x] Display format: `₹2.5 L` primary + full INR `₹2,50,000` in `title` tooltip
- [x] Drone-involved assets are FULLY priced — the addendum is for the drone CAPTURE itself (video + images), billed by location

**Scale model — type-specific** (replaces the old `ScaleId` enum):

| Type | Field | Control | Default | Step |
|---|---|---|---|---|
| **High-Rise** | Number of towers | Stepper | 2 | 1 |
| | Avg units per tower | Stepper | 20 | 5 |
| | Amenities count | Stepper | 6 | 1 |
| | Total plot area (acres) | Stepper | 1 | 0.5 |
| **Plotted Land** | Total plot area (acres) | Stepper | 20 | 1 |
| | Total no. of plots | **Range chip** | 200–400 (300 mid) | — |
| | Amenities count | Stepper | 6 | 1 |
| **Villa Community** | Total plot area (acres) | Stepper | 20 | 1 |
| | Total villas | Stepper | 50 | 10 |
| | Amenities count | Stepper | 6 | 1 |
| | Model villa typologies | Stepper | 3 | 1 |
| **Commercial** | Total plot area (acres) | Stepper | 2 | 0.5 |
| | Total building units | Stepper | 10 | 1 |
| | Amenities count | Stepper | 6 | 1 |
| **Retail** | Total plot area (acres) | Stepper | 2 | 0.5 |
| | Total building units | Stepper | 20 | 5 |
| | Amenities count | Stepper | 6 | 1 |
| **Warehousing** | Total plot area (acres) | Stepper | 20 | 1 |
| | Total building units | Stepper | 4 | 1 |

- [x] Plots field is a **range chip select** (0–50 · 50–200 · 200–400 · 400–600 · 600+) — midpoint values fed to the pricing engine
- [x] Every other field is a **+/- stepper** with a sensible default — user can advance to Continue without typing
- [x] `SCALE_FIELDS_BY_TYPE` config in `lib/quotePricing.ts` drives both the wizard's Scale-step form and the validators
- [x] `defaultScaleInputsFor(type)` helper pre-fills the form when type is set (or changed via back-nav)
- [x] Scale step is a **form**, not a single-select (so auto-advance no longer fires on this step — only on Type and Stage)

**Sub-options inside assets** (multi-select within an asset card):

- [x] **Location Intelligence** (and `location-catchment`, `location-logistics`): site-based highlights · Google Maps highlights · drone video route highlight. Each has its own price; total = sum of selected
- [x] **Showcase Video**: 3D walkthrough · location highlights · 3D superimposition · brand credentials. Compound pricing per spec:
  - `3D walkthrough` → +20% of 3D Set price (when 3D Set selected, else 0)
  - `Location highlights` → +20% of Location Intelligence price (when selected, else 0)
  - `3D superimposition` → formula(scale): base + tower/unit/area factor. **Only available inside Showcase Video** — the aerial-360 asset is now simply "Aerial 360°" (renamed).
  - `Brand credentials` → formula(scale): base + scale-derived factor
- [x] UI: sub-options appear inline under the asset card when the asset is selected, auto-pre-checked on toggle-on, hidden on toggle-off. Card border turns red if a sub-option-bearing asset has no sub-options selected — Continue is blocked until ≥1 is picked.
- [x] **Cross-asset dependency cascade**: when a dependent parent asset is toggled off, its sub-option inside another asset is auto-cleared AND the chip is **visually disabled** (gray, no click, native title hint *"Select the required parent asset above to enable this option"*). Restoring the parent re-enables and re-checks the sub-option. Driven by `CASCADE_RULES` in `QuoteWizard.tsx` — one entry per dependency for easy extension.
  - 3D Set off → Showcase Video's "3D walkthrough" disabled
  - Location Intelligence (variant) off → Showcase Video's "Location highlights" disabled

**Step-order change in wizard**

- [x] Scale moved BEFORE Assets so live pricing is available the moment user enters Assets step
- Final order: Type → Stage → **Scale** → Assets → Contact
- Auto-advance fires on Type, Stage, Scale (no behavior change to Assets/Contact)

**Components & files**

- [x] `lib/quotePricing.ts` — the source of truth. Formula-based pricers (`ASSET_PRICERS` map), `DRONE_INVOLVED_ASSETS` set, `SCALE_FIELDS_BY_TYPE` schemas, `effectiveDate()` (current-date function, not constant), `PRICING_VERSION = 'v2-draft'`, pure engine functions (`computeAssetPrice`, `totalFor`, `formatINR`, `quoteValidUntil`, `isScaleComplete`, `summarizeScale`), `QUOTE_VALIDITY_DAYS = 30`, `GST_RATE = 0.18`. Header comment block documents the pricing knobs (`PRICE_LOC_INTEL`, `MICROSITE_PERCENT`, `SHOWCASE_DEPENDENCY_PERCENT`, etc.) for easy tuning.
- [x] `lib/solutionsBundles.ts` — `AssetOption` gained an optional `subOptions: AssetSubOption[]` field. `LOCATION_INTEL_SUBS` and `SHOWCASE_VIDEO_SUBS` shared constants used across the relevant assets so spec changes land in one place.
- [x] `lib/quoteScope.ts` — `recommendTimeline()` now takes the typed scale; `isHeavyProject()` derives the "heavier" flag from type-specific signals (towers/plots/villas/area). `generateScopePreview()` uses `summarizeScale()` for the email phrasing.
- [x] `components/QuoteWizard.tsx`:
  - State: `scaleInputs: ScaleInputs` (per-type numeric record) + `subOptionsByAsset: Record<string, string[]>`
  - Actions: `set-scale-field` (per-field number), `toggle-sub-option`, `toggle-asset` (now carries the full `AssetOption` so the reducer can pre-fill sub-options on toggle-on)
  - `StepScale` rewritten as a type-aware form rendering `SCALE_FIELDS_BY_TYPE[type]`. `ScaleFieldInput` handles decimals vs integers, units, optional ⓘ hints (e.g. *"Distinct villa designs you want rendered"* for model villas).
  - `AssetCard` reworked into a `<div>` wrapper with a `<button>` header + an inline sub-options panel that appears when the asset is selected. New `SubOptionChip` component. Card border turns red when sub-options are required-but-empty.
  - `canAdvance` for step 3 (Assets) now also enforces "every selected asset that has `subOptions` must have ≥ 1 selected"
- [x] **Conditional Location field** unchanged: drone-involved selection auto-expands project-details + makes Location required.
- [x] `components/QuoteScopePreview.tsx` — receives the full new snapshot (`scaleInputs`, `subOptionsByAsset`) and re-runs the engine to compute the total. Single gold-bordered reveal panel unchanged in shape.
- [x] `app/api/quote/route.ts` — payload validates new shape (`scaleInputs`, `subOptionsByAsset`); `isValid()` calls `isScaleComplete(type, scaleInputs)`. Email body uses `summarizeScale()` for the scale line and includes sub-options in per-line breakdown (e.g. `(sub: site-based, drone-route)`).
- [x] **Removed:** `components/QuotePriceFooter.tsx`, the in-wizard `QuoteSummaryCard`, the `PriceChip` on asset cards, the old `ScaleId` enum + `SCALE_LABELS` + `SCALE_ORDER`, the hardcoded `EFFECTIVE_DATE` constant.

**Configurability**

- [x] All prices in ONE file (`lib/quotePricing.ts`). One asset = one block. No nested formulas — just a tier-object literal per asset
- [x] `EFFECTIVE_DATE` + `PRICING_VERSION` constants for audit trail — bump on every change
- [x] Header comment block explains the strategy (anchoring, drone exclusion convention, edit instructions)

**Open follow-ups for Phase 2.5**

- [ ] **Real numbers from studio finance** — current `ASSET_PRICING` block contains placeholder benchmarks marked `// TODO: confirm with studio`. ~25 assets × 5 tiers = ~125 cells to validate. Single-file edit when ready.
- [ ] Optional: `scripts/price-audit.mjs` to dump every asset × scale combo as a table for sanity-check before publishing
- [ ] Optional: CSV import/export for prices if edit-frequency justifies it (defer unless needed)
- [ ] Optional: a small `quote-version` line in the wizard footer so users know which pricing snapshot they were quoted under

**UX rules updated for Phase 2.5**

- [x] ~~No price visible anywhere~~ → **One number, revealed once, after contact submit**
- [x] Step order: Type → Stage → **Scale** → Assets → Contact (Scale moved before Assets so it informs the unseen pricing math)
- [x] Wizard is pricing-free — no chips, no sticky bar, no summary card. Inline nav on every step.
- [x] Drone-involved selection auto-expands project-details and conditionally requires Location (Google Maps link). The fact that "drone-involved" is even a concept is invisible to the user inside the wizard — they only see the field-becomes-required behaviour
- [x] Outcome screen reveals the quote: total in 5xl font, GST fine print, single drone addendum if applicable, validity footer
- [x] Disclaimers: *Quotes are exclusive of GST (18%)* and *Drone shoot quoted by location* — both shown ONCE, on the reveal screen and in the email

---

## 5. FeaturedCaseStudies + `/work/[slug]` detail pages

**Placement**

- Home: between BentoPortfolio and Process scroll-pin (position #8)
- Work page: surface Case Studies as a hero band above the bento grid
- New routes: `/work/[slug]` for 3 named case studies

**Pick 3 launch case studies** *(replace placeholders with real projects)*

- [ ] Case Study A — e.g. Skyline Heights (township, Bengaluru)
- [ ] Case Study B — e.g. Marina Bay (high-rise, coastal)
- [ ] Case Study C — e.g. Greenway Estates (plotted, Tier-2)

**Per case study — content collection**

- [ ] Project name, segment, geography, ticket size band, our scope
- [ ] Developer brief (their words, pull-quote)
- [ ] The marketing problem (1 paragraph + 1 hero visual)
- [ ] What we shipped — asset gallery (renders, walkthrough still, microsite screen, reel)
- [ ] **Hard numbers:** footfalls / qualified leads / bookings supported / cost-per-qualified-lead / NRI share / channel-partner adoption
- [ ] Before/After: old creative vs. ours
- [ ] Developer pull-quote (with name, role, company)
- [ ] Logo of developer (with permission)

**Components & files**

- [ ] `lib/caseStudies.ts` — typed long-form content for 3 studies
- [ ] `app/work/[slug]/page.tsx` — dynamic route, generateStaticParams
- [ ] `components/FeaturedCaseStudies.tsx` (home strip — 3 cards w/ headline number)
- [ ] `components/CaseStudyHero.tsx`
- [ ] `components/CaseStudyMetrics.tsx`
- [ ] `components/CaseStudyGallery.tsx`
- [ ] Extend `app/work/page.tsx` to surface case studies above bento

**UX rules**

- [ ] Long-form scroll, never modal — Indian B2B buyers share URLs to bosses
- [ ] Open Graph image includes the headline number (e.g. "147 bookings · 21 days")
- [ ] Sticky next-case-study + Quote CTA at bottom
- [ ] Reading-progress bar (subtle)
- [ ] All visuals carry the RERA artistic-impression disclaimer

---

## 6. StudioBehindTheWork + About deepening

**Placement**

- Home: directly **after** `GlobalPresence` and before Testimonials (position #11) — warm break in cinematic cold rhythm, completes the post-Process zoom: cinematic → planet → people → voices
- About: expand existing Team + Offices sections; rewrite as a dual-hub narrative

**Hard constraint — no overlap with GlobalPresence**

- Skip the geography map / globe visual — GlobalPresence already owns it on this page
- Lean into **faces**, **gear**, and the **dual-hub *story***, not the dual-hub locations

**Home section — checklist**

- [ ] Component: `components/StudioBehindTheWork.tsx`
- [ ] Left column: 6-portrait grid (leadership), hover → role
- [ ] Right column: short founder note (~80 words) + "studio rhythm" tagline e.g. *"6 days. 2 cities. 1 calendar."*
- [ ] Below: gear strip (horizontal scroll on mobile)
  - 4× Mavic 3 Cinema + Inspire 3
  - 80-core GPU render farm
  - In-house colour grade suite
  - Unreal Engine 5 / Twinmotion
  - DGCA-certified pilots
- [ ] Asset: 6 leadership portraits, square, neutral background, `/public/images/team/`
- [ ] Wire into `app/page.tsx` (home position #10)

**About page — checklist**

- [ ] Replace `team-count grid` with 4–6 named leadership cards (photo · name · role · city)
- [ ] New "Why Two Cities" narrative block — *metro craft at Tier-2 economics*; covers Bengaluru (craft, talent, premium clients) and Raipur (economics, Tier-2 reach, CG/MP/Odisha belt)
- [ ] Add "Day in the Studio" photo strip (6 candid shots) or 30s reel
- [ ] Keep existing values + cosmic offices section

---

## 7. Build91 Journal (`/journal` insights blog)

**Placement**

- New routes: `/journal` (index) and `/journal/[slug]` (post)
- Home: `JournalStrip` (3 latest cards) between Testimonials and QuoteToolPromo (position #12)
- Footer: new column "Journal" with 3 recent post links

**Infra & files**

- [ ] Decide MDX pipeline: `next-mdx-remote` + `gray-matter` (recommended — minimal lift, version-controlled)
- [ ] Folder: `content/journal/*.mdx`
- [ ] `lib/journal.ts` — read frontmatter, list posts, get by slug
- [ ] `app/journal/page.tsx` — index, category filter, search
- [ ] `app/journal/[slug]/page.tsx` — post page, sticky TOC, reading progress
- [ ] `components/JournalCard.tsx`
- [ ] `components/JournalStrip.tsx`
- [ ] `components/JournalTOC.tsx`
- [ ] Footer: add Journal column with `getRecentPosts(3)`
- [ ] Sitemap + RSS feed

**Post frontmatter schema**

- [ ] `title`, `slug`, `dek` (summary), `category` (Playbooks / Case Notes / Industry / Craft)
- [ ] `tags[]`, `heroImage`, `author`, `date`, `readTime`
- [ ] `quoteCtaContext` — to pre-fill `/quote` deep-link

**First 6 posts — content backlog (write in order)**

- [ ] *Anatomy of a ₹500cr Bengaluru launch microsite*
- [ ] *Why your 3D render is killing your booking velocity*
- [ ] *RERA artistic-impression rules: what your marketing head must know*
- [ ] *Drone permissions in India — DGCA, no-fly zones, by city*
- [ ] *Reels that sold a township in 21 days*
- [ ] *Pre-launch teaser playbook — 90 days to launch day*

**UX rules**

- [ ] Long-form reading layout, max-w-prose, generous leading
- [ ] Sticky TOC on desktop (left rail); inline TOC on mobile (collapsible)
- [ ] Reading-progress bar at top
- [ ] Related posts (3) + closing CTA → `/quote?context={article-tag}`
- [ ] Each post page has clean OG card with hero image + title

---

# Phase 5 — atlabs.ai-inspired showcase patterns

> **Research note:** initial pass on https://www.atlabs.ai/ was via
> server-side HTML fetch, which can't see JS-rendered video loops or
> Lottie animations. Patterns below are characterised from atlabs +
> the wider "AI startup landing" archetype (Runway, ElevenLabs, Pika,
> Synthesia). **Before building, do a 15-min browser walk-through of
> atlabs.ai with DevTools open** to capture exact motion specs (scroll
> direction, autoplay cadence, hover behaviour, card transforms) — then
> tighten the checklists below with verified details.

---

## 8. AssetReel — atlabs-style horizontal video carousel below hero

**The pattern on atlabs.ai (as observed):**

- Horizontal scrolling row of category cards, sitting *immediately* under
  the hero — acts as an instant "look what we make" reveal before you've
  scrolled to read anything else
- Each card carries: a short looping muted video preview, a category tag
  (Avatar Videos / Product Ads / Animation / Short Films / Music Videos /
  Educational), and small metadata chips (duration `30 secs`, aspect
  ratio `1:1`, mood `Playful`, timeline markers `0:00 - 0:05`)
- Auto-scrolls slowly when idle, drag-to-scroll on user interaction
- No big section heading — the cards *are* the message
- Visually: tight rounded corners, dark cards on dark bg with a soft glow
  edge, ~9:16 or 4:5 portrait aspect, peek-and-snap behaviour

**Build91 adaptation — what changes:**

- Categories map to **asset types**, not AI features:
  - Aerial 360
  - 3D Walkthrough
  - 3D Interior Render
  - 3D Exterior Render
  - Cinematic Project Film
  - Plot Superimposition
  - Vertical Reel
  - Microsite Loop
- Metadata chips become **production specs** real-estate buyers care about:
  - Asset type · Project name · Aspect ratio · Duration · *"Built in 6 days"*
- The card *is* the proof — a 4-second looping preview of the actual
  deliverable, not a category icon. This is the **biggest difference from
  BentoPortfolio** further down the page: BentoPortfolio is a curated
  *gallery*; AssetReel is a *menu* of capabilities.

**Placement**

- Home: position **#2** — directly under VideoHero, *before* StatsBar
- Rationale: hero promises capability, AssetReel proves it before the
  user has to do any reading. Stats then quantify it. Trust then
  guarantees compliance. The opening 30 seconds of the page become a
  *show-don't-tell* cascade instead of stat-after-stat.

**Conflict with existing sections — must decide:**

- **Does AssetReel cannibalise BentoPortfolio?** Possibly. Two options:
  - **Option A — keep both:** AssetReel as snappy capability menu near
    top; BentoPortfolio as deeper filterable browse below. Justifiable
    if the cards stay visually distinct (AssetReel = small + fast +
    asset-led; BentoPortfolio = large + slow + project-led).
  - **Option B — replace BentoPortfolio with AssetReel:** simpler page,
    one strong showcase, less scroll fatigue. Recommended if the asset
    library is rich enough to make AssetReel feel deep.
- **Does AssetReel weaken the ScrollPinReveal · Services?** Slightly —
  Services explains *categories*; AssetReel demonstrates them. Keep both
  but tighten Services copy so it leans on the *thinking* (why we make
  it this way) rather than restating *what* we make.

**Checklist**

- [ ] Do the browser-walk-through of atlabs.ai (see research note) and
  pin down: autoplay cadence, hover state, drag inertia, edge behaviour *(deferred — defaults match observed patterns; tighten if QC review flags differences)*
- [x] Decide Option A vs Option B re: BentoPortfolio coexistence → **Option A: keep both**, with deliberately distinct visual languages (AssetReel = 4:5 small cards, mute-locked, auto-scroll; BentoPortfolio = 9:16 large cards, click-to-unmute, project-led)
- [x] Define 6–10 asset categories → **8 shipped** (Aerial 360, 3D Walkthrough, 3D Interior, 3D Exterior, Cinematic Project Film, Plot Superimposition, Vertical Reel, Microsite Loop)
- [ ] Per category, supply: 4–6s loop (9:16 or 4:5), poster frame, label, 4 metadata chips *(scaffold uses `intro-reel-web.mp4` + seeded picsum posters; swap-in is a single-line change per row in `lib/assetReel.ts`)*
- [ ] Asset folder: `/public/video/asset-reel/{slug}.mp4` + poster jpg *(folder not yet created; data layer references the path convention)*
- [x] Component: `components/AssetReel.tsx`
  - [x] Horizontal scroll container with `scroll-snap-x mandatory`
  - [x] Card: rounded corners, soft glow edge (per-card tint), metadata overlay (category top-left, aspect top-right, project + duration + turnaround bottom)
  - [x] Auto-scroll on idle (~4.5s per card advance), paused on touch/mouse/wheel for 8s
  - [x] Drag/swipe on mobile, mousewheel-pan on desktop trackpad (native scroll)
  - [x] Edge fade masks (left + right) instead of dot strip — cleaner with auto-advance
  - [x] Respect `prefers-reduced-motion`: autoplay off, no auto-advance, static cards on posters
  - [x] Cards lazy-load videos (IntersectionObserver — video element only mounts when card enters viewport)
- [x] Data: `lib/assetReel.ts` — 8 categories with metadata + tint cycling
- [x] Wire into `app/page.tsx` position **#2** (under VideoHero, before StatsBar)
- [x] Section heading — **no heading**, only a tiny eyebrow chip ("What we make · Swipe / scroll →"). Matches atlabs minimalism.

**UX rules**

- [ ] Videos are **muted, loop, autoplay** (HTML5 attrs `muted loop
  autoplay playsinline`). No audio anywhere in AssetReel.
- [ ] Cards stay in viewport for ~1.5–2s of autoplay before scroll
  advances — long enough to register the loop
- [ ] First card visible on load is always the highest-impact asset
- [ ] Total file weight: <500 KB per loop (use VP9/H.265, max 720p
  vertical). Aggregate AssetReel weight cap: 3 MB

---

## 9. OutcomeWidgets — atlabs-style animated bento below testimonials

**The pattern on atlabs.ai (as observed):**

- A grid of widget tiles sitting under the testimonials, each animating
  independently to reinforce a different proof point
- Tile types observed/likely on atlabs:
  - Large metric tile with animated count-up ("10x Faster")
  - Logo-cluster tile showing brands using the product
  - Volume metric ("100k+ Videos created")
- Each tile has its own visual treatment — bento-style asymmetric sizes
- Continuous subtle motion (not just on-load): counters drift, charts
  redraw, avatars cycle. The page **stays alive** as you read

**Build91 adaptation — what changes:**

- Tiles become **outcome proof points**, deliberately different from
  StatsBar at the top:
  - StatsBar = aggregate volume credentials (*3000 drone shoots*)
  - OutcomeWidgets = *what your launch will look like* (results, speed,
    reach, geography)
- 5-widget bento layout (mix of sizes):
  - **W1 (large, 2-col):** *Animated map of India* with launches lit up
    over the last 12 months — pulses on each city
  - **W2 (medium, 1-col):** *"30-day launch sprint"* — Day 0 → Day 30
    count-up bar that walks through 15 production milestones
  - **W3 (medium, 1-col):** *"₹500cr+ bookings supported"* with
    count-up on scroll-into-view
  - **W4 (medium, 2-col):** *Asset attribution stacked bar* — "What gets
    buyers to walk in", 7 categories, sequential draw-in left-to-right.
    Replaced an earlier Geography-pie tile whose data (India / UAE /
    Australia / Singapore) duplicated the GlobalPresence globe.
  - **W5 (small, 1-col):** *Live "currently in flight" ticker* — 1-line
    rotating text, light fade transitions

**Placement**

- Home: position **#14** — directly after Testimonials, before
  JournalStrip
- Rationale: testimonials establish *trust*; OutcomeWidgets quantify
  *what that trust delivered*. The bottom-of-page placement also keeps
  page energy alive when most users disengage — continuous-motion
  widgets create a "scroll didn't end yet" pull.

**Conflict with StatsBar — must enforce contrast:**

- StatsBar (top) = **flat, restrained, count-up-on-load, no continuous
  motion**
- OutcomeWidgets (bottom) = **bento, asymmetric, continuous subtle
  motion, mixed media (map + chart + text-ticker + count-up)**
- Even the typography should differ — StatsBar uses big static numerals;
  OutcomeWidgets can mix in serif italic accents, charts, illustrative
  bits. Two separate visual languages so the page doesn't feel like
  "stats twice"

**Checklist**

- [ ] Do the browser-walk-through of atlabs.ai (see research note) and
  pin down: which tiles animate continuously vs on-scroll, exact tile
  proportions, hover behaviour *(deferred — QC pass once content reviewed)*
- [x] Confirm the 5-widget composition above (or trim/adjust) → shipped as-spec'd
- [ ] **Source the data behind each widget — outcomes must be true, not invented** *(critical TODO — every number in `lib/outcomes.ts` is a studio-norm placeholder marked `// CONFIRM:`. The section's credibility rests on these being real; replace before the page is published. The contract: 12 cities, 14-day average, ₹500cr bookings, India/UAE/Australia/Singapore split 70/15/10/5, 6 in-flight status lines)*
- [x] Component: `components/OutcomeWidgets.tsx` (container + bento grid with named areas `'map_map_countdown' 'map_map_metric' 'pie_pie_ticker'`)
- [x] Sub-components per widget type:
  - [x] `components/widgets/IndiaLaunchMap.tsx` — constellation network, weight-prioritised rotation, hand-rolled SVG (no GeoJSON dependency, no map library)
  - [x] `components/widgets/CountdownBar.tsx` — rAF-driven 6s loop, day counter mirrors bar fill, linear ease
  - [x] `components/widgets/CountUpMetric.tsx` — ease-out cubic count-up, fires once on viewport entry
  - [x] `components/widgets/AttributionBar.tsx` — stacked horizontal bar with 7 colored segments + color-coded legend (replaced the earlier `GeographyPie` donut whose data duplicated the GlobalPresence globe). Sequential left-to-right segment draw-in with 180ms stagger, percentage count-up per legend row, hover dims non-target segments, reduced-motion safe, dev-time assertion that values sum to 100. Data lives in `lib/outcomes.ts` as `WALK_IN_ATTRIBUTION` — all 7 percentages tagged `// CONFIRM:` until microsite analytics provides measured values.
  - [x] `components/widgets/LiveTicker.tsx` — AnimatePresence text fade, 4s rotation, pulsing green dot
- [x] Data: `lib/outcomes.ts` — `LAUNCH_CITIES`, `AVG_LAUNCH_DAYS`, `LAUNCH_MILESTONES`, `BOOKINGS_SUPPORTED_CR`, `WALK_IN_ATTRIBUTION`, `WALK_IN_SAMPLE_SIZE`, `LIVE_TICKER_STATUS`. All in one file. All marked `// CONFIRM:`.
- [x] Bento layout: CSS grid with `[grid-template-areas:'...']` Tailwind arbitrary values, collapses to single column on mobile (priority order: map → countdown → metric → pie → ticker via DOM order)
- [x] Respect `prefers-reduced-motion`: all continuous animations stop, count-ups jump to final value, ticker shows the first item only, pulse rings hidden, donut arcs paint fully
- [x] Wire into `app/page.tsx` position **#12** (between Testimonials and QuoteToolPromo — slightly different number than the original spec #14 because JournalStrip/StudioBehindTheWork haven't shipped yet; bento still sits between testimonials and the conversion band as intended)

**Open follow-ups for Phase 5**

- [ ] **Tune `lib/outcomes.ts` with real numbers** — every value tagged `// CONFIRM:`. Single-file edit when ready.
- [ ] Produce 8 bespoke 4-second loops for AssetReel (4:5 portrait, 720×900, ~500KB each, H.264). Drop into `/public/video/asset-reel/{slug}.mp4`. Update `mediaSrc` in `lib/assetReel.ts`. No component change.
- [ ] Produce 8 poster JPGs at 720×900 for AssetReel cards (~100KB each). Replace seeded picsum URLs in `lib/assetReel.ts`.
- [ ] Browser-walkthrough atlabs.ai with DevTools, capture exact motion specs, reconcile any differences (drag inertia, autoplay cadence, hover state).
- [ ] Lighthouse + CWV pass on home after content swap — confirm LCP < 2.5s and CLS < 0.1 still hold with the new section weight.

**UX rules**

- [ ] Every continuous animation must use `requestAnimationFrame` and
  pause when the tile is off-screen (IntersectionObserver gate)
- [ ] Aggregate JS cost cap: this whole section should ship under 30 KB
  of JS (excluding chart libs — prefer hand-rolled SVG over Recharts)
- [ ] Each tile must read as a complete thought without the others —
  no "see also" dependencies across tiles
- [ ] The bento layout must feel *intentional*, not random — every tile
  earns its size with content density (smallest tile = least info)

---

# Phase 6 — Live Google rating below hero

## 10. Google rating merged into StatsBar (position #3)

**Placement** — Google rating is the **first cell** of the 3-cell
StatsBar at position #3 (right under AssetReel). No standalone band.

**Why merged, not standalone (revised direction)**

The original Phase 6 shipped GoogleRatingBand as its own slim strip at
position #2. Studio direction reversed this: one strong credentials line
beats two stacked moments. Merging produces:

- A single "trust strip" read instead of two (rating band → credentials)
- Clearer visual hierarchy: hero → asset reel → **proof line** → trust → logos
- Less vertical chrome between hero and the work

The earlier argument for separating internal vs. external numbers was
mitigated by making the rating cell visually distinct *within* the strip
(filled gold star inline with the rating, tiny Google "G" in the eyebrow
label, whole cell clickable). Visitor can tell at a glance which cell is
Google and which are studio.

**The 3 cells**

| # | Cell | Value | Source |
|---|---|---|---|
| 1 | Google Rating | `4.9 ★` (with G logo in label) | LIVE via Places API |
| 2 | Projects Delivered | `300+` | Hardcoded in `StatsBarClient` |
| 3 | Clients Served | `120+` | Hardcoded in `StatsBarClient` |

**Architecture — server-side ISR**

- [x] `lib/googleRating.ts` — server-only fetcher (`import 'server-only'`)
  hitting Places API (New) `places.googleapis.com/v1/places/{placeId}`
  with `X-Goog-FieldMask: rating` (tight field mask, cheapest billing).
  Wrapped in `fetch(..., { next: { revalidate: 86400 } })` so Next.js
  caches for 24h. AbortController timeout 4s. All error paths fall back
  to `FALLBACK_RATING = 4.9` with `source: 'fallback'` flag.
- [x] `components/StatsBar.tsx` — async Server Component that awaits
  `getGoogleRating()` and passes the result to `StatsBarClient`. (The
  earlier `GoogleRatingBand.tsx` server wrapper was retired when the
  merge happened — `StatsBar` now plays the same role.)
- [x] `components/StatsBarClient.tsx` — `"use client"` for the 3-cell
  layout + animations: discriminated-union `Stat` type (`'count'` vs
  `'rating'`) routed to `CountCell` or `RatingCell` respectively, both
  sharing the same gold-glow lock-in vocabulary.
- [x] `app/page.tsx` — section-order doc comment reflects StatsBar at
  position #3 with the Phase 6 merge indicated by `★+`.
- [x] `.env.local` carries the live `GOOGLE_PLACES_API_KEY` and
  `GOOGLE_PLACE_ID`. `.env.example` documents them with restriction
  checklist.
- [x] **Retired files** — `components/GoogleRatingBand.tsx` and
  `components/GoogleRatingBandClient.tsx` deleted during the merge.
  All UX behaviour absorbed into `StatsBarClient.tsx`'s `RatingCell`.

**Cost shape**

- Places API (New) Place Details with `rating` field mask = Enterprise
  SKU (~$25 / 1000 calls)
- 24h ISR → ~30 calls/month → ~$0.75/month worst case
- Google's $200/month free credit covers this many times over

**ToS compliance (all baked in)**

- [x] Official 4-colour Google "G" mark rendered inline as SVG (no asset
  fetch, no licensing risk on a remote image). Lives in the rating
  cell's eyebrow label, immediately adjacent to the rating value.
- [x] Rating cell wraps in `<Link target="_blank" rel="noopener noreferrer">`
  pointing at the Maps listing — click-through is the whole cell.
- [x] Rating displayed exactly as Google returns it, rounded to 1 decimal
  (matches Google's own surfaces)
- [x] Cache TTL 24h is well under the 30-day persistence ceiling Google's
  ToS imposes

**UX rules**

- [x] No descriptive text in the cell value — just `4.9 ★`. Attribution
  ("Google Rating" + Google G logo) lives in the cell's eyebrow label.
- [x] No review count shown — per studio direction.
- [x] Rating cell is one clickable target; count cells are static.
- [x] Animation: cell rises in 16px, number counts up 0 → rating over
  1.8s with ease-out cubic (matches sibling count cells), gold halo
  pulse + gold underline draw-in on lock.
- [x] Hover (rating cell only): scales 1.04× and ambient halo intensifies.
- [x] Reduced motion: number renders directly at final value, no
  count-up, no halo pulse. Cell still has a gentle opacity fade-in.

**Security**

- [x] API key only in `.env.local` (gitignored) and Vercel env-var UI
- [x] Variable name omits `NEXT_PUBLIC_` prefix so Next.js can't
  accidentally bundle it for the browser
- [ ] **TODO before launch:** rotate the key currently in `.env.local`
  (was shared in chat during development, treat as compromised)
- [ ] **TODO before launch:** lock down the key in Google Cloud Console
  — restrict to Places API (New) only, set daily quota cap, enable
  billing alert at $5/month

**Failure modes (all handled)**

- Missing env vars (e.g. dev clone without `.env.local`) → fallback to 4.9
- Network timeout (4s AbortController) → fallback
- Non-2xx HTTP response (quota, bad key, listing deleted) → fallback
- Valid response missing `rating` field → fallback
- Source flag (`live` vs `fallback`) is returned for diagnostics but not
  surfaced in the UI — visitor experience is identical either way

**Open follow-ups**

- [ ] Rotate the API key + apply restrictions listed above
- [ ] Replace `FALLBACK_RATING` if the studio's live rating drifts more
  than ±0.2 from current value
- [ ] When studio review count crosses ~150, consider surfacing the
  count as a tiny secondary number under the rating (currently hidden
  per direction)
- [ ] Consider adding the same band to `/about` and the footer once
  validated on home

---

# Phase 7 — Selected Work via Instagram Graph API

## 11. SelectedWork (replaces BentoPortfolio at position #8)

**Why this replacement**

The home page already says "A glimpse of work in the wild" at position
#8 — but BentoPortfolio was sourcing from `PORTFOLIO_ITEMS` (local MP4s
in `lib/portfolioData.ts`), which means every new piece of work needed
a code change + asset upload to surface. The studio's actual cadence
of work shipping happens on Instagram first — switching the source to
the IG Graph API means new reels appear here within 4 hours of being
posted, with zero code touch.

Section heading is unchanged ("Selected Work / A glimpse of work in the
wild.") so the page rhythm and IA stay identical. Only the source of
truth flips.

**Architecture — server-side ISR, client-side lightbox**

- [x] `lib/instagram.ts` — server-only fetcher (`import 'server-only'`)
  hitting `https://graph.instagram.com/{IG_USER_ID}/media` with the
  exact field list the studio's curl smoke-test confirmed works:
  `id,caption,media_type,media_product_type,media_url,thumbnail_url,
  permalink,timestamp`. Wrapped in `fetch(..., { next: { revalidate:
  14400 } })` for 4h cache. AbortController timeout 4s. Filters to
  `media_product_type === 'REELS'` and takes 8.
- [x] `lib/instagram-fallback.ts` — 6 hardcoded reel objects rendered
  when the API call fails for any reason. Studio drops 6 MP4s into
  `/public/video/reels-fallback/` + 6 JPG posters into
  `/public/reels-fallback/` and edits the array's `permalink` /
  `caption` per reel.
- [x] `components/SelectedWork.tsx` — async Server Component shell.
  Awaits `getReels()` and passes to client. No `'use client'`.
- [x] `components/SelectedWorkClient.tsx` — `'use client'` — 8-tile
  responsive grid (2/4/4 cols), thumbnail-only tiles with a centered
  play icon, click opens lightbox. Owns modal index state.
- [x] `components/ReelLightbox.tsx` — `'use client'` — fullscreen
  modal via `createPortal(document.body)`. Backdrop click closes, Esc
  closes, ←/→ navigate, focus trap on close button, body scroll lock.
  Native `<video>` with autoplay+controls+playsInline, IG permalink
  link below the caption.

**Token lifecycle — KV-stored, weekly cron refresh**

- [x] `app/api/cron/refresh-instagram-token/route.ts` — GET handler
  guarded by `Bearer ${CRON_SECRET}`. Calls
  `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={current}`,
  writes the rotated token to Vercel KV under `ig:access_token`.
- [x] `vercel.json` — single cron entry at `0 3 * * 0` (Sun 03:00 UTC
  ≈ Sun 08:30 IST). Weekly cadence means up to 8 chances to refresh
  inside the 60-day token window; if any one succeeds, the integration
  stays alive.
- [x] `lib/instagram.ts → getAccessToken()` reads KV first, falls back
  to `process.env.IG_ACCESS_TOKEN`. Env var serves as bootstrap before
  the first cron run, and as the dev-mode credential when KV isn't
  provisioned locally.

**Caching strategy — 4h ISR for media URLs**

Meta's `media_url` is a signed CDN link with ~6h life. The 4h ISR
window is deliberately under that — by the time a URL expires, the
next page revalidation has already fetched a fresh one. Sub-6h
expiry-inside-cache events are theoretically possible (edge case
where Meta rotates the signing key early); the thumbnail still
paints and the IG permalink click-through still works in that case.
If real reports show broken video playback, upgrade path is a
`/api/reel/[id]` proxy route that refreshes its own internal URL
cache on cache-miss. Deferred until evidence justifies the
complexity.

**Failure modes (all handled, all silent)**

- Missing env vars / KV unset → fallback to 6 hardcoded reels
- Network timeout (4s AbortController) → fallback
- Non-2xx HTTP response (token revoked, rate-limited) → fallback
- Response missing `data` array or 0 reels after REELS filter → fallback
- Media URL expired inside cache window → thumbnail still paints,
  click-through to IG permalink still works

`isFallback: true` on each reel object lets the studio tell live vs
canned apart in browser devtools without changing what gets rendered.

**Security**

- [x] `IG_ACCESS_TOKEN` only in `.env.local` (gitignored) and Vercel
  env-var UI; variable name omits `NEXT_PUBLIC_` so Next.js can't
  bundle it to the browser
- [x] `CRON_SECRET` guards `/api/cron/refresh-instagram-token` so even
  if the route URL leaks, no outside party can trigger a refresh
- [ ] **TODO before launch:** rotate the IG token currently in
  `.env.local` (was shared in chat during development, treat as
  compromised — same as the Google Places key)
- [ ] **TODO before launch:** verify the Meta app stays in
  "Development" mode permanently — we only query the app owner's
  own account, so review submission is not required

**UX rules**

- [x] Section heading copy unchanged from BentoPortfolio so the page
  IA is preserved
- [x] CTA in section header now points at IG (`instagram.com/build91studio`)
  instead of `/work` — pulls traffic toward the live feed
- [x] Grid: 2 cols mobile, 4 cols tablet/desktop; 9:16 aspect tiles
  to preserve reel native aspect
- [x] No autoplay on tile thumbnails (8 simultaneous video decoders
  crushes mid-tier phones — the earlier BentoPortfolio was a
  horizontal-scroll strip with only ~3 in-view at a time, different
  math). Play happens in the lightbox.
- [x] Lightbox: native `<video controls>` so users get native scrub
  + fullscreen + AirPlay without us hand-rolling controls
- [x] Reduced motion: backdrop fade is short (180ms); thumbnail
  hover-zoom skipped by `prefers-reduced-motion` media query

**Open follow-ups**

- [ ] Studio drops 6 fallback reels into `/public/video/reels-fallback/`
  + posters into `/public/reels-fallback/` + edits `permalink` and
  `caption` in `lib/instagram-fallback.ts`
- [ ] Provision Vercel KV (Storage → Create Database → KV) and connect
  to the project; copy the auto-injected `KV_REST_API_URL` and
  `KV_REST_API_TOKEN` into local `.env.local` for dev
- [ ] Generate a random 32+ char string for `CRON_SECRET` (e.g. `openssl
  rand -hex 32`) and set in both `.env.local` and Vercel env-vars
- [ ] Rotate the chat-exposed IG token in Meta dashboard; paste the
  new long-lived token into `.env.local` and Vercel env-vars
- [ ] After first deploy, manually `curl -H "Authorization: Bearer
  $CRON_SECRET" https://<domain>/api/cron/refresh-instagram-token` to
  smoke-test the cron logic before waiting a full week
- [ ] `BentoPortfolio.tsx` is left on disk as a rollback target — if the
  IG integration ever needs to be temporarily disabled, swap one import
  line in `app/page.tsx` and the old self-hosted strip is back
- [ ] If the studio ever wants curated control (hide a specific reel),
  switch from "latest 8" to "latest 8 where caption includes
  `#selectedwork`" — single-line filter change in `getReels()`

---

# Cross-cutting tasks

- [ ] Add `/quote` to `NAV_LINKS` as secondary CTA, not main nav (keep nav at 5)
- [ ] Add `/journal` to footer Explore column (not main nav)
- [ ] Update `app/sitemap.ts` to include new routes
- [ ] Update `metadata` keywords list with: "real estate quote India", "RERA marketing", "drone real estate Bengaluru", "project microsite India"
- [ ] Run Lighthouse + Core Web Vitals pass after each phase
- [ ] Verify all new components honor `prefers-reduced-motion`
- [ ] Verify all new sections have correct `section-base` + section-color tokens to keep the cinematic palette continuous

---

# Definition of Done — per initiative

For each item above to count as done:

1. Built, wired into IA, mobile-tested at 375 / 768 / 1280 / 1920
2. Lighthouse: LCP < 2.5s, CLS < 0.1 on the relevant page
3. All images served via `next/image` with width/height
4. Reduced-motion variants pass
5. Copy review pass (real-estate-marketing tone — confident, never fluffy)
6. At least one mobile screenshot taken into the PR
7. README / this checklist updated with ✅ on completed line items
