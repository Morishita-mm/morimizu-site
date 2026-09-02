import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, GitFork, PackageOpen } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { ProjectArtwork } from '@/components/project-artwork';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { getProjectEn, projectsEn } from '@/lib/projects-en';
import { LINKEDIN_URL } from '@/lib/social-links';

type ProjectPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projectsEn.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectEn(slug);
  if (!project) return {};

  return {
    title: `${project.name} | Products | morimizu.dev`,
    description: project.summary,
    alternates: {
      canonical: `/en/projects/${project.slug}`,
      languages: {
        'ja-JP': `/projects/${project.slug}`,
        'en-US': `/en/projects/${project.slug}`,
      },
    },
    openGraph: {
      title: `${project.name} | morimizu.dev`,
      description: project.summary,
      locale: 'en_US',
      images: project.image ? [project.image.src] : [],
    },
  };
}

export default async function EnglishProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectEn(slug);
  if (!project) notFound();

  const projectIndex = projectsEn.findIndex(
    (item) => item.slug === project.slug,
  );
  const nextProject = projectsEn[(projectIndex + 1) % projectsEn.length];
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.name,
    description: project.summary,
    codeRepository: project.repositoryUrl,
    programmingLanguage: project.languages,
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      name: 'Mizuki',
      url: 'https://morimizu.dev/en',
      sameAs: [LINKEDIN_URL, 'https://github.com/Morishita-mm'],
    },
  }).replace(/</g, '\\u003c');

  return (
    <>
      <SiteHeader
        active="apps"
        locale="en"
        languageHref={`/projects/${project.slug}`}
      />
      <main className="product-detail-page english-site">
        <article>
          <header className="product-detail-hero page-shell">
            <FullPageLink className="product-detail-back" href="/en/projects">
              <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.7} />
              Back to products
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
                  View on GitHub
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
              The friction,
              <span className="journal-serif">and the answer I built.</span>
            </h2>
            <div className="product-story-columns">
              <div data-reveal="up">
                <span>01 / THE PROBLEM</span>
                <p>{project.challenge}</p>
              </div>
              <div data-reveal="up" data-reveal-delay="70">
                <span>02 / THE APPROACH</span>
                <p>{project.answer}</p>
              </div>
            </div>
          </section>

          <section
            className="product-architecture-section"
            aria-labelledby="architecture-title"
          >
            <div className="page-shell">
              <header className="product-architecture-heading" data-reveal="up">
                <p className="product-section-label">SYSTEM ARCHITECTURE</p>
                <div>
                  <h2 id="architecture-title">How the pieces connect.</h2>
                  <p>
                    A view of the path from input through storage, processing,
                    and presentation.
                  </p>
                </div>
              </header>
              <figure className="product-architecture-figure" data-reveal="up">
                <div className="product-architecture-viewport">
                  <Image
                    src={project.architecture.src}
                    alt={project.architecture.alt}
                    width="1600"
                    height="900"
                    loading="lazy"
                  />
                </div>
                <figcaption>
                  <span>{project.name}</span>
                  <span>Architecture based on the working implementation</span>
                </figcaption>
              </figure>
            </div>
          </section>

          <section
            className="product-flow-section"
            aria-labelledby="flow-title"
          >
            <div className="page-shell">
              <header className="product-flow-heading" data-reveal="up">
                <p>THE WORKFLOW</p>
                <h2 id="flow-title">From input to the next decision.</h2>
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
              <h2 id="decisions-title">Decisions that shaped the system</h2>
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
                <h2 id="status-title">Where it is now</h2>
                <p>{project.now}</p>
              </div>
              <div
                className="product-evidence"
                data-reveal="up"
                data-reveal-delay="60"
              >
                <h3>WORKING EVIDENCE</h3>
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
                <h3>NEXT STEPS</h3>
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
                  View the code on GitHub
                  <ArrowUpRight
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.7}
                  />
                </a>
                <FullPageLink href={`/en/projects/${nextProject.slug}`}>
                  Next product: {nextProject.name}
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
      <SiteFooter locale="en" />
      <script
        dangerouslySetInnerHTML={{ __html: jsonLd }}
        type="application/ld+json"
      />
    </>
  );
}
