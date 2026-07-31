import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant
} from './buttonClassName';

export type { ButtonSize, ButtonVariant };
export { buttonClassName };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

/**
 * Antd-free button using semantic theme tokens (`bg-brand`, etc.).
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
