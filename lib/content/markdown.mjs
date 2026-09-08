import { sanitize, defaultSchema } from 'hast-util-sanitize';
import rehypeKatex from 'rehype-katex';
import { VFile } from 'vfile';
import { parseMarkdown } from './ox-content.mjs';

/** @import {Root, Element, RootContent} from 'hast' */

const schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'details',
    'summary',
    'dl',
    'dt',
    'dd',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'target', 'rel'],
    code: [['className', /^language-./, 'math-inline', 'math-display']],
    details: ['open'],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      'width',
      'height',
      'loading',
      'decoding',
    ],
  },
};

// KaTeX warnings can quote private manuscript text; diagnostics stay in VFile.
const renderMath = rehypeKatex({
  trust: false,
  strict: 'ignore',
  maxExpand: 1000,
  maxSize: 20,
});

/** @param {Root | RootContent} node @param {(node: Element) => void} visit */
function elements(node, visit) {
  if (node.type === 'element') visit(node);
  if ('children' in node)
    for (const child of node.children) elements(child, visit);
}

/**
 * Compile an article body into sanitized, renderer-independent HAST.
 * Ordering is deliberate: parse → normalize math → sanitize → trusted KaTeX.
 * The caller never receives Ox Content HTML or a vendor-owned AST.
 * @param {string} source
 * @returns {Root}
 */
export function compileMarkdown(source) {
  const tree = sanitize(parseMarkdown(source), schema);

  // Keep heading and footnote links working with the sanitizer's DOM-clobber
  // protection. IDs remain prefixed; only links to existing IDs are adjusted.
  const ids = new Set();
  elements(tree, (node) => {
    if (typeof node.properties.id === 'string') ids.add(node.properties.id);
  });
  elements(tree, (node) => {
    const href = node.properties.href;
    if (
      node.tagName !== 'a' ||
      typeof href !== 'string' ||
      !href.startsWith('#')
    )
      return;
    try {
      if (
        ids.has(`${schema.clobberPrefix}${decodeURIComponent(href.slice(1))}`)
      )
        node.properties.href = `#${schema.clobberPrefix}${href.slice(1)}`;
    } catch {
      // Malformed fragments stay inert rather than aborting the whole article.
    }
  });
  renderMath(tree, new VFile());
  return tree;
}
