import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the static dist as-is, so any deep link (e.g.
// /preview/teams-card) returns 404 on hard load before the SPA boots.
// Standard fix: emit a 404.html that's identical to index.html so GH Pages
// falls back to the SPA, which then resolves the route via React Router.
const spa404Fallback = () => ({
  name: 'spa-404-fallback',
  closeBundle() {
    const dist = resolve(__dirname, 'dist');
    copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), spa404Fallback()],
  base: '/RADAR-UI/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
