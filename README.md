# morimizu.dev

Mizukiの個人開発アプリと、Qiitaへ投稿した技術ノートをまとめるパーソナル開発ラボです。

## ローカル開発

Node.js 22以降が必要です。

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local` の `QIITA_ARTICLES_DIR` には、Qiita CLIで記事を管理しているリポジトリ、またはその `public/` ディレクトリを指定します。

## コマンド

```bash
npm run dev            # 記事同期後に開発サーバーを起動
npm run sync:articles  # 公開可能なQiita記事を同期
npm run lint           # サイト固有コードを検査
npm run build          # 記事同期と本番ビルド
npm run deploy         # Cloudflareへデプロイ
```

## Cloudflare開発用プレビュー

`staging` ブランチへpushすると、Cloudflare Workersのバージョンプレビューへ自動アップロードされます。
プレビューURLはCloudflare Accessでアカウントメンバーのみに制限しています。

```text
https://staging-morimizu-site.little-cell-dd48.workers.dev
```

本番へ反映する場合は、確認済みの変更を `main` へmerge/pushします。`main` のWorkflowだけが `morimizu.dev` へデプロイし、`staging` のWorkflowは本番を変更しません。

詳しい運用と確認手順は [`docs/cloudflare-preview.md`](docs/cloudflare-preview.md) を参照してください。

## 記事の同期

記事の正本は [`Morishita-mm/QiitaArticle`](https://github.com/Morishita-mm/QiitaArticle) です。`id` が付与され、`private: false` かつ `ignorePublish: false` の記事だけをビルドへ含めます。

投稿・同期・CI/CDの詳しい運用は [`docs/article-sync.md`](docs/article-sync.md) を参照してください。
