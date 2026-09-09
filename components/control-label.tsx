/** Reserve space for both translations; expose only the current label. */
export function ControlLabel({
  ja,
  en,
  locale,
}: {
  ja: string;
  en: string;
  locale: 'ja' | 'en';
}) {
  return (
    <span className="e-control-label">
      <span lang="ja" aria-hidden={locale !== 'ja'}>{ja}</span>
      <span lang="en" aria-hidden={locale !== 'en'}>{en}</span>
    </span>
  );
}
