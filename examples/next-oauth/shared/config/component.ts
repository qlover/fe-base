import { buttonClassName } from './button';

/**
 * Shared Tailwind class strings for OAuth developer / playground UI.
 * Uses project semantic tokens (works in light and dark).
 *
 * Prefer `<Button variant="..." />` for buttons.
 * Keep using these helpers for non-button surfaces / inputs.
 */
export const oauthLabelClass =
  'text-secondary-text mb-1.5 block text-xs font-medium uppercase tracking-wide';

export const oauthInputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-lg border bg-bg-container px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

export const oauthTextareaClass = `${oauthInputClass} resize-y min-h-[5.5rem]`;

/** @deprecated Prefer `<Button variant="primary" />` or `buttonClassName`. */
export const oauthPrimaryButtonClass = buttonClassName({ variant: 'primary' });

/** @deprecated Prefer `<Button variant="secondary" />` or `buttonClassName`. */
export const oauthSecondaryButtonClass = buttonClassName({
  variant: 'secondary'
});

/** @deprecated Prefer `<Button variant="ghost" />` or `buttonClassName`. */
export const oauthGhostActionClass = buttonClassName({ variant: 'ghost' });

/** @deprecated Prefer `<Button variant="danger" />` or `buttonClassName`. */
export const oauthDangerButtonClass = buttonClassName({ variant: 'danger' });

/** @deprecated Prefer `<Button variant="warning" />` or `buttonClassName`. */
export const oauthWarningButtonClass = buttonClassName({ variant: 'warning' });

export const oauthCardClass =
  'bg-primary rounded-2xl shadow-xl border border-primary-border overflow-hidden';

export const oauthElevatedPanelClass =
  'bg-elevated rounded-xl border border-primary-border';

/** @deprecated Prefer `<Button variant="header" />` or `buttonClassName`. */
export const headerActionButtonClassName = buttonClassName({
  variant: 'header'
});
