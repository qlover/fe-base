/**
 * @description Home page title
 * @localZh Next OAuth
 * @localEn Next OAuth
 */
export const PAGE_HOME_TITLE = 'page_home:title';

/**
 * @description Home page meta description
 * @localZh OAuth 模板项目：预置 Supabase Auth 与 Brain User 上游代理两种方案
 * @localEn OAuth template with two predefined upstreams: Supabase Auth and Brain User proxy
 */
export const PAGE_HOME_DESCRIPTION = 'page_home:description';

/**
 * @description Home page keywords
 * @localZh OAuth 2.0, 模板, Supabase, Brain User, 授权码, PKCE, Next OAuth
 * @localEn OAuth 2.0, template, Supabase, Brain User, authorization code, PKCE, Next OAuth
 */
export const PAGE_HOME_KEYWORDS = 'page_home:keywords';

/**
 * @description Home nav - Docs
 * @localZh 文档
 * @localEn Docs
 */
export const PAGE_HOME_NAV_DOCS = 'page_home:nav__docs';

/**
 * @description Home nav - About
 * @localZh 关于
 * @localEn About
 */
export const PAGE_HOME_NAV_ABOUT = 'page_home:nav__about';

/**
 * @description Hero badge label
 * @localZh 第三方账号统一登录
 * @localEn Unified third-party sign-in
 */
export const PAGE_HOME_HERO_BADGE = 'page_home:hero__badge';

/**
 * @description Hero title line 1
 * @localZh GitHub、Google 等
 * @localEn GitHub, Google and more
 */
export const PAGE_HOME_HERO_TITLE1 = 'page_home:hero__title1';

/**
 * @description Hero title line 2
 * @localZh 一键登录你的应用
 * @localEn sign in to your apps
 */
export const PAGE_HOME_HERO_TITLE2 = 'page_home:hero__title2';

/**
 * @description Hero description
 * @localZh 基于 Supabase 的统一认证平台，集成 GitHub、Google 等第三方账号登录，同时提供标准 OAuth 2.0 授权能力（授权码 + PKCE、refresh_token、userinfo）。用户可通过多种登录方式快速访问，第三方应用也可对接 OAuth 实现统一认证。
 * @localEn A Supabase-powered authentication platform that integrates GitHub, Google and other third-party sign-in methods, while providing standard OAuth 2.0 authorization (authorization code + PKCE, refresh_token, userinfo). Users can sign in via multiple providers, and third-party apps can integrate via OAuth for unified authentication.
 */
export const PAGE_HOME_HERO_DESC = 'page_home:hero__desc';

/**
 * @description Hero primary CTA
 * @localZh 开始使用
 * @localEn Get started
 */
export const PAGE_HOME_HERO_START = 'page_home:hero__start';

/**
 * @description Hero secondary CTA
 * @localZh 阅读文档
 * @localEn Read docs
 */
export const PAGE_HOME_HERO_DOCS = 'page_home:hero__docs';

/**
 * @description Feature 1 label
 * @localZh 多种第三方登录
 * @localEn Multiple third-party sign-in
 */
export const PAGE_HOME_FEATURE1_TITLE = 'page_home:feature1__title';

/**
 * @description Feature 1 description
 * @localZh 通过 Supabase Auth 集成 GitHub、Google 等第三方账号登录，同时支持邮箱密码、手机验证码等多种登录方式。
 * @localEn Integrate GitHub, Google and other third-party sign-in via Supabase Auth, along with email/password, phone OTP and more.
 */
export const PAGE_HOME_FEATURE1_DESC = 'page_home:feature1__desc';

/**
 * @description Feature 2 label
 * @localZh OAuth 2.0 授权
 * @localEn OAuth 2.0 authorization
 */
export const PAGE_HOME_FEATURE2_TITLE = 'page_home:feature2__title';

/**
 * @description Feature 2 description
 * @localZh 基于 @qlover/oauth-wrapper 提供标准 OAuth 2.0 授权码 + PKCE 流程，第三方应用可快速接入统一认证。
 * @localEn Standard OAuth 2.0 authorization code + PKCE via @qlover/oauth-wrapper—third-party apps can integrate unified auth quickly.
 */
export const PAGE_HOME_FEATURE2_DESC = 'page_home:feature2__desc';

/**
 * @description Feature 3 label
 * @localZh 开发者控制台
 * @localEn Developer console
 */
export const PAGE_HOME_FEATURE3_TITLE = 'page_home:feature3__title';

/**
 * @description Feature 3 description
 * @localZh 自助注册 OAuth 应用、配置 redirect_uri，并用 Playground 在站内调试完整流程。
 * @localEn Register apps, manage redirect URIs, and debug the full flow in the Playground.
 */
export const PAGE_HOME_FEATURE3_DESC = 'page_home:feature3__desc';

/**
 * @description Architecture section title
 * @localZh 项目如何分层
 * @localEn How this project is structured
 */
export const PAGE_HOME_SECTION_ARCH_TITLE = 'page_home:section__arch__title';

/**
 * @description Architecture section body
 * @localZh 这是一个模板项目：@qlover/oauth-wrapper 提供与上游无关的 OAuth 2.0 协议面；示例预置两种上游——默认 SupabaseOAuthProvider（邮箱/手机/GitHub/Google），可选 BrainUserOAuthProvider（把已有登录 API 包装成 OAuth 服务端）。切换 NEXT_PUBLIC_OAUTH_UPSTREAM_PROVIDER / OAUTH_UPSTREAM_PROVIDER 即可。
 * @localEn This is a template: @qlover/oauth-wrapper supplies the provider-agnostic OAuth 2.0 surface. Two upstreams ship in-box—default SupabaseOAuthProvider (email/phone/GitHub/Google), optional BrainUserOAuthProvider (wrap an existing login API as an OAuth AS). Switch via NEXT_PUBLIC_OAUTH_UPSTREAM_PROVIDER / OAUTH_UPSTREAM_PROVIDER.
 */
export const PAGE_HOME_SECTION_ARCH_BODY = 'page_home:section__arch__body';

/**
 * @description Demo deployment section title
 * @localZh 预置方案：Supabase（默认）与 Brain User（可选）
 * @localEn Built-in options: Supabase (default) and Brain User (optional)
 */
export const PAGE_HOME_SECTION_DEMO_TITLE = 'page_home:section__demo__title';

/**
 * @description Demo deployment section body
 * @localZh 默认绑定 SupabaseOAuthProvider，行为与原先一致。若要将已有登录接口变成 OAuth 授权服务器，改为 brain-user 并配置 Brain User 相关环境变量；协议端点（authorize、token、userinfo）不变。GitHub/Google 等 SSO 仅在 Supabase 方案下可用。
 * @localEn Default binding is still SupabaseOAuthProvider (same behavior as before). To wrap an existing login API as an OAuth AS, set brain-user and configure Brain User envs; authorize/token/userinfo stay the same. GitHub/Google SSO is available only under the Supabase option.
 */
export const PAGE_HOME_SECTION_DEMO_BODY = 'page_home:section__demo__body';

/**
 * @description API snippet section title
 * @localZh 主要端点
 * @localEn Key endpoints
 */
export const PAGE_HOME_API_SNIPPET_TITLE = 'page_home:api__snippet__title';

/**
 * @description API snippet login line note
 * @localZh 终端用户登录（Supabase Auth）
 * @localEn End-user sign-in (Supabase Auth)
 */
export const PAGE_HOME_API_SNIPPET_LOGIN = 'page_home:api__snippet__login';

/**
 * @description CTA section title
 * @localZh 准备好开始了吗？
 * @localEn Ready to build?
 */
export const PAGE_HOME_CTA_TITLE = 'page_home:cta__title';

/**
 * @description CTA section description
 * @localZh 创建你的第一个 OAuth 应用，只需几分钟。
 * @localEn Create your first OAuth app in minutes.
 */
export const PAGE_HOME_CTA_DESC = 'page_home:cta__desc';

/**
 * @description CTA button label
 * @localZh 前往控制台
 * @localEn Go to console
 */
export const PAGE_HOME_CTA_BUTTON = 'page_home:cta__button';

/**
 * @description Footer tagline
 * @localZh 统一认证登录平台
 * @localEn Unified authentication platform
 */
export const PAGE_HOME_FOOTER_TAGLINE = 'page_home:footer__tagline';
