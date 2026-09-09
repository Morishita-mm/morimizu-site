// Highlight the changed block without a quadratic diff on large manuscripts.
export function ManuscriptDiff({
  before,
  after,
  beforeLabel = '保存済み原稿',
  afterLabel = '取り込む原稿',
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const a = before.split('\n'),
    b = after.split('\n');
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length,
    endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  return (
    <div className="ja-diff">
      <section>
        <h3>{beforeLabel}</h3>
        <pre>
          {a.map((line, i) => (
            <span
              key={i}
              className={i >= start && i < endA ? 'ja-diff-removed' : undefined}
            >
              {line || ' '}
              <br />
            </span>
          ))}
        </pre>
      </section>
      <section>
        <h3>{afterLabel}</h3>
        <pre>
          {b.map((line, i) => (
            <span
              key={i}
              className={i >= start && i < endB ? 'ja-diff-added' : undefined}
            >
              {line || ' '}
              <br />
            </span>
          ))}
        </pre>
      </section>
    </div>
  );
}
