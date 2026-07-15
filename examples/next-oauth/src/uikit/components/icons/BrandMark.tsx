import { forwardRef } from 'react';
import type { IconProps } from './types';

/**
 * Next OAuth brand mark — geometric "N" on rounded square.
 * Colors follow theme via `--fe-color-brand` / on-brand white.
 */
export const BrandMark = forwardRef<SVGSVGElement, IconProps>(
  function BrandMark({ title, titleId, ...props }, ref) {
    return (
      <svg
        data-testid="BrandMark"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden={title ? undefined : true}
        data-slot="icon"
        ref={ref}
        aria-labelledby={titleId}
        {...props}
      >
        {title ? <title id={titleId}>{title}</title> : null}
        <rect width="32" height="32" rx="8" fill="rgb(var(--fe-color-brand))" />
        <path
          fill="#FFFFFF"
          d="M9 7h3.4l5.7 9.2V7H22v18h-3.4l-5.7-9.2V25H9V7Z"
        />
      </svg>
    );
  }
);
