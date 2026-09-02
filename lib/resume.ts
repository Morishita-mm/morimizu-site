import { LINKEDIN_URL } from '@/lib/social-links';

export type ContactItem = {
  label: string;
  value: string;
  href?: string;
};

export type ExperienceEntry = {
  period: string;
  company: string;
  role: string;
  description: string[];
};

export type EducationEntry = {
  period: string;
  institution: string;
  degree: string;
};

export type LanguageEntry = {
  language: string;
  level: string;
};

export type PosterResumeData = {
  name: string;
  role: string;
  heading: string;
  summary: string;
  contacts: ContactItem[];
  experiences: ExperienceEntry[];
  educations: EducationEntry[];
  skills: string[];
  languages: LanguageEntry[];
};

export const RESUME_JA: PosterResumeData = {
  name: '森下 瑞基',
  role: 'Software Engineer',
  heading: '森下 瑞基, Software Engineer',
  summary:
    '高専での電子制御工学および大学での先端ロボティクスを背景に、システムの堅牢性・セキュリティ・保守性を重視したソフトウェア開発を実践。Java/SpringやPythonでの実務から、RustやDockerによる環境構築・自動化まで、課題に最適な技術を選定・探究します。',
  contacts: [
    {
      label: 'EMAIL',
      value: 'contact@morimizu.dev',
      href: 'mailto:contact@morimizu.dev',
    },
    {
      label: 'GITHUB',
      value: 'github.com/Morishita-mm',
      href: 'https://github.com/Morishita-mm',
    },
    {
      label: 'WEBSITE',
      value: 'morimizu.dev',
      href: 'https://morimizu.dev',
    },
    {
      label: 'LINKEDIN',
      value: 'linkedin.com/in/mizuki-morishita-231445421',
      href: LINKEDIN_URL,
    },
    {
      label: 'QIITA',
      value: 'qiita.com/morimizu',
      href: 'https://qiita.com/morimizu',
    },
    {
      label: 'LOCATION',
      value: 'Tokyo, Japan',
    },
  ],
  experiences: [
    {
      period: '2026.01 - Present',
      company:
        '鉄道会社基盤システム リプレイス・新機能追加（株式会社ユーベック）',
      role: 'Software Test & Verification Engineer',
      description: [
        '開発フェーズ後半からテストフェーズにアサイン。仕様書レビュー、試験観点およびチェックリストの作成、Linux Server / Windows Server 上での機能試験・総合試験を担当。',
        '開発ツールが限られた環境下で、Python in Excelやマクロを活用してテストデータ作成プロセスを自動化・大幅に効率化。',
        '他チーム連携が必要な機能試験において綿密な調整を主導し、予定スケジュールを前倒しして試験を完遂。',
      ],
    },
    {
      period: '2025.08 - 2025.12',
      company:
        '航空会社基盤機能 老朽化対応・Javaバージョンアップ（株式会社ユーベック）',
      role: 'Quality Assurance & Test Engineer',
      description: [
        'Javaバージョンアップに伴う基盤機能・諸機能の更新検証。ローカル開発環境およびAWSテスト環境にて計500件以上のテストケースを実施。',
        '自動化が困難なエンドユーザー向け画面テストにおいて、テストエビデンスのフォーマット作成を簡略化・標準化して消化速度を他メンバー比1.5倍に向上。プロジェクト離任時点で最多テスト実施数を記録。',
      ],
    },
    {
      period: '2025.04 - 2025.07',
      company:
        '新人技術研修 / Java・Spring Webシステム開発（株式会社ユーベック）',
      role: 'Team Lead & Full Stack Developer',
      description: [
        'Java / Spring Boot を用いたECショッピングサイトの設計・実装およびAWSデプロイ。チームリーダーとして3週間で約250コミットを記録し最高水準の評価を獲得。',
        'GitHub Issues / Pull Request による課題・コードレビュー管理、コンフリクト解消を一手に担当。Git未経験メンバーへの技術指導および他チームの技術的課題解決にも貢献。',
      ],
    },
  ],
  educations: [
    {
      period: '2022.04 - 2024.09',
      institution: '電気通信大学',
      degree: 'Ⅱ類融合科 先端ロボティクスプログラム（中退）',
    },
    {
      period: '2017.04 - 2022.03',
      institution: '沼津工業高等専門学校',
      degree: '電子制御工学科（卒業）',
    },
  ],
  skills: [
    'Java',
    'Spring Boot',
    'Python',
    'Rust',
    'C / C++',
    'Docker',
    'AWS',
    'Linux',
    'Windows',
    'Git',
    'GitHub',
    'TypeScript',
  ],
  languages: [
    { language: '日本語 (Japanese)', level: '母国語 (Native)' },
    {
      language: '英語 (English)',
      level: '技術読解・実務 (Professional / Technical)',
    },
  ],
};

export const RESUME_EN: PosterResumeData = {
  name: 'Mizuki Morishita',
  role: 'Software Engineer',
  heading: 'Mizuki Morishita, Software Engineer',
  summary:
    'Background in Electronic Control Engineering (KOSEN) and Advanced Robotics (UEC Tokyo). Committed to engineering robust, secure, and maintainable systems. Experienced in Java/Spring, Python automation, Linux/Windows verification, and modern tooling with Rust and Docker.',
  contacts: [
    {
      label: 'EMAIL',
      value: 'contact@morimizu.dev',
      href: 'mailto:contact@morimizu.dev',
    },
    {
      label: 'GITHUB',
      value: 'github.com/Morishita-mm',
      href: 'https://github.com/Morishita-mm',
    },
    {
      label: 'WEBSITE',
      value: 'morimizu.dev',
      href: 'https://morimizu.dev/en',
    },
    {
      label: 'LINKEDIN',
      value: 'linkedin.com/in/mizuki-morishita-231445421',
      href: LINKEDIN_URL,
    },
    {
      label: 'QIITA',
      value: 'qiita.com/morimizu',
      href: 'https://qiita.com/morimizu',
    },
    {
      label: 'LOCATION',
      value: 'Tokyo, Japan',
    },
  ],
  experiences: [
    {
      period: '2026.01 - Present',
      company:
        'Enterprise Railway Core System: Migration & Enhancement (UBEC Inc.)',
      role: 'Software Test & Verification Engineer',
      description: [
        'Executed integration and functional testing across Linux and Windows Server platforms for railway core replacement.',
        'Automated test data workflows using Python in Excel and scripts, overcoming restricted tooling constraints.',
        'Led cross-team coordination on complex functional modules, achieving early completion ahead of deadlines.',
      ],
    },
    {
      period: '2025.08 - 2025.12',
      company:
        'Airline Infrastructure: Modernization & Java Upgrade (UBEC Inc.)',
      role: 'Quality Assurance & Test Engineer',
      description: [
        'Executed 500+ integration test cases across local environments and AWS deployments following major Java runtime upgrade.',
        'Streamlined evidence logging templates for complex UI testing, accelerating execution speed by 1.5x and recording highest test coverage in the project.',
      ],
    },
    {
      period: '2025.04 - 2025.07',
      company:
        'Full-Stack Web Engineering Intensive: Java & Spring Boot (UBEC Inc.)',
      role: 'Team Lead & Full Stack Developer',
      description: [
        'Engineered an e-commerce platform using Java and Spring Boot deployed to AWS, driving ~250 commits in 3 weeks as team lead and earning top evaluation.',
        'Managed GitHub Issues and Pull Requests, mentored peers on Git fundamentals, and assisted other teams with architectural blockers.',
      ],
    },
  ],
  educations: [
    {
      period: '2022.04 - 2024.09',
      institution: 'The University of Electro-Communications (UEC Tokyo)',
      degree:
        'Cluster II (Integrated Programs), Advanced Robotics Program (Withdrew)',
    },
    {
      period: '2017.04 - 2022.03',
      institution:
        'National Institute of Technology, Numazu College (Numazu KOSEN)',
      degree: 'Department of Electronic Control Engineering (Graduated)',
    },
  ],
  skills: [
    'Java',
    'Spring Boot',
    'Python',
    'Rust',
    'C / C++',
    'Docker',
    'AWS',
    'Linux',
    'Windows',
    'Git',
    'GitHub',
    'TypeScript',
  ],
  languages: [
    { language: 'Japanese', level: 'Native' },
    { language: 'English', level: 'Professional / Technical' },
  ],
};
