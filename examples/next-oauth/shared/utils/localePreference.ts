import { i18nConfig, type LocaleType } from '@config/i18n';

const LOCALE_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

const SUPPORTED_LOCALES = i18nConfig.supportedLngs;

/** Built from `supportedLngs` — do not hardcode locale codes. */
const LOCALE_PATH_ALT = SUPPORTED_LOCALES.map(escapeRegExp).join('|');
const LOCALE_PATH_RE = new RegExp(`^/(${LOCALE_PATH_ALT})(?=/|$)`);
const STRIP_LOCALE_PATH_RE = new RegExp(`^/(${LOCALE_PATH_ALT})(?=/|$)`);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isSupportedLocale(value: string): value is LocaleType {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Persistent locale preference cookie (next-intl `localeCookie`). */
export const localeCookieConfig = {
  name: i18nConfig.storageKey,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: LOCALE_COOKIE_MAX_AGE_SEC
};

/**
 * OIDC-style `ui_locales` (space/comma separated) or `locale` query → app locale.
 * Matches exact supported codes, or BCP-47 prefixes (e.g. `zh-CN` → `zh`).
 */
export function parsePreferredLocaleParam(
  searchParams: URLSearchParams
): LocaleType | null {
  const raw =
    searchParams.get('ui_locales')?.trim() ||
    searchParams.get('locale')?.trim() ||
    '';
  if (!raw) {
    return null;
  }

  for (const token of raw.split(/[\s,]+/).filter(Boolean)) {
    const lower = token.toLowerCase();
    if (isSupportedLocale(lower)) {
      return lower;
    }
    const primary = lower.split('-')[0] ?? '';
    if (primary && isSupportedLocale(primary)) {
      return primary;
    }
  }

  return null;
}

export function getPathLocale(pathname: string): LocaleType | null {
  const match = pathname.match(LOCALE_PATH_RE);
  const candidate = match?.[1];
  return candidate && isSupportedLocale(candidate) ? candidate : null;
}

export function stripLocalePrefix(pathname: string): string {
  const stripped = pathname.replace(STRIP_LOCALE_PATH_RE, '');
  return stripped || '/';
}

export function withLocalePrefix(locale: LocaleType, pathname: string): string {
  const rest = stripLocalePrefix(pathname);
  return rest === '/' ? `/${locale}` : `/${locale}${rest}`;
}
