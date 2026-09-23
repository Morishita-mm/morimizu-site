'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve full-page route navigation. */
import { useEffect, type ReactNode } from 'react';
import { LocaleProvider, useLocale, type Locale } from '../locale';
import { initializeRoofScene } from '@/components/roof-home/scene.js';
import { initializeScrollReveal } from '@/components/roof/reveal.js';

function Header({ path, preview }: { path: string; preview: boolean }) {
  const { t, en, toggle } = useLocale();
  const active = path.replace(/^\/en(?=\/|$)/, '') || '/';
  return <>
    <a href="#content" className="skip">{t('本文へスキップ', 'Skip to content')}</a>
    <header className="site-header wrap">
      <a className="brand" href="/" aria-label={t('morimizu ホーム', 'morimizu Home')}>morimizu</a>
      <div className="header-actions">
        <nav className="topnav" aria-label={t('メインナビゲーション', 'Main navigation')}>
          <a href="/projects" aria-current={active.startsWith('/projects') ? 'page' : undefined}>WORKS</a>
          <a href="/notes" aria-current={active.startsWith('/notes') || active.startsWith('/journal') ? 'page' : undefined}>NOTES</a>
          <a href="/about" aria-current={active.startsWith('/about') || active.startsWith('/resume') ? 'page' : undefined}>ABOUT</a>
        </nav>
        <button className="language-toggle" type="button" onClick={toggle} lang={en ? 'ja' : 'en'} aria-label={en ? 'JP: 日本語に切り替え' : 'EN: Switch to English'}>{en ? 'JP' : 'EN'}</button>
        <button className="sky-toggle" id="sky-toggle" type="button" role="switch" aria-checked="false" aria-label={t('夜モード', 'Night mode')}>
          <span className="sky-icon sun-icon" aria-hidden="true" />
          <span className="sky-icon moon-icon" aria-hidden="true" />
          <span id="sky-name" className="sr">DAY</span>
          <span id="sky-action" className="sky-tooltip" aria-hidden="true">{t('太陽を沈める', 'Set the sun')}</span>
        </button>
      </div>
      {preview && <span className="preview-note">LOCAL PREVIEW</span>}
    </header>
    <output className="sr" id="time-status" />
  </>;
}
function Footer() {
  const { t } = useLocale();
  return <footer className="site-footer wrap">
    <a href="/" className="brand">morimizu</a>
    <nav className="footer-nav" aria-label={t('フッターナビゲーション', 'Footer navigation')}>
      <a href="/projects">WORKS</a><a href="/notes">NOTES</a><a href="/about">ABOUT</a>
      <a href="/resume" className="resume-link">RÉSUMÉ <i className="icon arrow-up-icon" aria-hidden="true" /></a>
      <a href="/journal/admin" className="footer-admin">{t('記事を管理', 'Journal Studio')}</a>
    </nav>
    <a href="https://github.com/Morishita-mm" className="footer-link"><i className="icon github-icon" aria-hidden="true" />GitHub</a>
  </footer>;
}
function SharedMotion({ path }: { path: string }) {
  const { locale } = useLocale();
  useEffect(() => initializeRoofScene(), [path]);
  useEffect(() => path.includes('/journal/admin') ? undefined : initializeScrollReveal(), [path]);
  useEffect(() => {
    // Native illustration labels follow the React locale without rewriting page text.
    document.documentElement.lang = locale;
    window.dispatchEvent(new Event('morimizu-language'));
  }, [locale]);
  return null;
}
function ShellContent({ path, preview, children }: { path: string; preview: boolean; children: ReactNode }) {
  const { locale } = useLocale();
  return <div className="roof-site" lang={locale}>
    <Header path={path} preview={preview} />
    <main id="content">{children}</main>
    <Footer />
    <SharedMotion path={path} />
  </div>;
}
export function SiteShell({ path, initialLocale = 'ja', preview = false, children }: {
  path: string; initialLocale?: Locale; preview?: boolean; children: ReactNode;
}) {
  return <LocaleProvider initialLocale={initialLocale}>
    <ShellContent path={path} preview={preview}>{children}</ShellContent>
  </LocaleProvider>;
}
