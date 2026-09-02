# Cloudflare開発用プレビュー

## 構成

- 実行基盤はCloudflare Workers（Worker名: `morimizu-site`）です。
- 本番は `morimizu.dev` のCustom Domainです。
- 開発確認はWorkerのPreview URL（`staging` alias）を使います。
- Preview URLはCloudflare Accessの「Cloudflareアカウントメンバーのみ」ポリシーで保護しています。
- Zero TrustはFreeプランを利用しています。開発用途の1席は無料枠内です。

開発用URL:

```text
https://staging-morimizu-site.little-cell-dd48.workers.dev
```

未ログイン状態ではCloudflare Accessのログイン画面になり、Cloudflareアカウントで認証した本人だけがサイトを表示できます。本番の `morimizu.dev` にはAccessを適用していません。

## 変更を確認する流れ

1. `staging` ブランチで変更を作成します。
2. `staging` へpushします。
3. GitHub Actionsの `Preview morimizu.dev on Cloudflare` が、Qiita記事を同期してlint/buildを実行します。
4. 成功すると、`staging-morimizu-site.little-cell-dd48.workers.dev` が最新バージョンに更新されます。
5. ブラウザでAccessにログインし、画面・リンク・記事を確認します。
6. 問題がなければ `main` へmerge/pushします。`CI and deploy morimizu.dev` が本番へデプロイします。

手動でプレビューを更新する場合は、GitHub Actionsから同Workflowを `workflow_dispatch` で実行できます。`articles_ref` を空欄にするとQiitaArticleの `main`、指定するとそのcommit SHA/refを同期します。

## Qiita記事との同期

Previewと本番の両方で、ビルド時に `Morishita-mm/QiitaArticle` の公開済みMarkdownだけを読み込みます。記事の正本はQiitaArticleリポジトリのままです。

- `private: false`
- `ignorePublish: false`
- 20桁のQiita記事IDが付与済み

記事を更新しただけでも `staging` へpushしてPreviewで確認できます。Qiita側の公開Workflowとサイト本番Workflowの連携は、既存の [`docs/article-sync.md`](article-sync.md) に記載しています。

## Cloudflare側の設定を変更する場合

Workerの **Settings → Domains & Routes** でPreview URLsを有効にし、**Access** でScopeを `Previews only`、ポリシーを `Cloudflare account` にします。Preview URLを公開状態に戻さないでください。
