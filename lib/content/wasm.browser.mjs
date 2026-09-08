import url from '@ox-content/wasm/ox_content_wasm_bg.wasm?url';

// Only the standalone workshop renders Markdown in the browser. Its article
// chunk loads this module once; production articles are server components.
const response = await fetch(url);
if (!response.ok) throw new Error('Markdown engine could not be loaded');
export default await WebAssembly.compile(await response.arrayBuffer());
