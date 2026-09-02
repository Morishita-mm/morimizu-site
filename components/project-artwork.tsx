'use client';

import Image from 'next/image';
import { Eye, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '@/lib/projects';

type ProjectArtworkProps = {
  compact?: boolean;
  locale?: 'ja' | 'en';
  project: Project;
};

function ProjectGlyph({ visual }: Pick<Project, 'visual'>) {
  if (visual === 'lissue') {
    return (
      <svg aria-hidden="true" className="product-glyph" viewBox="0 0 112 112">
        <path d="M26 27h44a8 8 0 0 1 8 8v48H34a8 8 0 0 1-8-8V27Z" />
        <path className="product-glyph-accent" d="m48 55 8 8 20-22" />
        <path d="M42 76h22" />
        <circle className="product-glyph-dot" cx="84" cy="28" r="7" />
      </svg>
    );
  }

  if (visual === 'ragy') {
    return (
      <svg aria-hidden="true" className="product-glyph" viewBox="0 0 112 112">
        <path d="M56 22 86 39v34L56 90 26 73V39L56 22Z" />
        <path className="product-glyph-accent" d="M39 65 56 48l17 17" />
        <circle className="product-glyph-dot" cx="56" cy="43" r="7" />
        <circle cx="38" cy="70" r="5" />
        <circle cx="74" cy="70" r="5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="product-glyph" viewBox="0 0 112 112">
      <path d="M22 30h68v52H22z" />
      <path d="m31 63 10-14 10 21 11-30 9 23 10-9" />
      <path className="product-glyph-accent" d="M31 74h50" />
      <circle className="product-glyph-dot" cx="84" cy="28" r="7" />
    </svg>
  );
}

function RagyPreview({ locale }: { locale: 'ja' | 'en' }) {
  return (
    <>
      <div className="product-terminal-bar">
        <span>ragy / project dashboard</span>
        <span aria-hidden="true">● ● ●</span>
      </div>
      <div className="product-terminal-body">
        <p>
          <span>$</span> ragy status --docs
        </p>
        <dl>
          <div>
            <dt>Ollama</dt>
            <dd>RUNNING</dd>
          </div>
          <div>
            <dt>Redis</dt>
            <dd>RUNNING</dd>
          </div>
          <div>
            <dt>Dify Gateway</dt>
            <dd>RUNNING</dd>
          </div>
          <div>
            <dt>Sync Watchdog</dt>
            <dd>RUNNING</dd>
          </div>
        </dl>
        <p className="product-terminal-sync">
          <span>✓</span> docs/Lissue/README.md <em>SYNCED</em>
        </p>
      </div>
      <span className="product-artwork-caption">
        {locale === 'en' ? 'Example CLI output' : '実装しているCLIの出力例'}
      </span>
    </>
  );
}

export function ProjectArtwork({
  compact = false,
  locale = 'ja',
  project,
}: ProjectArtworkProps) {
  const [previewVisible, setPreviewVisible] = useState(false);

  if (compact) {
    const previewLabel =
      locale === 'en'
        ? previewVisible
          ? `Show ${project.name} icon`
          : `Show ${project.name} preview`
        : previewVisible
          ? `${project.name}のアイコンを表示`
          : `${project.name}の画面を表示`;

    return (
      <figure
        className={`product-artwork product-artwork-switcher product-artwork-${project.visual}${previewVisible ? ' is-preview-visible' : ''}`}
      >
        <div className="product-artwork-icon-state">
          <ProjectGlyph visual={project.visual} />
          <span>{project.shortName}</span>
        </div>
        <div aria-hidden="true" className="product-artwork-preview-state">
          {project.visual === 'ragy' ? (
            <RagyPreview locale={locale} />
          ) : project.image ? (
            <>
              <Image
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
                src={project.image.src}
                style={{ objectFit: 'contain' }}
                unoptimized
              />
              <span className="product-artwork-caption">
                {project.image.caption}
              </span>
            </>
          ) : null}
        </div>
        <button
          aria-label={previewLabel}
          aria-pressed={previewVisible}
          className="product-artwork-toggle"
          onClick={() => setPreviewVisible((visible) => !visible)}
          type="button"
        >
          {previewVisible ? (
            <RotateCcw aria-hidden="true" size={14} strokeWidth={1.7} />
          ) : (
            <Eye aria-hidden="true" size={14} strokeWidth={1.7} />
          )}
          <span>
            {locale === 'en'
              ? previewVisible
                ? 'Icon'
                : 'Preview'
              : previewVisible
                ? 'アイコン'
                : '画面を見る'}
          </span>
        </button>
      </figure>
    );
  }

  if (project.visual === 'ragy') {
    return (
      <figure
        className={`product-artwork product-artwork-terminal product-artwork-${project.visual}`}
      >
        <RagyPreview locale={locale} />
      </figure>
    );
  }

  if (!project.image) return null;

  return (
    <figure
      className={`product-artwork product-artwork-image product-artwork-${project.visual}${compact ? ' is-compact' : ''}`}
    >
      <Image
        alt={project.image.alt}
        fill
        sizes="100vw"
        src={project.image.src}
        style={{ objectFit: 'contain' }}
        unoptimized
      />
      <figcaption className="product-artwork-caption">
        {project.image.caption}
      </figcaption>
    </figure>
  );
}
