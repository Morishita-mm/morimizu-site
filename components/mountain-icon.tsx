import { useId } from 'react';

/** Mountain silhouette adopted from the local Roots concept. */
export function MountainIcon() {
  const gradientId = useId();
  return (
    <svg
      className="site-icon site-icon--mountain"
      viewBox="0 0 106 40"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="10"
          x2="104"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--black, #151519)" />
          <stop offset=".55" stopColor="var(--blue, #2449ff)" />
          <stop offset="1" stopColor="var(--mountain-highlight, #647fff)" />
        </linearGradient>
      </defs>
      <path
        d="M2 34C15 29 30 13 43 6C56-1 51 28 64 25C76 22 78 11 85 20C91 28 94 32 104 34C89 38 84 29 78 25C71 23 61 34 54 29C48 25 49 7 42 12C30 19 17 37 2 34Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
