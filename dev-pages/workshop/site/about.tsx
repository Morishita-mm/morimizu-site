'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element -- Shared with the standalone preview; local optimized artwork. */
import { useLocale } from '../locale';
import { AboutTools } from './about-tools';
import { RoofArrow, RoofBreadcrumbs } from './roof-page-components';
import { LINKEDIN_URL } from '@/lib/social-links';

export function AboutPage() {
  const { en, t } = useLocale();
  const prefix = en ? '/en' : '';
  const interests = [
    { icon: 'projects', name: t('個人開発', 'Personal projects') },
    { icon: 'movies', name: t('映画鑑賞', 'Movies') },
    { icon: 'games', name: t('ゲーム', 'Games') },
    { icon: 'training', name: t('筋トレ', 'Strength training') },
  ];
  return (
    <article className="about-page page-main wrap">
      <RoofBreadcrumbs
        items={[{ label: 'HOME', href: prefix || '/' }, { label: 'ABOUT' }]}
      />
      <header className="page-head">
        <div>
          <p className="eyebrow">03 / ABOUT</p>
          <h1 className="page-title">ABOUT</h1>
          <p className="page-description">
            {t('このサイトをつくっている人。', 'The person behind this site.')}
          </p>
        </div>
      </header>
      <div className="about-intro">
        <img
          className="profile-photo about-avatar"
          src="/roof/profile-morimizu.png"
          width="1254"
          height="1254"
          alt="morimizu"
          decoding="async"
        />
        <div>
          <p className="eyebrow">morimizu</p>
          <h2>
            Mizuki Morishita<span>森下瑞基</span>
          </h2>
          <p>
            {t(
              '個人開発してるエンジニアです。',
              'I’m a software engineer who builds personal projects.',
            )}
            <br />
            {t(
              '最近運動不足なのでランニング始めました。',
              'I recently started running to get moving again.',
            )}
          </p>
        </div>
      </div>
      <div className="about-layout">
        <section
          className="about-section"
          id="interests"
          aria-labelledby="interests-title"
        >
          <h2 id="interests-title">INTERESTS</h2>
          <div>
            <div className="interest-grid">
              {interests.map((item) => (
                <div key={item.icon}>
                  <span className="interest-symbol" aria-hidden="true">
                    <img
                      src={`/roof/about/interest-${item.icon}.svg`}
                      width="40"
                      height="40"
                      alt=""
                      decoding="async"
                    />
                  </span>
                  <h3>{item.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
        <AboutTools />
        <section
          className="about-section"
          id="resume"
          aria-labelledby="about-resume-title"
        >
          <h2 id="about-resume-title">RÉSUMÉ</h2>
          <div>
            <p>
              {t(
                '仕事の内容・使っている技術・これまでの経歴。',
                'My work, skills, and experience.',
              )}
            </p>
            <a className="text-link resume-link" href={`${prefix}/resume`}>
              {t('職務経歴書を見る', 'View résumé')}
              <RoofArrow />
            </a>
          </div>
        </section>
        <section
          className="about-section"
          id="links"
          aria-labelledby="links-title"
        >
          <h2 id="links-title">LINKS</h2>
          <div>
            <ul className="social-list">
              {[
                ['GitHub', 'https://github.com/Morishita-mm'],
                ['Qiita', 'https://qiita.com/morimizu'],
                ['LinkedIn', LINKEDIN_URL],
                ['Email', 'mailto:mzk.tech0711@gmail.com'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a className="text-link" href={href}>
                    {label}
                    <RoofArrow diagonal />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </article>
  );
}
