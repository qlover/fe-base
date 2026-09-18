/**
 * React Seed product mark (not PAM).
 * Soft rounded tile + seed sprout; uses `currentColor` (typically `text-brand`).
 */
export function SeedLogo(props: { className?: string }) {
  return (
    <svg
      data-testid="SeedLogo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="1em"
      height="1em"
      className={props.className}
      role="img"
      aria-label="React Seed"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        fill="currentColor"
        d="M16 7c-3.8 3.2-5.8 6.6-5.8 10.1 0 3.4 2.5 5.9 5.8 5.9s5.8-2.5 5.8-5.9C21.8 13.6 19.8 10.2 16 7z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M16 23v2.5"
        opacity="0.85"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        d="M16 12.5c-1.6 1.4-2.4 2.9-2.4 4.4"
        opacity="0.55"
      />
    </svg>
  );
}
