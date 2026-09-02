import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, GitFork, PackageOpen } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { ProjectArtwork } from '@/components/project-artwork';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { getProject, projects } from '@/lib/projects';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return {};

  return {
    title: `${project.name} | つくったもの | morimizu.dev`,
    description: project.summary,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title: `${project.name} | morimizu.dev`,
      description: project.summary,
      images: ['/og.png'],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(projectIndex + 1) % projects.length];
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.name,
    description: project.summary,
    codeRepository: project.repositoryUrl,
    programmingLanguage: project.languages,
    author: {
      '@type': 'Person',
      name: 'Mizuki',
      url: 'https://morimizu.dev',
    },
  }).replace(/</g, '\\u003c');

  return (
    <>
      <SiteHeader active="apps" />
      <main className="product-detail-page">
        <article>
          <header className="product-detail-hero page-shell">
            <FullPageLink className="product-detail-back" href="/projects">
              <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.7} />
              つくったものへ戻る
            </FullPageLink>

            <div className="product-detail-heading" data-reveal="up">
              <p className="product-detail-meta">
                <span>{project.number}</span>
                <span>{project.category}</span>
                <span className="product-status">
                  <i aria-hidden="true" />
                  {project.status}
                </span>
              </p>
              <h1>{project.name}</h1>
              <p className="product-detail-tagline">{project.tagline}</p>
            </div>

            <div
              className="product-detail-summary"
              data-reveal="up"
              data-reveal-delay="60"
            >
              <p>{project.summary}</p>
              <div className="product-detail-actions">
                {project.primaryLink ? (
                  <a
                    href={project.primaryLink.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <PackageOpen
                      aria-hidden="true"
                      size={15}
                      strokeWidth={1.6}
                    />
                    {project.primaryLink.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      size={14}
                      strokeWidth={1.7}
                    />
                  </a>
                ) : null}
                <a
                  href={project.repositoryUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <GitFork aria-hidden="true" size={14} strokeWidth={1.6} />
                  GitHubで見る
                  <ArrowUpRight
                    aria-hidden="true"
                    size={14}
                    strokeWidth={1.7}
                  />
                </a>
              </div>
            </div>

            <dl
              className="product-detail-facts"
              data-reveal="up"
              data-reveal-delay="100"
            >
              {project.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div data-reveal="up" data-reveal-delay="140">
              <ProjectArtwork project={project} />
            </div>
          </header>

          <section
            className="product-story page-shell"
            aria-labelledby="story-title"
          >
            <p className="product-section-label">WHY / HOW</p>
            <h2 id="story-title" data-reveal="up">
              不便だったことと、
              <span className="journal-serif">つくった答え。</span>
            </h2>
            <div className="product-story-columns">
              <div data-reveal="up">
                <span>01 / 気になっていたこと</span>
                <p>{project.challenge}</p>
              </div>
              <div data-reveal="up" data-reveal-delay="70">
                <span>02 / こうしてみた</span>
                <p>{project.answer}</p>
              </div>
            </div>
          </section>

          <section
            className="product-flow-section"
            aria-labelledby="flow-title"
          >
            <div className="page-shell">
              <header className="product-flow-heading" data-reveal="up">
                <p>使うときの流れ</p>
                <h2 id="flow-title">入力から、次の判断まで。</h2>
              </header>
              <ol className="product-flow-list" data-reveal="up">
                {project.flow.map((step, index) => (
                  <li key={step.label}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <small>{step.label}</small>
                    <strong>{step.title}</strong>
                    <p>{step.detail}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section
            className="product-decisions page-shell"
            aria-labelledby="decisions-title"
          >
            <header data-reveal="up">
              <p className="product-section-label">DESIGN DECISIONS</p>
              <h2 id="decisions-title">作るときに決めたこと</h2>
            </header>
            <ol>
              {project.decisions.map((decision, index) => (
                <li
                  data-reveal="up"
                  data-reveal-delay={String(index * 55)}
                  key={decision.title}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{decision.title}</h3>
                    <p>{decision.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="product-status-section"
            aria-labelledby="status-title"
          >
            <div className="page-shell product-status-grid">
              <div data-reveal="up">
                <p className="product-section-label">CURRENT STATUS</p>
                <h2 id="status-title">いまの状態</h2>
                <p>{project.now}</p>
              </div>

              <div
                className="product-evidence"
                data-reveal="up"
                data-reveal-delay="60"
              >
                <h3>確認できること</h3>
                <ul>
                  {project.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div
                className="product-next"
                data-reveal="up"
                data-reveal-delay="100"
              >
                <h3>次に整えること</h3>
                <ul>
                  {project.next.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="product-detail-bottom-links">
                <a
                  href={project.repositoryUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHubでコードを見る
                  <ArrowUpRight
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.7}
                  />
                </a>
                <FullPageLink href={`/projects/${nextProject.slug}`}>
                  次のプロダクト：{nextProject.name}
                  <ArrowUpRight
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.7}
                  />
                </FullPageLink>
              </div>
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
      <script
        dangerouslySetInnerHTML={{ __html: jsonLd }}
        type="application/ld+json"
      />
    </>
  );
}
