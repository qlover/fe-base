export type LocaleRouterMode = 'path' | 'query';

export interface LocaleRouterOptions {
  /**
   * List of supported language codes.
   *
   * @example `['zh', 'en', 'jp']`
   */
  supportedLocales: readonly string[];

  /**
   * URL strategy for locale detection.
   *
   * - `'path'`: Locale is part of the URL path (e.g., `/zh/login`).
   * - `'query'`: Locale is a query parameter (e.g., `/login?locale=zh`).
   *
   * @default `'path'`
   */
  mode: LocaleRouterMode;

  /**
   * Query parameter name to use in `'query'` mode.
   * Only relevant when `mode` is `'query'`.
   *
   * @default `'locale'`
   * @example `'lang'`
   */
  localeQueryParam?: string;
}

/**
 * Utility class for switching locales in a URL while preserving all other parts
 * (path segments, query parameters, hash fragment).
 *
 * Supports two modes:
 * - **Path mode** (`mode: 'path'`): Locale is the first path segment.
 *   Example: `/zh/login?name=122` → `/en/login?name=122`
 * - **Query mode** (`mode: 'query'`): Locale is a query parameter.
 *   Example: `/login?name=122` → `/login?name=122&locale=en`
 *
 * The class automatically handles adding, replacing, or removing locale information
 * without affecting other parts of the URL.
 *
 * @example Path mode
 * ```typescript
 * const router = new LocaleRouter({
 *   supportedLocales: ['zh', 'en', 'jp'],
 *   mode: 'path'
 * });
 * const newPath = router.switchLocale('/zh/products?id=1', 'zh', 'en');
 * console.log(newPath); // '/en/products?id=1'
 * ```
 *
 * @example Query mode with custom parameter name
 * ```typescript
 * const router = new LocaleRouter({
 *   supportedLocales: ['zh', 'en', 'jp'],
 *   mode: 'query',
 *   localeQueryParam: 'lang'
 * });
 * const newPath = router.switchLocale('/login?foo=bar', 'en', 'zh');
 * console.log(newPath); // '/login?foo=bar&lang=zh'
 * ```
 */
export class LocaleRouter {
  /**
   * List of supported language codes.
   */
  protected supportedLocales: readonly string[];

  /**
   * Current routing mode: `'path'` or `'query'`.
   */
  protected mode: LocaleRouterMode;

  /**
   * Query parameter name used in `'query'` mode.
   */
  protected localeQueryParam: string;

  /**
   * Regular expression to match locale prefix in path mode.
   * Example: `^/(zh|en|jp)(/|$)`
   */
  protected localePrefixRegex: RegExp;

  /**
   * Creates a new LocaleRouter instance.
   *
   * @param options - Configuration options.
   */
  constructor(options: LocaleRouterOptions) {
    this.supportedLocales = options.supportedLocales;
    this.mode = options.mode;
    this.localeQueryParam = options.localeQueryParam ?? 'locale';

    // Build regex to match locale prefix, e.g., /(zh|en|jp)(/|$)
    const escapedLocales = this.supportedLocales.map((loc) =>
      loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    this.localePrefixRegex = new RegExp(`^/(${escapedLocales.join('|')})(/|$)`);
  }

  /**
   * Generates a new URL path after switching from the current locale to a target locale.
   *
   * All non-locale parts of the URL are preserved:
   * - Path segments (except the locale prefix in path mode)
   * - Query parameters (locale parameter is added/replaced in query mode)
   * - Hash fragment (always preserved)
   *
   * In **development environment**, a warning is logged if the provided `currentLocale`
   * does not match the locale extracted from `currentPath`. This helps detect inconsistent
   * state when the locale is cached separately from the URL.
   *
   * @param currentPath - The current URL path (may contain query string and hash).
   *                      Example: `'/zh/login?name=122#section'`
   * @param currentLocale - The current locale value (used only for development validation).
   *                        Not used for actual transformation; the method relies on the URL content.
   * @param targetLocale - The target locale to switch to. Must be one of the supported locales.
   *
   * @returns The new URL path with the locale switched, preserving all other components.
   *
   * @throws {Error} If `targetLocale` is not in `supportedLocales`.
   *
   * @example Path mode
   * ```typescript
   * const router = new LocaleRouter({ supportedLocales: ['zh','en'], mode: 'path' });
   * const newPath = router.switchLocale('/zh/about', 'zh', 'en');
   * console.log(newPath); // '/en/about'
   * ```
   *
   * @example Query mode with hash
   * ```typescript
   * const router = new LocaleRouter({ supportedLocales: ['zh','en'], mode: 'query' });
   * const newPath = router.switchLocale('/page?foo=1#top', 'en', 'zh');
   * console.log(newPath); // '/page?foo=1&locale=zh#top'
   * ```
   */
  public switchLocale(
    currentPath: string,
    currentLocale: string,
    targetLocale: string
  ): string {
    if (process.env.NODE_ENV === 'development') {
      const extracted = this.extractLocaleFromPath(currentPath);
      if (extracted && extracted !== currentLocale) {
        console.warn(
          `LocaleRouter: Provided currentLocale "${currentLocale}" does not match URL locale "${extracted}"`
        );
      }
    }

    if (!this.supportedLocales.includes(targetLocale)) {
      throw new Error(`Unsupported locale: ${targetLocale}`);
    }

    // Split off the hash fragment
    const [pathAndQuery, hash = ''] = currentPath.split('#');
    const hashPart = hash ? `#${hash}` : '';

    if (this.mode === 'query') {
      return this.switchLocaleQueryMode(pathAndQuery, targetLocale) + hashPart;
    } else {
      return this.switchLocalePrefixMode(pathAndQuery, targetLocale) + hashPart;
    }
  }

  /**
   * Extracts the current locale from a given URL path based on the configured mode.
   *
   * @param path - The URL path (may include query string in query mode).
   * @returns The extracted locale string, or `null` if no locale is found.
   *
   * @internal This method is used for development validation.
   */
  protected extractLocaleFromPath(path: string): string | null {
    if (this.mode === 'query') {
      const [, query] = path.split('?');
      const params = new URLSearchParams(query);
      return params.get(this.localeQueryParam);
    } else {
      const match = path.match(this.localePrefixRegex);
      return match ? match[1] : null;
    }
  }

  /**
   * Switches locale in query mode by setting/updating the locale query parameter.
   *
   * @param pathAndQuery - The path with optional query string (no hash).
   * @param targetLocale - The target locale.
   * @returns The new path with updated query string.
   */
  protected switchLocaleQueryMode(
    pathAndQuery: string,
    targetLocale: string
  ): string {
    const [pathname, queryString = ''] = pathAndQuery.split('?');
    const params = new URLSearchParams(queryString);
    params.set(this.localeQueryParam, targetLocale);
    const newQueryString = params.toString();
    return newQueryString ? `${pathname}?${newQueryString}` : pathname;
  }

  /**
   * Switches locale in path mode by replacing or adding the locale prefix.
   *
   * @param pathAndQuery - The path with optional query string (no hash).
   * @param targetLocale - The target locale.
   * @returns The new path with updated locale prefix.
   */
  protected switchLocalePrefixMode(
    pathAndQuery: string,
    targetLocale: string
  ): string {
    const [pathname, queryString = ''] = pathAndQuery.split('?');
    let newPathname: string;

    if (this.localePrefixRegex.test(pathname)) {
      // Existing locale prefix: replace it
      newPathname = pathname.replace(
        this.localePrefixRegex,
        `/${targetLocale}$2`
      );
    } else {
      // No locale prefix: add it
      const normalizedPath = pathname === '/' ? '' : pathname;
      newPathname = `/${targetLocale}${normalizedPath}`;
    }

    return queryString ? `${newPathname}?${queryString}` : newPathname;
  }
}
