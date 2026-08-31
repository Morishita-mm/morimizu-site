export function MizuGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="glyph-line glyph-line-jade"
        d="M22.375 9.625A9 9 0 0 0 9.625 22.375"
        fill="none"
        stroke="var(--jade, #327871)"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
      <path
        className="glyph-line glyph-line-ink"
        d="M9.625 22.375A9 9 0 0 0 22.375 9.625"
        fill="none"
        stroke="var(--ink, #17241e)"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
      <path
        className="glyph-line glyph-line-ink"
        d="M22.375 9.625C23.375 12.875 20.25 14.875 16 16"
        fill="none"
        stroke="var(--ink, #17241e)"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
      <path
        className="glyph-line glyph-line-jade"
        d="M16 16C11.75 17.125 8.625 19.125 9.625 22.375"
        fill="none"
        stroke="var(--jade, #327871)"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
      <circle
        className="glyph-dew"
        cx="25.875"
        cy="5.75"
        fill="var(--jade, #327871)"
        r="1.5"
      />
      <circle
        className="glyph-dew-glint"
        cx="25.44"
        cy="5.31"
        fill="var(--paper, #f4f1e8)"
        r="0.38"
      />
    </svg>
  );
}
