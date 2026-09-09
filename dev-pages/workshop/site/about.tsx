'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element -- Shared with the standalone preview; local optimized artwork. */
import {
  Code2,
  Clapperboard,
  Gamepad2,
  Dumbbell,
  Play,
  CircleDot,
  ArrowUpRight,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { useLocale } from '../locale';
import { ShizuokaCard } from './about-shizuoka';
import { AboutTools } from './about-tools';
import { GitHubIcon, LinkedInIcon, QiitaIcon } from '@/components/social-icons';
import { LINKEDIN_URL } from '@/lib/social-links';
import './about-personal.css';

export function AboutPage() {
  const { en, t } = useLocale();
  const interests = [
    {
      Icon: Code2,
      name: t('個人開発', 'Personal projects'),
      copy: t(
        '趣味で個人開発をしています。休日もよくコードを書いています。',
        'I work on personal projects as a hobby, often on my days off.',
      ),
    },
    {
      Icon: Clapperboard,
      name: t('映画鑑賞', 'Movies'),
      copy: t(
        'アクション映画が好きです。ドウェイン・ジョンソンに憧れています。',
        'I like action movies and look up to Dwayne Johnson.',
      ),
    },
    {
      Icon: Gamepad2,
      name: t('ゲーム', 'Games'),
      copy: t(
        '個人開発をしていない休日は、だいたいゲームをしています。',
        'On days off when I’m not working on a project, I’m usually gaming.',
      ),
    },
    {
      Icon: Dumbbell,
      name: t('筋トレ', 'Strength training'),
      copy: t(
        'ハンドボールや筋トレで、身体が成長するのを実感してきました。',
        'Through handball and strength training, I’ve felt myself getting stronger.',
      ),
    },
    {
      Icon: Play,
      name: t('配信を見る', 'Watching streams'),
      copy: t(
        'YouTubeとTwitchでよく配信を見てます。',
        'I often watch streams on YouTube and Twitch.',
      ),
    },
    {
      Icon: CircleDot,
      name: t('パチンコ', 'Pachinko'),
      copy: t('パチンコも好きです。', 'I enjoy pachinko too.'),
    },
  ];
  const values = [
    [
      t('考えを言葉にする', 'Put it into my own words'),
      t(
        '自分が何を考えているのか、言葉で説明できるようにしたいです。',
        'I want to be able to explain what I think in my own words.',
      ),
    ],
    [
      t('興味を持って取り組む', 'Stay curious'),
      t(
        '何かに取り組むときは、自分なりに興味を持つようにしています。',
        'I try to find something that interests me in whatever I’m doing.',
      ),
    ],
    [
      t('好きなものを好きなだけ', 'Make time for what I love'),
      t(
        '好きなことには好きなだけ時間を使いたいです。',
        'I want to spend as much time as I like on the things I enjoy.',
      ),
    ],
    [
      t('効率こそ命', 'Efficiency matters'),
      t(
        'やるなら効率よく進めたいです。',
        'I want to get things done efficiently.',
      ),
    ],
  ];
  return (
    <article className="about-personal shell">
      <header className="about-intro">
        <div className="about-intro-copy">
          <p className="about-kicker">ABOUT / MIZUKI MORISHITA</p>
          <h1>
            {t('こんにちは、', 'Hi there,')}
            <br />
            {t('Mizukiです。', 'I’m Mizuki.')}
          </h1>
          <p className="about-intro-lead">
            {t(
              '個人開発とAIとの議論が好きな',
              'A software engineer who enjoys personal projects',
            )}
            <br className="about-desktop-break" />
            {t(
              'ソフトウェアエンジニアです。',
              ' and discussing ideas with AI.',
            )}
          </p>
          <p className="about-intro-detail">
            {t(
              '休日はだいたいゲームか個人開発をしています。筋トレやパチンコ、配信を見るのも好きです。',
              'I spend most days off gaming or working on personal projects. I also enjoy strength training, pachinko, and watching streams.',
            )}
          </p>
          <a className="about-text-link" href={en ? '/en/resume' : '/resume'}>
            {t('職務経歴はこちら', 'View résumé')}
            <ArrowUpRight size={17} />
          </a>
        </div>
        <ShizuokaCard />
      </header>
      <nav
        className="about-index"
        aria-label={t('このページの目次', 'On this page')}
      >
        <span>{t('自己紹介', 'About me')}</span>
        <a href="#interests">{t('好きなこと', 'Interests')}</a>
        <a href="#values">{t('大切にしていること', 'Values')}</a>
        <a href="#tools">Tools</a>
      </nav>

      <section
        className="about-section"
        id="interests"
        aria-labelledby="interests-title"
      >
        <div className="about-section-heading">
          <p className="about-kicker">01 / OFF THE CLOCK</p>
          <h2 id="interests-title">{t('好きなこと', 'Interests')}</h2>
          <p>
            {t(
              '仕事以外では、こんなことをしています。',
              'What I do outside work.',
            )}
          </p>
        </div>
        <ul className="about-interests">
          {interests.map(({ Icon, name, copy }) => (
            <li key={name}>
              <Icon size={24} aria-hidden="true" />
              <h3>{name}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="about-values"
        id="values"
        aria-labelledby="values-title"
      >
        <div className="about-values-intro">
          <p className="about-kicker">02 / HOW I THINK</p>
          <h2 id="values-title">
            {t('理屈は大事。', 'Reason matters.')}
            <br />
            {t('でも、それだけではない。', 'But it isn’t everything.')}
          </h2>
          <p>
            {t(
              '筋が通っているかは気になります。ただ、理屈だけではうまくいかないことも多いので、そのことは忘れずにいたいです。',
              'I care about whether things make sense. But logic doesn’t settle everything, and I try to keep that in mind.',
            )}
          </p>
          <span className="about-values-line" aria-hidden="true" />
        </div>
        <ol className="about-values-list">
          {values.map(([title, copy], index) => (
            <li key={title}>
              <span aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <AboutTools />

      <section className="about-work" aria-labelledby="work-title">
        <div>
          <p className="about-kicker">THE PROFESSIONAL SIDE</p>
          <h2 id="work-title">{t('仕事と経歴', 'Work and experience')}</h2>
          <p>
            {t(
              '仕事の内容や使っている技術、これまでの経歴は職務経歴書にまとめています。',
              'See my résumé for my work, skills, education, and experience.',
            )}
          </p>
        </div>
        <div className="about-work-links">
          <a
            className="about-primary-link"
            href={en ? '/en/resume' : '/resume'}
          >
            {t('職務経歴書を見る', 'View résumé')}
            <ArrowUpRight size={20} />
          </a>
          <a
            className="about-text-link"
            href={en ? '/en/projects' : '/projects'}
          >
            {t('つくったものを見る', 'Explore my projects')}
            <ArrowRight size={18} />
          </a>
        </div>
      </section>
      <footer className="about-contact">
        <p>{t('各種リンク', 'Find me online')}</p>
        <div>
          <a href="https://github.com/Morishita-mm">
            <GitHubIcon size={17} />
            GitHub
            <ArrowUpRight size={13} />
          </a>
          <a href="https://qiita.com/morimizu">
            <QiitaIcon size={17} />
            Qiita
            <ArrowUpRight size={13} />
          </a>
          <a href={LINKEDIN_URL}>
            <LinkedInIcon size={17} />
            LinkedIn
            <ArrowUpRight size={13} />
          </a>
          <a href="mailto:mzk.tech0711@gmail.com">
            <Mail size={17} />
            Email
            <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
      <details className="about-credits">
        <summary>{t('クレジット', 'Credits')}</summary>
        <p>
          <a href="https://www.gsi.go.jp/kankyochiri/gm_jpn.html">
            {t('地球地図日本（国土地理院）', 'Global Map Japan · GSI')}
          </a>
          {t(
            'を加工して静岡県の図を作成。',
            ', adapted for the Shizuoka illustration.',
          )}
        </p>
      </details>
    </article>
  );
}
