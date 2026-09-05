/* oxlint-disable next/no-img-element -- Standalone Vite sample; local WebP assets are already optimized. */
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './workshop.css';

const home = '/';
const blueprint = '/blueprint/rust-log-analyzer';
const live = 'https://morimizu.dev';
const artwork = (name: string) =>
  new URL(`./assets/${name}.webp`, import.meta.url).href;

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      className={back ? 'arrow arrow-back' : 'arrow'}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Original code-native marks: one grid, consistent optical weight, no library
// icon collages. The existing chosen identity remains untouched in production.
function ToolMark({ kind = 'ragy' }: { kind?: string }) {
  return (
    <svg
      className="tool-mark"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      {kind === 'ragy' ? (
        <>
          <path
            d="M54 13C37 3 11 21 13 40c2 17 20 14 29 7l15-12c11-9 15 6 9 16C55 73 33 76 24 61"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M26 66C8 58 9 31 24 24c12-6 22 1 27 10"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="m51 34 5 6"
            stroke="var(--orange)"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      ) : kind === 'log' ? (
        <>
          <path
            d="M9 18h22v44H9m10-44v44M71 18H49v44h22M49 29h22M49 51h22"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M31 34h18v12H31z" fill="var(--orange)" />
        </>
      ) : kind === 'lissue' ? (
        <>
          <rect
            x="12"
            y="16"
            width="56"
            height="48"
            rx="7"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M12 29h56M31 29v35M49 29v35"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle cx="22" cy="44" r="3" stroke="currentColor" strokeWidth="3" />
          <circle cx="40" cy="46" r="5" fill="var(--orange)" />
          <path
            d="m55 46 4 4 6-8"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="m41 11 25 15v28L41 69 23 58V23z"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path d="m24 27 16 13-16 13L8 40z" fill="var(--orange)" />
        </>
      )}
    </svg>
  );
}

function Brand() {
  return (
    <a className="brand" href={home} aria-label="工房のトップへ">
      <svg
        viewBox="0 0 36 36"
        width="37"
        height="37"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M27 12C17 3 4 13 7 24c3 10 17 9 22-1 4-9-4-15-13-9C4 22 21 30 27 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="30" cy="5" r="2" fill="var(--orange)" />
      </svg>
      <span>
        morimizu<span className="brand-dot">.</span>
        <small>PERSONAL SOFTWARE WORKSHOP</small>
      </span>
    </a>
  );
}

function Header({ detail = false }: { detail?: boolean }) {
  return (
    <>
      <a className="skip-link" href="#main">
        本文へスキップ
      </a>
      <header className="header wrap">
        <Brand />
        <nav aria-label="メインナビゲーション">
          <a href={`${home}#tools`} aria-current={!detail ? 'page' : undefined}>
            道具
          </a>
          <a href={blueprint} aria-current={detail ? 'page' : undefined}>
            設計図
          </a>
          <a href={`${live}/notes`}>
            ノート <span className="external">↗</span>
          </a>
          <a href={`${live}/about`} className="nav-about">
            Mizukiについて <span className="external">↗</span>
          </a>
        </nav>
        <span className="sample-badge">
          <i />
          LOCAL SAMPLE
        </span>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="footer wrap">
      <Brand />
      <p>つくって、使って、また少し直す。</p>
      <a href="https://github.com/Morishita-mm">GitHub ↗</a>
      <small>© 2026 Mizuki</small>
    </footer>
  );
}

function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-rule" />
              MIZUKI&apos;S WORKSHOP
            </p>
            <h1 id="hero-title">
              自分の工房を、
              <br />
              つくっていく<span className="orange-dot">。</span>
            </h1>
            <p className="hero-description">
              開発中の「こうだったらいいな」を、
              <br className="desktop-break" />
              自分で使う道具に。
              <br />
              ここは、つくりながら整えていく個人開発の工房です。
            </p>
            <a className="primary-link" href="#tools">
              道具を見てみる <Arrow />
            </a>
            <div className="hero-footnote">
              <span className="crosshair">＋</span>
              <span>小さな不自由から、次の道具が生まれる。</span>
            </div>
          </div>
          <figure className="hero-art">
            <img
              src={artwork('workbench')}
              alt="緑のリボン状の道具や小さなモジュールを並べた、工房を表すオリジナルの立体作品"
              fetchPriority="high"
              width="1536"
              height="1024"
            />
            <figcaption>
              <span>TOOLS FOR MY OWN WORK</span>
              <span>FIG. 01 — 工房のイメージ</span>
            </figcaption>
          </figure>
        </section>
        <div className="workbench-rule wrap">
          <span>不自由を、道具に変える。</span>
          <span className="mono">BUILD → USE → REFINE</span>
        </div>
        <section
          className="tools wrap"
          id="tools"
          aria-labelledby="tools-title"
        >
          <header className="section-heading">
            <div>
              <p className="eyebrow">01 / ON THE WORKBENCH</p>
              <h2 id="tools-title">
                ほしかったもの。
                <br />
                つくってみたもの。
              </h2>
            </div>
            <p>
              自分の開発環境を、少しずつ使いやすく。
              <br />
              使っている道具も、まだ試しているものも。
            </p>
          </header>
          <div className="tool-grid">
            <article className="product product-ragy">
              <a href={`${live}/projects/ragy`} className="product-link">
                <figure className="product-art">
                  <span className="product-number">01 / RAGY</span>
                  <img
                    src={artwork('ragy')}
                    alt="資料とAIのつながりを、一続きの緑のリボンで表したRagyのコンセプトビジュアル"
                    width="1024"
                    height="1024"
                    loading="lazy"
                  />
                  <span className="product-corner">
                    <ToolMark />
                  </span>
                </figure>
                <div className="product-copy">
                  <p className="product-type">
                    LOCAL RAG / AGENT TOOLING <span>日常利用中</span>
                  </p>
                  <div className="product-title">
                    <h3>Ragy</h3>
                    <Arrow />
                  </div>
                  <p>手元の資料と、AIのあいだをつなぐ。</p>
                  <span className="text-link">
                    道具について読む <span>↗</span>
                  </span>
                </div>
              </a>
            </article>
            <article className="product product-log">
              <a href={blueprint} className="product-link">
                <figure className="product-art">
                  <span className="product-number">02 / RUST LOG ANALYZER</span>
                  <img
                    src={artwork('log-analyzer')}
                    alt="独立した二つのモジュールを橙色の接点でつなぎ、表示と分析の疎結合を表したコンセプトビジュアル"
                    width="1024"
                    height="1024"
                    loading="lazy"
                  />
                  <span className="product-corner">
                    <ToolMark kind="log" />
                  </span>
                </figure>
                <div className="product-copy">
                  <p className="product-type">
                    RUST × PYTHON / REDIS <span>試作中</span>
                  </p>
                  <div className="product-title">
                    <h3>Rust Log Analyzer</h3>
                    <Arrow />
                  </div>
                  <p>さっと読む。じっくり調べる。その両方を。</p>
                  <span className="text-link">
                    道具と設計図を見る <Arrow />
                  </span>
                </div>
              </a>
            </article>
          </div>
          <div className="small-tools">
            <a href={`${live}/projects/lissue`}>
              <ToolMark kind="lissue" />
              <div>
                <span className="eyebrow">03 / ISSUE CLI・TUI</span>
                <h3>Lissue</h3>
                <p>Issueを、いつものターミナルに。</p>
              </div>
              <Arrow />
            </a>
            <a href={`${live}/projects/tech-interviewer`}>
              <ToolMark kind="diagnostic" />
              <div>
                <span className="eyebrow">04 / ARCHITECTURE SIMULATOR</span>
                <h3>Architecture Diagnostic</h3>
                <p>設計の判断を、振り返る。</p>
              </div>
              <Arrow />
            </a>
          </div>
          <p className="image-note">
            立体作品は、道具の役割をもとにAIで制作したイメージです。実際の画面は各プロジェクトで紹介しています。
          </p>
        </section>
        <section className="atelier-invitation" aria-labelledby="atelier-title">
          <div className="wrap invitation-inner">
            <div className="invitation-label">
              <span className="eyebrow">02 / THE DRAWING ROOM</span>
              <span className="drawing-seal">
                M / D<br />
                <small>DESIGN NOTES</small>
              </span>
            </div>
            <div>
              <h2 id="atelier-title">
                道具の裏には、
                <br />
                設計図がある。
              </h2>
              <p>
                どうして、この形にしたんだろう。
                <br />
                仕組みをほどきながら、つくるときの判断を残します。
              </p>
              <a className="primary-link light" href={blueprint}>
                設計のアトリエへ <Arrow />
              </a>
            </div>
            <div className="invitation-mark">
              <ToolMark kind="log" />
              <span>RUST + REDIS + PYTHON</span>
            </div>
          </div>
        </section>
        <section className="notebook wrap">
          <span className="eyebrow">03 / FIELD NOTES</span>
          <h2>つくる途中の、覚え書き。</h2>
          <a className="text-link" href={`${live}/notes`}>
            技術ノートを読む ↗
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}

const steps = [
  {
    title: '全体を見る',
    caption: 'RustとPythonのあいだに、Redisを置く。',
    body: 'ログの表示と分析を別のプロセスに分けました。直接呼び合うのではなく、Redisを通してログや集計結果を受け渡します。',
  },
  {
    title: 'ログを届ける',
    caption: '同じログを、それぞれの仕事へ。',
    body: '受け取ったログは、Rustの表示処理とPythonの分析処理へ。ひとつの言語にすべてを詰め込まず、得意な処理を任せます。',
  },
  {
    title: '分析を返す',
    caption: '調べた結果を、いつもの画面に。',
    body: 'Python / Polarsで集計した結果をRedisへ返し、RustのTUIで受け取ります。表示側は、分析側の実装を直接知る必要がありません。',
  },
];

function BlueprintDrawing({ step }: { step: number }) {
  return (
    <div className={`blueprint-canvas step-${step}`}>
      <div className="sheet-top">
        <span>SYSTEM DRAWING / 001</span>
        <span>RUST LOG ANALYZER</span>
      </div>
      <svg
        className="architecture-drawing"
        viewBox="0 0 1000 440"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An inline SVG diagram needs its accessible image role.
        role="img"
        aria-labelledby="diagram-title diagram-desc"
      >
        <title id="diagram-title">Rust Log Analyzerの構成図</title>
        <desc id="diagram-desc">
          ログがRedisに入り、RustのTUIとPythonのPolars分析へ配信される。分析結果はRedisに戻り、TUIへ配信される。RustとPythonは直接接続しない。
        </desc>
        <defs>
          <marker
            id="flow-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path
              d="m2 1 6 4-6 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </marker>
        </defs>
        <g className="flow-lines flow-ingest">
          <path d="M191 213H343" />
          <path d="M527 178H603V120H698" />
          <path d="M527 235H602V320H698" />
        </g>
        <g className="flow-lines flow-return">
          <path d="M700 365H566V271H527" />
          <path d="M527 145H567V79H698" />
        </g>
        <g className="diagram-labels">
          <text x="227" y="193">
            RAW LOGS
          </text>
          <text x="611" y="104">
            LOGS
          </text>
          <text x="614" y="304">
            LOGS
          </text>
          <text x="578" y="387">
            RESULTS
          </text>
          <text x="601" y="61">
            RESULTS
          </text>
        </g>
        <g className="source-node">
          <rect x="35" y="157" width="155" height="112" rx="4" />
          <text x="58" y="188" className="node-index">
            INPUT
          </text>
          <text x="58" y="220" className="node-title">
            ログ
          </text>
          <text x="58" y="246" className="node-description">
            services / Vector
          </text>
        </g>
        <g className="redis-node">
          <rect x="345" y="113" width="182" height="176" rx="4" />
          <text x="370" y="147" className="node-index">
            02 / MEDIATOR
          </text>
          <text x="370" y="194" className="node-title">
            Redis
          </text>
          <path d="M370 216h130" />
          <text x="370" y="248" className="node-description">
            メッセージの受け渡し
          </text>
          <text x="345" y="329" className="diagram-annotation">
            ここで、処理を切り離す。
          </text>
          <path className="annotation-line" d="M434 308v-18" />
        </g>
        <g className="rust-node">
          <rect x="701" y="48" width="259" height="127" rx="4" />
          <text x="726" y="82" className="node-index">
            01 / INTERFACE
          </text>
          <text x="726" y="116" className="node-title">
            Rust + Ratatui
          </text>
          <text x="726" y="147" className="node-description">
            ログ・集計結果の表示と操作
          </text>
        </g>
        <g className="python-node">
          <rect x="701" y="282" width="259" height="127" rx="4" />
          <text x="726" y="315" className="node-index">
            03 / ANALYSIS
          </text>
          <text x="726" y="351" className="node-title">
            Python + Polars
          </text>
          <text x="726" y="382" className="node-description">
            ログを集計する
          </text>
        </g>
        <path className="separation-rule" d="M724 227h213" />
        <text x="727" y="248" className="diagram-annotation">
          直接はつながない
        </text>
      </svg>
      <div className="mobile-drawing" aria-label="構成図のモバイル表示">
        <div>
          ログ <small>services / Vector</small>
        </div>
        <span aria-hidden="true">↓</span>
        <div className="mobile-redis">
          Redis <small>ログと集計結果の受け渡し</small>
        </div>
        <span aria-hidden="true">↓ ログ・結果　　↑ 集計結果</span>
        <div className="mobile-processors">
          <div>
            Rust<small>Ratatui / 表示・操作</small>
          </div>
          <div>
            Python<small>Polars / 集計</small>
          </div>
        </div>
        <p>RustとPythonは直接つながず、Redisを介してやり取りします。</p>
      </div>
      <div className="sheet-bottom">
        <span>CONCEPTUAL VIEW · 構成の要点</span>
        <span>表示と分析を、疎結合に。</span>
      </div>
    </div>
  );
}

function Blueprint() {
  const [step, setStep] = useState(0);
  return (
    <>
      <Header detail />
      <main id="main" className="detail-main">
        <div className="detail-breadcrumb wrap">
          <a href={`${home}#tools`}>
            <Arrow back />
            工房に戻る
          </a>
          <span>THE DRAWING ROOM / 02</span>
        </div>
        <section className="detail-hero wrap">
          <div>
            <p className="eyebrow">
              設計のアトリエ <span className="orange-label">試作中</span>
            </p>
            <h1>
              Rust Log
              <br />
              Analyzer<span className="orange-dot">.</span>
            </h1>
            <h2>速く読む。深く調べる。</h2>
            <p>
              ログを見る手は止めずに、分析はしっかり。
              <br />
              そのために、表示と分析を別々の道具にしました。
            </p>
            <a className="primary-link" href="#drawing">
              設計図をひらく <Arrow />
            </a>
          </div>
          <figure className="detail-object">
            <img
              src={artwork('log-analyzer')}
              alt="表示と分析を独立させ、中央の接点だけでつなぐ構成を表した立体作品"
              width="1024"
              height="1024"
            />
            <figcaption>
              <ToolMark kind="log" />
              <span>
                二つの得意を、ひとつの道具に。
                <small>ARCHITECTURE AS AN OBJECT / AI CONCEPT</small>
              </span>
            </figcaption>
          </figure>
        </section>
        <dl className="spec-strip wrap">
          <div>
            <dt>つくりたい体験</dt>
            <dd>ターミナルで、調査を続ける</dd>
          </div>
          <div>
            <dt>使った技術</dt>
            <dd>Rust / Python / Redis</dd>
          </div>
          <div>
            <dt>いまの状態</dt>
            <dd>技術プロトタイプ</dd>
          </div>
        </dl>
        <section
          className="drawing-section wrap"
          id="drawing"
          aria-labelledby="drawing-heading"
        >
          <header className="section-heading">
            <div>
              <p className="eyebrow">01 / THE BLUEPRINT</p>
              <h2 id="drawing-heading">
                得意な仕事を、
                <br />
                得意な場所へ。
              </h2>
            </div>
            <p>
              表示はRust。分析はPython。
              <br />
              あいだをRedisがつなぐ、シンプルな分担です。
            </p>
          </header>
          <fieldset
            className="drawing-controls"
            aria-label="構成図の説明を切り替え"
          >
            {steps.map((item, index) => (
              <button
                key={item.title}
                aria-pressed={step === index}
                onClick={() => setStep(index)}
                aria-controls="drawing-explanation"
              >
                <span>0{index + 1}</span>
                {item.title}
              </button>
            ))}
          </fieldset>
          <BlueprintDrawing step={step} />
          <div
            className="drawing-explanation"
            id="drawing-explanation"
            aria-live="polite"
          >
            <span className="eyebrow">NOTE / 0{step + 1}</span>
            <div>
              <h3>{steps[step].caption}</h3>
              <p>{steps[step].body}</p>
            </div>
          </div>
        </section>
        <section
          className="decision-section wrap"
          aria-labelledby="decisions-heading"
        >
          <header>
            <p className="eyebrow">02 / WHY THIS WAY</p>
            <h2 id="decisions-heading">
              設計するとき、
              <br />
              考えたこと。
            </h2>
          </header>
          <div className="decision-list">
            <article>
              <span>01</span>
              <div>
                <h3>表示に、分析を待たせない。</h3>
                <p>
                  Rustの非同期処理とRatatuiで表示・操作を担当し、Polarsによる集計はPythonへ分ける。重い仕事をひとつの処理に抱え込まない構成にしています。
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>間にひとつ、受け渡す場所を。</h3>
                <p>
                  直接呼び合わず、Redisを通じてやり取りする。分析の中身を変えるときも、表示側との境界を保ちやすくするためです。
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>分けたぶん、運用は増える。</h3>
                <p>
                  RedisとPythonも動かす必要があり、接続や起動の管理は増えます。速さと機能だけでなく、道具として扱いやすいかも、試しながら確かめているところです。
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="detail-next wrap">
          <ToolMark kind="log" />
          <div>
            <span className="eyebrow">FROM DRAWING TO CODE</span>
            <h2>
              動いているところも、
              <br className="mobile-break" />
              のぞいてみる。
            </h2>
          </div>
          <a
            className="primary-link"
            href={`${live}/projects/rust-log-analyzer`}
          >
            実際の画面・実装を見る ↗
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="wrap sample-not-found">
        <p className="eyebrow">404 / LOCAL SAMPLE</p>
        <h1>この設計図は、まだありません。</h1>
        <a className="primary-link" href={home}>
          工房に戻る <Arrow />
        </a>
      </main>
      <Footer />
    </>
  );
}

const path = window.location.pathname.replace(/\/$/, '') || '/';
document.title =
  path === blueprint
    ? 'Rust Log Analyzer — 設計のアトリエ / サンプル'
    : 'morimizu — 個人開発の工房 / サンプル';
createRoot(document.getElementById('root')!).render(
  path === '/' ? <Home /> : path === blueprint ? <Blueprint /> : <NotFound />,
);
