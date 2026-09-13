import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Local design study. The production app never imports this entry or its assets.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: false,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('../../', import.meta.url)) },
  },
  css: { postcss: { plugins: [] } },
  server: {
    host: '127.0.0.1',
    port: 3005,
    strictPort: true,
    watch: { useFsEvents: false, usePolling: true },
  },
  build: { outDir: '../../work/origori-concept', emptyOutDir: true },
});
