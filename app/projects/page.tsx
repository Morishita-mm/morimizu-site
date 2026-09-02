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
      <SiteHeader active="apps" />
      <main className="products-index">
        <section className="products-hero page-shell">
          <p className="products-kicker" data-reveal="up">
            <span>PUBLIC PRODUCTS</span>
            <span>{String(projects.length).padStart(2, '0')} SELECTED</span>
          </p>

          <div className="products-hero-grid">
            <h1 data-reveal="up">
              <span>つくったもの。</span>
              <span className="journal-serif">使いながら、</span>
              <span>直しているもの。</span>
            </h1>

            <div
              className="products-hero-copy"
              data-reveal="up"
              data-reveal-delay="60"
            >
              <p>
                自分の開発体験を少し良くするために作った道具です。公開して終わりではなく、実際に使いながら更新しています。
              </p>
              <a href="#selected-products">
                選んだプロダクトを見る
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
              <p>公開リポジトリから選んだもの</p>
              <h2 id="selected-products-title">
                <span>いま見せたい</span>
                <span>3つ</span>
              </h2>
              <p>
                配布中、日常利用中、技術プロトタイプ。状態を分けて、実物と設計判断を載せています。
              </p>
            </header>

            <div className="product-card-grid">
              {projects.map((project, index) => (
                <article
                  className={`product-card${index === 0 ? ' product-card-featured' : ''}`}
                  data-reveal="up"
                  data-reveal-delay={String(index * 50)}
                  key={project.slug}
                >
                  <FullPageLink
                    aria-label={`${project.name}の詳細を見る`}
                    className="product-card-main"
                    href={`/projects/${project.slug}`}
                  >
                    <div className="product-card-head">
                      <span>{project.number}</span>
                      <span>{project.category}</span>
                      <span className="product-status">
                        <i aria-hidden="true" />
                        {project.status}
                      </span>
                    </div>

                    <ProjectArtwork compact project={project} />

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
                  </FullPageLink>

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
