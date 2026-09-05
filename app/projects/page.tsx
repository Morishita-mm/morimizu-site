import type { Metadata } from 'next';
import { ArrowDownRight, ArrowUpRight, GitFork } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { ProjectArtwork } from '@/components/project-artwork';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { projects } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'つくったもの | morimizu.dev',
  description:
    'Mizukiが自分の開発体験を少し良くするために作り、公開しているプロダクト。',
  alternates: {
    canonical: '/projects',
    languages: { 'ja-JP': '/projects', 'en-US': '/en/projects' },
  },
  openGraph: {
    title: 'つくったもの | morimizu.dev',
    description:
      'Mizukiが自分の開発体験を少し良くするために作り、公開しているプロダクト。',
    url: '/projects',
    images: ['/og.png'],
  },
};

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader active="apps" languageHref="/en/projects" />
      <main className="products-index">
        <section className="products-hero page-shell">
          <p className="products-kicker" data-reveal="up">
            <span>PERSONAL TOOLBOX</span>
            <span>{String(projects.length).padStart(2, '0')} TOOLS IN USE</span>
          </p>

          <div className="products-hero-grid">
            <h1 data-reveal="up">
              <span>不自由を</span>
              <span className="journal-serif">道具に変える。</span>
            </h1>

            <div
              className="products-hero-copy"
              data-reveal="up"
              data-reveal-delay="60"
            >
              <p>
                自分が毎日使うものだから、速さや使い心地まで試せます。うまくいった結果だけでなく、設計で悩んだ過程も残しています。
              </p>
              <a href="#selected-products">
                使っている道具を見る
                <ArrowDownRight
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.7}
                />
              </a>
            </div>
          </div>

          <dl
            className="products-selection"
            data-reveal="up"
            data-reveal-delay="100"
          >
            <div>
              <dt>01</dt>
              <dd>
                <strong>使える</strong>
                <span>動作と使い方を確認できる</span>
              </dd>
            </div>
            <div>
              <dt>02</dt>
              <dd>
                <strong>説明できる</strong>
                <span>作った理由と判断が残っている</span>
              </dd>
            </div>
            <div>
              <dt>03</dt>
              <dd>
                <strong>続きがある</strong>
                <span>今の開発へつながっている</span>
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="selected-products-title"
          className="products-list-section"
          id="selected-products"
        >
          <div className="page-shell">
            <header className="products-list-heading" data-reveal="up">
              <h2 id="selected-products-title">
                <span>ほしかったもの</span>
                <span>つくってみたもの</span>
              </h2>
            </header>

            <div className="product-card-grid">
              {projects.map((project, index) => (
                <article
                  className={`product-card${index === 0 ? ' product-card-featured' : ''}`}
                  data-reveal="up"
                  data-reveal-delay={String(index * 50)}
                  key={project.slug}
                >
                  <div className="product-card-main">
                    <FullPageLink
                      aria-label={`${project.name}の詳細を見る`}
                      className="product-card-overlay"
                      href={`/projects/${project.slug}`}
                    />
                    <div className="product-card-head">
                      <span>{project.number}</span>
                      <span>{project.category}</span>
                      <span className="product-status">
                        <i aria-hidden="true" />
                        {project.status}
                      </span>
                    </div>

                    <ProjectArtwork compact locale="ja" project={project} />

                    <div className="product-card-copy">
                      <h3>{project.name}</h3>
                      <p>{project.tagline}</p>
                      <ul aria-label="主な技術">
                        {project.stack.slice(0, 4).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <span className="product-card-detail">
                        プロダクトを見る
                        <ArrowDownRight
                          aria-hidden="true"
                          size={17}
                          strokeWidth={1.6}
                        />
                      </span>
                    </div>
                  </div>

                  {project.repositoryVisibility === 'private' ? (
                    <span className="product-card-repository is-private">
                      <GitFork aria-hidden="true" size={14} strokeWidth={1.6} />
                      リポジトリ非公開
                    </span>
                  ) : (
                    <a
                      className="product-card-repository"
                      href={project.repositoryUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <GitFork aria-hidden="true" size={14} strokeWidth={1.6} />
                      GitHub
                      <ArrowUpRight
                        aria-hidden="true"
                        size={14}
                        strokeWidth={1.6}
                      />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
