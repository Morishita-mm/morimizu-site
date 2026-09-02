export type ProjectStatus =
  | '公開中'
  | '日常利用中'
  | '技術プロトタイプ'
  | 'Public'
  | 'In daily use'
  | 'Technical prototype';

export type Project = {
  slug: string;
  number: string;
  name: string;
  shortName: string;
  category: string;
  status: ProjectStatus;
  statusDetail: string;
  tagline: string;
  summary: string;
  repositoryUrl: string;
  primaryLink?: {
    label: string;
    href: string;
  };
  visual: 'lissue' | 'ragy' | 'rust-log-analyzer';
  image?: {
    src: string;
    alt: string;
    caption: string;
  };
  architecture: {
    src: string;
    alt: string;
  };
  languages: string[];
  stack: string[];
  facts: Array<{
    label: string;
    value: string;
  }>;
  challenge: string;
  answer: string;
  flow: Array<{
    label: string;
    title: string;
    detail: string;
  }>;
  decisions: Array<{
    title: string;
    detail: string;
  }>;
  evidence: string[];
  now: string;
  next: string[];
};

export const projects: Project[] = [
  {
    slug: 'lissue',
    number: '01',
    name: 'Lissue',
    shortName: 'lissue',
    category: 'LOCAL ISSUE CLI / TUI',
    status: '公開中',
    statusDetail: 'crates.io v0.2.0',
    tagline: 'GitとAIエージェントの間に、ローカルなIssue管理を。',
    summary:
      '開発中のタスクを、コードのすぐそばで扱うためのRust製CLIです。人はTUIで、AIエージェントはコマンドとJSONで、同じタスクを受け渡せます。',
    repositoryUrl: 'https://github.com/Morishita-mm/Lissue',
    primaryLink: {
      label: 'crates.ioで見る',
      href: 'https://crates.io/crates/lissue',
    },
    visual: 'lissue',
    image: {
      src: '/projects/lissue-tui.webp',
      alt: 'LissueのTUIでタスクと関連ファイルを操作している画面',
      caption: '実際のTUIデモから切り出した画面',
    },
    architecture: {
      src: '/projects/architecture/lissue.svg',
      alt: 'LissueのCLIとTUI、アプリケーションコア、SQLite、JSON、Gitの関係を示したアーキテクチャ図',
    },
    languages: ['Rust'],
    stack: ['Rust', 'Ratatui', 'SQLite', 'JSON'],
    facts: [
      { label: '配布', value: 'cargo install lissue' },
      { label: '公開版', value: 'v0.2.0' },
      { label: 'テスト', value: '41 tests passed' },
    ],
    challenge:
      'GitHub Issuesは便利ですが、実装中のコードやAIエージェントからは少し遠く感じます。一方、TODOをひとつのファイルへ集めると、複数の作業が重なったときにGitの競合が起きやすくなります。',
    answer:
      'ローカルの操作はSQLiteへ、共有する状態は1タスク1JSONへ分けました。人が読むためのTUIと、AIが扱うための構造化コマンドを、同じデータの上に載せています。',
    flow: [
      {
        label: 'INIT',
        title: '置く',
        detail: 'リポジトリ直下に.lissueを初期化',
      },
      {
        label: 'ADD',
        title: '結ぶ',
        detail: 'タスクへ説明と関連ファイルを添付',
      },
      {
        label: 'CLAIM',
        title: '受け取る',
        detail: '人やAIが次のタスクを担当',
      },
      {
        label: 'CONTEXT',
        title: '渡す',
        detail: '必要な文脈をまとめて取り出す',
      },
    ],
    decisions: [
      {
        title: 'SQLiteとJSONを分担させる',
        detail:
          '検索や更新はSQLiteの速さを使い、Gitで共有する状態は読みやすいJSONに同期します。',
      },
      {
        title: '1タスクを1ファイルにする',
        detail:
          '別々のタスクを同時に触っても、同じ巨大ファイルを編集しない構造にしました。プロジェクト内の性能試験では、1,000件時の追加処理が約80msから約0.37msへ改善しています。',
      },
      {
        title: '人向けIDと共有用UUIDを分ける',
        detail:
          'CLIでは短い連番を使い、Gitで共有するデータには衝突しにくいUUIDを持たせています。',
      },
    ],
    evidence: [
      'crates.ioへ3バージョンを公開済み',
      '34件の単体テストと7件のCLI統合テストを確認',
      '自分の別プロジェクトでも実際のタスク管理に利用',
      'MIT OR Apache-2.0で公開',
    ],
    now: '公開版v0.2.0を配布中です。CLIとTUIの主要な流れは動作し、テストも通っています。',
    next: [
      'GitHub Actionsでテストと整形を自動化する',
      'GitHub Releaseとタグをcrates.ioの版に合わせる',
      '古いリポジトリURLや表示文言を整理する',
    ],
  },
  {
    slug: 'ragy',
    number: '02',
    name: 'Ragy',
    shortName: 'ragy',
    category: 'LOCAL RAG / AGENT TOOLING',
    status: '日常利用中',
    statusDetail: 'local-first development system',
    tagline: '開発中の資料と、AIの間をつなぐローカルな基盤。',
    summary:
      'プロジェクトごとのドキュメントを同期し、CLI・TUI・MCPから同じ知識へアクセスするための個人用RAG基盤です。検索だけでなく、同期状況やキャッシュもひとつの入口から扱います。',
    repositoryUrl: 'https://github.com/Morishita-mm/My-RAG-Agent-System',
    visual: 'ragy',
    architecture: {
      src: '/projects/architecture/ragy.svg',
      alt: 'Ragyのドキュメント同期経路とRAG検索経路を示したアーキテクチャ図',
    },
    languages: ['Rust', 'Python'],
    stack: ['Rust', 'Python', 'Dify', 'Redis', 'Ollama'],
    facts: [
      { label: '入口', value: 'CLI / TUI / MCP' },
      { label: '扱う資料', value: 'md / pdf / docx / xlsx / images' },
      { label: '実行環境', value: 'local-first' },
    ],
    challenge:
      '開発の判断はREADME、設計メモ、Issue、画像の中に散らばります。AIへ毎回コピーして渡すのも、複数プロジェクトの文脈が混ざるのも避けたくて、自分の開発環境に合う入口が必要でした。',
    answer:
      'プロジェクト単位の知識ベースを作り、変更された資料だけを同期します。検索・チャット・状態確認をragyコマンドへまとめ、エディタからはMCP経由でも同じ情報を引けるようにしました。',
    flow: [
      {
        label: 'INIT',
        title: '分ける',
        detail: 'プロジェクトごとの知識ベースを用意',
      },
      {
        label: 'SYNC',
        title: '揃える',
        detail: '変更された資料だけを同期',
      },
      {
        label: 'ASK',
        title: '探す',
        detail: 'TUIやMCPから文脈を検索',
      },
      {
        label: 'TRACE',
        title: '確かめる',
        detail: '状態と検索結果を追いかける',
      },
    ],
    decisions: [
      {
        title: 'プロジェクトごとに文脈を分ける',
        detail:
          'データセットとキャッシュの名前空間を分け、別プロジェクトの情報が回答へ混ざりにくい形にしています。',
      },
      {
        title: '同期を差分だけにする',
        detail:
          'ファイルのハッシュを記録し、変更されたドキュメントだけをバックグラウンドで更新します。',
      },
      {
        title: '同じ機能へ複数の入口をつくる',
        detail:
          '日常操作はCLI、一覧と会話はTUI、コーディング中の参照はMCPと、場面に合わせて入口を選べます。',
      },
    ],
    evidence: [
      'Rust製CLI/TUIとPython製の同期・検索処理を同じリポジトリで管理',
      '文書同期、検索、コンテキスト最適化を対象にしたテスト群を用意',
      'Markdown、PDF、Word、Excel、画像の取り込み処理を実装',
      'ローカル環境での同期・検索ベンチマークを記録',
    ],
    now: '自分の開発環境で使いながら機能を足している段階です。公開リポジトリとしては、版表記やリリースの揃え方を整理している途中です。',
    next: [
      'README・Cargo・GitHub Releaseのバージョン表記を揃える',
      'TUIの実画面と短い導入デモを追加する',
      'テストをGitHub Actionsへ載せる',
    ],
  },
  {
    slug: 'rust-log-analyzer',
    number: '03',
    name: 'Rust Log Analyzer',
    shortName: 'log analyzer',
    category: 'REALTIME LOG TUI',
    status: '技術プロトタイプ',
    statusDetail: 'working proof of concept',
    tagline: '流れ続けるログを、ターミナルの中で止めずに読む。',
    summary:
      '複数サービスのログをRedisで受け取り、Rust製TUIへリアルタイム表示する実験作です。PythonとPolarsで1秒ごとの集計も行い、調査に必要な情報を同じ画面へまとめます。',
    repositoryUrl: 'https://github.com/Morishita-mm/rust-log-analyzer',
    visual: 'rust-log-analyzer',
    image: {
      src: '/projects/rust-log-analyzer.webp',
      alt: 'Rust Log Analyzerでログ一覧と集計を表示しているターミナル画面',
      caption: '実際のデモから切り出した画面',
    },
    architecture: {
      src: '/projects/architecture/rust-log-analyzer.svg',
      alt: 'Rust Log Analyzerのログ送信元、Redis、RustとPythonの処理、ターミナル画面の関係を示したアーキテクチャ図',
    },
    languages: ['Rust', 'Python'],
    stack: ['Rust', 'Tokio', 'Ratatui', 'Python', 'Polars', 'Redis'],
    facts: [
      { label: '表示', value: 'realtime TUI' },
      { label: '集計', value: '1 second window' },
      { label: '構成', value: 'message-driven' },
    ],
    challenge:
      '複数サービスのログを追うと、表示・絞り込み・集計のために道具を行き来しがちです。大量に流れても操作を止めず、ターミナルの中だけで原因を追える形を試したいと考えました。',
    answer:
      'ログの配送をRedis Pub/Subへ寄せ、表示はRust/Tokio、集計はPython/Polarsに分けました。TUIでは正規表現フィルタ、Vim風の移動、選択ログのコピーを扱えます。',
    flow: [
      {
        label: 'INGEST',
        title: '流す',
        detail: 'サービスのログをRedisへ送る',
      },
      {
        label: 'ANALYZE',
        title: '数える',
        detail: 'Polarsで1秒ごとに集計',
      },
      {
        label: 'PUBLISH',
        title: '戻す',
        detail: '集計結果を別チャンネルへ配信',
      },
      {
        label: 'INSPECT',
        title: '追う',
        detail: 'TUIで絞り込み、選び、コピー',
      },
    ],
    decisions: [
      {
        title: '表示と分析を分ける',
        detail:
          '非同期UIはRust、データ集計はPolarsを使うPythonへ分け、それぞれ得意な処理を担当させています。',
      },
      {
        title: 'Redisで疎結合にする',
        detail:
          '送信元、集計、表示が互いの実装を直接知らず、同じログストリームへ参加できる構成にしました。',
      },
      {
        title: '調査操作をキーボードへ寄せる',
        detail:
          '正規表現入力、j/k移動、OSC 52コピーをTUIへ入れ、ターミナルから離れずに調査できます。',
      },
    ],
    evidence: [
      'Rust部分のビルドと起動用構成を確認',
      'Pythonファイルの構文と2つのCompose設定を確認',
      'サンプルアプリからVector、Redis、TUIまでの経路を用意',
      'ログ表示・フィルタ・集計が分かる実演デモを公開',
    ],
    now: '主要な経路が動く技術プロトタイプです。一般向けの配布物ではなく、リアルタイム処理の設計と操作感を確かめる段階として公開しています。',
    next: [
      'Redisの接続先を環境変数で切り替えられるようにする',
      'フィルタとログ選択のテストを追加する',
      'CI・ライセンス・一括起動の導線を整える',
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
