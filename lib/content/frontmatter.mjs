import { load, JSON_SCHEMA } from 'js-yaml';

/**
 * Data-only YAML shared by ingestion pipelines. Ox Content's WASM transform
 * does not implement full YAML (arrays, block scalars, duplicate validation).
 * Keep metadata decoding independent of the Markdown rendering backend.
 * @param {string} source
 * @returns {{ data: Record<string, unknown>, content: string, hasFrontmatter: boolean }}
 */
export function readFrontMatter(source) {
  if (!/^---(?:\r?\n|$)/.test(source))
    return { data: {}, content: source, hasFrontmatter: false };
  const header = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!header) throw new Error('Invalid YAML front matter');
  let data;
  try {
    data = load(header[1], { schema: JSON_SCHEMA });
  } catch {
    throw new Error('Invalid YAML front matter');
  }
  if (!data || Object.getPrototypeOf(data) !== Object.prototype)
    throw new Error('Invalid front matter object');
  return {
    data,
    content: source.slice(header[0].length),
    hasFrontmatter: true,
  };
}
