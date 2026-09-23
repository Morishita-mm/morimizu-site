// Original marks retained from the accepted portfolio prototype.
export function RoofProjectMark({
  kind,
  className = '',
}: {
  kind: string;
  className?: string;
}) {
  if (kind === 'tech-interviewer') {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`original-project-icon ${className}`}
        data-original-icon={kind}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15L31 6L42 13V35L31 42L18 33" />
        <path d="M18 15L6 24L18 33L29 24L18 15Z" />
      </svg>
    );
  }
  if (kind === 'architecture-sandbox') {
    return (
      <svg
        viewBox="0 0 128 128"
        className={`original-project-icon architecture-sandbox-mark ${className}`}
        data-original-icon={kind}
        aria-hidden="true"
        fill="var(--sandbox-mark-body, #2164e8)"
      >
        <path d="M16 108L51 27Q54 20 62 20H74L96 68H73L62 44L44 84H74L85 108Z" />
        <path
          d="M80 78H101L115 108H94Z"
          fill="var(--sandbox-mark-joint, #009f97)"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 120 120"
      className={`original-project-icon ${className}`}
      data-original-icon={kind}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === 'lissue' ? (
        <>
          <path d="M28 26v48c0 12 10 22 22 22h44" />
          <path
            d="M48 26v32c0 10 8 18 18 18h28"
            stroke="var(--accent)"
            strokeWidth="6"
          />
          <circle cx="28" cy="26" r="5" />
          <circle cx="28" cy="74" r="5" />
          <circle
            cx="48"
            cy="26"
            r="5"
            fill="var(--accent)"
            stroke="var(--accent)"
          />
          <circle
            cx="94"
            cy="76"
            r="6"
            fill="var(--accent)"
            stroke="var(--accent)"
          />
          <circle cx="94" cy="96" r="5" fill="currentColor" />
        </>
      ) : kind === 'ragy' ? (
        <>
          <path d="M20 35c24 0 24 50 48 50s24-25 32-25" />
          <path
            d="M20 85c24 0 24-50 48-50s24 25 32 25"
            stroke="var(--accent)"
            strokeWidth="6"
          />
          <circle cx="20" cy="35" r="5" />
          <circle
            cx="20"
            cy="85"
            r="5"
            fill="var(--accent)"
            stroke="var(--accent)"
          />
          <circle
            cx="100"
            cy="60"
            r="7"
            fill="var(--accent)"
            stroke="var(--accent)"
          />
        </>
      ) : (
        <>
          <path d="M14 37h21c13 0 13 23 25 23M14 60h46M14 83h21c13 0 13-23 25-23" />
          <path
            d="M68 60c13 0 14-25 37-25M68 60h37M68 60c13 0 14 25 37 25"
            stroke="var(--accent)"
            strokeWidth="6"
          />
          <circle cx="64" cy="60" r="7" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
