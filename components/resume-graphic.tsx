export function ResumeGraphic({
  className = '',
  size = 180,
}: {
  className?: string;
  size?: number;
}) {
  const count = 28;
  const cx = 60;
  const cy = 60;
  const ringRadius = 26;
  const circleRadius = 31;

  const circles = Array.from({ length: count }, (_, i) => {
    const angle = (i * 2 * Math.PI) / count;
    const x = Number((cx + ringRadius * Math.cos(angle)).toFixed(2));
    const y = Number((cy + ringRadius * Math.sin(angle)).toFixed(2));
    return <circle cx={x} cy={y} key={i} r={circleRadius} />;
  });

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeWidth="0.75"
      viewBox="0 0 120 120"
      width={size}
    >
      {circles}
      <circle cx={cx} cy={cy} fill="currentColor" r="4.2" />
    </svg>
  );
}
