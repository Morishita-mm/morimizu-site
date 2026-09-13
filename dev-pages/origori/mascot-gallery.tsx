/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Standalone asset gallery. */
import { useState } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { useLocale } from '../workshop/locale';
import manifest from './assets/mascots/manifest.json';
import './mascot-gallery.css';

const urls = import.meta.glob('./assets/mascots/*.{svg,png,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const labels = {
  standing: ['たつ', 'Standing'],
  sitting: ['すわる', 'Sitting'],
  idea: ['ひらめき', 'An idea'],
  resting: ['ひとやすみ', 'Resting'],
  plane: ['かみひこうき', 'Paper plane'],
  face: ['かお', 'Face'],
  crumpled: ['くしゃくしゃ', 'Crumpled'],
};

export function MascotGallery() {
  const { t } = useLocale();
  const [background, setBackground] = useState('paper');
  return (
    <div className="o-asset-gallery shell">
      <a className="o-text-link" href="/">
        <ArrowLeft size={16} />
        {t('サイトに戻る', 'Back to the site')}
      </a>
      <header className="o-asset-heading">
        <p className="o-eyebrow">ORIGORI / VECTOR ASSETS</p>
        <h1>{t('オリゴリ素材帳', 'Origori asset library')}</h1>
        <p>
          {t('どんな背景にも、どんな大きさにも。', 'Any background. Any size.')}
          <br />
          {t(
            '7種類の基本ポーズのSVGと透過PNG、3種類のGIFです。',
            'Seven base poses as SVGs and transparent PNGs, plus three animated GIFs.',
          )}
        </p>
      </header>
      <fieldset className="o-asset-backgrounds">
        <legend>{t('背景を変えて確認', 'Preview a background')}</legend>
        {[
          ['paper', '紙色', 'Paper'],
          ['ink', '濃紺', 'Ink'],
          ['sage', '緑', 'Sage'],
          ['checker', '透明チェック', 'Checkerboard'],
        ].map(([value, ja, en]) => (
          <button
            key={value}
            type="button"
            aria-pressed={background === value}
            onClick={() => setBackground(value)}
          >
            <i className={`swatch-${value}`} />
            {t(ja, en)}
          </button>
        ))}
      </fieldset>
      <AnimationGallery background={background} />
      <div className="o-asset-grid">
        {Object.entries(manifest).map(([name, asset]) => {
          const src = urls[`./assets/mascots/${asset.svg}`];
          const label = labels[name as keyof typeof labels];
          return (
            <article className="o-asset-card" key={name}>
              <div className="o-asset-stage" data-background={background}>
                <img
                  src={src}
                  width={asset.width}
                  height={asset.height}
                  alt={`オリゴリ・${label[0]}`}
                />
              </div>
              <div className="o-asset-card-heading">
                <h2>{t(label[0], label[1])}</h2>
                <span>{name.toUpperCase()}</span>
              </div>
              <div
                className="o-asset-sizes"
                data-background={background}
                aria-label={t(
                  '24、48、96ピクセルの表示比較',
                  'Size comparison at 24, 48, and 96 pixels',
                )}
              >
                {[24, 48, 96].map((size) => (
                  <figure key={size}>
                    <div style={{ width: size, height: size }}>
                      <img
                        src={src}
                        width={asset.width}
                        height={asset.height}
                        alt=""
                      />
                    </div>
                    <figcaption>{size}px</figcaption>
                  </figure>
                ))}
              </div>
              <div className="o-asset-downloads">
                <a href={src} download={asset.svg}>
                  <Download size={15} />
                  SVG
                </a>
                <a
                  href={urls[`./assets/mascots/${asset.png}`]}
                  download={asset.png}
                >
                  <Download size={15} />
                  PNG{' '}
                  <small>
                    {asset.width} × {asset.height}
                  </small>
                </a>
              </div>
            </article>
          );
        })}
      </div>
      <p className="o-asset-note">
        {t(
          'SVGは画像埋め込みを含まないベクターデータです。折り面を整理して描き起こし、周囲の余白は約1%に揃えています。',
          'The SVGs contain vector geometry with no embedded bitmaps. Paper folds are redrawn for clarity, with roughly 1% padding.',
        )}
      </p>
    </div>
  );
}

function AnimationGallery({ background }: { background: string }) {
  const { t } = useLocale();
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <section className="o-animation-gallery" aria-labelledby="animation-title">
      <h2 id="animation-title">
        {t('動く、オリゴリ。', 'Origori in motion.')}
      </h2>
      <p>
        {t(
          '折って、とばして、歩いて。再生ボタンで動きを確認できます。',
          'Fold, fly, and walk. Press play to preview each loop.',
        )}
      </p>
      <div className="o-animation-grid">
        {[
          [
            'fold-and-fly',
            '紙飛行機になって、ひとっとび。',
            'Fold into a paper plane and fly.',
          ],
          [
            'crumple-and-unfold',
            'くしゃくしゃ。でも、だいじょうぶ。',
            'Crumple up, then unfold again.',
          ],
          [
            'walking',
            'とことこ、いっしょに歩こう。',
            'A little walk together.',
          ],
        ].map(([name, ja, en]) => {
          const filename = `origori-${name}.gif`;
          return (
            <article className="o-animation-card" key={name}>
              <div className="o-animation-stage" data-background={background}>
                <img
                  width="512"
                  height="512"
                  alt={t(ja, en)}
                  src={
                    urls[
                      `./assets/mascots/${playing === name ? filename : name === 'walking' ? 'origori-walking.svg' : 'origori-standing.svg'}`
                    ]
                  }
                />
              </div>
              <h3>{t(ja, en)}</h3>
              <div className="o-animation-controls">
                <button
                  type="button"
                  aria-pressed={playing === name}
                  onClick={() => setPlaying(playing === name ? null : name)}
                >
                  {playing === name ? t('停止', 'Stop') : t('再生', 'Play')}
                </button>
                <a
                  href={urls[`./assets/mascots/${filename}`]}
                  download={filename}
                >
                  <Download size={15} /> GIF · 512px
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
