# Editorial portfolio — shared production UI and local design preview

本番の `app/` ルートは `editorial.tsx` の共通UIを `preview={false}` で使用します。
ローカル専用の入口は `entry.tsx` です。本番にはbrand-lab/icon-labのルートを作らず、LOCAL PREVIEW表示とレビューリンクも非表示です。
日英切替はURLを変更せず、ブラウザに保存した選択を復元します。Qiita本文は原文です。
検証: `node dev-pages/workshop/verify-locale.mjs`、`node dev-pages/workshop/verify-render.mjs`。

## 起動・ページ

```sh
npm run dev:workshop
```

- トップ: http://127.0.0.1:3002/
- プロジェクト: http://127.0.0.1:3002/projects
- 技術ノート: http://127.0.0.1:3002/notes
- 職務経歴: http://127.0.0.1:3002/about
- 英語の職務経歴: http://127.0.0.1:3002/en/about
- morimizu worksのMアイコン別案3つ（前回案も保存）: http://127.0.0.1:3002/brand-lab

全4プロジェクトの詳細と同期済みQiita記事の全文をローカルで閲覧できます。
記事のMarkdownレンダラー・サニタイズ・数式・Mermaidは既存実装を再利用。
アプリへのリンクとGitHub、Qiita、LinkedIn、メールのみ外部へ移動します。
経歴ページは以前のPosterResumeViewを再利用し、元の配色・段組み・印刷機能を維持しています。
元のCSSは経歴ページ内にスコープを限定し、ほかのページには影響しません。
各アプリの構成図は概要の直下に常時表示。スマホでは図を縮小しすぎず横スクロールで閲覧します。

トップの4プロジェクトは同じカード形式の手動カルーセルです。スワイプ、トラックパッド、左右ボタン、Tabでのカード移動に対応し、自動送りはしません。
トップの名前はMizuki Morishita、スキルはRustを先頭、Java・Spring Bootを後ろにしています。職務経歴本文の情報は変更しません。

## Qiitaのいいね数

公開API `GET https://qiita.com/api/v2/users/morimizu/items` の `likes_count` を取得し、記事IDで結びます。
データは `qiita-likes.json` に取得日時と数だけを保存。トークン不要で、閲覧者のブラウザからQiitaに直接通信しません。
ローカルサーバー起動時・サンプルビルド時に更新（1時間以内はキャッシュを再利用）。手動更新は `npm run sync:workshop-likes`。
常時の自動更新ではなく取得時点の値で、ページにも時刻を表示します。通信失敗時は前回の値を保持し、未取得を0件とは表示しません。
本番用の記事同期・CIは未変更です。本番採用時には同じ処理を既存の記事同期またはビルド工程へ組み込みます。
API仕様: https://qiita.com/api/v2/docs

## 前案から変えたこと

工房の模型・暖色・緑・セリフ体・切手風の装飾を外し、白・黒・ブルーを基準に再構成。
大きなサイト名、横長の抽象作品、3つの入口（Projects / Notes / About）、
役割に応じて密度を変えるページレイアウトを採用しています。

紹介文は公開サイトの現行文言を維持。プロジェクト・記事・経歴は
`lib/projects.ts`、`lib/qiita-articles.ts`、`lib/resume.ts` を直接参照します。
UIの案内や見出し以外に、実績の書き換え・架空の数値・新しい自己紹介は加えていません。
英語対応は経歴ページのみのサンプルです。

サイト名はmorimizu works。Mの左右の部材が中央でつながる独自SVGを、サイトアイコンとロゴ中の2つのmで共有しています。
ヘッダー・トップ・フッター・タブアイコンに反映。faviconも同じパスを使い、明暗の背景に対応します。
`/brand-lab` にはM-01（ふたつのアーチ）、M-02（四角い切り抜き）、M-03（一筆の曲線）を追加。
各案をロゴ内の2つのmにも適用し、明暗・16/24/32/48pxを比較できます。選定前なのでトップとfaviconは前回のMを維持しています。
追加案M-04は、4枚の独立した面と6/8/6ユニットの隙間でMを構成。単色版と青を添えた版を比較できます。参考の3枚構成そのものは使わず、独自のパスで描いています。
M-04の図形は76×76に調整。ワードマークのmへの組み込みをやめ、通常のレタリングと独立したシンボルを並べます。M-01〜03の旧比較はそのまま保存しています。
同じ方向性の追加案M-05（向かい合う面）、M-06（少しずれたリズム）、M-07（内側に重心）を掲載。M-04とともに冒頭で比較でき、全案76×76・単色/青・明暗・小サイズ・独立した文字ロゴとの組み合わせを揃えています。トップやfaviconへの採用は未実施です。
Lissue・Ragy・Rust Log Analyzerは、現在の本番 `components/project-artwork.tsx` のSVG形状をコピーし、このプレビュー内だけ色を変更しています。
黒地には白と明るい青、明るい地には黒と青を使います。本番側のアイコンファイルは編集しません。
AI生成のヒーロー画像1点を使用（約62 KB）。Ragyの画像は使わずファイルのみ保存。[生成時のプロンプト](assets/editorial-prompts.md)。
実画面・既存の構成図は本物のアセットを再利用し、AI画像で代用していません。
構成図は表示時にテーマ色だけを変換し、内容と本番SVGは変更しません。

## 本番からの分離

通常の `app/`・`public/` と別のViteエントリーで動作します。
ビルド先はGit管理外の `work/workshop-sample/`。本番・stagingへの反映は行いません。
前案の `main.tsx`、`workshop.css`、旧画像は参照せず保存しています。
現行エントリーは `editorial.tsx` です。

```sh
npm run build:workshop
npm run lint
npm exec tsc -- --noEmit --incremental false
npm run build
node dev-pages/workshop/verify-build.mjs
node dev-pages/workshop/verify-render.mjs
```

## 追加内容の提案（未実装）

1. 技術と実例の対応: スキル名から、その技術を使った案件・プロジェクト・記事へつなぐ。
2. 設計判断の短い事例集: 制約、選択した構成、妥協した点を1件ずつ読めるようにする。
3. プロジェクトの更新履歴: 最終更新と現在の状態を示し、活動を追いやすくする。

まずは既存の3つの内容を主役にし、追加機能は方向性の承認後に検討します。
## ChatGPT制作の追加アイコン

M-08〜10をcodex-with-chatgpt経由で制作。assets/m-08-shoulder-planes.svg、assets/m-09-shoulder-chamfer.svg、assets/m-10-shoulder-rebate.svgに元SVGを保存。文字ロゴと分離し、カラー・単色・小サイズで比較できます。既存候補、トップ、faviconは未変更です。
