# Qiita記事とmorimizu.devの同期

## 方針

記事の正本は引き続き `Morishita-mm/QiitaArticle` です。サイト用にMarkdownを複製して編集する運用にはしません。

morimizu.devは、ビルド前にQiitaArticleの `public/*.md` を読み、次の条件をすべて満たす記事だけを静的なTypeScriptデータへ変換します。

```text
id が20桁のQiita記事ID
private === false
ignorePublish === false
```

このため、未投稿記事、Qiitaの限定共有記事、公開対象外の記事がWorkerやブラウザへ含まれることはありません。ローカルボリュームをCloudflare Workerから読む処理もありません。

## ローカルでの確認

`.env.local` にQiitaArticleリポジトリの場所を指定します。

```dotenv
QIITA_ARTICLES_DIR=/Volumes/ORICO/src/github.com/Morishita-mm/QiitaArticle
```

通常は次だけで十分です。

```bash
npm run dev
```

`predev` が `npm run sync:articles` を先に実行します。記事だけ再同期したい場合は、次を実行します。

```bash
npm run sync:articles
```

生成される `lib/generated/qiita-articles.ts` はGit管理しません。`prebuild` でも同じ同期を行うため、ローカルとCIは同じ掲載条件になります。

## 普段の記事投稿 — 操作は1回のpush

1. QiitaArticleで `npx qiita new <slug>` を実行する。
2. 執筆中はFront Matterを `ignorePublish: true` にする。
3. `npx qiita preview` で表示を確認する。
4. 公開時に `private: false` と `ignorePublish: false` を確認する。
5. 記事をcommitし、`main`へ1回pushする。

本番の自動化を設定すると、その1回のpushから以下が順番に動きます。

```text
QiitaArticle/mainへpush
  → Qiita CLIがQiitaへ公開
  → id / updated_atの更新をcommit・push
  → 公開後のcommit SHAでサイトWorkflowを起動
  → 公開可能な記事だけを同期
  → morimizu.devをbuild
  → Cloudflareへdeploy
```

Qiitaへの公開に失敗した場合、サイトのWorkflowは起動しません。Qiitaは成功してサイトだけ失敗した場合は、サイト側の `CI and deploy morimizu.dev` Workflowを同じ `articles_sha` で再実行します。

## GitHubで一度だけ行う設定

### サイトリポジトリ

このサイトをGitHubリポジトリへ配置したら、同梱の `.github/workflows/deploy.yml` が使えます。

Secrets:

- `CLOUDFLARE_API_TOKEN`: 対象WorkerをデプロイできるCloudflare Account API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

デプロイ時に `morimizu.dev` をWorkerのCustom Domainとして登録します。初回の成功後は、同じドメインを保ったままWorkerの新しいバージョンだけが更新されます。

任意のVariable:

- `QIITA_ARTICLES_REF`: サイト単独のデプロイ時に取得する記事側ref。未設定時は `main`

### QiitaArticleリポジトリ

既存の `QIITA_TOKEN` に加えて、次を設定します。

Secret:

- `SITE_WORKFLOW_TOKEN`: サイトリポジトリだけを対象とし、`Actions: write` のみを与えたfine-grained PAT

Variables:

- `SITE_REPOSITORY`: サイトの `owner/repository`
- `SITE_DEPLOY_WORKFLOW`: `deploy.yml`
- `SITE_DEFAULT_BRANCH`: 通常は `main`

これら4項目のどれかが未設定なら、Qiita公開だけを行いサイト起動処理は安全にスキップします。サイトのリポジトリ名が決まった後に値を入れれば自動連携が有効になります。

## Qiita上で直接編集した場合

QiitaArticle側で次を実行し、差分を確認してからcommit・pushします。

```bash
npx qiita pull
git diff
```

サイトからQiitaへ内容を書き戻す処理は設けません。同期方向を `QiitaArticle → morimizu.dev` の一方向にすることで、競合と二重管理を避けています。

## 削除・限定共有・下書き

- `id: null`: 未投稿なのでサイトには出ない
- `ignorePublish: true`: Qiitaへの一括投稿とサイト掲載の両方から除外
- `private: true`: Qiitaでは限定共有。サイトでは必ず除外
- Markdownファイルを削除: 次回サイトビルドで一覧と本文から消える。Qiita側の記事削除はQiita画面で別途行う

`private: true` は下書きではないため、執筆途中の記事には `ignorePublish: true` を使います。

## 対応しているMarkdown

GFMの表・脚注、Qiitaのnote、raw HTMLの `details` / `dl` / 画像幅、KaTeX数式、Mermaid図、`language:filename` 形式のコードブロックに対応しています。raw HTMLは許可リストでサニタイズし、MarkdownをMDXやJavaScriptとして実行しません。
