import { useLocale } from './locale';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export function carouselPosition(
  left: number,
  width: number,
  totalWidth: number,
) {
  return { atStart: left <= 2, atEnd: left + width >= totalWidth - 2 };
}

export function ProjectCarousel({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const track = useRef<HTMLOListElement>(null);
  const [position, setPosition] = useState({ atStart: true, atEnd: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () =>
      setPosition(
        carouselPosition(
          element.scrollLeft,
          element.clientWidth,
          element.scrollWidth,
        ),
      );
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);
  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const cards = element.children;
    const step =
      cards.length > 1
        ? (cards[1] as HTMLElement).offsetLeft -
          (cards[0] as HTMLElement).offsetLeft
        : element.clientWidth;
    element.scrollBy({
      left: step * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }
  return (
    <section
      className="project-carousel"
      aria-label={t('つくったもの', 'Projects')}
      aria-roledescription={t('カルーセル', 'carousel')}
    >
      <ol
        className="project-carousel-track"
        id="home-project-track"
        ref={track}
      >
        {children}
      </ol>
      <div className="carousel-controls">
        <button
          type="button"
          aria-label={t('前のプロジェクトへ', 'Previous project')}
          aria-controls="home-project-track"
          disabled={position.atStart}
          onClick={() => move(-1)}
        >
          ←
        </button>
        <button
          type="button"
          aria-label={t('次のプロジェクトへ', 'Next project')}
          aria-controls="home-project-track"
          disabled={position.atEnd}
          onClick={() => move(1)}
        >
          →
        </button>
      </div>
    </section>
  );
}
