import type { Metadata } from 'next';
import { ArrowDownRight, ArrowUpRight, GitFork } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { ProjectArtwork } from '@/components/project-artwork';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { projectsEn } from '@/lib/projects-en';

export const metadata: Metadata = {
  title: 'Products | morimizu.dev',
  description:
    'Public software products Mizuki builds to improve a personal development workflow.',
  alternates: {
    canonical: '/en/projects',
    languages: { 'ja-JP': '/projects', 'en-US': '/en/projects' },
  },
  openGraph: {
    title: 'Products | morimizu.dev',
    description:
      'Public software products Mizuki builds to improve a personal development workflow.',
    url: '/en/projects',
    images: ['/og.png'],
  },
};

export default function EnglishProjectsPage() {
  return (
    <>
      <SiteHeader active="apps" locale="en" languageHref="/projects" />
      <main className="products-index english-site">
        <section className="products-hero page-shell">
          <p className="products-kicker" data-reveal="up">
            <span>PUBLIC PRODUCTS</span>
            <span>{String(projectsEn.length).padStart(2, '0')} SELECTED</span>
          </p>

          <div className="products-hero-grid">
            <h1 data-reveal="up">
              <span>Things I built.</span>
              <span className="journal-serif">Things I use,</span>
              <span>learn from, and refine.</span>
            </h1>

            <div
              className="products-hero-copy"
              data-reveal="up"
              data-reveal-delay="60"
            >
              <p>
                These tools started from friction in my own development
                workflow. Publishing is not the finish line: I keep using and
                improving them.
              </p>
              <a href="#selected-products">
                Explore selected products
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
                <strong>Working</strong>
                <span>The software and its usage are visible</span>
              </dd>
            </div>
            <div>
              <dt>02</dt>
              <dd>
                <strong>Explainable</strong>
                <span>The decisions behind it are documented</span>
              </dd>
            </div>
            <div>
              <dt>03</dt>
              <dd>
                <strong>Still evolving</strong>
                <span>Each product connects to ongoing work</span>
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
              <p>Selected from public repositories</p>
              <h2 id="selected-products-title">
                <span>Things I build,</span>
                <span>and use.</span>
              </h2>
              <p>
                A published tool, a system in daily use, and a technical
                prototype—each with working evidence and architecture decisions.
              </p>
            </header>

            <div className="product-card-grid">
              {projectsEn.map((project, index) => (
                <article
                  className={`product-card${index === 0 ? ' product-card-featured' : ''}`}
                  data-reveal="up"
                  data-reveal-delay={String(index * 50)}
                  key={project.slug}
                >
                  <div className="product-card-main">
                    <FullPageLink
                      aria-label={`View ${project.name}`}
                      className="product-card-overlay"
                      href={`/en/projects/${project.slug}`}
                    />
                    <div className="product-card-head">
                      <span>{project.number}</span>
                      <span>{project.category}</span>
                      <span className="product-status">
                        <i aria-hidden="true" />
                        {project.status}
                      </span>
                    </div>
                    <ProjectArtwork compact locale="en" project={project} />
                    <div className="product-card-copy">
                      <h3>{project.name}</h3>
                      <p>{project.tagline}</p>
                      <ul aria-label="Main technologies">
                        {project.stack.slice(0, 4).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <span className="product-card-detail">
                        View the product
                        <ArrowDownRight
                          aria-hidden="true"
                          size={17}
                          strokeWidth={1.6}
                        />
                      </span>
                    </div>
                  </div>
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
      <SiteFooter locale="en" />
    </>
  );
}
