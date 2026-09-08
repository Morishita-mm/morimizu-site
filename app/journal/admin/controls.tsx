'use client';
/* oxlint-disable next/no-html-link-for-pages */
import { useEffect, useState } from 'react';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
type Visibility = 'private' | 'unlisted' | 'public';
type Entry = {
  id: string;
  title: string;
  document: string;
  tags_json: string | null;
  visibility: Visibility;
  version: number;
  draft_revision: string;
  live_revision: string | null;
};
const labels = { private: '非公開', unlisted: '限定公開', public: '公開' };
async function api<T>(path: string, body?: object) {
  const response = await fetch(`/api/journal/admin/entries${path}`, {
    cache: 'no-store',
    ...(body
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      : {}),
  });
  if (!response.ok) {
    if (response.status === 401)
      throw new Error(
        '認証が必要です。ページを再読み込みしてログインしてください。',
      );
    if (response.status === 409)
      throw new Error(
        '原稿または公開設定が変更されています。再読み込みして確認してください。',
      );
    if (response.status === 400)
      throw new Error(
        '入力内容を確認してください。タグは30個まで、各80文字以内で入力できます。',
      );
    throw new Error(
      '処理できませんでした。原稿のsummaryと接続状態を確認してください。',
    );
  }
  return response.json() as Promise<T>;
}
export function JournalAdmin() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  async function load(after = '') {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ entries: Entry[]; next: string | null }>(
        after ? `?after=${encodeURIComponent(after)}` : '',
      );
      setEntries((old) =>
        after ? [...old, ...result.entries] : result.entries,
      );
      setNext(result.next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    api<{ entries: Entry[]; next: string | null }>('')
      .then((result) => {
        setEntries(result.entries);
        setNext(result.next);
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, []);
  return (
    <SiteShell path="/journal">
      <div className="shell journal">
        <header className="e-page-heading">
          <p className="e-kicker">JOURNAL / PRIVATE</p>
          <h1>原稿管理</h1>
          <p>
            保存された原稿の表示を確認し、公開範囲とタグを管理します。本文はアップロード時の内容で固定されます。
          </p>
        </header>
        <div className="journal-actions">
          <a className="e-outline-link" href="/journal/admin/upload">
            原稿をアップロード →
          </a>
          <a href="/journal">公開されたJournal</a>
        </div>
        {error && <p role="alert">{error}</p>}
        {!busy && !error && entries.length === 0 && (
          <p>
            原稿はまだありません。「原稿をアップロード」から、書き終えたMarkdownを登録してください。
          </p>
        )}
        <ol className="journal-list">
          {entries.map((e) => (
            <li key={e.id}>
              <div className="journal-meta">
                {labels[e.visibility]} · 保存済み
              </div>
              <h2>
                <a href={`/journal/admin/${e.id}`}>{e.title}</a>
              </h2>
              <p>{e.id}</p>
            </li>
          ))}
        </ol>
        {busy && <output>読み込み中…</output>}
        {next && (
          <button disabled={busy} onClick={() => void load(next)}>
            続きを表示
          </button>
        )}
      </div>
    </SiteShell>
  );
}
export function JournalControls({
  id,
  reviewedRevision,
}: {
  id: string;
  reviewedRevision: string;
}) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');
  const [share, setShare] = useState('');
  const [busy, setBusy] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  useEffect(() => {
    api<Entry>(`/${id}`)
      .then((e) => {
        setEntry(e);
        setVisibility(e.visibility);
        setTags(
          (e.tags_json !== null
            ? JSON.parse(e.tags_json)
            : JSON.parse(e.document).tags
          ).join(', '),
        );
      })
      .catch((e) => setMessage(e.message));
  }, [id]);
  async function act(action: 'apply' | 'visibility' | 'rotate' | 'tags') {
    if (!entry) return;
    setBusy(true);
    setMessage('');
    setShare('');
    try {
      const result = await api<{ sharePath: string | null }>(`/${id}`, {
        action,
        ...(action === 'tags'
          ? {
              tags: tags
                .split(/[,、\n]/)
                .map((tag) => tag.trim())
                .filter(Boolean),
            }
          : {}),
        visibility,
        version: entry.version,
        revision: reviewedRevision,
      });
      if (result.sharePath)
        setShare(new URL(result.sharePath, location.origin).href);
      setEntry(await api<Entry>(`/${id}`));
      setMessage('保存しました。');
      setReviewed(false);
      if (action === 'tags') location.reload();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const stale = entry?.draft_revision !== reviewedRevision;
  return (
    <section className="shell journal journal-controls" aria-label="公開管理">
      <a href="/journal/admin">← 原稿一覧</a>
      <h1>原稿の表示確認</h1>
      <p>
        下の表示はサーバーに保存された原稿です。本文は固定されています。公開範囲とタグはここから変更できます。
      </p>
      {entry && <p>現在：{labels[entry.visibility]} ／ 本文固定</p>}
      {stale && entry && (
        <p role="alert">
          新しい原稿が届いています。再読み込みして確認してください。
        </p>
      )}
      <p>
        <a href={`/api/journal/admin/entries/${id}?source=1`}>
          保存した原稿をダウンロード
        </a>
      </p>
      <div className="journal-tag-editor">
        <label htmlFor="journal-tags">記事のタグ</label>
        <input
          id="journal-tags"
          type="text"
          value={tags}
          disabled={!entry || busy}
          aria-describedby="journal-tags-help"
          placeholder="AI, 設計, 開発環境"
          onChange={(event) => setTags(event.target.value)}
        />
        <p id="journal-tags-help">
          カンマで区切って入力してください（30個まで・各80文字以内）。空欄で保存するとタグをすべて削除します。
        </p>
        <button disabled={!entry || busy} onClick={() => void act('tags')}>
          タグを保存
        </button>
        <p>
          タグは一覧と記事に反映されます。ダウンロードする原稿はアップロード時の内容です。
        </p>
      </div>
      <label htmlFor="journal-visibility">公開範囲</label>{' '}
      <select
        id="journal-visibility"
        value={visibility}
        onChange={(e) => {
          setVisibility(e.target.value as Visibility);
          setReviewed(false);
        }}
      >
        {Object.entries(labels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <p>
        {visibility === 'private'
          ? '本人だけが閲覧できます。共有リンクも停止します。'
          : visibility === 'unlisted'
            ? '一覧には掲載しません。リンクを持つ人は閲覧・再共有できます。'
            : '誰でも一覧から閲覧できます。'}
      </p>
      <label>
        <input
          type="checkbox"
          checked={reviewed}
          onChange={(e) => setReviewed(e.target.checked)}
        />{' '}
        下の原稿と公開範囲を確認しました
      </label>
      <div className="journal-actions">
        <button
          disabled={!entry || busy || stale || !reviewed}
          onClick={() => void act('apply')}
        >
          公開範囲を保存
        </button>
        {entry?.visibility === 'unlisted' && (
          <button
            disabled={busy || visibility !== 'unlisted'}
            onClick={() => void act('rotate')}
          >
            旧リンクを停止して新しい共有リンクを発行
          </button>
        )}
      </div>
      <output>{busy ? '保存中…' : message}</output>
      {share && (
        <p>
          共有リンク（この画面を離れる前に控えてください）：
          <a href={share}>{share}</a>
        </p>
      )}
    </section>
  );
}
