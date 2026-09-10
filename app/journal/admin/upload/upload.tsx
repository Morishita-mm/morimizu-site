'use client';
/* oxlint-disable next/no-html-link-for-pages */
import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ManuscriptDiff } from '../diff';
import { AdminFrame } from '../frame';
import { request, type Entry } from '../client';
import { ArticlePreview, type Preview } from '../preview';
import { AuthorshipField, withAuthorship } from '../authorship';

type ImportPreview = Preview & {
  existing: Entry | null;
  document: Preview['document'] & { id: string };
};
export function JournalUpload() {
  const router = useRouter();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [dragging, setDragging] = useState(false);
  async function choose(files: FileList | null) {
    setError('');
    setPreview(null);
    if (!files?.length) return;
    const file = files[0];
    if (
      files.length !== 1 ||
      !file.name.toLowerCase().endsWith('.md') ||
      !file.size ||
      file.size > 256 * 1024
    ) {
      setError(
        'Markdownファイルを1つ選んでください（空でない256 KiB以下の .md）。',
      );
      return;
    }
    setBusy(true);
    setName(file.name);
    try {
      setPreview(
        await request<ImportPreview>('/import', { source: await file.text() }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!preview) return;
    setBusy(true);
    setError('');
    try {
      if (preview.existing) {
        await request(`/entries/${preview.document.id}`, {
          action: 'save',
          source: preview.source,
          version: preview.existing.version,
        });
      } else {
        const response = await fetch('/api/journal/admin/drafts', {
          method: 'PUT',
          headers: { 'Content-Type': 'text/markdown;charset=utf-8' },
          body: preview.source,
          redirect: 'error',
        });
        if (!response.ok)
          throw new Error(
            response.status === 409
              ? 'このIDの記事が別の画面で保存されています。ファイルを選び直して内容を比較してください。'
              : '保存できませんでした。接続とログイン状態を確認してください。',
          );
      }
      router.push(`/journal/admin/${preview.document.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <AdminFrame>
      <header className="ja-heading">
        <div>
          <p className="ja-eyebrow">BRING YOUR WORDS</p>
          <h1>Markdownを取り込む</h1>
          <p className="ja-muted">ローカルで書いた原稿を、続きから編集。</p>
        </div>
        <a className="ja-button" href="/journal/admin">
          記事一覧へ
        </a>
      </header>
      <div className="ja-import-layout">
        <div>
          <div
            className={`ja-dropzone ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!busy) void choose(e.dataTransfer.files);
            }}
          >
            <Upload size={28} />
            <h2>ファイルをドロップ</h2>
            <p className="ja-muted">またはファイルを選択 · .md / 256 KiBまで</p>
            <input
              aria-label="Markdownファイル"
              type="file"
              accept=".md,text/markdown"
              disabled={busy}
              onChange={(e) => void choose(e.target.files)}
            />
          </div>
          <section className="ja-import-help">
            <FileText size={20} />
            <h2>新しい原稿をローカルで作る</h2>
            <code>{'npm run journal:new -- --title "記事のタイトル"'}</code>
            <p className="ja-muted">
              IDと日付を自動で入力したMarkdownを作成します。IDのないファイルは取り込み時に自動生成します。
            </p>
            <a href="/api/journal/admin/template">
              テンプレートをダウンロード ↓
            </a>
          </section>
        </div>
        <section className="ja-import-check">
          <h2>取り込み内容の確認</h2>
          {busy && <output>処理中…</output>}
          {error && (
            <p className="ja-error" role="alert">
              {error}
            </p>
          )}
          {!preview && (
            <div className="ja-empty">
              <FileText size={30} />
              <p>ファイルを選ぶと、ここで内容を確認できます。</p>
            </div>
          )}
          {preview && (
            <>
              <p className="ja-muted">{name}</p>
              <p className="ja-badge">
                {preview.existing
                  ? '同じIDの記事があります · 下書きを更新'
                  : '新しい記事 · 非公開で保存'}
              </p>
              {preview.existing?.deleted_at ? (
                <p className="ja-error">
                  この記事はゴミ箱にあります。先に復元してください。
                </p>
              ) : (
                <p>
                  保存しても自動公開されません。保存後もブラウザーで編集できます。
                </p>
              )}
              <AuthorshipField
                value={preview.document.authorship}
                onChange={(value) => setPreview(withAuthorship(preview, value))}
                disabled={busy}
              />
              <ArticlePreview preview={preview} />
              {preview.existing && (
                <details className="ja-import-diff">
                  <summary>保存済み原稿と比較する</summary>
                  <ManuscriptDiff
                    before={preview.existing.source}
                    after={preview.source}
                  />
                </details>
              )}
              <button
                className="ja-button ja-primary"
                disabled={busy || Boolean(preview.existing?.deleted_at)}
                onClick={() => void save()}
              >
                {preview.existing
                  ? '下書きを更新して編集へ'
                  : '非公開で保存して編集へ'}
              </button>
            </>
          )}
        </section>
      </div>
    </AdminFrame>
  );
}
