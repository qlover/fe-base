/** Shared auth form class strings and hero wash (theme tokens only). */

export const authInputClass =
  'border-primary-border bg-secondary text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

export const authSocialBtnClass =
  'border-primary-border bg-secondary text-primary-text hover:bg-elevated focus:ring-brand inline-flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';

export const authPrimaryBtnClass =
  'bg-brand hover:bg-brand-hover text-on-brand focus:ring-brand w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-70';

/** Hero wash built from theme channel tokens (no parallel palette). */
export const authHeroMeshStyle = {
  background: [
    'radial-gradient(ellipse 80% 60% at 12% 18%, rgb(var(--fe-color-brand) / 0.18), transparent 55%)',
    'radial-gradient(ellipse 70% 50% at 88% 78%, rgb(var(--fe-color-brand) / 0.1), transparent 50%)',
    'linear-gradient(155deg, rgb(var(--fe-color-brand) / 0.1) 0%, rgb(var(--fe-color-primary)) 48%, rgb(var(--fe-color-secondary)) 100%)'
  ].join(', ')
} as const;
