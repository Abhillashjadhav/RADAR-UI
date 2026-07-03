#!/usr/bin/env node
// Deck frames: 14 click states at 1920x1080 -> walkthrough/frames/, plus
// walkthrough/frames/boxes.json with the highlight rectangle per frame
// (viewport coords, matching the screenshot pixels).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'walkthrough/frames');
const PORT = 5173;
const BASE = `http://localhost:${PORT}/RADAR-UI`;

async function loadChromium() {
  try { return (await import('playwright')).chromium; }
  catch { return (await import('/opt/node22/lib/node_modules/playwright/index.mjs')).chromium; }
}

async function serverUp() {
  try { const r = await fetch(`${BASE}/`); return r.ok || r.status === 302; }
  catch { return false; }
}
async function ensureServer() {
  if (await serverUp()) return null;
  const proc = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(PORT)], {
    cwd: ROOT, stdio: 'ignore', detached: true,
  });
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (await serverUp()) return proc;
  }
  throw new Error('dev server not up');
}

const union = (a, b) => {
  if (!a) return b; if (!b) return a;
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y };
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const devProc = await ensureServer();
  const chromium = await loadChromium();
  let browser;
  for (const executablePath of [undefined, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome']) {
    try { browser = await chromium.launch({ executablePath }); break; } catch { /* next */ }
  }
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  const boxes = {};
  const settle = (ms = 800) => page.waitForTimeout(ms);

  const shot = async (name, boxLocators = []) => {
    await settle();
    let box = null;
    for (const loc of boxLocators) {
      try {
        if (await loc.count()) {
          await loc.first().scrollIntoViewIfNeeded();
          await page.waitForTimeout(150);
          box = union(box, await loc.first().boundingBox());
        }
      } catch { /* skip */ }
    }
    boxes[name] = box;
    await page.screenshot({ path: `${OUT}/${name}` });
    console.log('captured', name, box ? 'with box' : 'NO BOX');
  };

  // 01 homepage
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle' });
  await shot('01_homepage.png', [page.locator('div.rounded-2xl:has(input)')]);

  // 02-06 network
  await page.goto(`${BASE}/#/network`, { waitUntil: 'networkidle' });
  await shot('02_network_landing.png', [page.getByRole('button', { name: 'ANALYZE' })]);
  await page.getByRole('button', { name: 'ANALYZE' }).click();
  await shot('03_network_analyzed.png', [page.locator('div.border-l-4')]);
  await page.getByRole('button', { name: '90%' }).click();
  await shot('04_network_coverage_90.png', [page.getByRole('button', { name: '90%' }), page.locator('div.border-l-4')]);
  await page.locator('select[aria-label="Lens filter"]').first().selectOption('geopolitical');
  await shot('05_network_lens_filter.png', [page.locator('select[aria-label="Lens filter"]').first()]);
  await page.locator('svg g.cursor-pointer text').filter({ hasText: /Celestica|VTECH|Flex/ }).first().click();
  await shot('06_network_node_panel.png', [page.locator('div.w-72').last()]);

  // 07-09 full table modal
  await page.getByRole('button', { name: /See all \d+ suppliers/ }).click();
  await shot('07_fulltable_open.png', [page.locator('div.max-w-6xl')]);
  const popHeader = page.getByText('POP Change', { exact: false }).first();
  await popHeader.click();
  await settle(500);
  // header + top rows: extend the header box downward
  {
    const hb = await popHeader.boundingBox();
    boxes['08_fulltable_pop_sorted.png'] = hb ? { x: hb.x - 8, y: hb.y - 4, width: hb.width + 16, height: hb.height + 170 } : null;
    await page.screenshot({ path: `${OUT}/08_fulltable_pop_sorted.png` });
    console.log('captured 08_fulltable_pop_sorted.png with box');
  }
  await page.locator('select[aria-label="Lens filter"]').last().selectOption('geopolitical');
  await shot('09_fulltable_lens.png', [page.locator('select[aria-label="Lens filter"]').last()]);

  // 10-12 signals
  await page.goto(`${BASE}/#/signals`, { waitUntil: 'networkidle' });
  await shot('10_signals_landing.png', [page.locator('table').first()]);
  // movers: toggle off then on so 11 shows the applied sort as a distinct click
  await page.getByRole('button', { name: /Biggest movers/ }).click();
  await settle(400);
  await page.getByRole('button', { name: /Biggest movers/ }).click();
  await shot('11_signals_movers.png', [page.getByRole('button', { name: /Biggest movers/ })]);
  await page.locator('tbody tr').first().click();
  await settle(900);
  const attr = page.locator('div.rounded-xl', { hasText: 'sub-factor attribution' }).last();
  await shot('12_signals_drawer.png', [attr]);

  // 13-14 QSC live
  await page.goto(`${BASE}/#/network-live`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'ANALYZE' }).click();
  await settle(1000);
  await shot('13_qsclive_analyzed.png', [page.locator('div.border-l-4')]);
  await page.getByRole('button', { name: /See all \d+ suppliers/ }).click();
  await settle(600);
  await shot('14_qsclive_fulltable.png', [
    page.getByText('POP Change', { exact: false }).first(),
    page.locator('th', { hasText: 'Lens' }).first(),
  ]);

  writeFileSync(`${OUT}/boxes.json`, JSON.stringify(boxes, null, 2));
  await browser.close();
  if (devProc) devProc.kill();
  console.log('done — boxes.json written');
}

main().catch(e => { console.error(e); process.exit(1); });
