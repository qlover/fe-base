/**
 * Email OTP Callback page i18n identifiers
 *
 * 回调页面的翻译 key，用于 Supabase magic link 登录后的中间页面。
 * 未来新增回调页面（email-verify-callback、register-success 等）
 * 可按同样模式在 i18n-identifier/pages/ 下创建新文件。
 */

// ─── SEO meta (PageI18nInterface required fields) ───

/**
 * @description Page title for SEO
 * @localZh 登录验证
 * @localEn Sign-in Verification
 */
export const PAGE_EMAIL_OTP_CB_TITLE = 'page_email_otp_callback:title';

/**
 * @description Page description for SEO
 * @localZh 正在通过邮箱链接验证您的身份并完成登录。
 * @localEn Verifying your identity via email link to complete sign-in.
 */
export const PAGE_EMAIL_OTP_CB_DESCRIPTION =
  'page_email_otp_callback:description';

/**
 * @description Page content summary for SEO
 * @localZh 邮箱 Magic Link 登录回调页面，自动验证身份并建立会话。
 * @localEn Email magic link login callback page, automatically verifies identity and establishes session.
 */
export const PAGE_EMAIL_OTP_CB_CONTENT = 'page_email_otp_callback:content';

/**
 * @description Page keywords for SEO
 * @localZh 登录,邮箱验证,Magic Link,OTP
 * @localEn login,email verification,magic link,OTP
 */
export const PAGE_EMAIL_OTP_CB_KEYWORDS = 'page_email_otp_callback:keywords';

// ─── UI text ───

/**
 * @description Callback page status text while verifying identity
 * @localZh 正在验证身份...
 * @localEn Verifying your identity...
 */
export const PAGE_EMAIL_OTP_CB_AUTHENTICATING =
  'page_email_otp_callback:authenticating';

/**
 * @description Callback page status text while establishing session
 * @localZh 正在建立会话...
 * @localEn Establishing session...
 */
export const PAGE_EMAIL_OTP_CB_ESTABLISHING =
  'page_email_otp_callback:establishing';

/**
 * @description Callback page status text on error
 * @localZh 出了点问题，正在跳转...
 * @localEn Something went wrong, redirecting...
 */
export const PAGE_EMAIL_OTP_CB_ERROR = 'page_email_otp_callback:error';

/**
 * @description Callback page subtitle text
 * @localZh 请稍候，我们正在完成登录。
 * @localEn Please wait while we complete your sign-in.
 */
export const PAGE_EMAIL_OTP_CB_SUBTITLE =
  'page_email_otp_callback:subtitle';
