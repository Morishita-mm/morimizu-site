'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element -- Shared with the standalone preview. */
import { useEffect, useRef } from 'react';
import { useLocale } from '../locale';
import { RoofArrow, RoofBreadcrumbs } from './roof-page-components';
import type { PosterResumeData } from '@/lib/resume';
import type { Localized } from './types';
import './roof-resume.css';

type ResumeEntryState = { entry: HTMLDetailsElement; open: boolean };

export function ResumePage({
  resume,
}: {
  resume: Localized<PosterResumeData>;
}) {
  const { en, t } = useLocale();
  const prefix = en ? '/en' : '';
  const data = resume[en ? 'en' : 'ja'];
  const content = useRef<HTMLElement>(null);
  const originalStates = useRef<ResumeEntryState[] | null>(null);
  const orientationStyle = useRef<HTMLStyleElement | null>(null);
  function preparePrint() {
    if (originalStates.current !== null) return;
    originalStates.current = Array.from(
      content.current?.querySelectorAll<HTMLDetailsElement>(
        '.resume-experience',
      ) ?? [],
    ).map((entry) => ({ entry, open: entry.open }));
    for (const { entry } of originalStates.current) entry.open = true;
  }
  function restorePrint() {
    if (originalStates.current !== null) {
      for (const { entry, open } of originalStates.current) entry.open = open;
      originalStates.current = null;
    }
    orientationStyle.current?.remove();
    orientationStyle.current = null;
  }
  useEffect(() => {
    window.addEventListener('beforeprint', preparePrint);
    window.addEventListener('afterprint', restorePrint);
    return () => {
      window.removeEventListener('beforeprint', preparePrint);
      window.removeEventListener('afterprint', restorePrint);
      restorePrint();
    };
  }, []);
  function print(orientation: 'portrait' | 'landscape') {
    orientationStyle.current?.remove();
    const style = document.createElement('style');
    style.id = 'resume-print-orientation';
    style.textContent = `@page { size: A4 ${orientation}; margin: 12mm 13mm; }`;
    document.head.appendChild(style);
    orientationStyle.current = style;
    try {
      window.print();
    } catch (error) {
      restorePrint();
      throw error;
    }
  }
  return (
    <div className="resume-page page-main wrap">
      <RoofBreadcrumbs
        items={[
          { label: 'HOME', href: prefix || '/' },
          { label: 'ABOUT', href: `${prefix}/about` },
          { label: 'RÉSUMÉ' },
        ]}
      />
      <header className="page-head resume-page-head">
        <div>
          <p className="eyebrow">04 / RÉSUMÉ</p>
          <h1 className="page-title">RÉSUMÉ</h1>
          <p className="page-description">
            {t(
              'これまでの仕事と、使っている技術。',
              'My experience and the technologies I work with.',
            )}
          </p>
        </div>
        <fieldset
          className="resume-print-controls"
          aria-label={t('職務経歴書の印刷', 'Print résumé')}
        >
          {(['portrait', 'landscape'] as const).map((orientation) => (
            <button
              key={orientation}
              type="button"
              className="resume-print-button"
              data-print-orientation={orientation}
              aria-label={
                orientation === 'portrait'
                  ? t(
                      '職務経歴書をA4縦向きで印刷またはPDF保存',
                      'Print or save résumé as A4 portrait PDF',
                    )
                  : t(
                      '職務経歴書をA4横向きで印刷またはPDF保存',
                      'Print or save résumé as A4 landscape PDF',
                    )
              }
              onClick={() => print(orientation)}
            >
              <i className="icon resume-print-icon" aria-hidden="true" />
              <span>
                {orientation === 'portrait'
                  ? t('A4縦で印刷', 'Print A4 portrait')
                  : t('A4横で印刷', 'Print A4 landscape')}
              </span>
            </button>
          ))}
        </fieldset>
      </header>
      <article
        className="resume-content"
        aria-label={t('職務経歴書', 'Résumé')}
        ref={content}
      >
        <header className="resume-intro">
          <img
            className="profile-photo resume-avatar"
            src="/roof/profile-morimizu.png"
            width="1254"
            height="1254"
            alt="morimizu"
            decoding="async"
          />
          <div className="resume-intro-copy">
            <h2>{data.name}</h2>
            <p className="resume-profession">{data.role}</p>
            <p className="resume-summary">{data.summary}</p>
          </div>
        </header>
        <section
          className="resume-section"
          id="resume-experience"
          aria-labelledby="resume-experience-title"
        >
          <h2 id="resume-experience-title">EXPERIENCE</h2>
          <div className="resume-section-content">
            {data.experiences.map((entry, index) => (
              <details
                className="resume-experience"
                key={index}
                open={index === 0}
              >
                <summary className="resume-experience-summary">
                  <span className="resume-period">{entry.period}</span>
                  <span className="resume-disclosure" aria-hidden="true">
                    <RoofArrow />
                  </span>
                  <h3>{entry.company}</h3>
                  <p className="resume-role">{entry.role}</p>
                </summary>
                <div className="resume-entry-details">
                  <ul>
                    {entry.description.map((description) => (
                      <li key={description}>{description}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section
          className="resume-section"
          id="resume-skills"
          aria-labelledby="resume-skills-title"
        >
          <h2 id="resume-skills-title">SKILLS</h2>
          <div className="resume-section-content">
            <ul className="resume-skills">
              {data.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </section>
        <section
          className="resume-section"
          id="resume-education"
          aria-labelledby="resume-education-title"
        >
          <h2 id="resume-education-title">EDUCATION</h2>
          <div className="resume-section-content">
            <div className="resume-education">
              {data.educations.map((entry) => (
                <article key={entry.period}>
                  <p className="resume-period">{entry.period}</p>
                  <h3>{entry.institution}</h3>
                  <p>{entry.degree}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className="resume-section"
          id="resume-languages"
          aria-labelledby="resume-languages-title"
        >
          <h2 id="resume-languages-title">LANGUAGES</h2>
          <div className="resume-section-content">
            <dl className="resume-languages">
              {data.languages.map((entry) => (
                <div key={entry.language}>
                  <dt>{entry.language}</dt>
                  <dd>{entry.level}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section
          className="resume-section"
          id="resume-contacts"
          aria-labelledby="resume-contacts-title"
        >
          <h2 id="resume-contacts-title">CONTACTS</h2>
          <div className="resume-section-content">
            <dl className="resume-contacts">
              {data.contacts.map((entry) => (
                <div key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>
                    {entry.href ? (
                      <a href={entry.href}>{entry.value}</a>
                    ) : (
                      entry.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </article>
      <div className="page-return resume-return">
        <a className="text-link" href={`${prefix}/about`}>
          {t('自己紹介へ戻る', 'Back to About')}
          <RoofArrow />
        </a>
      </div>
    </div>
  );
}
