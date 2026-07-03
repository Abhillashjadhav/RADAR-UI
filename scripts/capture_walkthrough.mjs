#!/usr/bin/env node
// Automated click-by-click walkthrough capture.
// Starts the dev server (if not already running), drives the app with
// Playwright at 1920x1080, and saves numbered PNGs to walkthrough/.
//
//   node scripts/capture_walkthrough.mjs
//
// Uses the system-installed Playwright + Chromium (no download).
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'walkthrough');
const PORT = 5173;
const BASE = `http://localhost:${PORT}/RADAR-UI`;

// Prefer local playwright; fall back to the global install used in this env.
async function loadChromium() {
  try { return (await import('playwright')).chromium; }
  catch { return (await import('/opt/node22/lib/node_modules/playwright/index.mjs')).chromium; }
}
const CHROME_PATHS = [undefined, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'];

async function serverUp() {
  try { const r = await fetch(`${BASE}/`); return r.ok || r.status === 302; }
  catch { return false; }
}

async function ensureServer() {
  if (await serverUp()) return null;
  console.log('starting dev server…');
  const proc = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(PORT)], {
    cwd: ROOT, stdio: 'ignore', detached: true,
  });
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (await serverUp()) return proc;
  }
  throw new Error('dev server did not come up on :' + PORT);
}

const settle = (p, ms = 700) => p.waitForTimeout(ms);

async function main() {
  mkdirSync(OUT, { recursive: true });
  const devProc = await ensureServer();

  const chromium = await loadChromium();
  let browser;
  for (const executablePath of CHROME_PATHS) {
    try { browser = await chromium.launch({ executablePath }); break; } catch { /* try next */ }
  }
  if (!browser) throw new Error('could not launch chromium');

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));

  const shot = async name => {
    await settle(page);
    await page.screenshot({ path: `${OUT}/${name}` });
    console.log('captured', name);
  };

  // ---- Network view (mock) --------------------------------------------------
  await page.goto(`${BASE}/network`, { waitUntil: 'networkidle' });
  await shot('01_network_landing.png');

  await page.getByRole('button', { name: 'ANALYZE' }).click();
  await shot('02_network_analyzed.png');

  await page.getByRole('button', { name: '90%' }).click();
  await shot('03_network_coverage_90.png');

  // Lens filter (floating bar select)
  await page.locator('select[aria-label="Lens filter"]').first().selectOption('geopolitical');
  await shot('04_network_lens_filter.png');

  // Click a priority supplier node (its label text bubbles to the <g> handler)
  await page.locator('svg g.cursor-pointer text').filter({ hasText: /Celestica|VTECH|Flex/ }).first().click();
  await shot('05_network_node_panel.png');

  // Full supplier table
  await page.getByRole('button', { name: /See all \d+ suppliers/ }).click();
  await shot('06_fulltable_open.png');

  // POP Change sorted desc (first click = descending, movers on top)
  await page.getByText('POP Change', { exact: false }).first().click();
  await shot('07_fulltable_pop_sorted.png');

  // Lens filter inside the modal (last select on screen — modal overlays page)
  await page.locator('select[aria-label="Lens filter"]').last().selectOption('geopolitical');
  await shot('08_fulltable_lens_filtered.png');

  // ---- Signals ----------------------------------------------------------------
  await page.goto(`${BASE}/signals`, { waitUntil: 'networkidle' });
  // 09 = landing before the movers sort: toggle the default off to show recency order
  await page.getByRole('button', { name: /Biggest movers/ }).click();
  await shot('09_signals_landing.png');

  // 10 = movers sort applied (delta descending — reds on top)
  await page.getByRole('button', { name: /Biggest movers/ }).click();
  await shot('10_signals_movers.png');

  await page.locator('select[aria-label="Lens filter"]').selectOption('geopolitical');
  await shot('11_signals_lens_filter.png');

  // 12 = drawer for the top row, scrolled to the attribution bar
  await page.locator('select[aria-label="Lens filter"]').selectOption('all');
  await page.locator('tbody tr').first().click();
  await settle(page);
  const attribution = page.getByText('sub-factor attribution', { exact: false }).first();
  if (await attribution.count()) await attribution.scrollIntoViewIfNeeded();
  await shot('12_signals_drawer.png');

  // ---- QSC Live -----------------------------------------------------------------
  await page.goto(`${BASE}/network-live`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'ANALYZE' }).click();
  await settle(page, 1000);
  await shot('13_qsclive_analyzed.png');

  await page.getByRole('button', { name: /See all \d+ suppliers/ }).click();
  await shot('14_qsclive_fulltable.png');

  await browser.close();
  if (devProc) devProc.kill();

  console.log('\nwalkthrough/ contents:');
  for (const f of readdirSync(OUT).sort()) console.log(' ', f);
}

main().catch(e => { console.error(e); process.exit(1); });
