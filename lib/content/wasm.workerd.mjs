// Vinext also runs this Worker bundle under Node for prerendering. Keep the
// Worker-only WASM import lazy so Node does not try to link it as a JS module.
const { default: wasmModule } =
  typeof WebSocketPair === 'function'
    ? await import('@ox-content/wasm/ox_content_wasm_bg.wasm')
    : await import('./wasm.node.mjs');

export default wasmModule;
