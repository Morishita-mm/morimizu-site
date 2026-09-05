// Existing production ProjectGlyph geometry, with local theme classes only.
export function OriginalProjectMark({ kind }: { kind: string }) {
  return (
    <svg
      className="e-mark original-project-mark"
      viewBox="0 0 120 120"
      aria-hidden="true"
      data-original-icon={kind}
    >
      {kind === 'lissue' ? (
        <>
          <path d="M28 26v48c0 12 10 22 22 22h44" />
          <path className="original-accent" d="M48 26v32c0 10 8 18 18 18h28" />
          <circle cx="28" cy="26" r="5" />
          <circle cx="28" cy="74" r="5" />
          <circle className="original-accent-fill" cx="48" cy="26" r="5" />
          <circle className="original-accent-fill" cx="94" cy="76" r="6" />
          <circle className="original-light-fill" cx="94" cy="96" r="5" />
        </>
      ) : kind === 'ragy' ? (
        <>
          <path d="M20 35c24 0 24 50 48 50s24-25 32-25" />
          <path
            className="original-accent"
            d="M20 85c24 0 24-50 48-50s24 25 32 25"
          />
          <circle cx="20" cy="35" r="5" />
          <circle className="original-accent-fill" cx="20" cy="85" r="5" />
          <circle className="original-accent-fill" cx="100" cy="60" r="7" />
        </>
      ) : (
        <>
          <path d="M14 37h21c13 0 13 23 25 23M14 60h46M14 83h21c13 0 13-23 25-23" />
          <path
            className="original-accent"
            d="M68 60c13 0 14-25 37-25M68 60h37M68 60c13 0 14 25 37 25"
          />
          <circle className="original-light-fill" cx="64" cy="60" r="7" />
        </>
      )}
    </svg>
  );
}
