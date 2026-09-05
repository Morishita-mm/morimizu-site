import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Deliberately separate from app/ and public/. Neither the sample routes nor
// their artwork enter the normal Cloudflare production build.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: false,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('../../', import.meta.url)) },
  },
  css: { postcss: { plugins: [] } },
  build: {
    outDir: '../../work/workshop-sample',
    emptyOutDir: true,
  },
});
