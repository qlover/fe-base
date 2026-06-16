/**
 * @description Home page title
 * @localZh Next OAuth
 * @localEn Next OAuth
 */
export const PAGE_HOME_TITLE = 'page_home:title';

/**
 * @description Home page meta description
 * @localZh 集成 GitHub、Google 等第三方账号的统一认证登录平台
 * @localEn Unified authentication platform with GitHub, Google and other third-party sign-in
 */
export const PAGE_HOME_DESCRIPTION = 'page_home:description';

/**
 * @description Home page keywords
 * @localZh OAuth 2.0, 第三方登录, GitHub, Google, Supabase, Next OAuth
 * @localEn OAuth 2.0, third-party login, GitHub, Google, Supabase, Next OAuth
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
 * @localZh @qlover/oauth-wrapper 提供通用 OAuth 2.0 协议能力（授权码、PKCE、换票）；next-oauth 通过 SupabaseOAuthProvider 装配 Supabase Auth，实现 GitHub、Google 等第三方登录及邮箱/手机登录，并暴露标准 OAuth 端点供第三方应用接入。
 * @localEn @qlover/oauth-wrapper provides the reusable OAuth 2.0 protocol core (authorization code, PKCE, token exchange); next-oauth wires Supabase Auth via SupabaseOAuthProvider for GitHub, Google and email/phone sign-in, and exposes standard OAuth endpoints for third-party app integration.
 */
export const PAGE_HOME_SECTION_ARCH_BODY = 'page_home:section__arch__body';

/**
 * @description Demo deployment section title
 * @localZh 当前部署：Supabase Auth 登录
 * @localEn This deployment: Supabase Auth sign-in
 */
export const PAGE_HOME_SECTION_DEMO_TITLE = 'page_home:section__demo__title';

/**
 * @description Demo deployment section body
 * @localZh 当前实例通过 SupabaseOAuthProvider 接入 Supabase Auth，支持 GitHub、Google 第三方登录以及邮箱密码、手机验证码、邮箱 Magic Link 等多种方式。OAuth 协议面（authorize、token、userinfo）保持不变，第三方应用可无缝对接。
 * @localEn This instance uses SupabaseOAuthProvider with Supabase Auth, supporting GitHub and Google sign-in along with email/password, phone OTP, email Magic Link and more. The OAuth surface (authorize, token, userinfo) remains consistent for seamless third-party app integration.
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
