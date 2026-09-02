import Image from 'next/image';
import type { Project } from '@/lib/projects';

type ProjectArtworkProps = {
  compact?: boolean;
  project: Project;
};

export function ProjectArtwork({
  compact = false,
  project,
}: ProjectArtworkProps) {
  if (project.visual === 'ragy') {
    return (
      <figure
        className={`product-artwork product-artwork-terminal product-artwork-${project.visual}${compact ? ' is-compact' : ''}`}
      >
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
        <figcaption className="product-artwork-caption">
          実装しているCLIの出力例
        </figcaption>
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
        sizes={compact ? '(max-width: 760px) 100vw, 50vw' : '100vw'}
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
