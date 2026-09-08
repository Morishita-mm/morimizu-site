# Journal実行時管理の検証結果

2026-09-08。本文固定・管理画面アップロード方式のローカル実装・検証を完了。本番導入は未実施。

## 実現・検証できた運用

| 要件 | 確認した結果 |
|---|---|
| 初回送信 | 管理画面で選択／ドラッグ＆ドロップしたMarkdownだけを、確認チェックと保存操作後に送信。private、live版なし。未認証取得404 |
| 再送信 | 同じid・同じ原稿で記事・版の重複なし。元Markdownと改行を保持 |
| 本文固定 | 内容が異なる同一IDの原稿は409。ブラウザー・CLI・同時アップロードのいずれでも保存版を上書きしない |
| 公開範囲の保存 | 描画したrevisionと状態versionで照合。別画面の公開設定変更と競合したら409 |
| 公開範囲 | publicの一覧・通常URL、unlistedの共有URL、privateの管理限定を確認 |
| 共有停止 | private化・リンク再発行で旧リンク404。再共有しても旧リンクは復活しない |
| 原稿送信の権限 | 送信専用トークンは管理画面・原稿取得・公開操作には利用不可 |
| 未認証 | 管理HTML/RSC/API、URLエンコードした管理パスは401。メールヘッダー偽装・不正署名・別audience・別email・期限切れJWTを拒否 |
| 公開取消 | 通常HTML/APIと共有HTML/RSCで404。no-storeを確認。既存の配信済みコピーは回収対象外 |
| サイト更新 | 永続化したローカルD1をWorkerコード交換後に再利用し、全版・公開設定・版参照が同一 |
| 復旧 | 全原稿・全版・状態を別の空D1へ移し、値が同一であることを確認 |
| Markdown表示 | 既存rendererでGFM、コードファイル名、KaTeX、Mermaidを実ブラウザー確認。scriptが実行されない |
| デザイン | 1440px/390pxで管理・記事表示を確認。アップロード画面は320pxも確認し、横方向のはみ出しなし |
| 既存画面 | 既存55ルートをprerender。日英8ルートとフォントの既存検証成功。Qiita同期19公開記事を維持 |
| 配布物 | Journal記事のprerenderなし。生成記事TSと非公開テストcanaryがdistに混入しない |
| 未設定デプロイ | ローカルDB IDではpredeploy guardが失敗することを確認 |

## 実行した確認

- `npm run test:journal`：36件成功（スキーマ23件、D1/HTTP統合の親テストと12項目）。D1はMiniflare/workerdの実装を使用。単なるインメモリモックのデータベースではない。
- `npm run test:journal:browser`相当の `node scripts/verify-journal-runtime.mjs`：ビルド済みWorker + 独立した一時D1 + Chrome。RSA署名JWTを検証し、ファイル選択／ドラッグ＆ドロップ・明示保存・重複再送・上書き拒否・公開／限定公開／非公開・共有停止まで成功。CLIの同一原稿再送も確認。
- `npm run build`：既存55ルートprerender、10 skipped、postbuildのJournal境界検査成功。
- `npm run lint`、`npx tsc --noEmit`、`git diff --check`：成功。
- `node dev-pages/workshop/verify-locale.mjs`：8ルート×2言語成功。
- `node scripts/verify-fonts.mjs`：8,004字形/ウェイト比較成功。
- 初期実装時のWrangler `deploy --dry-run`：送信・デプロイなしでbundleを検査。非圧縮15,220.66KiB、gzip4,305.50KiB。2026-09-08確認の公式上限は非圧縮64MiB。実CPU・起動時間は未測定。

図の大容量chunk警告、既存Qiita数式のKaTeX警告、Nodeのmodule.register非推奨警告は残る。ビルド失敗ではない。

検証途中で、Vinextがbuild時のroute module検査をNodeで行うため`cloudflare:workers`のトップレベルimportが失敗する問題を確認し、DB使用時に読み込む形に修正した。Journalだけforce-dynamicにしつつ、既存ページのprerenderは維持した。

ブラウザーのテスト用JWTは短命かつ実Cloudflareでは無効。テストJWKSへの応答はハーネスだけで置き換え、アプリに認証バイパス・テスト用secretは組み込んでいない。テスト原稿は一時ディレクトリに作り終了時に削除。画面記録はGit除外済みの `outputs/journal/admin-desktop.png`、`admin-mobile.png`、`shared-mobile.png`。

## ユーザー向けのローカルプレビュー

`node scripts/verify-journal-preview.mjs`で、起動中の127.0.0.1:3003に対して本人のブラウザーと同じ認証仲介経路を確認。ホーム → Journal → サンプル記事 → フッターのJournal管理 → アップロードが動作。同じサンプルの再送で本文・公開状態が変わらないことを確認した。任意Host・別Origin・クロスサイト要求は403。

実際の確認用サーバーを再起動して、サンプルの非公開設定と保存原稿が完全一致して保持されることも確認した。サンプルは確認後に公開へ戻し、ユーザーが表示ページを開ける状態で残した。

画面記録：`outputs/journal/local-upload-1440.png`、`local-upload-390.png`、`local-upload-320.png`、`local-sample-desktop.png`。サンプルは明示的に表示確認用と記載し、実験結果を創作していない。

## 本番で未実施の項目

- D1作成、本番migration、Accessアプリ・本人ポリシー、Secrets設定、初回Worker反映。
- 実Cloudflare Accessのログイン、OTP/IdP、AUD、本人email、workers.dev/preview経由の拒否。
- Cloudflareの実CDNキャッシュ設定、旧静的Journalのキャッシュ除去、複数地域からの公開取消、Fail closed設定。
- Workers実CPU使用量（特に大きなMarkdown・数式）と起動時間、現在のアカウント使用量・Free可否。
- 本番上限到達の実験（ローカルではDB障害時に503で閉じることを確認）。
- 本番SQL export/import、Time Travel、実災害復旧、既存記事の選択移行と公開確認。

現在のローカルworkerdは2026-05-22まで対応しているため、既存サイトと同じ互換日2026-05-15で検証した。料金・上限は2026-09-08の公式文書を別途確認している。

2026-09-09の本番反映準備で、全投稿経路に管理者本人のAccess JWTを必須化し、正しい送信トークンのみ・別emailの署名JWT・偽装emailヘッダー・期限切れ・別AUDを拒否するテストを追加した。`assets.run_worker_first`でJournalとAPIをWorker認証の優先対象に指定。未認証リクエストでDBに原稿が追加されないことを確認。

Notes内のJournal/Qiitaタブ、両一覧の並び順、履歴移動、通信失敗後の再試行、スマホ表示をChromeで確認。ヘッダーの配置と罫線は共通。公開原稿をビルドに含めず、アップロードした本文を固定したままタグだけを変更できる。

本番リソースの初期設定とログイン確認は、完了後にこの記録を更新する。

本番準備の追加検査で、ルーターが複数スラッシュを正規化する一方、認証判定が正規化前だった差を修正。Worker入口でスラッシュを正規化してから管理者判定し、変形URLでもHTML/RSC/原稿ダウンロードを拒否する回帰テストを追加した。
