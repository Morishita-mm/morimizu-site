import { ChevronDown, Mail, MapPin } from 'lucide-react';
import type { PosterResumeData } from '@/lib/resume';
import { MizuGlyph } from '@/components/mizu-glyph';
import { PrintButton } from '@/components/print-button';
import { GitHubIcon, LinkedInIcon, QiitaIcon } from '@/components/social-icons';
import { TechIcon } from '@/components/tech-icons';

function getContactIcon(label: string) {
  switch (label.toUpperCase()) {
    case 'EMAIL':
      return <Mail size={12} />;
    case 'GITHUB':
      return <GitHubIcon size={12} />;
    case 'WEBSITE':
      return <MizuGlyph size={12} />;
    case 'LINKEDIN':
      return <LinkedInIcon size={12} />;
    case 'QIITA':
      return <QiitaIcon size={12} />;
    case 'LOCATION':
      return <MapPin size={12} />;
    default:
      return null;
  }
}

export function PosterResumeView({
  data,
  locale = 'ja',
}: {
  data: PosterResumeData;
  locale?: 'ja' | 'en';
}) {
  const isEn = locale === 'en';

  return (
    <div className="poster-page-wrapper poster-page-wide">
      <div className="poster-toolbar">
        <PrintButton locale={locale} />
      </div>

      <article
        aria-label={isEn ? 'Developer Resume' : '職務経歴書'}
        className="poster-resume"
      >
        {/* Left Column: Site Glyph + 01 CONTACTS */}
        <aside className="poster-sidebar">
          <div aria-hidden="true" className="poster-graphic-container">
            <MizuGlyph className="poster-brand-glyph" />
          </div>

          <section className="poster-section">
            <header className="poster-section-header">
              <h2 className="poster-section-title">CONTACTS</h2>
              <span className="poster-section-num">01</span>
            </header>
            <ul className="poster-contacts-list">
              {data.contacts.map((contact) => (
                <li className="poster-contact-item" key={contact.label}>
                  <span className="poster-contact-label">
                    <span aria-hidden="true" className="poster-contact-icon">
                      {getContactIcon(contact.label)}
                    </span>
                    <span>{contact.label}</span>
                  </span>
                  <span className="poster-contact-value">
                    {contact.href ? (
                      <a href={contact.href} rel="noreferrer" target="_blank">
                        {contact.value}
                      </a>
                    ) : (
                      contact.value
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Right Main Area: Header + 2-Column Grid (EXPERIENCE/EDUCATION & SKILLS/LANGUAGES) */}
        <div className="poster-main">
          <header className="poster-header">
            <h1>{data.heading}</h1>
            {data.summary ? (
              <p className="poster-summary">{data.summary}</p>
            ) : null}
          </header>

          <div className="poster-content-grid">
            {/* Left Sub-column: 02 EXPERIENCE -> 03 EDUCATION */}
            <div className="poster-column">
              <section className="poster-section">
                <header className="poster-section-header">
                  <h2 className="poster-section-title">EXPERIENCE</h2>
                  <span className="poster-section-num">02</span>
                </header>

                <div className="poster-timeline">
                  {data.experiences.map((exp, idx) => (
                    <details
                      className="poster-timeline-node"
                      key={exp.period + exp.company}
                      open={idx === 0}
                    >
                      <summary
                        aria-label={`${exp.period} ${exp.company} - ${exp.role}`}
                        className="poster-timeline-summary"
                      >
                        <span
                          aria-hidden="true"
                          className="poster-timeline-bullet"
                        />
                        <div className="poster-timeline-summary-content">
                          <div className="poster-timeline-header-row">
                            <span className="poster-entry-period">
                              {exp.period}
                            </span>
                            <span
                              aria-hidden="true"
                              className="poster-timeline-toggle-icon"
                            >
                              <ChevronDown size={14} />
                            </span>
                          </div>
                          <h3 className="poster-entry-title">{exp.company}</h3>
                          <p className="poster-entry-role">{exp.role}</p>
                        </div>
                      </summary>
                      <div className="poster-timeline-details">
                        <ul className="poster-entry-desc-list">
                          {exp.description.map((line, lIdx) => (
                            <li key={lIdx}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              <section className="poster-section">
                <header className="poster-section-header">
                  <h2 className="poster-section-title">EDUCATION</h2>
                  <span className="poster-section-num">03</span>
                </header>
                <div className="poster-education-list">
                  {data.educations.map((edu) => (
                    <article
                      className="poster-experience-item"
                      key={edu.period + edu.institution}
                    >
                      <span className="poster-entry-period">{edu.period}</span>
                      <h3 className="poster-entry-title">{edu.institution}</h3>
                      <p className="poster-entry-desc">{edu.degree}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sub-column: 04 SKILLS -> 05 LANGUAGES */}
            <div className="poster-column">
              <section className="poster-section">
                <header className="poster-section-header">
                  <h2 className="poster-section-title">SKILLS</h2>
                  <span className="poster-section-num">04</span>
                </header>
                <div className="poster-skills-grid">
                  {data.skills.map((skill) => (
                    <div className="poster-skill-item" key={skill}>
                      <TechIcon
                        className="poster-skill-icon"
                        name={skill}
                        size={15}
                      />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="poster-section">
                <header className="poster-section-header">
                  <h2 className="poster-section-title">LANGUAGES</h2>
                  <span className="poster-section-num">05</span>
                </header>
                <div className="poster-languages-list">
                  {data.languages.map((lang) => (
                    <div className="poster-language-item" key={lang.language}>
                      <span className="poster-language-name">
                        {lang.language}
                      </span>
                      <span className="poster-language-level">
                        {lang.level}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
