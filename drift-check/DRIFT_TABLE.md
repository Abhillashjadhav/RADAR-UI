# Drift table — brief-spec vs build (2026-07-03)

Reference PNGs were NOT present in /design-reference/ at run time; the brief's
written descriptions were treated as the authoritative spec. A final pixel
pass against the six production screenshots is PENDING their upload.
Before/after captures: drift-check/current/ vs drift-check/final/.

| # | Element | Production (per brief) | Ours (before) | Fix | Status |
|---|---------|------------------------|----------------|-----|--------|
| 1 | Homepage | Chat landing: sparkle icon, two-tone greeting, Pro-chip input + gold send, caution line, 5 suggestion chips, wave background | Old supplier dashboard at / | src/components/Home/ChatHome.tsx; / rewired, Dashboard moved to /dashboard | FIXED |
| 2 | New Chat target | Button opens chat homepage | Button inert | Sidebar wordmark links / (New Chat → /) | FIXED |
| 3 | Data Mapper | RADAR > Onboarding: dropzone copy, Select File, red-starred schema chips, Proceed bottom-right | /soon placeholder | src/components/DataMapper/DataMapper.tsx | FIXED |
| 4 | Supplier Risk Assessment (pre) | Helper line, Commodity/Suppliers/Duration selects, Run button, previous-runs stack with per-run Commodity/Suppliers line | Old supplier detail page | src/components/SupplierRisk/SupplierRiskAssessment.tsx | FIXED |
| 5 | Supplier Risk Assessment (running) | AI ANALYSIS IN PROGRESS banner + Cancel + progress bar, Analyzing status row, skeleton cards | Missing | same file — simulated run loop | FIXED |
| 6 | Top dark strip | Grid glyph far left | Bare 8px strip | PageHeader.tsx: 32px strip + LayoutGrid glyph | FIXED |
| 7 | Nav badge | Dark circle, white count | Gold circle, dark count | Sidebar.tsx badge classes | FIXED |
| 8 | Client switcher | Dark avatar, lowercase name, small-caps CLIENT | "QSC" uppercase | Sidebar.tsx → "qsc" | FIXED |
| 9 | f-coin scope | ONLY Data Mapper + Supplier Risk Assessment | On Network/Signals/Risk Monitor/modal too | FCoin removed from those four; kept on the two production pages | FIXED |
| 10 | RADAR > Onboarding link | Data Mapper page | /soon placeholder | Sidebar link → /data-mapper | FIXED |
| 11 | Supplier Risk link | Assessment page | /supplier/SUP-001 detail | Sidebar link → /supplier-risk | FIXED |
| 12 | Dashboard bottom row | Separate row above client switcher | Pointed at / (now chat home) | → /dashboard | FIXED |

Intentional differences kept: card-style network nodes; added surfaces
(Signals, QSC Live, anomaly/parameter drawers).

PENDING (needs the six reference PNGs): verbatim microcopy audit, stat-card
sub-lines, "— 0" category deltas, tier-band canvas labels, six network stat
tiles, SUMMARY STATS toggle, mini-map, exact glyph set — i.e. the Agent A/B/C
image-diff pass.
