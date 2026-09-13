/* oxlint-disable next/no-img-element -- Standalone SVG assets in the local preview. */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLocale } from '../workshop/locale';
import manifest from './assets/mascots/manifest.json';
import geometry from './assets/mascots/motion-data.json';
import {
  foldFrame,
  orientPlane,
  planeRotation,
  FLIGHT_PLANE_SCALE,
} from './motion-geometry.mjs';
import './motion.css';

export type Pose = keyof typeof manifest;
type Facet = { points: number[][]; color: number[] };
const urls = import.meta.glob('./assets/mascots/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
export const poseUrl = (pose: Pose) =>
  urls[`./assets/mascots/${manifest[pose].svg}`];

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return reduced;
}

export function Origori({
  pose = 'sitting',
  className = '',
}: {
  pose?: Pose;
  className?: string;
}) {
  const { width, height } = manifest[pose];
  return (
    <span className={`o-mascot ${className}`} aria-hidden="true">
      <img src={poseUrl(pose)} alt="" width={width} height={height} />
    </span>
  );
}

export function AnimatedOrigori({
  pose,
  className = '',
  duration = 480,
  flightHeading,
}: {
  pose: Pose;
  className?: string;
  duration?: number;
  flightHeading?: number;
}) {
  const reduced = useReducedMotion();
  const heading = pose === 'plane' ? flightHeading : undefined;
  const frameKey = `${pose}:${heading}`;
  const previous = useRef(frameKey);
  const liveFrame = useRef<Facet[]>(
    heading === undefined
      ? geometry[pose]
      : orientPlane(geometry[pose], heading),
  );
  const [frame, setFrame] = useState<Facet[] | null>(null);
  useLayoutEffect(() => {
    const to =
      heading === undefined
        ? geometry[pose]
        : orientPlane(geometry[pose], heading);
    if (reduced || previous.current === frameKey) {
      liveFrame.current = to;
      setFrame(null);
      previous.current = frameKey;
      return;
    }
    previous.current = frameKey;
    // Continue from the visible facets when a click interrupts an unfolding.
    const from = liveFrame.current;
    setFrame(from);
    const start = performance.now();
    let request = 0;
    const draw = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = foldFrame(from, to, progress);
      liveFrame.current = progress === 1 ? to : next;
      setFrame(progress === 1 ? null : next);
      if (progress < 1) request = requestAnimationFrame(draw);
    };
    request = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(request);
  }, [pose, reduced, duration, heading, frameKey]);
  return (
    <span
      className={`o-animated ${className}`}
      data-pose={pose}
      data-folding={frame ? 'true' : 'false'}
      aria-hidden="true"
    >
      {frame ? (
        <svg viewBox="0 0 256 256">
          {frame.map((facet, index) => (
            <polygon
              key={index}
              fill={`rgb(${facet.color.join(',')})`}
              points={facet.points
                .map((point) => point.map((n) => n.toFixed(2)).join(','))
                .join(' ')}
            />
          ))}
        </svg>
      ) : (
        <img
          className="o-hero-image"
          src={poseUrl(pose)}
          alt=""
          width="256"
          height="256"
          style={
            heading === undefined
              ? undefined
              : {
                  transform: `rotate(${heading}deg) scale(${FLIGHT_PLANE_SCALE})`,
                }
          }
        />
      )}
    </span>
  );
}

const messages: Record<Pose, [string, string]> = {
  standing: ['きょうも、こつこつ。', 'One small fold at a time.'],
  sitting: ['ちょこんと、おともします。', 'I’ll keep you company.'],
  idea: ['あ、ひらめいた！', 'Oh, an idea!'],
  resting: ['ひと息ついたら、また。', 'A little break is good.'],
  crumpled: [
    'わ、くしゃくしゃ。ちょっと待ってね。',
    'Oh, crumpled! Give me a moment.',
  ],
  plane: ['どこへでも、ひとっとび。', 'Ready to take flight.'],
  face: ['こんにちは。', 'Hello there.'],
};

export function PlayfulOrigori({
  initialPose = 'standing',
  className = '',
}: {
  initialPose?: Pose;
  className?: string;
}) {
  const { t } = useLocale();
  const [pose, setPose] = useState<Pose>(initialPose);
  const burst = useRef({ time: 0, count: 0 });
  const recovery = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const description = useId();
  useEffect(() => () => clearTimeout(recovery.current), []);
  const change = (next: Pose) => {
    clearTimeout(recovery.current);
    setPose(next);
  };
  const tap = () => {
    const now = performance.now();
    burst.current = {
      time: now,
      count: now - burst.current.time < 1000 ? burst.current.count + 1 : 1,
    };
    if (pose === 'crumpled') {
      burst.current.count = 0;
      change('standing');
    } else if (burst.current.count >= 5) {
      change('crumpled');
      burst.current.count = 0;
      recovery.current = setTimeout(() => setPose('standing'), 2200);
    } else {
      const cycle: Pose[] = ['standing', 'sitting', 'idea', 'resting'];
      change(cycle[(cycle.indexOf(pose) + 1) % cycle.length]);
    }
  };
  return (
    <div className={`o-playful ${className}`} data-pose={pose}>
      <p className="o-playful-message" aria-live="polite" aria-atomic="true">
        {t(...messages[pose])}
      </p>
      <button
        className="o-character-button"
        type="button"
        onClick={tap}
        aria-label={t('オリゴリを変形させる', 'Transform Origori')}
        aria-describedby={description}
      >
        <AnimatedOrigori pose={pose} />
      </button>
      <p className="o-playful-hint" id={description}>
        {t(
          'クリックで変身。つつきすぎには、ご用心。',
          'Click to transform. Easy on the poking!',
        )}
      </p>
      <button
        className="o-rest-button"
        type="button"
        aria-pressed={pose === 'resting'}
        onClick={() => {
          burst.current.count = 0;
          change(pose === 'resting' ? 'standing' : 'resting');
        }}
      >
        <RotateCcw size={14} />
        {pose === 'resting'
          ? t('そろそろ、つくろう', 'Ready to make again')
          : t('オリゴリと、ひと息', 'Take a break with Origori')}
      </button>
    </div>
  );
}

type Flight = {
  pose: Pose;
  x: number;
  y: number;
  size: number;
  id: number;
  dx: number;
  dy: number;
  heading: number;
};

// Enhancement for mascot links only. All normal navigation and modified clicks
// retain browser behavior; reduced motion takes the native link immediately.
export function FlightNavigation() {
  const reduced = useReducedMotion();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [flying, setFlying] = useState(false);
  const active = useRef<{
    anchor: HTMLAnchorElement;
    cancel: () => void;
  } | null>(null);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a')
          : null;
      if (!anchor) return;
      // A later navigation choice wins over an in-progress departure.
      if (active.current && active.current.anchor !== anchor)
        active.current.cancel();
      if (
        !anchor.hasAttribute('data-origori-flight') ||
        reduced ||
        anchor.target ||
        anchor.hasAttribute('download')
      )
        return;
      const destination = new URL(anchor.href);
      if (
        destination.origin !== location.origin ||
        destination.pathname === location.pathname
      )
        return;
      const mascot = anchor.querySelector<HTMLElement>('.o-mascot');
      if (!mascot) return;
      const pose = anchor.dataset.origoriFlight as Pose;
      if (!(pose in manifest)) return;
      event.preventDefault();
      if (active.current) return;
      const rect = mascot.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const id = performance.now();
      const timers: ReturnType<typeof setTimeout>[] = [];
      const cleanup = () => {
        timers.forEach(clearTimeout);
        delete anchor.dataset.departing;
        active.current = null;
        setFlight(null);
        setFlying(false);
        document.removeEventListener('visibilitychange', visibility);
      };
      const arrive = () => {
        cleanup();
        location.assign(destination.href);
      };
      const visibility = () => {
        if (document.hidden) arrive();
      };
      active.current = { anchor, cancel: cleanup };
      anchor.dataset.departing = 'true';
      const x = rect.x + (rect.width - size) / 2;
      const y = rect.y + (rect.height - size) / 2;
      const dx = innerWidth - x + 100;
      const dy = -y - size - 100;
      setFlight({
        pose,
        x,
        y,
        size,
        id,
        dx,
        dy,
        heading: planeRotation(dx, dy),
      });
      // One painted original frame, a 340ms fold, then a 300ms flight.
      timers.push(
        setTimeout(
          () =>
            setFlight((value) =>
              value?.id === id ? { ...value, pose: 'plane' } : value,
            ),
          32,
        ),
      );
      timers.push(setTimeout(() => setFlying(true), 380));
      timers.push(setTimeout(arrive, 690));
      document.addEventListener('visibilitychange', visibility);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !active.current) return;
      const anchor = active.current.anchor;
      active.current.cancel();
      anchor.focus();
    };
    const restore = () => active.current?.cancel();
    document.addEventListener('click', click);
    document.addEventListener('keydown', escape);
    window.addEventListener('pageshow', restore);
    return () => {
      restore();
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('pageshow', restore);
    };
  }, [reduced]);
  if (!flight) return null;
  return (
    <div
      className={`o-flight ${flying ? 'is-flying' : ''}`}
      aria-hidden="true"
      style={{
        left: flight.x,
        top: flight.y,
        width: flight.size,
        height: flight.size,
        transform: flying
          ? `translate(${flight.dx}px, ${flight.dy}px) scale(.6)`
          : 'translate(0px, 0px) scale(1)',
      }}
    >
      <AnimatedOrigori
        key={flight.id}
        pose={flight.pose}
        duration={340}
        flightHeading={flight.heading}
      />
    </div>
  );
}
