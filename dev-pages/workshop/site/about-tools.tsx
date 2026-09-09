/* oxlint-disable next/no-img-element -- Local optimized illustration shared with the standalone preview. */
import { useState, type CSSProperties } from 'react';
import {
  Plus,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Terminal,
} from 'lucide-react';
import { useLocale } from '../locale';
import deskLight from '../assets/about-desk-light.webp?url';
import deskDark from '../assets/about-desk-dark.webp?url';

// Scene positions describe generic objects; product data can change independently.
const equipment = [
  {
    id: 'display',
    ja: '開発環境',
    en: 'Development',
    name: 'Neovim',
    detailJa: 'Ghostty + tmux / zsh + Oh My Zsh',
    detailEn: 'Ghostty + tmux / zsh + Oh My Zsh',
    Icon: Terminal,
    x: 22,
    y: 3,
    w: 55,
    h: 51,
  },
  {
    id: 'computer',
    ja: 'PC',
    en: 'Computer',
    name: 'Mac mini M4',
    detailJa: 'デスクトップPC',
    detailEn: 'Desktop computer',
    Icon: Monitor,
    x: 3,
    y: 38,
    w: 17,
    h: 32,
  },
  {
    id: 'keyboard',
    ja: 'キーボード',
    en: 'Keyboard',
    name: 'HHKB Professional',
    detailJa: '墨・無刻印',
    detailEn: 'Charcoal · blank keycaps',
    Icon: Keyboard,
    x: 31,
    y: 64,
    w: 42,
    h: 23,
  },
  {
    id: 'mouse',
    ja: 'マウス',
    en: 'Mouse',
    name: 'MX Master 3S',
    detailJa: 'マウス',
    detailEn: 'Mouse',
    Icon: Mouse,
    x: 77,
    y: 62,
    w: 14,
    h: 17,
  },
  {
    id: 'audio',
    ja: 'イヤホン',
    en: 'Earbuds',
    name: 'Nothing Ear',
    detailJa: 'イヤホン',
    detailEn: 'Earbuds',
    Icon: Headphones,
    x: 79,
    y: 45,
    w: 10,
    h: 11,
  },
];

export function AboutTools() {
  const { t } = useLocale();
  const [active, setActive] = useState('display');
  const [showTip, setShowTip] = useState(false);
  const item = equipment.find((item) => item.id === active)!;
  return (
    <section
      className="about-section about-tools"
      id="tools"
      aria-labelledby="tools-title"
    >
      <div className="about-section-heading">
        <p className="about-kicker">03 / TOOLS</p>
        <h2 id="tools-title">Tools</h2>
        <p>
          {t(
            'デスクの上のものに触れて、使っている道具を見る。',
            'Explore the desk to see what I use.',
          )}
        </p>
      </div>
      <figure className="about-interactive-desk">
        <div className="about-desk-scene">
          {[
            ['light', deskLight],
            ['dark', deskDark],
          ].map(([theme, src]) => (
            <img
              key={theme}
              className={`about-desk-image-${theme}`}
              src={src}
              width="1536"
              height="1024"
              loading="lazy"
              alt={t(
                'ターミナルを映したディスプレイ、PC、キーボード、マウス、イヤホンを置いたデスクのイラスト',
                'An illustrated desk with a terminal display, computer, keyboard, mouse and earbuds',
              )}
            />
          ))}
          {equipment.map(({ id, ja, en, name, x, y, w, h }, index) => (
            <button
              key={id}
              type="button"
              className="about-desk-hotspot"
              data-active={active === id}
              aria-pressed={active === id}
              aria-label={`${t(ja, en)}: ${name}`}
              aria-controls="desk-details"
              style={
                {
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                } as CSSProperties
              }
              onPointerEnter={(event) => {
                setActive(id);
                setShowTip(event.pointerType === 'mouse');
              }}
              onPointerLeave={() => setShowTip(false)}
              onFocus={() => {
                setActive(id);
                setShowTip(true);
              }}
              onBlur={() => setShowTip(false)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setShowTip(false);
              }}
              onClick={() => setActive(id)}
            >
              <span className="about-desk-pin">
                <Plus size={15} aria-hidden="true" />
                <span className="about-pin-number" aria-hidden="true">
                  0{index + 1}
                </span>
              </span>
            </button>
          ))}
          {showTip && (
            <div
              className="about-desk-tooltip"
              aria-hidden="true"
              style={{
                left: `${Math.min(82, Math.max(18, item.x + item.w / 2))}%`,
                top: `${item.y > 60 ? item.y - 12 : item.y + item.h + 2}%`,
              }}
            >
              <strong>{item.name}</strong>
              <span>{t(item.detailJa, item.detailEn)}</span>
            </div>
          )}
          <span className="about-desk-image-note">
            {t('デスクのイメージ', 'Desk illustration')}
          </span>
        </div>
        <figcaption
          className="about-desk-details"
          id="desk-details"
          aria-live="polite"
          aria-atomic="true"
        >
          <div>
            <span>{t(item.ja, item.en)}</span>
            <h3>{item.name}</h3>
          </div>
          {item.detailJa !== item.ja && (
            <p>{t(item.detailJa, item.detailEn)}</p>
          )}
        </figcaption>
      </figure>
      <fieldset
        className="about-desk-selector"
        aria-label={t('道具を選ぶ', 'Select equipment')}
      >
        {equipment.map(({ id, ja, en, Icon }) => (
          <button
            type="button"
            key={id}
            aria-pressed={active === id}
            aria-controls="desk-details"
            onClick={() => setActive(id)}
            onFocus={() => setActive(id)}
          >
            <Icon size={16} aria-hidden="true" />
            {t(ja, en)}
          </button>
        ))}
      </fieldset>
    </section>
  );
}
