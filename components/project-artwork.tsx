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
      <svg aria-hidden="true" className="product-glyph" viewBox="0 0 120 120">
        <rect height="68" rx="9" width="86" x="17" y="26" />
        <path d="M17 43h86M46 43v51M75 43v51" />
        <circle cx="31" cy="58" r="5" />
        <circle className="product-glyph-accent-fill" cx="60" cy="69" r="6" />
        <path className="product-glyph-accent" d="m84 63 5 5 9-12" />
      </svg>
    );
  }

  if (visual === 'ragy') {
    return (
      <svg aria-hidden="true" className="product-glyph" viewBox="0 0 120 120">
        <path d="M20 35c24 0 24 50 48 50s24-25 32-25" />
        <path className="product-glyph-accent" d="M20 85c24 0 24-50 48-50s24 25 32 25" />
        <circle cx="20" cy="35" r="5" />
        <circle className="product-glyph-accent-fill" cx="20" cy="85" r="5" />
        <circle className="product-glyph-accent-fill" cx="100" cy="60" r="7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="product-glyph" viewBox="0 0 120 120">
      <path className="product-glyph-light" d="M14 37h21c13 0 13 23 25 23M14 60h46M14 83h21c13 0 13-23 25-23" />
      <path className="product-glyph-accent" d="M68 60c13 0 14-25 37-25M68 60h37M68 60c13 0 14 25 37 25" />
      <circle className="product-glyph-light-fill" cx="64" cy="60" r="7" />
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
