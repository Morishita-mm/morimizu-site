/* oxlint-disable next/no-img-element -- Local optimized illustrations shared with the standalone preview. */
import { useLocale } from '../locale';

export function AboutTools() {
  const { t } = useLocale();
  const equipment = [
    {
      id: 'editor',
      label: t('開発環境', 'Development'),
      name: 'Neovim',
      detail: 'Ghostty + tmux / zsh + Oh My Zsh',
    },
    { id: 'mac-mini', label: t('PC', 'Computer'), name: 'Mac mini M4' },
    {
      id: 'keyboard',
      label: t('キーボード', 'Keyboard'),
      name: 'HHKB Professional',
    },
    { id: 'mouse', label: t('マウス', 'Mouse'), name: 'MX Master 3S' },
    { id: 'earbuds', label: t('イヤホン', 'Earbuds'), name: 'Nothing Ear' },
  ];
  return (
    <section className="about-section" id="tools" aria-labelledby="tools-title">
      <h2 id="tools-title">SETUP</h2>
      <div>
        <dl className="tool-list">
          {equipment.map((item) => (
            <div className="tool-item" key={item.id}>
              <dt>{item.label}</dt>
              <dd>
                <figure className="tool-visual" aria-hidden="true">
                  <img
                    src={`/roof/about/setup/${item.id}-v1.png`}
                    width="1254"
                    height="1254"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="tool-copy">
                  <strong>{item.name}</strong>
                  {item.detail && <span>{item.detail}</span>}
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
