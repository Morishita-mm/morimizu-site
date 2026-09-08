'use client';
/* oxlint-disable next/no-html-link-for-pages */
import { useRef, useState, type DragEvent } from 'react';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
type Receipt = { id: string; revision: string; duplicate: boolean };
export function JournalUpload() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  function choose(files: FileList | null) {
    setReceipt(null);
    setError('');
    setConfirmed(false);
    setFile(null);
    if (!files?.length) return;
    if (files.length !== 1) {
      setError('Markdownファイルを1つずつ選んでください。');
      return;
    }
    const chosen = files[0];
    if (!chosen.name.toLowerCase().endsWith('.md')) {
      setError('拡張子が .md のファイルを選んでください。');
      return;
    }
    if (chosen.size === 0 || chosen.size > 256 * 1024) {
      setError('空でない256 KiB以下のMarkdownを選んでください。');
      return;
    }
    setFile(chosen);
  }
  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!busy) choose(event.dataTransfer.files);
  }
  async function upload() {
    if (!file || !confirmed || busy) return;
    setBusy(true);
    setError('');
    setReceipt(null);
    try {
      const response = await fetch('/api/journal/admin/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
        body: file,
        redirect: 'error',
        signal: AbortSignal.timeout(30000),
      });
      if (response.status === 409)
        throw new Error(
          '同じ記事IDで異なる内容が保存されています。保存版は上書きされません。原稿一覧で確認してください。',
        );
      if (response.status === 401)
        throw new Error(
          'ログインの有効期限が切れています。再読み込みしてログインし直してください。',
        );
      if (response.status === 400)
        throw new Error(
          '原稿のヘッダーと本文を確認してください。id・title・createdAt・kind・summaryが必要です。status・visibility・publishedAtは含めないでください。',
        );
      if (response.status === 413)
        throw new Error('ファイルは256 KiB以下にしてください。');
      if (!response.ok)
        throw new Error(
          '保存できませんでした。接続を確認して再度お試しください。',
        );
      const saved = (await response.json()) as Receipt;
      setReceipt(saved);
      setFile(null);
      setConfirmed(false);
      if (input.current) input.current.value = '';
    } catch (error) {
      setError(
        error instanceof Error && error.name === 'Error'
          ? error.message
          : '送信結果を確認できませんでした。原稿一覧を確認するか、同じファイルを再送してください。',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <SiteShell path="/journal">
      <div className="shell journal journal-upload">
        <header className="e-page-heading">
          <p className="e-kicker">JOURNAL / UPLOAD</p>
          <h1>原稿をアップロード</h1>
          <p>ローカルで書き終えたMarkdownを、非公開の原稿として保存します。</p>
        </header>
        <nav className="journal-actions" aria-label="原稿管理のナビゲーション">
          <a href="/journal/admin">原稿一覧</a>
          <a href="/journal">公開されたJournal</a>
        </nav>
        <section
          className="journal-upload-policy"
          aria-labelledby="upload-policy-heading"
        >
          <h2 id="upload-policy-heading">書き終えた原稿を、記録として残す</h2>
          <p>
            アップロード後は保存された原稿を正本とし、ローカルのファイルは編集しない運用です。本文は固定され、管理画面では表示確認と公開範囲・タグの変更ができます。
          </p>
          <p>
            同じ原稿の再送は重複を作りません。同じ記事IDで内容が異なるファイルは、保存版を上書きしません。
          </p>
        </section>
        <div
          className={`journal-dropzone${dragging ? ' is-dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={drop}
        >
          <label htmlFor="journal-file">Markdownファイルを選択</label>
          <input
            ref={input}
            id="journal-file"
            type="file"
            accept=".md,text/markdown"
            disabled={busy}
            onChange={(e) => choose(e.target.files)}
            aria-describedby="file-help"
          />
          <p id="file-help">
            ここにドラッグ＆ドロップもできます。1ファイル・256
            KiBまで。選ぶだけでは送信されません。
          </p>
          {file && (
            <p className="journal-selected-file">
              選択中：{file.name}（{Math.max(1, Math.ceil(file.size / 1024))}{' '}
              KiB）
            </p>
          )}
        </div>
        <div className="journal-upload-submit">
          <label>
            <input
              type="checkbox"
              disabled={!file || busy}
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />{' '}
            内容を確定し、アップロード後はローカルの原稿を編集しません
          </label>
          <button
            disabled={!file || !confirmed || busy}
            onClick={() => void upload()}
          >
            {busy ? 'アップロード中…' : '非公開で保存する'}
          </button>
        </div>
        {error && (
          <p className="journal-upload-error" role="alert">
            {error}
          </p>
        )}
        {receipt && (
          <section className="journal-upload-receipt" aria-label="保存結果">
            <h2>
              {receipt.duplicate
                ? 'この原稿はすでに保存されています'
                : '原稿を非公開で保存しました'}
            </h2>
            <p>
              {receipt.duplicate
                ? '原稿や公開範囲は変更していません。'
                : 'まだ読者には公開されていません。表示を確認してから、公開範囲を選んでください。'}
            </p>
            <a className="e-outline-link" href={`/journal/admin/${receipt.id}`}>
              保存した原稿を確認 →
            </a>
            <p className="journal-meta">記事ID：{receipt.id}</p>
          </section>
        )}
        <details className="journal-upload-help">
          <summary>Markdownの書式とテンプレート</summary>
          <p>
            ファイルの先頭にYAMLヘッダーを付け、id・title・createdAt・kind・summaryを記入してください。公開範囲は管理画面で選びます。
          </p>
          <a href="/api/journal/admin/template">
            Markdownテンプレートをダウンロード
          </a>
          <p>
            訂正や追記は別の記録として新しいIDで作成し、relatedEntriesに元の記事IDを指定できます。
          </p>
        </details>
      </div>
    </SiteShell>
  );
}
