'use client';
/* oxlint-disable next/no-html-link-for-pages */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Download,
  History,
  Eye,
  PenLine,
  Upload,
} from 'lucide-react';
import type { JournalEntry } from '@/lib/journal/types';
import { readFrontMatter } from '@/lib/content/frontmatter.mjs';
import { serializeManuscript, today } from '@/journal/manuscript.mjs';
import { ManuscriptDiff } from './diff';
import { Modal } from './modal';
import { AdminFrame } from './frame';
import {
  request,
  download,
  statusName,
  dateLabel,
  kindNames,
  type Entry,
} from './client';
import { ArticlePreview, type Preview } from './preview';

type Revision = { revision: string; title: string; received_at: string };
export function JournalEditor({ id }: { id: string }) {
  const search = useSearchParams();
  const [entry, setEntry] = useState<Entry | null>(null);
  const entryRef = useRef<Entry | null>(null);
  const [source, setSource] = useState('');
  const sourceRef = useRef('');
  const saved = useRef('');
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState('読み込み中…');
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [view, setView] = useState(
    search.get('view') === 'preview' ? 'preview' : 'edit',
  );
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [publish, setPublish] = useState(false);
  const [visibility, setVisibility] = useState<Entry['visibility']>('public');
  const [share, setShare] = useState('');
  const [history, setHistory] = useState<Revision[] | null>(null);
  const [historyNext, setHistoryNext] = useState<string | null>(null);
  const [old, setOld] = useState<{ revision: string; source: string } | null>(
    null,
  );
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [imported, setImported] = useState<Preview | null>(null);
  const importedRef = useRef<Preview | null>(null);
  function updateImport(next: Preview | null) {
    importedRef.current = next;
    setImported(next);
  }
  const dirty = Boolean(entry) && source !== entry?.source;
  const parsed = useMemo(() => {
    try {
      return readFrontMatter(source);
    } catch {
      return { data: {}, content: '' };
    }
  }, [source]);
  const fields = parsed.data as Partial<JournalEntry>;
  function receive(e: Entry) {
    // Keep the persisted source as the save baseline when migrating legacy tags.
    let nextSource = e.source;
    // Preserve tags edited with the earlier metadata-only controls.
    if (
      e.tags_json !== null &&
      (!e.live_revision || e.live_revision === e.draft_revision)
    ) {
      const parsed = readFrontMatter(e.source);
      if (JSON.stringify(parsed.data.tags ?? []) !== e.tags_json) {
        nextSource = serializeManuscript(
          { ...parsed.data, tags: JSON.parse(e.tags_json) },
          parsed.content,
        );
      }
    }
    entryRef.current = e;
    saved.current = e.source;
    sourceRef.current = nextSource;
    setEntry(e);
    setSource(nextSource);
    setBlocked(false);
    setError('');
    setSaveState(nextSource === e.source ? '保存済み' : '未保存');
  }
  function receiveMutation(updated: Entry, snapshot: string) {
    const edited = sourceRef.current !== snapshot;
    if (edited) {
      entryRef.current = updated;
      saved.current = updated.source;
      setEntry(updated);
      setSaveState('未保存');
    } else {
      receive(updated);
    }
    return edited;
  }
  useEffect(() => {
    let active = true;
    request<Entry>(`/entries/${id}`)
      .then((e) => {
        if (active) receive(e);
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setSaveState('読み込めませんでした');
        }
      });
    return () => {
      active = false;
    };
  }, [id]);
  function edit(next: string) {
    sourceRef.current = next;
    setSource(next);
    setSaveState('未保存');
    setPublish(false);
  }
  function field(key: string, value: unknown) {
    edit(
      serializeManuscript(
        { ...fields, [key]: value, updatedAt: today() },
        parsed.content,
      ),
    );
  }
  const save = useCallback(async () => {
    const current = entryRef.current;
    if (!current || current.deleted_at || saving.current || blocked) return;
    const snapshot = sourceRef.current;
    if (snapshot === saved.current) return current;
    saving.current = true;
    setBusy(true);
    setSaveState('保存中…');
    setError('');
    try {
      const updated = await request<Entry>(`/entries/${id}`, {
        action: 'save',
        source: snapshot,
        version: current.version,
      });
      entryRef.current = updated;
      saved.current = snapshot;
      setEntry(updated);
      setSaveState(sourceRef.current === snapshot ? '保存済み' : '未保存');
      return updated;
    } catch (e) {
      setError((e as Error).message);
      setSaveState('保存できませんでした');
      setBlocked(true);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }, [id, blocked]);
  useEffect(() => {
    if (!entry || !dirty || blocked || busy || entry.deleted_at) return;
    const timer = setTimeout(() => void save(), 1500);
    return () => clearTimeout(timer);
  }, [source, entry, dirty, blocked, busy, save]);
  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => {
      if (sourceRef.current !== saved.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, []);
  useEffect(() => {
    if (view !== 'preview' || !source) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setPreview(null);
      setPreviewError('');
      request<Preview>('/preview', { source }, { signal: controller.signal })
        .then(setPreview)
        .catch((e) => {
          if (e.name !== 'AbortError') setPreviewError(e.message);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [view, source]);
  async function loadHistory(after = '') {
    setError('');
    try {
      const result = await request<{
        revisions: Revision[];
        next: string | null;
      }>(`/entries/${id}?history=1&before=${encodeURIComponent(after)}`);
      setHistory((prev) =>
        after ? [...(prev ?? []), ...result.revisions] : result.revisions,
      );
      setHistoryNext(result.next);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function chooseRevision(revision: string) {
    try {
      const result = await request<{ source: string }>(
        `/entries/${id}?revision=${revision}`,
      );
      setOld({ revision, source: result.source });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function restoreRevision() {
    const current = entryRef.current;
    if (!old || !current) return;
    if (saving.current || sourceRef.current !== saved.current) {
      setError(
        '未保存の変更があります。保存が完了してから履歴を復元してください。',
      );
      setHistory(null);
      setOld(null);
      setRestoreConfirm(false);
      return;
    }
    const snapshot = sourceRef.current;
    setBusy(true);
    try {
      receiveMutation(
        await request<Entry>(`/entries/${id}`, {
          action: 'revert',
          version: current.version,
          revision: old.revision,
        }),
        snapshot,
      );
      setHistory(null);
      setOld(null);
      setRestoreConfirm(false);
      setView('edit');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    const current = entryRef.current;
    if (
      !current ||
      sourceRef.current !== saved.current ||
      !preview ||
      preview.source !== sourceRef.current
    )
      return;
    const snapshot = sourceRef.current;
    setBusy(true);
    setError('');
    try {
      const result = await request<{ sharePath: string | null; entry: Entry }>(
        `/entries/${id}`,
        {
          action: visibility === 'private' ? 'visibility' : 'apply',
          version: current.version,
          revision: current.draft_revision,
          visibility,
        },
      );
      const editedDuringPublish = receiveMutation(result.entry, snapshot);
      setShare(
        result.sharePath ? new URL(result.sharePath, location.origin).href : '',
      );
      setPublish(false);
      setSaveState(
        editedDuringPublish
          ? '未保存'
          : visibility === 'private'
            ? '公開を停止しました'
            : '公開設定を反映しました',
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file?: File) {
    if (!file) return;
    if (!file.name.endsWith('.md') || file.size > 256 * 1024) {
      setError('.mdファイル（256 KiB以下）を選んでください。');
      return;
    }
    try {
      const text = await file.text();
      const data = readFrontMatter(text);
      if (data.data.id && data.data.id !== id)
        throw new Error(
          '別の記事IDです。新規インポート画面から取り込んでください。',
        );
      const normalized = serializeManuscript(
        { ...data.data, id, createdAt: fields.createdAt, updatedAt: today() },
        data.content,
      );
      updateImport(await request<Preview>('/preview', { source: normalized }));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const ready =
    !dirty &&
    !busy &&
    !blocked &&
    preview?.source === source &&
    Boolean(fields.title && fields.summary && parsed.content.trim());
  return (
    <AdminFrame>
      <header className="ja-editor-top">
        <a
          href="/journal/admin"
          onClick={(e) => {
            if (
              dirty &&
              !window.confirm('未保存の変更があります。ページを離れますか？')
            )
              e.preventDefault();
          }}
        >
          <ArrowLeft size={16} />
          記事一覧
        </a>
        <div className="ja-actions">
          <output className="ja-status">
            <Check size={14} />
            {saveState}
          </output>
          <button
            className="ja-button"
            disabled={!entry || busy || !dirty || blocked}
            onClick={() => void save()}
          >
            保存
          </button>
          <button
            className="ja-button ja-primary"
            disabled={!entry || busy || Boolean(entry?.deleted_at)}
            onClick={() => {
              setVisibility(
                entry?.visibility === 'unlisted' ? 'unlisted' : 'public',
              );
              setView('preview');
              setPublish(true);
            }}
          >
            公開設定へ
          </button>
        </div>
      </header>
      {error && (
        <div className="ja-error" role="alert">
          <p>{error}</p>
          {entry && (
            <div className="ja-actions">
              <button onClick={() => download(sourceRef.current, id)}>
                編集中の原稿を保存
              </button>
              <button
                onClick={() => {
                  setBlocked(false);
                  setError('');
                }}
              >
                保存を再試行
              </button>
              <button
                onClick={async () => {
                  if (
                    window.confirm(
                      '未保存の変更を破棄して保存版を読み直しますか？',
                    )
                  ) {
                    try {
                      const snapshot = sourceRef.current;
                      const updated = await request<Entry>(`/entries/${id}`);
                      if (sourceRef.current !== snapshot) {
                        setError(
                          '読み込み中に入力が変わったため、再読み込みを中止しました。編集中の内容は残っています。',
                        );
                        return;
                      }
                      receive(updated);
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }
                }}
              >
                保存版を読み直す
              </button>
            </div>
          )}
        </div>
      )}
      {entry?.deleted_at ? (
        <div className="ja-empty">
          <h1>この記事はゴミ箱にあります</h1>
          <p>記事一覧のゴミ箱から復元すると編集できます。</p>
          <a href="/journal/admin?status=trash">ゴミ箱へ</a>
        </div>
      ) : (
        entry && (
          <>
            <div className="ja-editor-caption">
              <span className="ja-badge">{statusName(entry)}</span>
              {entry.live_revision &&
                entry.live_revision !== entry.draft_revision && (
                  <span>未反映の変更あり</span>
                )}
              <span className="ja-muted">
                IDは自動生成・URLは変更されません
              </span>
            </div>
            <div
              className={`ja-editor-layout${publish ? ' is-publishing' : ''}`}
            >
              <section className="ja-writing">
                <div className="ja-view-switch">
                  <button
                    aria-pressed={view === 'edit'}
                    onClick={() => {
                      setView('edit');
                      setPublish(false);
                    }}
                  >
                    <PenLine size={15} />
                    編集
                  </button>
                  <button
                    aria-pressed={view === 'preview'}
                    onClick={() => setView('preview')}
                  >
                    <Eye size={15} />
                    プレビュー
                  </button>
                </div>
                {view === 'edit' ? (
                  <>
                    <label className="ja-sr-only" htmlFor="article-title">
                      タイトル
                    </label>
                    <textarea
                      id="article-title"
                      className="ja-title-input"
                      rows={2}
                      maxLength={160}
                      value={String(fields.title ?? '')}
                      onChange={(e) => field('title', e.target.value)}
                      placeholder="タイトルを入力"
                    />
                    <label htmlFor="article-summary">要約</label>
                    <textarea
                      id="article-summary"
                      rows={2}
                      maxLength={400}
                      value={String(fields.summary ?? '')}
                      onChange={(e) => field('summary', e.target.value)}
                      placeholder="この記事で伝えたいことを、ひとことで。"
                    />
                    <div className="ja-body-label">
                      <label htmlFor="article-body">本文</label>
                      <span>
                        Markdown · {parsed.content.length.toLocaleString()}文字
                      </span>
                    </div>
                    <textarea
                      id="article-body"
                      className="ja-body-input"
                      value={parsed.content}
                      onChange={(e) =>
                        edit(
                          serializeManuscript(
                            { ...fields, updatedAt: today() },
                            e.target.value,
                          ),
                        )
                      }
                      placeholder="Markdownで自由に書き始めましょう。"
                      spellCheck={false}
                    />
                  </>
                ) : previewError ? (
                  <p role="alert" className="ja-error">
                    {previewError}
                  </p>
                ) : preview ? (
                  <ArticlePreview preview={preview} />
                ) : (
                  <output>プレビューを準備しています…</output>
                )}
              </section>
              <aside className="ja-sidebar">
                {publish ? (
                  <section>
                    <h2>公開設定</h2>
                    <p className="ja-muted">
                      プレビューを確認してから反映してください。下書きの保存だけでは公開されません。
                    </p>
                    <label htmlFor="publish-scope">公開範囲</label>
                    <select
                      id="publish-scope"
                      value={visibility}
                      onChange={(e) =>
                        setVisibility(e.target.value as Entry['visibility'])
                      }
                    >
                      <option value="public">全体に公開</option>
                      <option value="unlisted">
                        リンクを知っている人に公開
                      </option>
                      <option value="private">非公開にする</option>
                    </select>
                    <p>
                      {visibility === 'private'
                        ? '通常URLと共有リンクを停止します。'
                        : visibility === 'unlisted'
                          ? '一覧に掲載せず、共有リンクで閲覧できます。'
                          : '誰でも公開一覧と記事URLから閲覧できます。'}
                    </p>
                    {!ready && (
                      <p className="ja-muted">
                        タイトル・要約・本文を入力し、自動保存とプレビューの完了をお待ちください。
                      </p>
                    )}
                    <button
                      className="ja-button ja-primary"
                      disabled={
                        visibility === 'private'
                          ? busy || dirty || !preview
                          : !ready
                      }
                      onClick={() => void apply()}
                    >
                      {visibility === 'private'
                        ? '公開を停止する'
                        : entry.live_revision
                          ? '変更を反映する'
                          : '公開する'}
                    </button>
                    <button
                      className="ja-button"
                      onClick={() => setPublish(false)}
                    >
                      キャンセル
                    </button>
                  </section>
                ) : (
                  <section>
                    <h2>記事の設定</h2>
                    <label htmlFor="article-kind">種類</label>
                    <select
                      id="article-kind"
                      value={String(fields.kind ?? 'article')}
                      onChange={(e) => field('kind', e.target.value)}
                    >
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
                    <label htmlFor="article-tags">タグ</label>
                    <input
                      id="article-tags"
                      key={id + JSON.stringify(fields.tags)}
                      defaultValue={
                        Array.isArray(fields.tags) ? fields.tags.join(', ') : ''
                      }
                      onBlur={(e) =>
                        field('tags', [
                          ...new Set(
                            e.target.value
                              .split(/[,、]/)
                              .map((v) => v.trim())
                              .filter(Boolean),
                          ),
                        ])
                      }
                      placeholder="AI, 設計, 開発"
                    />
                    <small className="ja-muted">カンマ区切り · 30個まで</small>
                    <label htmlFor="article-language">言語</label>
                    <select
                      id="article-language"
                      value={String(fields.language ?? 'ja')}
                      onChange={(e) => field('language', e.target.value)}
                    >
                      <option value="ja">日本語</option>
                      <option value="en">English</option>
                    </select>
                  </section>
                )}
                <section>
                  <h2>原稿と履歴</h2>
                  <button
                    disabled={busy || dirty}
                    onClick={() => void loadHistory()}
                  >
                    <History size={16} />
                    変更履歴・差分
                  </button>
                  <button onClick={() => download(sourceRef.current, id)}>
                    <Download size={16} />
                    Markdownを保存
                  </button>
                  <label className="ja-file-button">
                    <Upload size={16} />
                    Markdownで差し替え
                    <input
                      type="file"
                      accept=".md"
                      disabled={busy}
                      onChange={(e) => {
                        void importFile(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <p className="ja-muted">
                    ローカルで編集した原稿も、ここから下書きに取り込めます。
                  </p>
                </section>
                {entry.visibility === 'public' && (
                  <a
                    className="ja-public-link"
                    href={`/journal/${id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    公開中の記事を開く ↗
                  </a>
                )}
                {entry.visibility === 'unlisted' && (
                  <button
                    className="ja-button"
                    disabled={busy || dirty}
                    onClick={async () => {
                      const snapshot = sourceRef.current;
                      setBusy(true);
                      try {
                        const r = await request<{
                          sharePath: string;
                          entry: Entry;
                        }>(`/entries/${id}`, {
                          action: 'rotate',
                          version: entry.version,
                          visibility: 'unlisted',
                        });
                        setShare(new URL(r.sharePath, location.origin).href);
                        receiveMutation(r.entry, snapshot);
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    旧リンクを停止して再発行
                  </button>
                )}
                {share && (
                  <section>
                    <h2>共有リンク</h2>
                    <input aria-label="共有リンク" value={share} readOnly />
                    <button
                      onClick={() =>
                        void navigator.clipboard
                          .writeText(share)
                          .catch(() =>
                            setError('リンクを選択してコピーしてください。'),
                          )
                      }
                    >
                      コピー
                    </button>
                    <p className="ja-muted">
                      この画面を離れる前に控えてください。
                    </p>
                  </section>
                )}
              </aside>
            </div>
          </>
        )
      )}
      {history && (
        <Modal
          label="変更履歴"
          onClose={() => {
            setHistory(null);
            setOld(null);
            setRestoreConfirm(false);
          }}
        >
          <section className="ja-history">
            {error && (
              <p className="ja-error" role="alert">
                {error}
              </p>
            )}
            <header>
              <h2>変更履歴</h2>
              <button
                className="ja-button"
                onClick={() => {
                  setHistory(null);
                  setOld(null);
                  setRestoreConfirm(false);
                }}
              >
                閉じる
              </button>
            </header>
            <p className="ja-muted">
              過去の版を下書きに戻しても、公開中の記事は変わりません。
            </p>
            <div className="ja-history-layout">
              <div>
                {history.map((r) => (
                  <button
                    key={r.revision}
                    className={
                      old?.revision === r.revision ? 'is-selected' : ''
                    }
                    onClick={() => void chooseRevision(r.revision)}
                  >
                    {dateLabel(r.received_at)}
                    <small>
                      {r.title || '無題の記事'}
                      {entry?.draft_revision === r.revision
                        ? ' · 現在の下書き'
                        : entry?.live_revision === r.revision
                          ? ' · 公開中'
                          : ''}
                    </small>
                  </button>
                ))}
                {historyNext && (
                  <button onClick={() => void loadHistory(historyNext)}>
                    以前の履歴を表示
                  </button>
                )}
              </div>
              {old && (
                <div>
                  <ManuscriptDiff
                    before={old.source}
                    after={source}
                    beforeLabel="選択した版"
                    afterLabel="現在の下書き"
                  />
                  {restoreConfirm ? (
                    <div>
                      <p>
                        この版を下書きに戻します。現在の保存版も履歴に残ります。
                      </p>
                      <button
                        className="ja-button ja-primary"
                        disabled={busy}
                        onClick={() => void restoreRevision()}
                      >
                        下書きに戻す
                      </button>
                      <button
                        className="ja-button"
                        onClick={() => setRestoreConfirm(false)}
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <button
                      className="ja-button"
                      disabled={busy || old.revision === entry?.draft_revision}
                      onClick={() => setRestoreConfirm(true)}
                    >
                      この版を下書きに戻す
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </Modal>
      )}
      {imported && (
        <Modal label="差し替え確認" onClose={() => updateImport(null)}>
          <section className="ja-history">
            {error && (
              <p className="ja-error" role="alert">
                {error}
              </p>
            )}
            <h2>下書きを差し替える</h2>
            <p>公開中の記事は変わりません。現在の保存版は履歴に残ります。</p>
            <ManuscriptDiff before={source} after={imported.source} />
            <div className="ja-actions">
              <button className="ja-button" onClick={() => updateImport(null)}>
                キャンセル
              </button>
              <button
                className="ja-button ja-primary"
                disabled={busy || blocked}
                onClick={async () => {
                  const selected = imported;
                  const previous = await save();
                  if (
                    !previous ||
                    importedRef.current !== selected ||
                    sourceRef.current !== saved.current
                  )
                    return;
                  edit(selected.source);
                  updateImport(null);
                  setView('edit');
                }}
              >
                下書きに取り込む
              </button>
            </div>
          </section>
        </Modal>
      )}
    </AdminFrame>
  );
}
