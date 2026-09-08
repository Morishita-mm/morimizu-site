# Engineering Journal: 原稿と公開管理の独立

2026-09-08。現行の設計。Phase 1の静的出版方式を置き換える。

## 調査と判断

既存はVinext / ReactをCloudflare Workerに配信し、55の既存ページとJournalを静的出力していた。JournalはローカルMarkdown → 公開投影TS → ビルドで記事を含めるため、修正も撤回も再デプロイが必要だった。Qiita → Notesは別の同期経路。

継続するもの：JournalのURL、カード・本文レイアウト、分類、タグ、仮説・結果・確信度、Projectリンク、公開記事同士の関連リンク、サニタイズ済みMarkdown renderer、GFM、数式、Mermaid、既存のフォントとfallback。

変更するもの：Journalのデータ取得をD1からの実行時取得へ変更。サイトの既存55ページはVinext prerenderを継続。Journalの原稿をビルド・フォント生成で一切読まず、旧生成TSも削除する。YAMLはJSON_SCHEMA限定のjs-yamlで解析し、実行可能なエンジンと原稿のグローバルキャッシュを避ける。Phase 1スキーマの内容検証は再利用する。

開始時点の未commitには、Phase 1一式、workshopのJournal導線、package/workflow変更、各種仕様書・画像・タスク記録があった。関係するPhase 1のファイルのみ変更し、他の画面・Qiita同期・Notes・元原稿を上書きしない。`content/journal/private/`は既存のまま保持してGit除外を追加。自動アップロードも移動も行わない。

## 選択肢

| 構成 | 費用・手間 | 判断 |
|---|---|---|
| 既存Worker + 専用D1 + Access | DBを1個追加。原稿・版・公開設定を単一トランザクションで管理。SQLで持ち出せる | 推奨・実装 |
| Worker + R2（原稿）+ 設定ストア | 大容量添付に向くが、原稿と公開設定の整合性・複数サービスのバックアップが増える | 今回はMarkdownだけなので不要 |
| KVのみ | 小さく始めやすいが、最終的整合性・キャッシュを考慮した公開取消の設計が必要 | 即時の公開判定には選ばない |
| 外部CMS | 編集・ワークフローは既製品だが、契約・認証・API・移行・課金体系が増える | 今回不要な機能が多い |
| Git + 静的ビルド | 既存構成を活用できる | 記事操作の独立という要件を満たさない |

サービスやリポジトリの分割はしない。送信CLIはNodeの標準機能だけで動き、単体で別のディレクトリにコピー可能。送信先URLと送信専用トークン以外に、DB・リポジトリ・内部ディレクトリを知らない。

## 正本と本文固定（アップロード方式への変更）

- アップロード前：ローカルMarkdownで執筆し、本文・タイトル・記事情報を確定する。
- アップロード後：D1に保持する保存版が正本。ローカル原稿は編集せず、クラウドとの双方向同期はしない。
- 管理画面では原稿表示、元Markdownのダウンロード、公開範囲、共有リンクだけを管理する。Web本文編集・ローカル変更の再反映は行わない。
- stable idが同じで原稿も一致する再送は成功として既存記事を返す。内容の異なる再送は409。CLIからも同じ制約を適用する。
- 登録はD1の条件付きINSERT/UPDATEを1トランザクションで実行する。同時に同じidの異なる原稿が送られても、一方しか保存しない。
- 本文固定後に公開不能にならないよう、summaryもアップロード時に必須とする。status / visibility / publishedAtはサーバー管理でありMarkdownでは拒否する。
- SHA-256で原稿の一致を確認し、元Markdownを保存する。既存データの破壊を避けるためrevisionテーブルとdraft/live参照は保持するが、新規記事は1版固定。旧方式で保存済みの履歴は削除しない。
- プレビューしたrevisionと状態versionの照合は継続し、確認と保存の間に公開設定が変わった場合は409で再確認を促す。
- 訂正・追記は新しいidの記録として作成し、relatedEntriesで元の記録を参照する。
- 限定公開は暗号学的乱数256bitのリンク。ハッシュのみDBに保存し、発行時だけURLを返す。非公開化や再発行で旧リンクを失効させる。

管理画面にはファイル選択とドラッグ＆ドロップを設け、明示的な保存ボタンを押したファイルだけを送る。`PUT /api/journal/admin/drafts`はAccess JWTと同一Originを要求し、ブラウザーに送信専用トークンを持たせない。

## 取得と認証の境界

```text
選んだMarkdown ── 管理画面のアップロード (Access JWT + 同一Origin) ── D1の固定原稿
本人 ── Cloudflare Access ── /journal/admin ── 表示確認 ── 公開範囲の保存
読者 ── /journal/<id> ── publicの反映済み版だけ
共有相手 ── /journal/share/<random> ── 有効なunlistedの反映済み版だけ
```

Worker入口で管理ページ（HTML/RSC）と管理APIの両方を認証する。AccessのJWTについて署名・RS256・issuer・audience・有効期限・app種別・本人emailを検証する。認証済みメールのヘッダーだけは信用しない。設定が欠けていれば拒否する。workers.dev/previewへの直アクセスでも同じ検証が必要。テスト用の認証バイパスは実装しない。

旧CLIも管理者本人のAccess JWTと追加送信トークンの両方を要求する。送信トークンだけでは原稿追加できない。本番では送信トークンを設定せず、管理画面を投稿の入口とする。

管理POSTは同一Originとapplication/jsonを要求する。DB操作はバインド変数とトランザクションを使用。本文サイズはストリーム読取時から256KiBに制限。管理一覧・公開一覧は50件単位。サーバー例外にはSQL・原稿・資格情報を含めない。

公開APIもSQLでpublicと反映済み版に限定。関連レコードの非公開ID・タイトルは返さない。本文に手動で書かれたリンクや固有名詞を自動で秘匿する機能はなく、本文は著者が確認する。限定公開・非公開はnoindex、Referer送信を停止。私的なプレビューは外部画像・iframeを読み込まない（本文から外部サーバーへのアクセスを防ぐ）。画像のアップロード機能はない。

JournalのHTML/RSC/APIの応答にはno-store（ブラウザー/CDN）を設定し、D1プライマリーを毎回問い合わせる。KV・ISR・Cache API・静的原稿へのフォールバックはない。DB障害時は503などのエラーで閉じる。ブラウザーの戻るキャッシュ復帰時も再読込する。既に相手が読んだ内容・保存したコピー・配信開始済みの応答を取り戻すことはできない。

新しい仕組みが初めて本番に入る際は、以前の静的Journal配信物・CDNキャッシュを除去する必要がある。以後の通常の取消にはビルドもデプロイも不要。Cloudflare側でCache Everythingなどによりno-storeを上書きしないことを本番で確認する。

## 費用と上限（2026-09-08に公式情報を確認）

| 項目 | 無料枠 | 上限と有料化の目安 |
|---|---|---|
| Workers | アカウント全体で動的リクエスト10万/日、CPU 10ms/呼出 | 日次超過はエラー1027、CPU超過は1102。Paidは最低$5/月、1000万リクエスト・3000万CPU ms/月込み、超過は$0.30/100万req・$0.02/100万CPU ms |
| D1 | 500万行read/日、10万行write/日、合計5GB。Freeは1DB最大500MB | 日次クエリ枠超過はエラー（UTC日次リセットまで）、容量上限では追加書込不可。Paidは1DB10GB、月250億行read・5000万行write・5GB込み。超過は$0.001/100万read、$1/100万write、$0.75/GB月 |
| Cloudflare Access | Freeは50ユーザーまで。本人1人は範囲内 | 席数や必要機能がFreeを超える場合はPay-as-you-go（公式表示$7/ユーザー/月、年払い）などを検討。Freeでも初期登録で支払情報を求められることがあり、承認なく進めない |
| 復旧 | D1 Time TravelはFreeで7日 | Paidは30日。別途SQLバックアップを個人の非公開保存先に保持する |

根拠：[Workers料金](https://developers.cloudflare.com/workers/platform/pricing/)、[Workers上限](https://developers.cloudflare.com/workers/platform/limits/)、[D1料金](https://developers.cloudflare.com/d1/platform/pricing/)、[D1上限](https://developers.cloudflare.com/d1/platform/limits/)、[D1無料日次枠の適用告知](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/)、[Access料金](https://www.cloudflare.com/sase/products/access/)、[プランの席数](https://www.cloudflare.com/plans/)、[Zero Trust初期登録](https://developers.cloudflare.com/cloudflare-one/setup/)。

個人の少数の記事更新はD1無料枠に収まりやすい。一方、動的なMarkdown/数式のSSRはCPU 10msを超える可能性があるため、**無料運用を保証しない**。ローカルwall timeはCloudflareのCPU使用量ではない。大きい記事を含めた実CPU・起動時間（1秒上限）とWorkerのサイズ（現在はFree/Paidとも非圧縮64MiB上限、圧縮サイズ上限なし）を承認後のプレビューで測定する。必要なら月$5からのWorkers Paidを比較し、料金承認がなければ本番切替を止める。

保存量には元原稿と解析済み本文の両方・インデックスが含まれる。10KiB原稿を100記事なら本文だけで概ね2MiB程度（構造・索引分は別）。旧方式の履歴があればその容量も残る。D1のread/write計数はHTTP回数と一致せず、索引更新や走査も含む。無料枠は既存サイト等と共用。有料プランでの超過は追加課金になる。自動の有料化・契約変更は実装していない。

## 実装上の制限

Web本文編集、保存済み本文の差し替え、AI/会話取込、自動公開、画像等の添付アップロード、招待制、予約公開、全文検索はない。日本語フォントには既存の全文字fallbackがあるため、新しい記事の文字追加に再ビルドは不要。

サイトコードのデプロイはDBを変更しない。スキーマmigrationは別の明示操作。DB IDを継続して使い、初期化SQL・原稿投入をCIや起動処理に入れない。`npm run deploy`はローカル用DB IDのままでは失敗する。

## ローカルでの画面確認

`npm run journal:preview`でビルド後のサイトとローカル専用D1を起動する。127.0.0.1の仲介サーバーだけがテスト用署名JWTを発行し、アプリ本体は本番と同じ認証処理を通す。外部JWKS接続もローカルの公開鍵で応答し、本番にローカル認証モードを組み込まない。Host/Originを制限する。DBは`.wrangler/journal-preview/d1`に永続化し、サンプルが未登録のときだけローカルで投入・公開する。
