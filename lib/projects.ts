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
  repositoryVisibility?: 'public' | 'private';
  primaryLink?: {
    label: string;
    href: string;
  };
  visual: 'lissue' | 'ragy' | 'rust-log-analyzer' | 'tech-interviewer';
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
    slug: 'tech-interviewer',
    number: '01',
    name: 'Architecture Diagnostic',
    shortName: 'architecture-diagnostic',
    category: 'AI ARCHITECTURE SIMULATOR',
    status: '技術プロトタイプ',
    statusDetail: 'MVP v0.1.0 / Private Demo',
    tagline: '正解ではなく、トレードオフと根拠を語る力を診断する。',
    summary:
      '要件ヒアリングから構成図作成、10倍負荷の制約変更、証拠の固定までを無人で進行。お世辞のない厳格な現在地と判断根拠を可視化するAI技術面接シミュレーター。',
    repositoryUrl: 'https://github.com/Morishita-mm/tech-interviewer',
    repositoryVisibility: 'private',
    visual: 'tech-interviewer',
    image: {
      src: '/projects/tech-interviewer-report.webp',
      alt: 'Architecture Diagnosticの診断結果レポート画面',
      caption: '実際の診断結果レポート画面（4つの固定ケース「簡潔で妥当」の例）',
    },
    architecture: {
      src: '/projects/architecture/tech-interviewer.svg',
      alt: 'Architecture Diagnosticの受験者ワークスペース、決定論的進行とAI制御、6軸客観レポートとデータ自動消去を示すシステム構成図',
    },
    languages: ['TypeScript'],
    stack: [
      'TypeScript',
      'React Router',
      'Express',
      'Firestore',
      'Cloud Run',
      'Ajv Draft 2020-12',
    ],
    facts: [
      { label: 'セッション', value: '25分 焦点診断' },
      { label: '評価軸', value: '6つの固定評価項目' },
      { label: 'AI制御', value: '費用上限 & 決定論' },
    ],
    challenge:
      '教科書的な知識（ロードバランサーやキャッシュの配置）は知っていても、実際のシステム設計面接や実務では「なぜその構成なのか」「制約変化時に何を犠牲にして何を守るか」の判断根拠が問われます。しかし汎用AIは迎合的で、客観的な現在地を知る手段がありませんでした。',
    answer:
      '固定シナリオ（画像投稿SNS等）に対して要件開示・構成図描画・Evidence Lock（証拠固定）・10倍負荷の追加制約までを決定論的ステートマシンで無人に進行。AI評価を厳格なスキーマと費用Authorityで制約し、誇張のない客観的な現在地レポートを出力します。',
    flow: [
      {
        label: 'HEAR',
        title: '要件確認',
        detail: '面接官AIへの質問を通じた暗黙の前提と品質特性の引き出し',
      },
      {
        label: 'DESIGN',
        title: '構成設計',
        detail: '汎用パレットを使った構成図作成と初期トレードオフの回答',
      },
      {
        label: 'LOCK',
        title: '証拠固定',
        detail: '回答内容を不変にコミットし、事後評価の改ざんを防止',
      },
      {
        label: 'STRESS',
        title: '制約変化',
        detail: '10倍トラフィック急増など突発的な設計制約変更への適応',
      },
      {
        label: 'REPORT',
        title: '現在地診断',
        detail: '6軸の能力状態と肯定・反対証拠を明示したCore Report出力',
      },
    ],
    decisions: [
      {
        title: '決定論的な進行管理とAI評価の分離',
        detail:
          '面接の進行・状態遷移・証拠収集はプログラムがルール通り厳格に統制し、AIは制約された入力投影と評価生成のみに限定することで、AIの暴走や再現性の欠如を防止しました。',
      },
      {
        title: '待機費用ゼロで運用し、30日でデータを自動削除する',
        detail:
          'アクセスがない時間はサーバー費用が一切かからない仕組みを採用。また、診断データは一定期間（30日）が過ぎると自動的に完全に消去されるように設定し、運用費を抑えながら利用者のプライバシーを守っています。',
      },
      {
        title: '特定のAIモデルに縛られず、利用料金の上限を厳格に管理する',
        detail:
          '特定のAIサービスに依存しない共通の接続構造をつくり、いつでもモデルの変更や併用ができるようにしています。さらに、面接1回ごとに利用できるAIコストの上限をシステム的に制限し、想定外の高額請求が物理的に起きないよう安全性を担保しました。',
      },
    ],
    evidence: [
      '技術選定の理由と見送った理由を整理した設計記録',
      '4つの固定参照ケース（必要十分・部分的・過剰設計・証拠不足）による決定論的評価再生テスト',
      'クラウド本番同等環境における実AI評価と費用制御の完全動作検証',
      '厳格な入出力JSON Schema検査による不正データの遮断',
    ],
    now: 'ローカル環境での完全無人診断フロー（25分セッション）と参照レポート比較ワークベンチが稼働中。',
    next: [
      '限定公開アルファの受入テスト',
      '追加シナリオ（決済システム、リアルタイムチャット）の拡充',
      'レポート永続化機能の実装',
    ],
  },
  {
    slug: 'lissue',
    number: '02',
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
        label: 'CLAIM',
        title: '引き受ける',
        detail: '作業者が担当を宣言し状態を更新',
      },
      {
        label: 'EDIT',
        title: '進める',
        detail: 'TUIまたはCLIでメモと文脈を追加',
      },
      {
        label: 'SYNC',
        title: '合わせる',
        detail: 'Git経由でJSONを他環境と同期',
      },
    ],
    decisions: [
      {
        title: 'SQLiteとJSONのハイブリッド構成',
        detail:
          '手元の高速な検索や一覧表示にはSQLiteを使い、チームや複数端末での同期にはGit管理しやすい1タスク1JSONファイルを書き出します。',
      },
      {
        title: 'Ratatuiによる専用TUI',
        detail:
          'ブラウザを開かずにターミナル内で作業を完結させるため、キーバインド主体のTUIを標準で組み込みました。',
      },
      {
        title: 'AIエージェント向けの出力モード',
        detail:
          '人間用の整形表示だけでなく、AIがパースしやすいフラットなJSON出力をすべての主要サブコマンドに用意しました。',
      },
    ],
    evidence: [
      'crates.ioでの一般公開と複数環境での動作確認',
      '41件の単体・統合テストの自動実行',
      '実際の開発現場での日常利用によるドッグフーディング',
    ],
    now: '基本機能は安定しており、自分自身の日々の開発タスク管理において主力ツールとして稼働しています。',
    next: [
      '外部イシュートラッカーとの双方向同期ブリッジ',
      '複数リポジトリを跨いだアグリゲーション表示',
      'プラグイン機構によるカスタムフィールド対応',
    ],
  },
  {
    slug: 'ragy',
    number: '03',
    name: 'Ragy',
    shortName: 'ragy',
    category: 'LOCAL RAG WORKSPACE',
    status: '日常利用中',
    statusDetail: 'CLI v0.2.1 / Workspace',
    tagline: '外部サービスに依存せず、手元のドキュメントを即座に引く。',
    summary:
      'ローカルのMarkdownやソースコードを対象に、埋め込みベクターと全文検索を組み合わせて素早く回答を引き出すRAGツールです。',
    repositoryUrl: 'https://github.com/Morishita-mm/ragy',
    visual: 'ragy',
    architecture: {
      src: '/projects/architecture/ragy.svg',
      alt: 'RagyのCLI、チャンク分割、埋め込み、ローカルベクターDB、検索パイプラインの関係を示したアーキテクチャ図',
    },
    languages: ['TypeScript', 'Python'],
    stack: ['TypeScript', 'Python', 'Ollama', 'Redis', 'Qdrant'],
    facts: [
      { label: '実行環境', value: '完全ローカル動作' },
      { label: '対応形式', value: 'Markdown / Code' },
      { label: '検索方式', value: 'Hybrid Search' },
    ],
    challenge:
      '外部のSaaS型ナレッジベースやAI検索は手軽ですが、機密情報を含むコードベースや下書きメモをそのままアップロードすることには抵抗がありました。また、ネットワーク遅延も思考の中断につながります。',
    answer:
      'すべての処理（埋め込みベクター生成、検索インデックス、LLM推論）を手元の環境で完結させました。高速なインデックス更新と、CLIからの手軽なクエリ実行を実現しています。',
    flow: [
      {
        label: 'CONNECT',
        title: '指定する',
        detail: '対象のディレクトリやファイルを登録',
      },
      {
        label: 'EXTRACT',
        title: '切り出す',
        detail: 'コードや文章を適切な意味単位に分割',
      },
      {
        label: 'VECTORIZE',
        title: '埋め込む',
        detail: 'ローカルモデルでベクターを生成し格納',
      },
      {
        label: 'QUERY',
        title: '引く',
        detail: '自然言語で関連度の高い箇所を特定',
      },
    ],
    decisions: [
      {
        title: 'ハイブリッド検索（BM25 + ベクター）の採用',
        detail:
          '意味的な曖昧検索だけでなく、関数名や固有の変数名による完全一致検索の両方を活かすため、2つのスコアを統合してランク付けしています。',
      },
      {
        title: 'ファイル変更の差分インデックス更新',
        detail:
          'ファイルが保存されるたびに全体を再計算するのではなく、ハッシュ比較による差分チャンクのみを更新することで負荷を抑えています。',
      },
      {
        title: 'Unix哲学に基づくCLIインターフェース',
        detail:
          '検索結果をパイプで別のコマンドやエディタに直接渡せるよう、プレーンテキストおよびJSON出力を完備しました。',
      },
    ],
    evidence: [
      '日々のノート作成や開発調査での常時稼働実績',
      '数十万トークン規模のドキュメント群に対するサブ秒応答の維持',
      'ネットワーク完全切断環境での正常動作検証',
    ],
    now: '主要な開発プロジェクトのドキュメント検索エンジンとして、ローカル常駐プロセスで快適に稼働しています。',
    next: [
      'PDFやOffice文書など対応ファイルフォーマットの拡充',
      'チャンク境界の動的最適化アルゴリズムの導入',
      'チーム共有用のローカルLAN同期機能の検証',
    ],
  },
  {
    slug: 'rust-log-analyzer',
    number: '04',
    name: 'Rust Log Analyzer',
    shortName: 'rust-log-analyzer',
    category: 'ASYNC LOG PROCESSOR / TUI',
    status: '技術プロトタイプ',
    statusDetail: 'Internal Prototype',
    tagline: '大量のログストリームを、非同期パイプラインとTUIでさばく。',
    summary:
      '大量のログをリアルタイムに集約・集計し、ターミナル上で対話的にフィルタリング・観察するための非同期ストリーム処理プロトタイプです。',
    repositoryUrl: 'https://github.com/Morishita-mm/rust-log-analyzer',
    visual: 'rust-log-analyzer',
    image: {
      src: '/projects/rust-log-analyzer.webp',
      alt: 'Rust Log AnalyzerのTUIでリアルタイムにログストリームを監視している画面',
      caption: '非同期ストリームから集計したログのTUI表示画面',
    },
    architecture: {
      src: '/projects/architecture/rust-log-analyzer.svg',
      alt: 'Rust Log AnalyzerのVector、Redis、Pythonによる集計、Rust/RatatuiによるTUIの連携を示したアーキテクチャ図',
    },
    languages: ['Rust', 'Python'],
    stack: ['Rust', 'Python', 'Polars', 'Redis', 'Ratatui'],
    facts: [
      { label: '処理方式', value: '非同期ストリーム処理' },
      { label: '集計エンジン', value: 'Polars (Python)' },
      { label: '表示UI', value: 'Ratatui (Rust)' },
    ],
    challenge:
      'マイクロサービスや分散システムから出力される大量のログを調査する際、クラウドの重いダッシュボードを開くまでのラグや、ローカルでの集計処理による端末のフリーズが課題でした。',
    answer:
      '非同期I/Oに強いRustでログの受信とUI描画を担当し、重いデータ集計処理はPolarsを活用したPythonプロセスへ分離。Redisをバッファとして挟むことで、高速かつ疎結合なパイプラインを構築しました。',
    flow: [
      {
        label: 'PRODUCE',
        title: '集める',
        detail: '複数サービスからログをパイプラインへ注入',
      },
      {
        label: 'ROUTE',
        title: '仲介する',
        detail: 'Redisストリームでバッファリングと順序制御',
      },
      {
        label: 'AGGREGATE',
        title: '集計する',
        detail: 'Polarsにより秒単位のウィンドウ集計を実行',
      },
      {
        label: 'RENDER',
        title: '描画する',
        detail: 'Ratatuiによりキーボード主体のTUIで可視化',
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
