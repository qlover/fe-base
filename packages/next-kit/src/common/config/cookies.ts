/**
 * Subset of js-cookie `CookieAttributes` used by app shell cookie defaults.
 * Kept local so `common` does not require a runtime js-cookie dependency.
 */
export type CookieAttributes = {
  domain?: string;
  path?: string;
  expires?: number | Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
};

export const cookiesConfig: CookieAttributes = {
  domain: '',
  path: '/',
  expires: 30,
  /**
   * httpOnly must be false so client JavaScript can set the cookie.
   * httpOnly: true is only for server-set cookies (e.g. auth tokens).
   */
  httpOnly: false,
  /**
   * Whether the cookie is sent only over HTTPS.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#secure_cookie_attribute
   */
  secure: false,
  /**
   * 'strict': most strict — cross-site navigations do not send the cookie.
   * Other values: 'lax', 'none' (requires secure: true).
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#samesite_cookie_attribute
   */
  sameSite: 'strict'
};
