'use client';
/* oxlint-disable next/no-html-link-for-pages */
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Upload,
  Search,
  FileText,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Modal } from './modal';
import { AdminFrame } from './frame';
import {
  request,
  statusName,
  dateLabel,
  kindNames,
  type Entry,
} from './client';

const tabs = {
  all: 'すべて',
  private: '未公開',
  public: '公開中',
  unlisted: '限定公開',
  stopped: '公開停止',
  trash: 'ゴミ箱',
};
type Listing = {
  entries: Entry[];
  next: string | null;
  counts: Record<string, number>;
};
export function JournalAdmin() {
  const router = useRouter();
  const search = useSearchParams();
  const query = search.toString();
  const [data, setData] = useState<Listing | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{
    entry: Entry;
    action: string;
  } | null>(null);
  const [reload, setReload] = useState(0);
  const [message, setMessage] = useState('');
  const status = search.get('status') ?? 'all';
  useEffect(() => {
    const controller = new AbortController();
    request<Listing>(`/entries?${query}`, undefined, {
      signal: controller.signal,
    })
      .then(setData)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [query, reload]);
  function filter(values: Record<string, string>) {
    setBusy(true);
    setError('');
    const params = new URLSearchParams(query);
    params.delete('after');
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`/journal/admin?${params}`);
  }
  async function create() {
    setBusy(true);
    setError('');
    try {
      const e = await request<Entry>('/entries', {});
      router.push(`/journal/admin/${e.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  async function act() {
    if (!pending) return;
    setBusy(true);
    setError('');
    try {
      await request(`/entries/${pending.entry.id}`, {
        action: pending.action,
        version: pending.entry.version,
        visibility: 'private',
      });
      setMessage(
        pending.action === 'purge'
          ? '記事を完全に削除しました。'
          : pending.action === 'restore'
            ? '非公開で復元しました。'
            : pending.action === 'trash'
              ? 'ゴミ箱に移動しました。'
              : '公開を停止しました。',
      );
      setPending(null);
      setReload((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <AdminFrame>
      <header className="ja-heading">
        <div>
          <p className="ja-eyebrow">YOUR WRITING SPACE</p>
          <h1>記事を育てる。</h1>
          <p className="ja-muted">
            アイデアを下書きに。伝えたいタイミングで公開。
          </p>
        </div>
        <div className="ja-actions">
          <a className="ja-button" href="/journal/admin/upload">
            <Upload size={16} />
            インポート
          </a>
          <button
            className="ja-button ja-primary"
            disabled={busy}
            onClick={() => void create()}
          >
            <Plus size={18} />
            記事を書く
          </button>
        </div>
      </header>
      <div className="ja-tabs" aria-label="記事の状態">
        {Object.entries(tabs).map(([key, label]) => (
          <button
            key={key}
            aria-current={status === key ? 'page' : undefined}
            onClick={() => filter({ status: key })}
          >
            {label}
            <span>{data?.counts[key] ?? '—'}</span>
          </button>
        ))}
      </div>
      <form
        className="ja-filters"
        key={query}
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          filter(Object.fromEntries(form) as Record<string, string>);
        }}
      >
        <label className="ja-search">
          <Search size={18} />
          <input
            aria-label="タイトルを検索"
            name="q"
            defaultValue={search.get('q') ?? ''}
            placeholder="タイトルを検索…"
          />
        </label>
        <input
          aria-label="タグで絞り込み"
          name="tag"
          defaultValue={search.get('tag') ?? ''}
          placeholder="タグ"
        />
        <select
          aria-label="記事の種類"
          name="kind"
          defaultValue={search.get('kind') ?? ''}
        >
          <option value="">すべての種類</option>
          {[
            'article',
            'log',
            'hypothesis',
            'experiment',
            'decision',
            'failure',
          ].map((k) => (
            <option key={k} value={k}>
              {kindNames[k]}
            </option>
          ))}
        </select>
        <select
          aria-label="並び順"
          name="sort"
          defaultValue={search.get('sort') ?? 'desc'}
        >
          <option value="desc">保存が新しい順</option>
          <option value="asc">保存が古い順</option>
        </select>
        <button className="ja-button">検索</button>
      </form>
      {error && (
        <p className="ja-error" role="alert">
          {error}
          <button onClick={() => setReload((v) => v + 1)}>再試行</button>
        </p>
      )}
      <output className="ja-status">{busy ? '読み込み中…' : message}</output>
      <div className="ja-list" aria-busy={busy}>
        <div className="ja-list-head">
          <span>記事</span>
          <span>状態</span>
          <span>保存日時 / 公開日</span>
          <span>操作</span>
        </div>
        {data?.entries.map((e) => (
          <div className="ja-row" key={e.id}>
            <div className="ja-row-title">
              <FileText size={20} />
              <div>
                <a href={`/journal/admin/${e.id}`}>{e.title || '無題の記事'}</a>
                <div className="ja-tags">
                  {JSON.parse(e.tags_json ?? '[]').map((tag: string) => (
                    <button key={tag} onClick={() => filter({ tag })}>
                      {tag}
                    </button>
                  ))}
                  <span>{kindNames[e.kind] ?? e.kind}</span>
                </div>
              </div>
            </div>
            <div>
              <span
                className={`ja-badge ${e.visibility === 'public' && !e.deleted_at ? 'is-public' : ''}`}
              >
                {statusName(e)}
              </span>
              {e.live_revision &&
                e.draft_revision !== e.live_revision &&
                !e.deleted_at && (
                  <small className="ja-muted">未反映の変更あり</small>
                )}
            </div>
            <div className="ja-row-date">
              <time>{dateLabel(e.received_at)}</time>
              <small>
                {e.published_at
                  ? `公開 ${e.published_at}`
                  : 'まだ公開していません'}
              </small>
            </div>
            <div className="ja-row-actions">
              {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Escape from any descendant dismisses the native disclosure. */}
              <details
                className="ja-menu"
                name="journal-row-actions"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    event.currentTarget.open = false;
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.currentTarget.open = false;
                    event.currentTarget.querySelector('summary')?.focus();
                  }
                }}
              >
                <summary
                  className="ja-icon-action"
                  aria-label={`${e.title || '無題の記事'}の操作`}
                  data-tooltip="その他の操作"
                >
                  <MoreHorizontal size={20} aria-hidden="true" />
                </summary>
                <div>
                  {!e.deleted_at ? (
                    <>
                      <a href={`/journal/admin/${e.id}?view=preview`}>
                        プレビュー
                      </a>
                      <a href={`/journal/admin/${e.id}`}>編集・タグ変更</a>
                      <a href={`/api/journal/admin/entries/${e.id}?source=1`}>
                        Markdownを保存
                      </a>
                      {e.visibility === 'public' && (
                        <a
                          href={`/journal/${e.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          公開記事を開く ↗
                        </a>
                      )}
                      {e.visibility !== 'private' && (
                        <button
                          onClick={() =>
                            setPending({ entry: e, action: 'visibility' })
                          }
                        >
                          公開を停止
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        setPending({ entry: e, action: 'restore' })
                      }
                    >
                      非公開で復元
                    </button>
                  )}
                </div>
              </details>
              <button
                className="ja-icon-action ja-danger"
                aria-label={e.deleted_at ? '完全に削除' : 'ゴミ箱に移動'}
                data-tooltip={e.deleted_at ? '完全に削除' : 'ゴミ箱に移動'}
                onClick={() =>
                  setPending({
                    entry: e,
                    action: e.deleted_at ? 'purge' : 'trash',
                  })
                }
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        {!busy && data?.entries.length === 0 && (
          <div className="ja-empty">
            <FileText size={32} />
            <h2>
              {status === 'trash' ? 'ゴミ箱は空です' : '記事が見つかりません'}
            </h2>
            <p>検索条件を変えるか、新しい記事を書いてみましょう。</p>
          </div>
        )}
      </div>
      {data?.next && (
        <button
          className="ja-button ja-more"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const more = await request<Listing>(
                `/entries?${query}&after=${data.next}`,
              );
              setData({ ...more, entries: [...data.entries, ...more.entries] });
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          さらに表示
        </button>
      )}
      {pending && (
        <Modal label="記事の操作確認" onClose={() => !busy && setPending(null)}>
          {error && (
            <p className="ja-error" role="alert">
              {error}
            </p>
          )}
          <Trash2 size={24} />
          <h2 id="confirm-title">
            {pending.action === 'purge'
              ? '完全に削除しますか？'
              : pending.action === 'restore'
                ? '記事を復元しますか？'
                : pending.action === 'trash'
                  ? 'ゴミ箱に移動しますか？'
                  : '公開を停止しますか？'}
          </h2>
          <p>「{pending.entry.title || '無題の記事'}」</p>
          <p className="ja-muted">
            {pending.action === 'purge'
              ? '保存原稿と変更履歴も削除します。この操作は取り消せません。'
              : pending.action === 'restore'
                ? '非公開で復元します。以前の共有リンクは復活しません。'
                : '読者と共有リンクから閲覧できなくなります。原稿は残ります。'}
          </p>
          <div className="ja-actions">
            <button
              className="ja-button"
              disabled={busy}
              onClick={() => setPending(null)}
            >
              キャンセル
            </button>
            <button
              className="ja-button ja-primary"
              disabled={busy}
              onClick={() => void act()}
            >
              実行する
            </button>
          </div>
        </Modal>
      )}
    </AdminFrame>
  );
}
