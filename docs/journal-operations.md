# Journalの運用

> 2026-09-09更新：編集可能なJournal Studioの現行ローカル仕様は [journal-studio.md](journal-studio.md) を参照。以下は本文固定方式の導入時記録です。


現行方式は「ローカルで書き終える → 管理画面からアップロード → 表示確認 → 公開範囲を選択」。アップロード後はサーバーの保存版を正本とし、本文を固定する。ローカルの元原稿は以後編集しない。本番初期設定は未実施。設計・費用は [journal-runtime-design.md](journal-runtime-design.md)、検証結果は [journal-runtime-validation.md](journal-runtime-validation.md)。

## まずローカルで開く

```sh
npm run journal:preview
```

サイトをビルドしてから、ローカル専用DBと確認用サーバーを起動する。

- ホーム：<http://127.0.0.1:3003/>
- アップロード：<http://127.0.0.1:3003/journal/admin/upload>
- 原稿一覧：<http://127.0.0.1:3003/journal/admin>
- サンプル記事：<http://127.0.0.1:3003/journal/journal-preview-sample>

ホーム・その他のページの共通フッター「Journal管理」からアップロードへ移動できる。ヘッダーのNotes → Journalタブから公開一覧へ移動し、一覧の管理者リンクからアップロードへも移動できる。

確認用サーバーは127.0.0.1だけで待ち受ける。本人認証の代わりにローカルの署名JWTを仲介サーバーが付け、アプリ本体は通常と同じ署名検証を行う。実Cloudflareには接続しない。Host/Origin/クロスサイト要求を検査し、この仕組みを本番Workerには含めない。ローカルでは同じPC上からアクセスできる確認用環境であり、本番のログイン確認は別途必要。

DBはGit除外済みの `.wrangler/journal-preview/d1` に保存し、Ctrl+Cで止めて再起動しても保持する。サンプルは初回だけローカルDBに投入・公開する。自分で非公開にしたサンプルを起動時に公開し直すことはない。実際にアップロードした原稿は常にprivateで保存する。本番のDB・公開記事には影響しない。

ポート変更は `JOURNAL_PREVIEW_PORT=3004 npm run journal:preview`。この場合は上記URLのポートも置き換える。サイトコード変更後は停止して同じコマンドで再ビルド・再起動する。記事のアップロードや公開範囲変更だけなら再起動は不要。

## 原稿を作る

原稿・バックアップ・認証情報はサイトの公開リポジトリの**外**に保存する。`content/journal`は旧Phase 1の記録例であり、今後の保存場所でもビルド入力でもない。既存の`content/journal/private/`は自動処理しない。

```markdown
---
id: agent-boundary-experiment
title: エージェントの境界を小さくした実験
createdAt: '2026-09-08'
updatedAt: '2026-09-08'
kind: experiment
summary: 試した条件と、判断が変わった点を記録する。
tags: [Agent, 設計]
projects: []
relatedEntries: []
language: ja
---
## 問い
ここに自分の記録を書く。
```

`id`は半角英数字とハイフン（100文字以内）。後からタイトル・ファイル名を変えてもidは保つ。`admin` / `share` / `upload`は予約。`kind`はlog / hypothesis / experiment / decision / failure / article。`summary`もアップロード時に必要。hypothesis、result、confidence（low/medium/high）、sourceTypeも使用できる。Phase 1と同じ256KiB上限。本文の画像は既存のURL参照のみで、ローカル画像や添付ファイルを一緒に送らない。

`status`、`visibility`、`publishedAt`は**書かない**（送信すると400）。公開日はサーバーが初回公開／限定公開時に設定。公開範囲の変更で並び順を変えない。updatedAtはアップロード前に確定する。

## 管理画面からアップロードする

1. `/journal/admin/upload`を開く。本番は本人のCloudflare Access認証を通る。ローカル確認用サーバーではそのまま開ける。
2. `.md`ファイルを1個選ぶか、画面にドラッグ＆ドロップする。ファイル選択だけでは送信されない。
3. 「内容を確定し、アップロード後はローカルの原稿を編集しません」にチェックを入れる。
4. 「非公開で保存する」を押す。保存結果から「保存した原稿を確認」を開く。

ファイル選択・256KiB上限・ヘッダー不備・同一IDの内容競合・通信失敗を画面に表示する。ヘッダーの書き方は画面の「Markdownの書式とテンプレート」にあり、そのまま書き始められるテンプレートをダウンロードできる。管理画面でトークンを入力する必要はない。

成功後はクラウドの保存版が正本になる。本文・タイトル等をローカルで変更して再同期する運用は行わない。同じ原稿を再送した場合は既存記事へ案内し、異なる内容を同じidで送ると409で拒否する。公開範囲や保存日時も戻らない。通信結果が不明な場合も、同じファイルを再送できる。

## CLIについて

本番ではブラウザーの管理画面だけを投稿の入口にし、`JOURNAL_UPLOAD_TOKEN`を設定しない。旧CLI経路も管理者本人のAccess JWTが必須で、送信トークンだけでは投稿できない。

開発・検証で旧CLIを利用する場合のみ、本人の短期Access JWTを`JOURNAL_ACCESS_JWT`、追加の送信トークンを`JOURNAL_UPLOAD_TOKEN`、送信先を`JOURNAL_URL`へ設定する。認証値はリポジトリやシェル履歴に保存しない。CLIは1個のMarkdownだけを扱い、公開操作は行わない。

## 確認・公開・修正

1. `/journal/admin`を開き、本人のCloudflare Access認証を通る。
2. 一覧から原稿を開く。下に実際の記事rendererで確認待ちの原稿が表示される。外部画像は私的なプレビューでは読み込まない。
3. 公開範囲を選び、原稿の確認チェックを入れ「公開範囲を保存」。確認した保存版の公開範囲を変更する。別画面で公開設定が変わった場合は再読込して再確認する。
4. 本文の編集・差し替えは行わない。訂正・追記は新しいIDの別記事として記録し、relatedEntriesで元記事につなげる。

| 操作 | 結果 |
|---|---|
| 非公開 | 本人の管理画面だけで確認できる。通常URLと共有リンクは404 |
| 限定公開 | 公開一覧・通常URLには出さない。有効な共有リンクから反映済み版を読める |
| 公開 | `/journal`と`/journal/<id>`から反映済み版を読める |
| 旧リンクを停止して新しい共有リンクを発行 | 以前の共有リンクを無効化して新規発行 |

共有リンクは発行時だけ表示される。控え忘れたら再発行する。共有をやめるには非公開にする。非公開から再び限定公開にしても古いリンクは復活しない。限定公開はリンクを持つ人が再共有できる仕組みであり、招待制ではない。

「保存した原稿をダウンロード」はサーバーに保持した元Markdownを本人だけが取得する。バックアップ・持ち出し用であり、ローカルとの双方向同期は行わない。

## バックアップと移行

ローカル原稿だけでは公開設定・反映済み版・過去の版は復元できない。D1のSQLエクスポートも個人の非公開保存先へ保持する。全revisionに元Markdownがあり、SQLiteや他DBへ持ち出せる。移行後に再解析する場合も元原稿が残る。

以下のremote操作は**本番初期設定・操作承認後のみ**。通常の執筆や公開には不要。事前にCloudflare認証を用意し、本番IDを含むビルド設定を使用する。

```sh
umask 077
npx wrangler d1 export morimizu-journal --remote --config dist/server/wrangler.json --output "$HOME/JournalBackups/journal-backup.sql"
```

重要な変更前と定期的（例：週1回）に保存。保存先ディレクトリは事前に作る。SQLには私的原稿と共有ハッシュも含まれる。公開Gitやサイトのpublic/へ置かない。D1 Time TravelはFreeで7日・Paidで30日であり、長期バックアップの代わりではない。

復旧は、最初に**別の空のローカルD1**へSQLをimportし、原稿・draft/live参照・公開範囲を照合してから、本番の復旧先へのimportとDB binding変更を別途承認する。既存DBをDROPして復元する自動スクリプトは用意しない。共有ハッシュを復元するとバックアップ時点のリンク状態も復元されるので、取消済み共有が復活しないよう、復旧時はいったん全記事をprivate・share_hash=NULLにしてから必要な記事だけ再確認して戻す。

ローカルの空DBへの復旧確認例（バックアップにはスキーマも含まれるためmigrationを先に実行しない）：

```sh
npx wrangler d1 execute morimizu-journal --local --config journal/wrangler.local.jsonc --persist-to /private/tmp/journal-restore-check --file "$HOME/JournalBackups/journal-backup.sql"
```

[Cloudflareのimport/export手順](https://developers.cloudflare.com/d1/best-practices/import-export-data/)を参照。テストでは別D1への原稿・全版・公開状態の移し替えとWorker差し替え後の保持を検証している。実本番のSQL export/importとTime Travelは未検証。

## 初回の本番導入（未実施、承認が必要）

ここからはリソース・認証・本番配信を変えるため、実行前に明示的承認が必要。

1. Cloudflareアカウントの現在プランと使用量を確認する。Workers FreeのCPU/サイズ制約に収まるか、本番前のプレビューで測る。課金登録や有料化が必要ならその段階で別途承認。
2. 専用D1 `morimizu-journal`を作成。そのIDをローカルのビルド環境変数`JOURNAL_DATABASE_ID`とGitHub Actions repository variableに設定。既存のSites用D1やQiita保存先は使わない。
3. `JOURNAL_DATABASE_ID`を指定して一度ビルド。本番migrationは `npx wrangler d1 migrations apply morimizu-journal --remote --config dist/server/wrangler.json`。migrationはスキーマのみ、記事投入なし。以後のデプロイでmigrationを自動実行しない。
4. Accessの同一アプリケーションで `morimizu.dev/journal/admin` とその配下、`morimizu.dev/api/journal/admin` とその配下を保護。本人emailだけをAllowし、他ユーザーへのAllowやBypassを入れない。OTPまたは既存IdPを利用。送信先 `/api/journal/v1/drafts`、公開ページ、shareはこのAccessアプリの対象にしない。現在のAccess UIで根パスと配下が両方保護されることを実アクセスで検証する。
5. WorkerのSecretsに`JOURNAL_ACCESS_TEAM`（https://チーム名.cloudflareaccess.com、末尾/なし）、`JOURNAL_ACCESS_AUD`、`JOURNAL_ADMIN_EMAIL`を設定。`wrangler secret put NAME --config dist/server/wrangler.json`で対話入力できる。非秘密の設定もSecretsとして扱うとサイト再デプロイで消えない。本番でJOURNAL_UPLOAD_TOKENは設定しない。
6. 必要な旧記事だけをリポジトリ外にコピーし、publicationフィールドを除いて選択送信。移行でもまずprivateに入る。元ファイルは保持し、自動で全件送らない。サンプル記事の自動公開もない。
7. 初回Worker更新・旧静的JournalのCDNキャッシュ除去を実施。古いデプロイへロールバックすると静的配信が復活するため、データ移行後は旧方式へ戻さない。
8. 本番で未認証のHTML/RSC/API、workers.dev/preview直アクセス、Access本人認証、再送、反映、公開取消、共有停止、キャッシュルールを確認。Worker routeの上限時挙動はFail closedにし、旧静的配信元への迂回を許可しない。問題なければ必要な記事だけ管理画面から公開する。

アプリは設定不足やDB障害で原稿を公開しない。`npm run deploy`のpredeployはローカル用DB IDを拒否する。本文や認証トークンをビルド環境へ渡す必要はない。デザイン更新時も同じDB IDを使い、Secretsを保持する。DB作成・削除・初期化をデプロイ手順へ追加しない。

## ローカル検証

```sh
npm run journal:db:local
npm run test:journal
npm run build
npm run test:journal:browser
```

ユーザーが画面を開く場合は上記の`npm run journal:preview`を使う。通常の`npm run dev`はD1をローカルで使う。本番のDBには接続しない。認証設定がなければ管理画面は401のままで、それが期待する挙動。

ブラウザーテストは別の一時D1、テスト用RSA鍵と署名JWT、ローカルJWKS応答を使用して実際の管理画面を操作する。Cloudflareへの認証リクエスト・本番変更は発生しない。Chromeを既定で利用し、`PLAYWRIGHT_CHANNEL`で変更可能。テストの認証バイパスをアプリへ組み込むことはない。画像はGit除外済みの`outputs/journal/`に保存。

## タグの管理と並び替え

公開一覧の「新しい順」「古い順」で公開日の降順・昇順を切り替えます。同日の記事はID順で安定して並び、ページ送りにも並び順を引き継ぎます。

管理画面の記事詳細で「記事のタグ」をカンマ区切りで入力し、「タグを保存」で反映します（30個まで、各80文字以内）。空欄保存で全削除、重複はまとめます。タグ保存は公開範囲や公開日を変更しません。タグはサーバー側の編集可能なメタデータで、固定原稿・リビジョン・ダウンロード原稿には手を加えません。

本番反映前に既存のD1マイグレーション適用手順で `0002_journal_tags.sql` も適用してください。ローカルプレビューは起動時に既存記事を保持して列を追加します。
