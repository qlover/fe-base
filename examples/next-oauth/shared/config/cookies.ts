export const cookiesConfig: Cookies.CookieAttributes = {
  domain: '',
  path: '/',
  expires: 30,
  /**
   * httpOnly 必须为 false，否则客户端 JavaScript 无法设置 cookie
   * httpOnly: true 只能用于服务端设置的 cookie（如认证 token）
   */
  httpOnly: false,
  /**
   * 是否仅通过 HTTPS 传输
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#secure_cookie_attribute
   */
  secure: false,
  /**
   * 'strict'：最严格，跨站请求（如从其他网站链接过来）不发送 Cookie
   * 其他可选值：'lax'（部分允许）、'none'（允许，但需要 secure: true）
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#samesite_cookie_attribute
   */
  sameSite: 'strict'
};
