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
        <path d="M28 26v48c0 12 10 22 22 22h44" />
        <path className="product-glyph-accent" d="M48 26v32c0 10 8 18 18 18h28" />
        <circle cx="28" cy="26" r="5" />
        <circle cx="28" cy="74" r="5" />
        <circle className="product-glyph-accent-fill" cx="48" cy="26" r="5" />
        <circle className="product-glyph-accent-fill" cx="94" cy="76" r="6" />
        <circle className="product-glyph-light-fill" cx="94" cy="96" r="5" />
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

  if (visual === 'tech-interviewer') {
    return (
      <svg aria-hidden="true" className="product-glyph" viewBox="0 0 48 48" fill="none">
        <path d="M18 15L31 6L42 13V35L31 42L18 33" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path className="product-glyph-accent" d="M18 15L6 24L18 33L29 24L18 15Z" stroke="#0d9488" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
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

function ArchitectureDiagnosticPreview({ locale }: { locale: 'ja' | 'en' }) {
  const isEn = locale === 'en';
  return (
    <>
      <div className="product-terminal-bar">
        <span>architecture-diagnostic / core-report</span>
        <span aria-hidden="true">● ● ●</span>
      </div>
      <div className="product-terminal-body" style={{ textAlign: 'left' }}>
        <p style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginBottom: '8px' }}>
          <span>SCENARIO: IMAGE SNS</span>
          <span style={{ color: '#0d9488', fontWeight: 600 }}>EVIDENCE LOCKED</span>
        </p>
        <dl>
          <div>
            <dt>Functional Coverage</dt>
            <dd style={{ color: '#2dd4bf' }}>ADVANCED</dd>
          </div>
          <div>
            <dt>Trade-off Rationale</dt>
            <dd style={{ color: '#2dd4bf' }}>ADVANCED</dd>
          </div>
          <div>
            <dt>10x Scale Resilience</dt>
            <dd style={{ color: '#38bdf8' }}>COMPETENT</dd>
          </div>
          <div>
            <dt>Failure Partitioning</dt>
            <dd style={{ color: '#38bdf8' }}>COMPETENT</dd>
          </div>
        </dl>
        <p className="product-terminal-sync">
          <span>✓</span> Core Report vNext <em>EVALUATION GENERATED</em>
        </p>
      </div>
      <span className="product-artwork-caption">
        {isEn ? 'Core Report Diagnostic Preview' : 'Core Report 診断結果プレビュー'}
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
          ) : project.visual === 'tech-interviewer' ? (
            <ArchitectureDiagnosticPreview locale={locale} />
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

  if (project.image) {
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

  if (project.visual === 'ragy') {
    return (
      <figure
        className={`product-artwork product-artwork-terminal product-artwork-${project.visual}`}
      >
        <RagyPreview locale={locale} />
      </figure>
    );
  }

  if (project.visual === 'tech-interviewer') {
    return (
      <figure
        className={`product-artwork product-artwork-terminal product-artwork-${project.visual}`}
      >
        <ArchitectureDiagnosticPreview locale={locale} />
      </figure>
    );
  }

  return null;
}
