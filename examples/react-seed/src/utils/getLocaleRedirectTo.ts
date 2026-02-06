/**
 * Builds the full path for redirecting to the same page with a different locale.
 * Preserves path (with the first segment replaced by targetLocale), search and hash.
 *
 * @param pathname - Current pathname (e.g. /ena/home, /en/detail/1)
 * @param targetLocale - Locale to redirect to (e.g. en, zh)
 * @param options - Optional search and hash from current location
 * @returns Full path string for navigate(to), e.g. /en/home?foo=bar#section
 *
 * @example
 * getLocaleRedirectTo('/ena/home', 'en') // '/en/home'
 * getLocaleRedirectTo('/zh/detail/1', 'en', { search: '?tab=2', hash: '#comments' }) // '/en/detail/1?tab=2#comments'
 */
export function getLocaleRedirectTo(
  pathname: string,
  targetLocale: string,
  options?: { search?: string; hash?: string }
): string {
  const segments = pathname.split('/').filter(Boolean);
  const newPathname =
    segments.length > 0
      ? '/' + [targetLocale, ...segments.slice(1)].join('/')
      : '/' + targetLocale;
  const search = options?.search ?? '';
  const hash = options?.hash ?? '';
  return newPathname + search + hash;
}
