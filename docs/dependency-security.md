# 依存パッケージのセキュリティ検証

2026-10-21の更新では、本番のReact修正済みcommit `6480e05` を基準に、開発・ビルド・任意依存も含めた `npm audit` の32パッケージの指摘を解消しました。これは既知のnpm advisoryに対する確認であり、未報告の脆弱性やアプリ全体の安全性を保証するものではありません。

## 更新方針

- React / React DOM / RSCはvinext 1.3.0のpeer要件に合わせて19.3.1へ統一。
- vinext、Vite、Cloudflare Vite plugin、Wrangler、Workers型、Mermaid、Sharp、oxfmtを修正版へ更新。lockfileの間接依存も更新。
- 使用箇所のない`shadcn` CLI依存を削除。生成済みUIコンポーネントは変更しません。
- 脆弱性の重大度を下げる設定、auditの除外、`--force`/`--legacy-peer-deps`、脆弱な旧フレームワークへのダウングレードは使用しません。

## バージョン制約を補正するoverride

- `rehype-katex → katex`: 旧0.16系から直接依存の安全な0.18系に統一。HTMLサニタイズ→信頼しない数式描画の順序や`trust: false`は維持。数式・XSSテストと実ビルドで確認します。
- `fflate`: Satori/OpenTypeの固定された0.7.3を修正版0.7.5へ統一。同じ0.7系のパッチ更新です。
- `vite-plugin-dynamic-import → fast-glob`: 以下の限定アダプターで置換。

### 修正版のないbracesを実際に除去する

調査時点の最新版`braces 3.0.3`はGHSA-vfj7-8cjw-p6xmの影響対象です。依存経路は`vinext → vite-plugin-commonjs → vite-plugin-dynamic-import → fast-glob → micromatch → braces`。上流の最新版でも残るため、単なるバージョン更新では解消できません。

`vite-plugin-dynamic-import 1.6.0`の実装を確認し、使用するAPIが`fastGlob.sync(string[], { cwd })`の1か所のみであることを確認しました。この呼び出しを`tools/build-glob/`の**自作の限定互換アダプター**に置き換えています。これはupstream fast-globそのものでも、その完全互換版でもありません。

- 実装は`tinyglobby 0.2.17`を使用。元のfast-glob、micromatch、bracesを依存ツリーから除去します。
- `onlyFiles`、非表示ファイルの除外、拡張子braceパターン、再帰、重複排除、cwdを維持。
- パターン長4096文字・brace深度32・パターン数256を上限とし、未対応オプションは例外にして黙って無視しません。
- CJSとESMの双方のロード、実際のdynamic-importプラグインの`globFiles`を使う統合テストを追加。
- 直接のローカルfile依存と`$fast-glob`参照はnpm 10/Node 22で`npm ci`を再現可能にするためのものです。外部レジストリの別バージョンを偽装していません。
- 上流が安全なglob実装へ移行したらこのアダプター・file依存・overrideを削除し、統合テストとビルドを再実行します。上流がfast-globの別APIを追加した場合も再評価が必要です。

## Miniflare更新への追従

Wranglerが使用するMiniflareの新APIに合わせ、ローカルJournalの試験・プレビューに公式の`convertV4MiniflareOptions`を使用します。永続化指定は`resourcePersistencePath`へ移行し、既存のプレビューAPIが受け取るD1ディレクトリの親を渡します（Miniflareが`d1`を付加するため）。DBの再起動保持・バックアップ復元テストは維持します。本番のD1スキーマやデータを移行・削除する操作はありません。

## 再検証

Node.js 22で以下を実行します。

```bash
npm ci
npm audit --audit-level=low
npm ls --all
npm run test:dependencies
QIITA_ARTICLES_DIR=/path/to/QiitaArticle npm run sync:articles
npm run lint
npm run test:journal
npm run test:content
npm run test:roof
QIITA_ARTICLES_DIR=/path/to/QiitaArticle JOURNAL_DATABASE_ID=... npm run build
node scripts/verify-worker-runtime.mjs
node dev-pages/workshop/verify-locale.mjs
node scripts/verify-fonts.mjs
```

本番・プレビュー両Workflowに、重大度lowを含む全依存auditと限定アダプターの試験を追加しています。新しいadvisoryが報告された場合は、解消するまでデプロイを止めます。実ビルドをworkerdで起動し、公開ページの表示と管理APIのJWT許可/拒否・no-storeヘッダーもローカルD1で検証します。
