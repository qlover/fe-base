import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { buttonClassName } from '@config/button';
import type { ButtonSize, ButtonVariant } from '@config/button';

export type { ButtonSize, ButtonVariant };
export { buttonClassName };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

/**
 * Project button component (antd-free). Variants follow semantic theme tokens.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={...}>Save</Button>
 * <Button variant="secondary" size="sm">Cancel</Button>
 * <Link className={buttonClassName({ variant: 'primary' })} href="/docs">Docs</Link>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'secondary',
      size = 'md',
      type = 'button',
      className,
      children,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        data-testid="Button"
        data-variant={variant}
        className={buttonClassName({ variant, size, className })}
        {...props}
      >
        {children}
      </button>
    );
  }
);
