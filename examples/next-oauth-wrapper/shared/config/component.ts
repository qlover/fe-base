/**
 * Shared Tailwind class strings for OAuth developer / playground UI.
 * Uses project semantic tokens (works in light and dark).
 */
export const oauthLabelClass =
  'text-secondary-text mb-1.5 block text-xs font-medium uppercase tracking-wide';

export const oauthInputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-lg border bg-bg-container px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

export const oauthTextareaClass = `${oauthInputClass} resize-y min-h-[5.5rem]`;

export const oauthPrimaryButtonClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand text-on-brand font-medium hover:bg-brand-hover transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed';

export const oauthSecondaryButtonClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary-border bg-primary text-primary-text font-medium hover:bg-elevated transition disabled:opacity-60 disabled:cursor-not-allowed';

export const oauthGhostActionClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-brand hover:text-brand-hover hover:bg-brand/10 transition';

export const oauthDangerButtonClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 bg-red-50 dark:bg-red-900/25 text-red-700 dark:text-red-300 font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-60';

export const oauthWarningButtonClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-medium hover:bg-amber-100 dark:hover:bg-amber-950/50 transition disabled:opacity-60';

export const oauthCardClass =
  'bg-primary rounded-2xl shadow-xl border border-primary-border overflow-hidden';

export const oauthElevatedPanelClass =
  'bg-elevated rounded-xl border border-primary-border';

/** Shared header control styles (language, theme, auth). */
export const headerActionButtonClassName =
  'inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg px-2 py-1.5 sm:px-3 text-sm font-medium text-primary-text bg-elevated hover:bg-secondary border border-primary-border/60 transition-colors shrink-0';
