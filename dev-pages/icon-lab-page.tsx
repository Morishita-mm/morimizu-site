import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-chrome';

export const metadata: Metadata = {
  title: 'Icon study | morimizu.dev',
  robots: { index: false, follow: false },
};

type Candidate = {
  id: string;
  name: string;
  note: string;
  selected?: boolean;
  icon: React.ReactNode;
};

const lissue: Candidate[] = [
  {
    id: 'L-D1',
    name: 'Three states',
    note: 'Open・Doing・Doneを、最小限の3列で見せる。',
    selected: true,
    icon: (
      <svg viewBox="0 0 120 120">
        <rect height="68" rx="9" width="86" x="17" y="26" />
        <path d="M17 43h86M46 43v51M75 43v51" />
        <circle cx="31" cy="58" r="5" />
        <circle className="accent-fill" cx="60" cy="69" r="6" />
        <path className="accent-stroke" d="m84 63 5 5 9-12" />
      </svg>
    ),
  },
  {
    id: 'L-H1',
    name: 'State current',
    note: 'ひとつのIssueが、3つの状態を流れていく。',
    icon: (
      <svg viewBox="0 0 120 120">
        <path d="M17 38c20 0 18 44 41 44s20-44 45-44" />
        <path className="accent-stroke" d="M17 82c18 0 21-22 41-22s23 22 45 22" />
        <circle cx="17" cy="38" r="5" />
        <circle className="accent-fill" cx="58" cy="60" r="6" />
        <circle cx="103" cy="38" r="5" />
      </svg>
    ),
  },
  {
    id: 'L-H2',
    name: 'Open cycle',
    note: 'Issueの進行を、閉じきらない循環として表す。',
    icon: (
      <svg viewBox="0 0 120 120">
        <path d="M31 87C12 66 20 34 47 24c26-10 54 7 57 35" />
        <path className="accent-stroke" d="M104 59c2 23-17 42-40 42-13 0-25-6-33-14" />
        <circle cx="31" cy="87" r="5" />
        <circle className="accent-fill" cx="66" cy="101" r="6" />
        <circle cx="104" cy="59" r="5" />
      </svg>
    ),
  },
  {
    id: 'L-H3',
    name: 'Workstream',
    note: '複数の作業が整理され、一つずつ完了へ向かう。',
    icon: (
      <svg viewBox="0 0 120 120">
        <path d="M18 34c25 0 31 26 51 26h33M18 60h84M18 86c25 0 31-26 51-26" />
        <path className="accent-stroke" d="M43 60h59" />
        <circle cx="18" cy="34" r="5" />
        <circle cx="18" cy="86" r="5" />
        <circle className="accent-fill" cx="102" cy="60" r="7" />
      </svg>
    ),
  },
];

const ragy: Candidate[] = [
  {
    id: 'R-G1',
    name: 'Context weave',
    note: '複数の文脈が交わり、一つの流れへまとまる。',
    selected: true,
    icon: (
      <svg viewBox="0 0 120 120">
        <path d="M20 35c24 0 24 50 48 50s24-25 32-25" />
        <path className="accent-stroke" d="M20 85c24 0 24-50 48-50s24 25 32 25" />
        <circle cx="20" cy="35" r="5" />
        <circle className="accent-fill" cx="20" cy="85" r="5" />
        <circle className="accent-fill" cx="100" cy="60" r="7" />
      </svg>
    ),
  },
  {
    id: 'R-G2',
    name: 'Recall field',
    note: '広い知識の中から、必要な文脈へ焦点が集まる。',
    icon: (
      <svg viewBox="0 0 120 120">
        <path d="M31 76a36 36 0 1 1 24 19" />
        <path className="accent-stroke" d="M43 69a22 22 0 1 1 17 13" />
        <path d="M55 63a9 9 0 1 1 9 6" />
        <circle className="accent-fill" cx="31" cy="76" r="6" />
      </svg>
    ),
  },
  {
    id: 'R-G3',
    name: 'Context fold',
    note: '散らばった情報を折り畳み、扱える形に整える。',
    icon: (
      <svg viewBox="0 0 120 120">
        <path d="m23 38 26-15 24 14 24-14v59L73 97 49 83 23 98V38Z" />
        <path d="M49 23v60M73 37v60" />
        <path className="accent-stroke" d="M23 62 49 47l24 14 24-15" />
        <circle className="accent-fill" cx="73" cy="61" r="6" />
      </svg>
    ),
  },
];

const logAnalyzer: Candidate[] = [
  {
    id: 'A-B',
    name: 'Log stream',
    note: '大量のイベントから、注目すべき一行を拾う形。',
    icon: (
      <svg viewBox="0 0 120 120">
        <path d="M24 28h72v64H24z" />
        <path className="light-stroke" d="M38 44h42M38 58h32M38 72h42" />
        <path className="accent-stroke" d="M34 58h48" />
        <circle className="bright-fill" cx="88" cy="58" r="6" />
      </svg>
    ),
  },
  {
    id: 'A-J1',
    name: 'Decoupled relay',
    note: '高速な表示と高度な解析を、中央の境界で疎結合に。',
    selected: true,
    icon: (
      <svg viewBox="0 0 120 120">
        <path className="light-stroke" d="M14 37h21c13 0 13 23 25 23M14 60h46M14 83h21c13 0 13-23 25-23" />
        <path className="accent-stroke" d="M68 60c13 0 14-25 37-25M68 60h37M68 60c13 0 14 25 37 25" />
        <circle className="bright-fill" cx="64" cy="60" r="7" />
      </svg>
    ),
  },
  {
    id: 'A-J2',
    name: 'Twin runtimes',
    note: '異なる二つの実行系を、共有しすぎない対の構造に。',
    icon: (
      <svg viewBox="0 0 120 120">
        <path className="light-stroke" d="M49 29C29 19 13 35 13 55s16 36 36 26M71 29c20-10 36 6 36 26S91 91 71 81" />
        <path className="accent-stroke" d="M49 45c-9-5-18 2-18 12s9 17 18 12M71 45c9-5 18 2 18 12s-9 17-18 12" />
        <circle className="bright-fill" cx="60" cy="43" r="5" />
        <circle className="bright-fill" cx="60" cy="60" r="5" />
        <circle className="bright-fill" cx="60" cy="77" r="5" />
      </svg>
    ),
  },
  {
    id: 'A-J3',
    name: 'Async exchange',
    note: '双方が自分の速度を保ち、キュー越しに情報を交換する。',
    icon: (
      <svg viewBox="0 0 120 120">
        <path className="light-stroke" d="M14 35h17c13 0 14 14 24 14M14 60h41M14 85h17c13 0 14-14 24-14" />
        <path className="accent-stroke" d="M65 49c10 0 11-14 24-14h17M65 60h41M65 71c10 0 11 14 24 14h17" />
        <circle className="bright-fill" cx="60" cy="44" r="4" />
        <circle className="bright-fill" cx="60" cy="60" r="4" />
        <circle className="bright-fill" cx="60" cy="76" r="4" />
      </svg>
    ),
  },
];

function StudySection({
  candidates,
  dark = false,
  description,
  title,
}: {
  candidates: Candidate[];
  dark?: boolean;
  description: string;
  title: string;
}) {
  return (
    <section className="icon-lab-section">
      <header className="icon-lab-section-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className={`icon-lab-grid${candidates.length === 4 ? ' is-four' : ''}`}>
        {candidates.map((candidate) => (
          <article
            className={`icon-lab-card${dark ? ' is-dark' : ''}`}
            key={candidate.id}
          >
            <div className="icon-lab-artwork">{candidate.icon}</div>
            <div className="icon-lab-card-copy">
              <div className="icon-lab-card-meta">
                <span>{candidate.id}</span>
                {candidate.selected ? <strong>採用</strong> : null}
              </div>
              <h3>{candidate.name}</h3>
              <p>{candidate.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function IconLabPage() {
  return (
    <>
      <SiteHeader />
      <main className="icon-lab page-shell">
        <header className="icon-lab-heading">
          <p>LOCAL ICON STUDY / 01</p>
          <h1>
            アイコンを、
            <span className="journal-serif">意味から考え直す。</span>
          </h1>
          <p>
            形の意味と視認性を比べるためのローカル検証ページです。各案は同じ112pxグリッドと線幅で揃えています。
          </p>
        </header>

        <StudySection
          candidates={lissue}
          description="L-D1を残し、R-G1と同じ流線・二色・点のルールで再検討。"
          title="Lissue"
        />
        <StudySection
          candidates={ragy}
          description="R-G1 Context weaveを採用。このアイコンをシリーズ全体の造形基準に。"
          title="Ragy"
        />
        <StudySection
          candidates={logAnalyzer}
          dark
          description="A-J1 Decoupled relayを採用。Rust TUI・Redis・Python解析の疎結合を表現。"
          title="Rust Log Analyzer"
        />
      </main>
    </>
  );
}
