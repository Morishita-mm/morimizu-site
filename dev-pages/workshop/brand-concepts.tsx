/* oxlint-disable next/no-html-link-for-pages -- Standalone local Vite preview. */
import {
  MShape,
  SiteIcon,
  isAbstractMark,
  isCenterPlateMark,
  type MVariant,
} from './site-identity';
// Original vector lettering; no icon library or font dependency. ASCII glyphs only.
const letters: Record<
  string,
  { width: number; path: string; accent?: string }
> = {
  m: {
    width: 98,
    path: 'M10 80V29h12c13 0 22 10 22 23v28M44 51V29h12c18 0 30 12 30 30v21',
  },
  o: {
    width: 78,
    path: 'M65 55c0 16-9 26-26 26S13 71 13 55s9-26 26-26 26 10 26 26Z',
  },
  r: { width: 59, path: 'M12 80V29h13c11 0 18 6 23 14' },
  i: { width: 28, path: 'M14 30v50', accent: 'M14 8v10' },
  z: { width: 69, path: 'M10 30h48L12 80h48' },
  u: { width: 77, path: 'M12 30v29c0 14 9 22 24 22h28V30' },
  k: { width: 69, path: 'M12 8v72m45-50L29 53l29 27' },
  w: {
    width: 99,
    path: 'M10 30v28c0 15 9 23 25 23h12V30m0 28c0 15 9 23 25 23h14V30',
  },
  s: { width: 68, path: 'M57 30H27c-19 0-19 24 0 24h15c20 0 20 26 0 26H10' },
  e: {
    width: 74,
    path: 'M13 55h47V44c0-9-9-15-22-15-17 0-26 9-26 25s10 26 28 26h21',
  },
  a: { width: 77, path: 'M63 80V30H38c-16 0-26 10-26 25s10 25 26 25h25' },
  ':': { width: 35, path: '', accent: 'M17 34v10m0 22v10' },
};

export function Lettering({
  word,
  identity = false,
  variant = 'original',
}: {
  word: string;
  identity?: boolean;
  variant?: MVariant;
}) {
  const characters = word.split('');
  const width = characters.reduce(
    (sum, character) => sum + letters[character].width,
    0,
  );
  const glyphs = characters.map((character, index) => {
    const glyph = letters[character];
    if (!glyph) throw new Error(`Missing letter: ${character}`);
    const x = characters
      .slice(0, index)
      .reduce((sum, previous) => sum + letters[previous].width, 0);
    return (
      <g key={index} transform={`translate(${x},0)`}>
        {identity && character === 'm' ? (
          <MShape variant={variant} />
        ) : (
          <path d={glyph.path} />
        )}
        {glyph.accent && <path d={glyph.accent} className="letter-accent" />}
      </g>
    );
  });
  return (
    <svg
      className="custom-lettering"
      viewBox={`0 0 ${width} 94`}
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
      strokeLinecap="square"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyphs}
    </svg>
  );
}

export function BrandWordmark({
  variant = 'original',
}: {
  variant?: MVariant;
}) {
  return (
    // The two inline SVG letter groups form one accessible composite logo.
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
    <span className="site-wordmark" role="img" aria-label="morimizu works">
      <Lettering
        word="morimizu"
        identity={!isAbstractMark(variant)}
        variant={variant}
      />
      <span className="site-wordmark-works">
        <Lettering word="works" />
      </span>
    </span>
  );
}

const concepts = [
  {
    id: 'A',
    name: 'morimizu',
    word: 'morimizu',
    note: '名前を、そのままブランドに。',
    description:
      'ドメインの「.dev」を外し、個人の活動名として残す案です。繰り返す縦線と開いた曲線で、アプリ・記事・経歴をひとつにまとめます。',
    detail: 'いまのアカウント名とのつながりを大切にするなら、この案。',
  },
  {
    id: 'B',
    name: 'MIZUKI WORKS',
    word: 'mizuki',
    note: '作ったものに、自分の署名を。',
    description:
      '誰が作ったものなのかを素直に伝える案です。主役の「mizuki」に小さな「works」を添えて、個人の制作物と仕事の記録を扱います。',
    detail: '職務経歴や海外向けのポートフォリオまで、一貫して使える名前。',
  },
  {
    id: 'C',
    name: 're:make',
    word: 're:make',
    note: '使って、もう一度つくる。',
    description:
      '自分の開発環境を、自分で作り直していく姿勢を名前にした案です。青いコロンを目印に、道具と設計の試行錯誤を前に出します。',
    detail: '個人名よりも、つくる姿勢を強く印象づけたいときに。',
  },
];

const mStudies: {
  id: string;
  variant: MVariant;
  title: string;
  description: string;
}[] = [
  {
    id: 'M-08',
    variant: 'shoulder-planes',
    title: '面と芯',
    description:
      '左右の黒い面と、中央の細い青い面を独立させた案です。3枚の面に同じ傾きを持たせ、文字を直接描かずにMの気配を残します。',
  },
  {
    id: 'M-08A',
    variant: 'shoulder-raised',
    title: '面と芯 — 重心を整える',
    description:
      'M-08の中央の青い面だけを、96のグリッド上で4だけ上げました。左右の黒い面、幅、傾きは原案のまま。少し落ち着いた重心になるかを比較する調整案です。',
  },
  {
    id: 'M-09',
    variant: 'shoulder-chamfer',
    title: '角を落とした柱',
    description:
      '黒い肩の足元を水平にそろえ、内側の角だけを落とした案です。中央の青い面は細く保ち、小さな表示でも輪郭の重さを比較します。',
  },
  {
    id: 'M-10',
    variant: 'shoulder-rebate',
    title: '内側を削いだ肩',
    description:
      '黒い肩の内側を途中から削ぎ、下側の余白を広げた案です。中央の青い面は独立したまま、重心と抜けの違いを比較します。',
  },
  {
    id: 'M-04',
    variant: 'planes',
    title: '余白でつなぐM',
    description:
      '4枚の面と余白はそのままに、図形全体を正方形の比率へ整えました。シンボルは文字に混ぜず、morimizu worksの隣へ。文字は読みやすいレタリングに戻しています。',
  },
  {
    id: 'M-05',
    variant: 'paired',
    title: '向かい合う面',
    description:
      'M-04の4枚を、左右2つの面へまとめた案です。中央の縦の余白を強く残し、文字というより対になった図形として覚えやすくしました。',
  },
  {
    id: 'M-06',
    variant: 'stagger',
    title: '少しずれたリズム',
    description:
      '面の数と隙間は保ち、右側を少し下へずらしました。左右対称を崩すことで、静かな構成の中に動きと固有の輪郭をつくる案です。',
  },
  {
    id: 'M-07',
    variant: 'inset',
    title: '内側に重心',
    description:
      '外側を細く、中央の2枚を広くした案です。M-04よりも中心がまとまり、細い輪郭と面の厚みの対比が目印になります。',
  },
  {
    id: 'M-01',
    variant: 'arch',
    title: 'ふたつのアーチ',
    description:
      '小文字のmを、同じ幅のアーチで組み立てる案。中央の柱を共有し、ロゴの丸い文字と自然につながります。',
  },
  {
    id: 'M-02',
    variant: 'cutout',
    title: '四角い切り抜き',
    description:
      'ひとつの塊から2つの空間を抜いた、角ばったm。小さくても輪郭が残る、道具の刻印のような案です。',
  },
  {
    id: 'M-03',
    variant: 'flow',
    title: '一筆の曲線',
    description:
      '一本の線を途切れずに曲げてつくるm。中央に小さな折り返しを残し、手で書いたような柔らかさを持たせます。',
  },
];

function IconSamples({ variant }: { variant: MVariant }) {
  return (
    <div
      className={`brand-icon-samples m-samples-${variant}${isCenterPlateMark(variant) ? ' m-center-plate-samples' : ''}`}
    >
      <div>
        <SiteIcon variant={variant} />
        <span>明るい背景</span>
      </div>
      <div className="inverse">
        <SiteIcon variant={variant} />
        <span>{isCenterPlateMark(variant) ? '反転・単色' : '暗い背景'}</span>
      </div>
      <div className="brand-small-icons">
        {[16, 24, 32, 48].map((size) => (
          <span key={size} style={{ width: size }}>
            <SiteIcon variant={variant} />
            {isCenterPlateMark(variant) && (
              <span className="m-monochrome m-small-monochrome">
                <SiteIcon variant={variant} />
              </span>
            )}
            <small>{size}px</small>
          </span>
        ))}
      </div>
    </div>
  );
}

export function BrandConcepts() {
  return (
    <div className="brand-lab shell">
      <a className="e-back" href="/">
        ← トップへ
      </a>
      <header className="e-page-heading">
        <p className="e-kicker">LOCAL / M ICON STUDIES</p>
        <h1>
          morimizu worksの、
          <br />
          面と余白からつくるM。
        </h1>
        <p>
          M-08Aを採用し、ローカルの各ページとfaviconに反映しました。中央の青い面だけを少し上げたCodexによる微調整です。原案と既存候補は比較用に残しています。小サイズは上がカラー、下が単色です。
        </p>
      </header>
      <div
        className="abstract-m-overview"
        aria-label="独立したシンボル案の比較"
      >
        {mStudies
          .filter((study) => isAbstractMark(study.variant))
          .map((study) => (
            <a key={study.id} href={`#${study.id.toLowerCase()}`}>
              <span>
                {study.id}
                {study.variant === 'planes' ? ' / 基準案' : ' / 追加案'}
              </span>
              <SiteIcon variant={study.variant} />
              <strong>{study.title}</strong>
            </a>
          ))}
      </div>
      <div className="m-study-links" aria-label="Mのアイコン案">
        {mStudies.map((study) => (
          <a key={study.id} href={`#${study.id.toLowerCase()}`}>
            {study.id}
            <span>{study.title}</span>↓
          </a>
        ))}
      </div>
      {mStudies.map((study) => (
        <section
          key={study.id}
          id={study.id.toLowerCase()}
          className={`m-study m-study-${study.variant}`}
          aria-labelledby={`${study.id}-title`}
        >
          <header className="m-study-heading">
            <div>
              <span className="e-kicker">{study.id}</span>
              <h2 id={`${study.id}-title`}>{study.title}</h2>
            </div>
            <p>{study.description}</p>
          </header>
          {isAbstractMark(study.variant) && (
            <div className="m-plane-comparison">
              <figure className="m-monochrome">
                <SiteIcon variant={study.variant} />
                <figcaption>01 / 単色で形を見る</figcaption>
              </figure>
              <figure>
                <SiteIcon variant={study.variant} />
                <figcaption>
                  {isCenterPlateMark(study.variant)
                    ? '02 / 中央の細い面に青を添える'
                    : '02 / 右側に青を添える'}
                </figcaption>
              </figure>
            </div>
          )}
          <div className="m-study-lockup">
            <div className="m-study-icon">
              <SiteIcon variant={study.variant} />
            </div>
            <BrandWordmark variant={study.variant} />
          </div>
          <IconSamples variant={study.variant} />
        </section>
      ))}
      <details className="brand-previous original-m-review">
        <summary>比較用：前回のV字のM</summary>
        <section
          className="brand-identity-review"
          aria-label="morimizu worksの新しいロゴ"
        >
          <div className="brand-identity-lockup">
            <BrandWordmark />
          </div>
          <div className="brand-icon-samples">
            <div>
              <SiteIcon />
              <span>サイトアイコン</span>
            </div>
            <div className="inverse">
              <SiteIcon />
              <span>暗い背景</span>
            </div>
            <div className="brand-small-icons">
              {[16, 24, 32, 48].map((size) => (
                <span key={size} style={{ width: size }}>
                  <SiteIcon />
                  <small>{size}</small>
                </span>
              ))}
            </div>
          </div>
        </section>
      </details>
      <details className="brand-previous">
        <summary>前回のサイト名・ロゴ案</summary>
        {concepts.map((concept) => (
          <section
            key={concept.id}
            className="brand-concept"
            aria-label={`${concept.id}案 ${concept.name}`}
          >
            <div className="brand-concept-meta">
              <span>
                {concept.id} / {concept.name}
              </span>
              <span>{concept.note}</span>
            </div>
            <div
              className={`brand-concept-stage brand-stage-${concept.id.toLowerCase()}`}
            >
              <Lettering word={concept.word} />
              {concept.id === 'B' && (
                <div className="works-signature">
                  <Lettering word="works" />
                </div>
              )}
            </div>
            <div className="brand-concept-context">
              <div className="brand-mini" aria-label="小さいサイズでの表示">
                <Lettering word={concept.word} />
              </div>
              <div className="brand-mini inverse" aria-label="暗い背景での表示">
                <Lettering word={concept.word} />
              </div>
              <div>
                <p>{concept.description}</p>
                <p>{concept.detail}</p>
              </div>
            </div>
          </section>
        ))}
      </details>
      <p className="brand-lab-footnote">
        すべて独自のSVGレタリングです。商標や同名サービスとの重複は未確認のため、採用前に確認します。
      </p>
    </div>
  );
}
