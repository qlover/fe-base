import { useId } from 'react';

/**
 * Official PAM site logo (from brain-toolkit `apps/pam`).
 * Diamond mark uses `currentColor` (typically `text-brand`).
 */
export function PAMLogo(props: { className?: string }) {
  const rawId = useId().replace(/:/g, '');
  const glowId = `pam-logo-glow-${rawId}`;

  return (
    <svg
      data-testid="PAMLogo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="40 40 120 120"
      width="1em"
      height="1em"
      className={props.className}
      role="img"
      aria-label="PAM"
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g filter={`url(#${glowId})`}>
        <rect
          x="65"
          y="65"
          width="70"
          height="70"
          rx="15"
          fill="currentColor"
          transform="rotate(45 100 100)"
        />
      </g>
      <circle
        cx="100"
        cy="100"
        r="9"
        fill="var(--pam-center, #ffffff)"
        opacity="0.95"
      />
      <circle
        cx="72.5"
        cy="70"
        r="3.5"
        fill="var(--pam-dot1, #06b6d4)"
        opacity="0.9"
      />
      <circle
        cx="127.5"
        cy="70"
        r="3.5"
        fill="var(--pam-dot2, #d946ef)"
        opacity="0.9"
      />
      <circle
        cx="100"
        cy="140"
        r="3.5"
        fill="var(--pam-dot3, #f59e0b)"
        opacity="0.9"
      />
    </svg>
  );
}
