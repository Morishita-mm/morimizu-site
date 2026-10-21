// The consuming plugin loads this adapter through both require() and import.
// oxlint-disable-next-line typescript/no-require-imports
const tinyglobby = require('tinyglobby');

// This is not a general fast-glob replacement. The override is scoped to the
// build plugin whose only call is sync(string[], { cwd: dirname(importer) }).
// Reject new API usage rather than silently ignoring incompatible options.
function sync(patterns, options = {}) {
  const inputs = typeof patterns === 'string' ? [patterns] : patterns;
  if (!Array.isArray(inputs) || inputs.length > 256)
    throw new TypeError('Expected at most 256 build glob patterns');
  for (const pattern of inputs) {
    if (typeof pattern !== 'string' || pattern.length > 4096)
      throw new TypeError(
        'Build glob patterns must be strings of at most 4096 characters',
      );
    let depth = 0;
    for (let index = 0; index < pattern.length; index++) {
      const character = pattern[index];
      if (character === '\\') {
        index++;
        continue;
      }
      if (character === '{' && ++depth > 32)
        throw new RangeError('Build glob brace nesting exceeds 32');
      if (character === '}' && depth > 0) depth--;
    }
  }
  if (
    !options ||
    Object.keys(options).some((key) => key !== 'cwd') ||
    (options.cwd !== undefined && typeof options.cwd !== 'string')
  )
    throw new TypeError('Only the build glob cwd option is supported');
  return tinyglobby.globSync(inputs, {
    cwd: options.cwd,
    expandDirectories: false,
    onlyFiles: true,
    dot: false,
    followSymbolicLinks: true,
  });
}

module.exports = { sync };
