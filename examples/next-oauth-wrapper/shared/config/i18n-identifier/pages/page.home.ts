/**
 * @description Home page title
 * @localZh Next OAuth Wrapper
 * @localEn Next OAuth Wrapper
 */
export const PAGE_HOME_TITLE = 'page_home:title';

/**
 * @description Home page meta description
 * @localZh 通用 OAuth 2.0 授权包装层，可接入任意上游登录 API
 * @localEn Universal OAuth 2.0 wrapper for any upstream login API
 */
export const PAGE_HOME_DESCRIPTION = 'page_home:description';

/**
 * @description Home page keywords
 * @localZh OAuth 2.0, 授权服务器, 登录 API, Next OAuth Wrapper
 * @localEn OAuth 2.0, authorization server, login API, Next OAuth Wrapper
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
 * @localZh 通用 OAuth 2.0 授权包装层
 * @localEn Universal OAuth 2.0 wrapper
 */
export const PAGE_HOME_HERO_BADGE = 'page_home:hero__badge';

/**
 * @description Hero title line 1
 * @localZh 任意登录 API
 * @localEn Any login API
 */
export const PAGE_HOME_HERO_TITLE1 = 'page_home:hero__title1';

/**
 * @description Hero title line 2
 * @localZh 变成 OAuth 服务端
 * @localEn becomes your OAuth server
 */
export const PAGE_HOME_HERO_TITLE2 = 'page_home:hero__title2';

/**
 * @description Hero description
 * @localZh 将现有用户/登录体系包装为标准 OAuth 2.0 授权服务器（授权码 + PKCE、refresh_token、userinfo）。第三方应用只需对接 OAuth，无需直接接触你的账号密码；上游登录能力通过可替换的 Provider 适配器接入。
 * @localEn Wrap your existing user/login API as a standards-compliant OAuth 2.0 authorization server (authorization code + PKCE, refresh_token, userinfo). Third-party apps integrate via OAuth only—credentials stay with your upstream provider through a swappable adapter.
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
 * @localZh 通用 OAuth 内核
 * @localEn Generic OAuth core
 */
export const PAGE_HOME_FEATURE1_TITLE = 'page_home:feature1__title';

/**
 * @description Feature 1 description
 * @localZh shared/oauth-wrapper 实现 RFC 授权码、PKCE、换票与客户端管理，与具体登录 API 无关。
 * @localEn shared/oauth-wrapper implements RFC flows, PKCE, token exchange, and client registry—provider-agnostic.
 */
export const PAGE_HOME_FEATURE1_DESC = 'page_home:feature1__desc';

/**
 * @description Feature 2 label
 * @localZh 可插拔登录 Provider
 * @localEn Pluggable login provider
 */
export const PAGE_HOME_FEATURE2_TITLE = 'page_home:feature2__title';

/**
 * @description Feature 2 description
 * @localZh 通过 OAuthUserAdapter 对接任意上游；本仓库 demo-oauth 目录提供参考实现。
 * @localEn Plug in any upstream via OAuthUserAdapter; this repo ships a reference under oauth-wrapper.
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
 * @localEn How this repo is split
 */
export const PAGE_HOME_SECTION_ARCH_TITLE = 'page_home:section__arch__title';

/**
 * @description Architecture section body
 * @localZh shared/oauth-wrapper 是通用 OAuth 授权服务器逻辑；oauth-wrapper 是本示例的装配层（会话 cookie、登录编排、Supabase 仓储）。换登录 API 时主要替换 demo-oauth 中的 Provider 适配器并调整 IOC 绑定，内核尽量保持不变。
 * @localEn shared/oauth-wrapper is the reusable OAuth server core. oauth-wrapper is this example’s wiring (session cookie, login orchestration, Supabase repository). To use another login API, replace the provider adapter under demo-oauth and rebind IOC—the core stays stable.
 */
export const PAGE_HOME_SECTION_ARCH_BODY = 'page_home:section__arch__body';

/**
 * @description Demo deployment section title
 * @localZh 本示例部署：Brain User 登录
 * @localEn This deployment: Brain User login
 */
export const PAGE_HOME_SECTION_DEMO_TITLE = 'page_home:section__demo__title';

/**
 * @description Demo deployment section body
 * @localZh 当前运行的示例在 oauth-wrapper 中接入了 Brain User API（BrainUserAdapter），环境变量 OAUTH_WRAPPER_API_BASE 指向上游地址。这只是演示一种 Provider；你的 fork 可以换成 Keycloak、自建 REST 等，无需修改 OAuth 协议面。
 * @localEn This running example uses Brain User API via BrainUserAdapter under oauth-wrapper (see OAUTH_WRAPPER_API_BASE). It is one reference provider—your fork can swap in Keycloak, a custom REST API, etc., without changing the OAuth surface.
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
 * @localZh 终端用户登录（示例 Provider）
 * @localEn End-user sign-in (example provider)
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
 * @localZh 通用 OAuth 2.0 授权包装层
 * @localEn Universal OAuth 2.0 authorization wrapper
 */
export const PAGE_HOME_FOOTER_TAGLINE = 'page_home:footer__tagline';
