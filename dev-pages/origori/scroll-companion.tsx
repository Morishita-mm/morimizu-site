import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLocale } from '../workshop/locale';
import { useReducedMotion } from './origori-motion';
import { walkingFrame } from './walking-geometry.mjs';
import './scroll-companion.css';

type WalkState = {
  progress: number;
  phase: number;
  amount: number;
  direction: 1 | -1;
  resting: boolean;
};
const initial: WalkState = {
  progress: 0,
  phase: 0,
  amount: 0,
  direction: 1,
  resting: true,
};

export function ScrollCompanion() {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(
    () => localStorage.getItem('origori-walk-paused') === 'true',
  );
  const [walk, setWalk] = useState(initial);
  const live = useRef(initial);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    let previousY = scrollY;
    let request = 0;
    let settleRequest = 0;
    let stop: ReturnType<typeof setTimeout> | undefined;
    let rest: ReturnType<typeof setTimeout> | undefined;
    const commit = (next: WalkState) => {
      live.current = next;
      setWalk(next);
    };
    const progress = () =>
      Math.max(
        0,
        Math.min(
          1,
          scrollY /
            Math.max(1, document.documentElement.scrollHeight - innerHeight),
        ),
      );
    const clear = () => {
      cancelAnimationFrame(request);
      cancelAnimationFrame(settleRequest);
      clearTimeout(stop);
      clearTimeout(rest);
      request = 0;
    };
    const settle = () => {
      const start = performance.now();
      const amount = live.current.amount;
      const draw = (now: number) => {
        const fraction = Math.min(1, (now - start) / 220);
        commit({ ...live.current, amount: amount * (1 - fraction) });
        if (fraction < 1) settleRequest = requestAnimationFrame(draw);
      };
      settleRequest = requestAnimationFrame(draw);
      rest = setTimeout(() => commit({ ...live.current, resting: true }), 1400);
    };
    const update = () => {
      request = 0;
      const delta = scrollY - previousY;
      previousY = scrollY;
      const nextProgress = progress();
      if (paused || document.hidden) return;
      if (Math.abs(delta) < 0.5) {
        commit({ ...live.current, progress: nextProgress });
        return;
      }
      cancelAnimationFrame(settleRequest);
      clearTimeout(stop);
      clearTimeout(rest);
      const trackWidth = track.current?.clientWidth ?? 1;
      commit({
        progress: nextProgress,
        phase:
          (live.current.phase +
            ((Math.abs(nextProgress - live.current.progress) * trackWidth) /
              18) *
              Math.PI *
              2) %
          (Math.PI * 2),
        amount: 1,
        direction: delta > 0 ? 1 : -1,
        resting: false,
      });
      stop = setTimeout(settle, 180);
    };
    const scroll = () => {
      if (!request) request = requestAnimationFrame(update);
    };
    const resize = () => {
      previousY = scrollY;
      commit({ ...live.current, progress: progress() });
    };
    const visibility = () => {
      clear();
      previousY = scrollY;
      commit({
        ...live.current,
        progress: progress(),
        amount: 0,
        resting: true,
      });
    };
    commit({ ...live.current, progress: progress(), amount: 0, resting: true });
    const observer = new ResizeObserver(resize);
    observer.observe(document.documentElement);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pageshow', visibility);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clear();
      observer.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pageshow', visibility);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [paused, reduced]);

  if (reduced) return null;
  const finished = walk.progress > 0.985;
  const status = paused
    ? 'paused'
    : walk.amount > 0.01
      ? 'walking'
      : walk.resting
        ? 'resting'
        : 'standing';
  const facets = walkingFrame(walk.phase, walk.amount, walk.resting || paused);
  return (
    <>
      <div className="o-scroll-space" aria-hidden="true" />
      <aside
        className="o-scroll-companion"
        data-state={status}
        data-direction={walk.direction}
        data-finished={finished}
        aria-label={t('オリゴリのおさんぽ', 'Origori’s little walk')}
      >
        <div className="o-walk-track" aria-hidden="true" ref={track}>
          <div
            className="o-walk-trail"
            style={{ width: `${walk.progress * 100}%` }}
          />
          <div
            className="o-walker-position"
            style={{ left: `${walk.progress * 100}%` }}
          >
            <svg
              className="o-walker"
              viewBox="0 0 256 256"
              style={{ transform: `scaleX(${walk.direction})` }}
            >
              {facets.map((facet, index) => (
                <polygon
                  key={index}
                  fill={`rgb(${facet.color.join(',')})`}
                  points={facet.points
                    .map((point) => point.map((n) => n.toFixed(2)).join(','))
                    .join(' ')}
                />
              ))}
            </svg>
            {finished && <span className="o-walk-spark">✧</span>}
          </div>
        </div>
        <p className="o-walk-caption" aria-hidden="true">
          {paused
            ? t('また、歩きたくなったら。', 'We can walk again anytime.')
            : finished
              ? t('さいごまで、ありがとう。', 'Thanks for coming all this way.')
              : status === 'walking'
                ? walk.direction > 0
                  ? t('とことこ、つぎの発見へ。', 'On to the next discovery.')
                  : t(
                      '気になるところ、もういちど。',
                      'Let’s take another look.',
                    )
                : t('ここで、ひとやすみ。', 'A little rest, right here.')}
        </p>
        <button
          type="button"
          className="o-walk-toggle"
          aria-pressed={paused}
          aria-label={t(
            paused ? 'オリゴリとまた歩く' : 'オリゴリのおさんぽを休む',
            paused ? 'Walk with Origori again' : 'Pause Origori’s walk',
          )}
          onClick={() => {
            localStorage.setItem('origori-walk-paused', String(!paused));
            setPaused(!paused);
          }}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          {paused ? t('また歩く', 'Walk') : t('おやすみ', 'Rest')}
        </button>
      </aside>
    </>
  );
}
