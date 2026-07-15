import { clsx } from 'clsx';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'ghost'
  | 'header';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonClassNameOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const baseClassName =
  'inline-flex items-center justify-center font-medium transition disabled:opacity-60 disabled:cursor-not-allowed';

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-on-brand hover:bg-brand-hover shadow-sm gap-2 rounded-lg',
  secondary:
    'border border-primary-border bg-primary text-primary-text hover:bg-elevated gap-2 rounded-lg',
  danger:
    'border border-red-500/40 bg-red-50 dark:bg-red-900/25 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 gap-2 rounded-lg',
  warning:
    'border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/50 gap-2 rounded-lg',
  ghost:
    'text-brand hover:text-brand-hover hover:bg-brand/10 gap-1.5 rounded-lg',
  header:
    'text-primary-text bg-elevated hover:bg-secondary border border-primary-border/60 gap-1 sm:gap-1.5 rounded-lg shrink-0 transition-colors'
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: 'px-2 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

/** Size overrides that better match ghost / header density. */
const variantSizeClassName: Partial<
  Record<ButtonVariant, Partial<Record<ButtonSize, string>>>
> = {
  ghost: {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-2 py-1.5 text-sm',
    lg: 'px-3 py-2 text-sm'
  },
  header: {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-2 py-1.5 sm:px-3 text-sm',
    lg: 'px-3 py-2 text-sm'
  }
};

/**
 * Shared class helper for `<Button>` and button-styled links.
 */
export function buttonClassName({
  variant = 'secondary',
  size = 'md',
  className
}: ButtonClassNameOptions = {}): string {
  const sizeCls = variantSizeClassName[variant]?.[size] ?? sizeClassName[size];

  return clsx(baseClassName, variantClassName[variant], sizeCls, className);
}
