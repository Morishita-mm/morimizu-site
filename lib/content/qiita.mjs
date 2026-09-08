/** Preserve decimal dollar prices while keeping code and actual $O(N)$ math. */
export function prepareQiitaBody(content) {
  return content
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g)
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part.replace(/(?<!\\)\$(?=\d+\.\d{2}(?:\s|[*/),]))/g, '\\$'),
    )
    .join('');
}
