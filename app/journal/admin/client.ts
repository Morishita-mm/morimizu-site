export type Entry = {
  id: string;
  title: string;
  kind: string;
  tags_json: string | null;
  visibility: 'private' | 'unlisted' | 'public';
  version: number;
  draft_revision: string;
  live_revision: string | null;
  document: string;
  source: string;
  received_at: string;
  published_at: string | null;
  deleted_at: string | null;
};
export const statusName = (
  entry: Pick<Entry, 'deleted_at' | 'visibility' | 'published_at'>,
) =>
  entry.deleted_at
    ? 'ゴミ箱'
    : entry.visibility === 'public'
      ? '公開中'
      : entry.visibility === 'unlisted'
        ? '限定公開'
        : entry.published_at
          ? '公開停止'
          : '未公開';
export async function request<T>(
  path: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/journal/admin${path}`, {
    cache: 'no-store',
    redirect: 'error',
    ...options,
    ...(body !== undefined
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      : {}),
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    const message =
      response.status === 401
        ? 'ログインの有効期限が切れています。原稿をダウンロードしてから再読み込みしてください。'
        : response.status === 409
          ? '別の画面で変更されています。編集中の内容は残っています。原稿をダウンロードするか、保存版を読み直してください。'
          : response.status === 503
            ? '接続できません。編集中の内容は残っています。しばらくしてから再試行してください。'
            : `入力内容を確認してください：${result.error ?? response.status}`;
    throw Object.assign(new Error(message), { status: response.status });
  }
  return response.json();
}
export function download(source: string, id: string) {
  const url = URL.createObjectURL(
    new Blob([source], { type: 'text/markdown;charset=utf-8' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `${id}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const dateLabel = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export const kindNames: Record<string, string> = {
  article: '記事',
  log: '日々の記録',
  hypothesis: '仮説',
  experiment: '実験',
  decision: '判断',
  failure: '失敗・振り返り',
};
