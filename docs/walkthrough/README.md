# Parameter-attribution drawer — demo links

GitHub Pages serves the SPA under hash routing, so all deep links use the
`/#/route?query` format.

| State | URL | Screenshot |
|---|---|---|
| Tariff case (Geopolitical, 10% → 50%) | https://abhillashjadhav.github.io/RADAR-UI/#/signals?lens=geopolitical | `param_tariff.png` |
| Binary flip (Compliance, WRO 0 → 1 TRIGGERED) | https://abhillashjadhav.github.io/RADAR-UI/#/signals?lens=esg_regulatory&supplier=SUPA-002 | `param_triggered.png` |
| No change in window (Logistics, index 62 → 62) | https://abhillashjadhav.github.io/RADAR-UI/#/signals?lens=logistics_transport&supplier=SUPA-001 | `param_nochange.png` |

Screenshots are captured from the production build (`vite preview`) at 1500×1000.
Regenerate with `node scripts/capture_walkthrough.mjs` (full app walkthrough)
or the ad-hoc script in the session scratchpad for these three states.
