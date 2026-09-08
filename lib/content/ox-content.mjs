import { initSync, parseAndRender, WasmParserOptions } from '@ox-content/wasm';
import { fromHtml } from 'hast-util-from-html';
import wasmModule from '#content-wasm';

/** @import {Root, RootContent} from 'hast' */

initSync({ module: wasmModule });

/**
 * The engine boundary: Markdown in, untrusted HAST out. No engine-owned AST,
 * markup conventions, or option types escape this module.
 * @param {string} source
 * @returns {Root}
 */
export function parseMarkdown(source) {
  // wasm-bindgen transfers ownership of these options to each Rust call.
  const options = new WasmParserOptions();
  options.gfm = true;
  options.math = true;
  options.mdx = false;
  options.semanticFootnotes = true;
  options.autolinkUrls = false;
  options.linkTargetBlank = false;
  options.autolinkTargetBlank = false;
  const result = parseAndRender(source, options);
  if (
    !result ||
    typeof result.html !== 'string' ||
    !Array.isArray(result.errors) ||
    result.errors.length
  ) {
    // Parser diagnostics may contain private manuscript text.
    throw new Error('Markdown could not be parsed');
  }
  const tree = fromHtml(result.html, { fragment: true });
  normalizeMath(tree);
  return tree;
}

/** @param {Root | RootContent} node */
function normalizeMath(node) {
  if (node.type === 'element') {
    const classes = node.properties.className;
    const tex = node.properties.dataOxTex;
    if (
      (node.tagName === 'span' || node.tagName === 'div') &&
      Array.isArray(classes) &&
      classes.includes('ox-math') &&
      typeof tex === 'string' &&
      (classes.includes('ox-math-inline') || classes.includes('ox-math-block'))
    ) {
      node.tagName = 'code';
      node.properties = {
        className: [
          'language-math',
          classes.includes('ox-math-block') ? 'math-display' : 'math-inline',
        ],
      };
      node.children = [{ type: 'text', value: tex }];
    }
  }
  if ('children' in node)
    for (const child of node.children) normalizeMath(child);
}
