export function chooseLocale(
  saved: string | null,
  query: string | null,
  browser: string | undefined,
  englishPath = false,
): 'ja' | 'en' {
  if (saved === 'ja' || saved === 'en') return saved;
  if (query === 'ja' || query === 'en') return query;
  if (englishPath) return 'en';
  return !browser || /^ja(?:-|$)/i.test(browser) ? 'ja' : 'en';
}
