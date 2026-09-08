// Retire the Phase 1 projection without reading any local manuscripts.
import { rm } from 'node:fs/promises';
await rm(new URL('../lib/generated/journal-entries.ts', import.meta.url), {
  force: true,
});
console.log('Journal content is runtime-only; no manuscripts read.');
