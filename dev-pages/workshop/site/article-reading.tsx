'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocale } from '../locale';
import './roof-notes.css';
type Heading = { id: string; text: string; level: number };
export function ArticleReading({ children }: { children: ReactNode }) {
  const { t, locale } = useLocale();
  const body = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState('');
  const [expanded, setExpanded] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 800px)');
    const sync = () => setExpanded(!media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!body.current) return;
    const translate = (ja: string, en: string) => (locale === 'en' ? en : ja);
    const nodes = [
      ...body.current.querySelectorAll<HTMLElement>(
        '.markdown-body h2, .markdown-body h3, .markdown-body h4',
      ),
    ];
    const used = new Set(
      [...document.querySelectorAll('[id]')].map((node) => node.id),
    );
    nodes.forEach((node, index) => {
      // Keep the first sanitized anchor; duplicate raw HTML IDs need distinct TOC targets.
      if (node.id && document.getElementById(node.id) === node) return;
      let id = `article-section-${index + 1}`;
      while (used.has(id)) id += '-';
      used.add(id);
      node.id = id;
    });
    setHeadings(
      nodes.map((node, index) => ({
        id: node.id,
        text:
          node.textContent?.trim() ||
          [...node.querySelectorAll('img')]
            .map((image) => image.alt)
            .filter(Boolean)
            .join(' ') ||
          `${translate('見出し', 'Section')} ${index + 1}`,
        level: Number(node.tagName.slice(1)),
      })),
    );
    const update = () => {
      const current =
        [...nodes]
          .reverse()
          .find((node) => node.getBoundingClientRect().top <= 120) ?? nodes[0];
      setActive(current?.id ?? '');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    const cleanups: (() => void)[] = [];
    body.current
      .querySelectorAll<HTMLElement>('.markdown-code-block')
      .forEach((block) => {
        const code = block.querySelector('pre code');
        if (!code) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'article-copy-code';
        button.textContent = translate('コピー', 'Copy');
        button.setAttribute(
          'aria-label',
          translate('コードをコピー', 'Copy code'),
        );
        const status = document.createElement('span');
        status.className = 'sr';
        status.setAttribute('role', 'status');
        const copy = async () => {
          status.textContent = '';
          button.textContent = translate('コピー', 'Copy');
          try {
            await navigator.clipboard.writeText(code.textContent ?? '');
            status.textContent = translate('コピーしました', 'Copied');
            button.textContent = translate('コピー済み', 'Copied');
          } catch {
            status.textContent = translate(
              'コピーできませんでした。コードを選択してコピーしてください。',
              'Copy failed. Select and copy the code manually.',
            );
          }
        };
        button.addEventListener('click', copy);
        block.insertBefore(button, block.firstChild);
        block.appendChild(status);
        cleanups.push(() => {
          button.removeEventListener('click', copy);
          button.remove();
          status.remove();
        });
      });
    return () => {
      window.removeEventListener('scroll', update);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [children, locale]);
  return (
    <div
      className={`reading-layout${headings.length ? '' : ' reading-layout-single'}`}
    >
      <div className="article-body" ref={body}>
        {children}
      </div>
      {headings.length > 0 && (
        <aside className="article-aside">
          <details
            className="toc"
            open={expanded}
            onToggle={(event) => setExpanded(event.currentTarget.open)}
          >
            <summary>{t('目次', 'On this page')}</summary>
            <nav aria-label={t('記事の目次', 'Article contents')}>
              <ol className="toc-list">
                {headings.map((heading) => (
                  <li key={heading.id} className={`toc-level-${heading.level}`}>
                    <a
                      href={`#${encodeURIComponent(heading.id)}`}
                      aria-current={active === heading.id ? 'true' : undefined}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        </aside>
      )}
    </div>
  );
}
