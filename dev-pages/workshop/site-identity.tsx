export const M_LEFT = 'M10 80V28h14l24 24v20L24 49v31Z';
export const M_RIGHT = 'm48 52 24-24h14v52H72V49L48 72Z';
export type MVariant =
  | 'original'
  | 'arch'
  | 'cutout'
  | 'flow'
  | 'planes'
  | 'paired'
  | 'stagger'
  | 'inset'
  | 'shoulder-planes'
  | 'shoulder-raised'
  | 'shoulder-chamfer'
  | 'shoulder-rebate';
// Actual ink bounds: 76 × 76, centered within the 96 × 96 icon viewBox.
// 6-unit side channels and an 8-unit central channel remain open in monochrome.
export const M_PLANES = [
  'M10 16 26 31 26 92 10 77Z',
  'M32 47 44 59 44 77 32 65Z',
  'M52 59 64 47 64 65 52 77Z',
  'M70 31 86 16 86 77 70 92Z',
];

// Original polygon studies. Every silhouette fits the same 76 × 76 ink bounds.
export const ABSTRACT_M_PATHS: Partial<Record<MVariant, string[]>> = {
  // ChatGPT-authored: left shoulder, right shoulder, central accent last.
  'shoulder-planes': [
    'M10 16 34 34 34 92 10 74Z',
    'M62 34 86 16 86 74 62 92Z',
    'M42 42 54 51 54 81 42 72Z',
  ],
  // M-08A: only the central plate moves upward by 4 viewBox units.
  'shoulder-raised': [
    'M10 16 34 34 34 92 10 74Z',
    'M62 34 86 16 86 74 62 92Z',
    'M42 38 54 47 54 77 42 68Z',
  ],
  'shoulder-chamfer': [
    'M10 16 22 16 34 34 34 92 10 92Z',
    'M62 34 74 16 86 16 86 92 62 92Z',
    'M42 46 54 46 54 70 48 76 42 70Z',
  ],
  'shoulder-rebate': [
    'M10 16 34 32 34 56 28 60 28 92 10 80Z',
    'M62 32 86 16 86 80 68 92 68 60 62 56Z',
    'M42 46 54 46 54 78 42 70Z',
  ],
  planes: M_PLANES,
  paired: [
    'M10 16 42 34 42 58 26 49 26 92 10 83Z',
    'M54 34 86 16 86 83 70 92 70 49 54 58Z',
  ],
  stagger: [
    'M10 16 26 26 26 80 10 70Z',
    'M32 40 44 48 44 70 32 62Z',
    'M52 52 64 44 64 74 52 82Z',
    'M70 36 86 26 86 82 70 92Z',
  ],
  inset: [
    'M10 16 22 26 22 92 10 82Z',
    'M28 34 44 48 44 78 28 64Z',
    'M52 48 68 34 68 64 52 78Z',
    'M74 26 86 16 86 82 74 92Z',
  ],
};

export function isAbstractMark(variant: MVariant) {
  return ABSTRACT_M_PATHS[variant] !== undefined;
}

export function isCenterPlateMark(variant: MVariant) {
  return (
    variant === 'shoulder-planes' ||
    variant === 'shoulder-raised' ||
    variant === 'shoulder-chamfer' ||
    variant === 'shoulder-rebate'
  );
}

// Two structural halves share one central join. Used verbatim in both m glyphs.
export function MShape({ variant = 'original' }: { variant?: MVariant }) {
  const planes = ABSTRACT_M_PATHS[variant];
  if (planes)
    return (
      <g data-m-variant={variant} fill="currentColor" stroke="none">
        {planes.map((path, index) => (
          <path
            key={path}
            d={path}
            className={index === planes.length - 1 ? 'm-accent' : undefined}
          />
        ))}
      </g>
    );
  if (variant === 'arch')
    return (
      <g
        data-m-variant="arch"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="butt"
      >
        <path d="M10 80V49c0-27 38-27 38 0v31" />
        <path className="m-accent-stroke" d="M48 49c0-27 38-27 38 0v31" />
      </g>
    );
  if (variant === 'cutout')
    return (
      <g data-m-variant="cutout" stroke="none" fill="currentColor">
        <path d="M10 80V28h76v52H70V44H56v36H40V44H26v36Z" />
      </g>
    );
  if (variant === 'flow')
    return (
      <g
        data-m-variant="flow"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 80V49c0-27 28-27 28 0v12c0 20 20 20 20 0V49c0-27 28-27 28 0v31" />
      </g>
    );
  return (
    <g data-m-variant="original" stroke="none">
      <path d={M_LEFT} fill="currentColor" />
      <path d={M_RIGHT} className="m-accent" />
    </g>
  );
}

export function SiteIcon({ variant = 'original' }: { variant?: MVariant }) {
  return (
    <svg className="site-icon" viewBox="0 6 96 96" aria-hidden="true">
      <MShape variant={variant} />
    </svg>
  );
}
