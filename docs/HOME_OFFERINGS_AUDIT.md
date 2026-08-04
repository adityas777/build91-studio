# Build91 Studio — Home-Page Offerings Inventory & Inner-Page Gap Audit

Audited: 2026-06-10 (v2 branch). Plan-only document — no code changes made.

Purpose:
1. Record the **canonical offerings & claims currently live on the home page** (the most
   up-to-date content surface on the site).
2. Identify **where each inner / menu page lags behind** that home-page content, so the
   inner pages can be updated to match.
3. Flag stale spots in `V2_CONTENT_ROADMAP.md` and unresolved placeholders.

---

## Part 1 — Canonical home-page offerings (as shipped, v2.1)

Section order: VideoHero → AssetReel → StatsBar → TrustStrip → ClientLogoWall →
ScrollPinReveal·Services → SolutionsRouter → SelectedWork (IG) → GlobalPresence →
Testimonials → OutcomeWidgets → QuoteToolPromo → CtaSplit.

### 1.1 Positioning (VideoHero taglines)
- "Project Showcases that **Sell the Vision**"
- "Immersive **Digital Experiences**"
- "End-to-End **Marketing Stack**"
- "From Blueprint to **Buyer**"

### 1.2 Asset-type menu (AssetReel — 8 capabilities)
Aerial 360° · 3D Walkthrough · 3D Interior Render · 3D Exterior Render ·
Cinematic Project Film · Plot Superimposition · Vertical Reel · Microsite Loop.
> Source: `lib/assetReel.ts`. All media + project names are placeholders (picsum posters,
> `intro-reel-web.mp4` loops, fictional projects like "Skyline Heights · Bengaluru").

### 1.3 Credentials (StatsBar)
- Google Rating — **live** via Places API (24h ISR, fallback 4.9), clickable → Maps listing
- **300+** Projects Delivered · **120+** Clients Served (constants in `StatsBarClient.tsx`)

### 1.4 Trust signals (TrustStrip — 4 pills)
- **RERA-Ready** — Every asset ships compliant
- **DGCA-Certified** — Licensed drone capture
- **In-House Studio** — Your IP stays in India
- **NDA Standard** — Pre-launch stays sealed

⚠️ All 4 pills deep-link to **`/about#compliance` — an anchor that does not exist** on the
About page (see Gap A1).

### 1.5 Clients (ClientLogoWall)
12 logos; only 2 named (Laxmi Developer, Western Arch), rest are `Partner 01..09`
placeholders. Country pills: India / UAE / Australia.

### 1.6 Service disciplines (ScrollPinReveal — "Six visual disciplines under one roof")
| Slide | Eyebrow | Offering |
|---|---|---|
| 1 | Project Showcase | Drone & Aerial 360° |
| 2 | 3D Visualization | Photoreal Renders |
| 3 | Virtual Experiences | Cinematic Walkthroughs |
| 4 | Virtual Experiences | 360° Virtual Tours |
| 5 | Marketing Stack | Films, Reels & Sites |
| 6 | Digital Launchpad | Project Microsites |

Note: 6 slides map onto the **5 pillars** of the Services page (Virtual Experiences gets
2 slides). The "six vs five" wording mismatch is flagged as Gap B1.

### 1.7 Solutions taxonomy (SolutionsRouter → shared with /quote)
This is the **newest, most authoritative offerings spec** on the site
(`lib/solutionsBundles.ts`):

**6 project types**, each with its own 7-asset menu:
- **High-Rise Apartments** — Location Intelligence · Isometric Views · 3D Set
  (Elevation, Amenities, Exteriors, 2–4 Units) · Aerial 360° · PDF Brochure ·
  Project Showcase Video · Project Microsite
- **Plotted Land / Villa Community** (shared menu) — Interactive Plotted Development Kit ·
  Location Intelligence · 3D Set (Amenities, Exteriors, Villa Homes) · Aerial 360° ·
  PDF Brochure · Showcase Video · Microsite
- **Commercial** — Location Intelligence · Isometric Views & Fit-out Scenarios · 3D Set
  (Elevation/Facade, Lobby & Atrium) · Aerial 360° · PDF Brochure · Showcase Video · Microsite
- **Retail** — Location Intelligence **with Catchment** · Isometric **Leasing Plan** · 3D Set
  (Facade, Atrium, Food Court, Anchor Zones) · Aerial 360° · **PDF Leasing Kit** ·
  Showcase Video · **Leasing Microsite**
- **Warehousing / Logistics** — Location Intelligence (**Highways, Ports, ICDs**) ·
  Isometric Site Plan **with Engineering Callouts** · 3D Set (Facade, Dock Yard, Mezzanine,
  Office Block) · Aerial 360° · **PDF Spec Sheet** · Showcase Video · **IPC/Leasing Microsite**

Sub-options:
- Location Intelligence (all variants): site-based highlights · Google Maps highlights ·
  drone video route highlight
- Showcase Video: 3D walkthrough (+20% of 3D Set) · location highlights (+20% of Loc-Intel) ·
  3D superimposition (only inside Showcase Video) · brand credentials

**5 lifecycle stages** with asset lists: Pre-Launch Teaser · Launch · Sustenance ·
Possession/Handover · Resale.

### 1.8 Work proof (SelectedWork)
8 latest Instagram reels via Graph API (4h ISR, lightbox playback), silent fallback to 6
hardcoded reels. Section CTA → `https://www.instagram.com/build91studio/`.

### 1.9 Footprint (GlobalPresence)
- **Raipur = Studio** · **Bengaluru = Sales** (role-tagged pins)
- Client reach: **India · UAE · Australia** ("Clients on three continents")

### 1.10 Outcomes (OutcomeWidgets — all `// CONFIRM:` placeholders)
- 12 launch cities across India · **30-day** launch sprint (15 milestones) ·
  **₹500cr+** bookings supported · walk-in attribution across 7 asset types
  (sample "120+ launches") · live in-flight ticker.

### 1.11 Conversion promises
- Quote wizard: "~60 seconds · No pricing forms" · "tailored proposal **in 24 hours**"
- SolutionsRouter card footer: "Custom proposal in 24h"

---

## Part 2 — Inner-page gap analysis

Menu pages: `/services` · `/work` · `/about` · `/contact` (+ secondary `/quote`).

### A. About page (`app/about/page.tsx`) — **largest gaps**

| # | Gap | Detail | Priority |
|---|---|---|---|
| A1 | **`#compliance` anchor missing — broken deep-links** | All 4 TrustStrip pills on home link to `/about#compliance`. No such section exists; clicks land at the top of About with no compliance content anywhere on the site. Needs a Compliance section covering RERA-ready process, DGCA drone certification, in-house production/IP, NDA standard (roadmap initiative 2, deferred to Phase 3). | **P0** |
| A2 | No dual-hub narrative | Home pins Raipur = **Studio** and Bengaluru = **Sales**. About's "Where We Work" lists both as undifferentiated offices. Roadmap's "Why Two Cities" block (metro craft × Tier-2 economics) not built. | P1 |
| A3 | Geography naming conflict | About copy + `SITE.reach` + metadata say "India, **Dubai** & Australia"; home (GlobalPresence, client country pills) says "**UAE**". Pick one term site-wide (UAE recommended — matches client-pill data model). | P1 |
| A4 | Anonymous team vs trust-led home | About shows role-count tiles (4/12/6/8/5). Home leans on verifiable trust (live Google rating, named clients). Roadmap Phase 3 wants named leadership cards (photo · name · role · city). | P2 |
| A5 | No credentials echo | About never states 300+ projects / 120+ clients / Google rating, and the compact ClientLogoWall variant planned for About was deferred. The page makes zero quantified claims. | P2 |

### B. Services page (`app/services/page.tsx` + `SERVICE_PILLARS` in `lib/constants.ts`)

| # | Gap | Detail | Priority |
|---|---|---|---|
| B1 | "Five pillars" vs home's "Six visual disciplines" | Copy mismatch; conceptually 6 home slides → 5 pillars. Align wording (either rename home deck or present Services as "5 pillars · 6 disciplines"). | P1 |
| B2 | Pillar items lag the newest asset taxonomy | `SERVICE_PILLARS` (older v1 list) is missing offerings the home SolutionsRouter/quote engine now sells: **Isometric Views** (+ fit-out / leasing-plan / engineering-callout variants), **Location Intelligence sub-options** (site-based / Google Maps / drone route), per-type **3D Sets**, **PDF Leasing Kit / Spec Sheet** variants, **3D Superimposition** (now positioned inside Showcase Video), and naming drift ("Interactive Plotted Development" vs home's "Interactive Plotted Development Kit"; "Signature Video" vs "Project Showcase Video"). Type-specific positioning (Retail catchment, Warehousing highways/ports/ICDs) appears nowhere. | **P0** |
| B3 | Conversion path mismatch | Services' closing CTA is "Book a Strategy Call" → `/contact` only. Home's primary conversion is the quote wizard (24h-proposal promise). Add a `/quote` CTA (keep contact as secondary). | P1 |
| B4 | No trust signals | RERA/DGCA/NDA pills are directly relevant to drone + render services but absent from the page. A slim TrustStrip reuse (or link to the future `/about#compliance`) would close the loop. | P2 |
| B5 | AssetReel categories lack landing anchors | Home's 8-asset menu (e.g. Plot Superimposition, Vertical Reel) has no corresponding anchor/section on Services to route to. Consider mapping each AssetReel category → a Services anchor. | P3 |

### C. Work page (`app/work/page.tsx`)

| # | Gap | Detail | Priority |
|---|---|---|---|
| C1 | Static placeholder portfolio vs live home feed | Home's "Selected Work" now streams real IG reels; Work still renders `PORTFOLIO_ITEMS` (local placeholders). The dedicated Work page looks *staler* than the home strip. Decide: embed the IG feed on Work too, refresh `PORTFOLIO_ITEMS` with real assets, or both. | P1 |
| C2 | No case studies behind outcome claims | Home's OutcomeWidgets claim ₹500cr+ bookings, 120+ launch sample, attribution percentages — with no proof pages. Roadmap Phase 3 (`/work/[slug]`, FeaturedCaseStudies) unbuilt. The claims should not go live before at least one case study exists. | P1 |
| C3 | Duplicate heading | Work hero eyebrow is "Selected Work" — same title as home's IG section. Differentiate (e.g. "Portfolio" / "All Work"). | P2 |
| C4 | CTA → `/contact` only | Same as B3 — no `/quote` path. | P2 |

### D. Contact page (`app/contact/page.tsx` + `ContactForm.tsx`)

| # | Gap | Detail | Priority |
|---|---|---|---|
| D1 | **Stale project-type dropdown** | `ContactForm` uses `PROJECT_TYPES = Residential / Commercial / Township / Mixed-Use / Other` — superseded by the confirmed 6 types used on home + quote (High-Rise Apartments, Plotted Land, Villa Community, Commercial, Retail, Warehousing/Logistics). Leads from the two forms won't categorize consistently. | **P0** |
| D2 | "Dubai" vs "UAE" | Map caption + metadata say Dubai (see A3). | P2 |
| D3 | No quote-tool cross-link | Contact never mentions the quote wizard; users who'd rather self-scope have no path. A slim "prefer a tailored quote in 24h?" link would mirror home. | P2 |

### E. Cross-cutting inconsistencies (found while auditing)

| # | Issue | Detail |
|---|---|---|
| E1 | Instagram handle mismatch | `SITE.social.instagram` = `instagram.com/build91_studio` (with underscore); SelectedWork CTA = `instagram.com/build91studio` (no underscore). One is wrong — confirm and unify. |
| E2 | Footer dead links | Footer links `/privacy` and `/terms` — neither route exists. Create pages or remove links. |
| E3 | Roadmap doc staleness (`docs/V2_CONTENT_ROADMAP.md`) | (a) "Proposed home-page section order (final)" still lists BentoPortfolio at #8 — replaced by SelectedWork (Phase 7). (b) Phase-5 data contract line still says "14-day average … India/UAE/Australia/Singapore split 70/15/10/5" — shipped values are a **30-day** sprint and an **AttributionBar** (GeographyPie deleted). Update on next roadmap pass. |
| E4 | Unconfirmed home-page data (blockers for launch, already `// CONFIRM:`-tagged in code) | Outcomes numbers (`lib/outcomes.ts`), stats constants (300+/120+), client logo names (`lib/clients.ts` partner-01..09 + country pills), testimonials (3 fictional quotes), AssetReel projects/loops/posters, quote pricing rates (`lib/quotePricing.ts` v2-draft). |

---

## Part 3 — Suggested execution order (content-only, no new features)

> ⚠️ Superseded by **Part 4** (owner decisions, 2026-06-10). Kept for history.

1. **P0 — A1**: Build the About `#compliance` section (un-breaks 4 live home links).
2. **P0 — B2**: Rewrite `SERVICE_PILLARS` items to match `lib/solutionsBundles.ts` taxonomy
   (single-file edit in `lib/constants.ts`; Services page + footer links update automatically).
3. **P0 — D1**: Replace `PROJECT_TYPES` in `lib/constants.ts` with the confirmed 6 types
   (ContactForm picks it up automatically).
4. **P1 — A3/D2**: Site-wide "Dubai" → "UAE" (or the reverse) in `constants.ts`, About,
   Contact, metadata.
5. **P1 — B1/B3, C1/C4**: Copy alignment + add `/quote` CTAs to Services and Work.
6. **P1 — A2, C2**: Dual-hub narrative on About; first case study on Work (Phase 3 work).
7. **P2/P3 + E-items**: Team cards, credentials echo, heading differentiation, IG handle
   confirm, privacy/terms pages, roadmap doc refresh, placeholder data confirmation.

---

## Part 4 — Approved decisions & implementation plan (owner sign-off 2026-06-10)

Decisions taken by the studio owner. This section is the build spec; each block lists the
exact files to touch. Still plan-only — nothing below is implemented yet.

### 4.1 About page — team/office video instead of compliance section *(replaces gap A1)*

**Decision:** No compliance section needed. Add a **placeholder team/office video** section
to About instead.

Plan:
- New section on `app/about/page.tsx`, suggested placement **between "Our Story" and
  "The Studio" (team)** — id `studio` so it's deep-linkable (`/about#studio`).
- 16:9 muted looping `<video autoPlay muted loop playsInline preload="metadata">` using the
  established placeholder convention: `mediaSrc = /video/intro-reel-web.mp4`,
  poster `/video/intro-poster.jpg`, with `// REPLACE:` comments pointing at the future
  bespoke files `/video/about-team.mp4` (1920×1080) + `/video/about-team-mobile.mp4`
  (1080×1920 optional) + posters.
- Eyebrow "Inside the Studio", short deck line ("The people and the rooms behind the work" —
  copy TBD), no autoplay audio, honors `prefers-reduced-motion` (poster only).
- **Retarget the 4 TrustStrip pills** in `components/TrustStrip.tsx`:
  `anchor: '/about#compliance'` → `'/about#studio'` (gives the deep-link a real target;
  the pills already work as general "about us" reassurance).

### 4.2 Home page mobile — tighten vertical whitespace ("crisper")

**Decision:** Home feels too empty on mobile. Reduce base-breakpoint vertical padding and
internal gaps; keep all `md:` values unchanged.

Per-section plan (base / mobile values only):
| Section | Current | Proposed |
|---|---|---|
| SolutionsRouter | `py-24` | `py-14` · also `mt-10` chip-rail/card gaps → `mt-6/mt-8` |
| GlobalPresence wrapper (cosmic) | `py-28` | `py-16` · `space-y-14` → `space-y-10`, globe `max-w-[480px]` → `max-w-[340px]` on mobile, grid `gap-12` → `gap-8` |
| Testimonials | `py-28` | `py-16` · quote `min-h-[260px]` → `min-h-[220px]`, `mt-14` progress → `mt-10` |
| OutcomeWidgets | `py-24` | `py-14` · header `mb-12` → `mb-8` |
| QuoteToolPromo | `py-14` | `py-12` (minor) |
| AssetReel / StatsBar / TrustStrip | `py-14/12/10` | keep — already tight |
| VideoHero tagline reserve | `min-h-[160px] sm:min-h-[200px]` | `min-h-[140px]` (verify longest tagline at 375px) |
| CtaSplit | audit at 375px | same treatment if loose |

Verification: preview at 375px before/after screenshots; check no tagline/quote clipping.

### 4.3 Services page — sell the current catalogue *(gap B2)* ✅ approved

Rewrite `SERVICE_PILLARS` in `lib/constants.ts` (Services page, footer links, and the old
ServicesShowcase all read from it). Keep the 5 pillar ids/order (footer + side-nav anchors
stay stable). New item lists aligned to `lib/solutionsBundles.ts`:

- **01 Project Showcase — "Sell the Vision"**
  - Interactive Plotted Development Kit (plot superimposition on aerial 360°, live inventory, plot-size filtering)
  - Location Intelligence (site-based highlights · Google Maps highlights · drone route film)
  - Aerial 360° (drone-captured panoramas)
  - Isometric Views (tower stacks · fit-out scenarios · leasing plans · engineering callouts)
  - Project Showcase Video (cinematic film with 3D superimposition + brand credentials)
- **02 3D Visualization — "See It Before It's Built"**
  - 3D Interiors (unit typologies — 2–4 units for high-rise, model villas)
  - 3D Exteriors (elevation, facade, surrounding context)
  - 3D Amenities (clubhouse, pools, food courts, atriums, dock yards — per asset class)
  - Type-specific 3D Sets (the right render stack per project type — high-rise, plotted, villa, commercial, retail, warehousing)
- **03 Virtual Experiences — "Walk Through the Future"** *(unchanged)*
  - 3D Walkthroughs · 360° Virtual Tours
- **04 Marketing Stack — "Fuel the Funnel"**
  - Website Design · Social Media Visual Kit · Video Shorts & Reels
  - PDF Brochure / Leasing Kit / Spec Sheet (type-specific digital brochures)
- **05 Digital Launchpad — "One Link. Every Asset."**
  - Project Microsite · Leasing / IPC Microsite (retail & warehousing variants) · Unified Asset Hub

Also (gap B3): Services closing CTA gains a primary "Get a Custom Quote" → `/quote`
(keep "Book a Strategy Call" → `/contact` as secondary).

### 4.4 Contact form project types *(gap D1)* ✅ approved

`lib/constants.ts` → `PROJECT_TYPES`:
`['Residential','Commercial','Township','Mixed-Use','Other']` →
`['High-Rise Apartments','Plotted Land','Villa Community','Commercial','Retail','Warehousing / Logistics','Other']`
(keep "Other" as catch-all). `ContactForm.tsx` picks it up automatically.

### 4.5 "Dubai" → "UAE" everywhere ✅ approved

Occurrences to change:
- `lib/constants.ts:28` — SITE.description "…India, Dubai & Australia" → "…India, UAE & Australia"
- `lib/constants.ts:51` — `reach: ['India','Dubai','Australia']` → `['India','UAE','Australia']`
- `app/about/page.tsx:78` — mission copy
- `app/contact/page.tsx:10` — metadata description
- `app/contact/page.tsx:134` — map caption "Clients across India, Dubai & Australia"
- `components/HomeReel.tsx:34` — legacy component, change anyway for consistency

**Keep:** `lib/assetReel.ts` "Ascend Towers · **Dubai**" — that's a project's city label
(placeholder), not a reach claim.

### 4.6 "Five visual disciplines" everywhere ✅ approved

- `app/page.tsx` — ScrollPinReveal `sectionDeck`: "Six visual disciplines under one roof —
  keep scrolling." → "**Five** visual disciplines under one roof — keep scrolling."
  (6 slides stay; Virtual Experiences simply owns two slides.)
- `app/services/page.tsx` — hero deck "Five pillars. One studio." → "Five visual
  disciplines. One studio."; closing CTA "Not sure which pillar your project needs?" →
  "…which discipline…"
- `app/services/page.tsx` metadata description — keep the 5 names, phrase as disciplines.

### 4.7 Remove the Work page (for now) ✅ approved

- Remove `{ href: '/work', label: 'Work' }` from `NAV_LINKS` (`lib/constants.ts`) — nav and
  footer both render from it.
- Replace `app/work/page.tsx` content with a server-side `redirect('/')`
  (`next/navigation`) so direct URLs / old shares don't 404. `PortfolioGrid.tsx` and
  `lib/portfolioData.ts` stay on disk for the future case-studies revival (Phase 3).
- No sitemap to update (no `app/sitemap.ts` exists). Legacy unimported components
  (`BentoPortfolio`, `FeaturedWork`, `ServicesShowcase`) still reference `/work` — harmless,
  redirect covers them; leave as-is.

### 4.8 Privacy & Terms pages ✅ approved — source: live site

Live-site sources (fetched 2026-06-10):
- Privacy: `https://studio.build91.in/privacy-policy`
- Terms: `https://studio.build91.in/termsconditions`
  (note the live paths; our footer links are `/privacy` and `/terms` — keep ours)

Key facts captured for adaptation:
- **Legal entity:** Manojava Systems Private Limited, Raipur, Chhattisgarh, India
- **Privacy:** 18+ only; collects voluntarily-provided personal info + cookies/log
  files/pixels; use for service delivery, payments, communication, marketing, legal
  compliance; retention "only as long as necessary", deletion requests honored within
  30 days; sharing with processors/service providers/authorities; rights requests →
  `studio@build91.in`; **Grievance Officer: Amit Mathur, `hr@build91.in`**; Indian law,
  arbitration in Raipur.
- **Terms (13 sections):** quotations via email/WhatsApp, 50% non-refundable deposit;
  visuals are artistic impressions, final build may differ; Build91 retains
  marketing/portfolio usage rights, client designs stay client IP; quotes valid 28 days
  (default); timelines depend on client feedback, deadlines not guaranteed; invoices due
  in 7 days, non-payment can pause work/withhold deliverables; client indemnifies against
  third-party claims; independent consultants may be engaged; as-is disclaimer + liability
  limits; colour-accuracy disclaimer; severability/entire agreement; independent
  contractors; **governing law India, exclusive jurisdiction courts of Raipur**;
  contact `studio@build91.in` / +91 7880147772.

Plan: create `app/privacy/page.tsx` + `app/terms/page.tsx` as static styled pages
(same section tokens as the rest of the site), adapting the live copy to the studio
context. The e-commerce-specific lines in the live privacy policy (delivery partners,
shipping) will be dropped/reworded — they belong to the build91.in commerce site, not the
studio. Footer links already point to `/privacy` & `/terms`; no footer change needed.

### 4.9 Remaining cross-cutting items

- **Instagram handle — ⚠️ NEEDS OWNER CONFIRMATION.** Three variants now in play:
  `build91_studio` (`lib/constants.ts`), `build91studio` (`SelectedWorkClient.tsx` CTA),
  and `build91studio_` (live-site footer). Plan: owner confirms the real handle → store
  once in `SITE.social.instagram` → `SelectedWorkClient` switches to reading the constant.
- Roadmap doc refresh (E3): fix the stale section-order list (BentoPortfolio → SelectedWork)
  and the Phase-5 data contract (14-day/geo-pie → 30-day/AttributionBar) in
  `V2_CONTENT_ROADMAP.md`.
- Placeholder-data confirmation list (E4) unchanged — still pre-launch blockers.

### Execution checklist (when implementation is approved)

1. `lib/constants.ts` — SERVICE_PILLARS rewrite · PROJECT_TYPES swap · reach/description
   UAE · NAV_LINKS minus Work *(one file, four edits)*
2. `app/about/page.tsx` — add `#studio` video section; `components/TrustStrip.tsx` —
   retarget pill anchors
3. `app/page.tsx` — "Five visual disciplines" deck; `app/services/page.tsx` — discipline
   copy + `/quote` CTA
4. `app/contact/page.tsx`, `components/HomeReel.tsx` — UAE copy
5. `app/work/page.tsx` — redirect to `/`
6. `app/privacy/page.tsx`, `app/terms/page.tsx` — new static pages from live-site content
7. Mobile-whitespace pass per 4.2 table — verify at 375px with before/after screenshots
8. (after owner confirms) Instagram handle unification
