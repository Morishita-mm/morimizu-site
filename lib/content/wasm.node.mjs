import { readFileSync } from 'node:fs';

// Node tooling and tests use the same WASM engine as production.
const wasmModule = new WebAssembly.Module(
  readFileSync(
    new URL(import.meta.resolve('@ox-content/wasm/ox_content_wasm_bg.wasm')),
  ),
);
export default wasmModule;
