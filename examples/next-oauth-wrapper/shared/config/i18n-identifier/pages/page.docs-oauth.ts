/**
 * @description OAuth integration docs page title
 * @localZh OAuth 集成文档
 * @localEn OAuth Integration Guide
 */
export const PAGE_DOCS_OAUTH_TITLE = 'page_docs_oauth:title';

/**
 * @description OAuth docs meta description
 * @localZh 通用 OAuth 包装层集成指南：授权码流程、端点与可插拔登录 Provider
 * @localEn Integration guide for the universal OAuth wrapper: flows, endpoints, and pluggable providers
 */
export const PAGE_DOCS_OAUTH_DESCRIPTION = 'page_docs_oauth:description';

/**
 * @description OAuth docs content label
 * @localZh OAuth 文档
 * @localEn OAuth docs
 */
export const PAGE_DOCS_OAUTH_CONTENT = 'page_docs_oauth:content';

/**
 * @description OAuth docs keywords
 * @localZh OAuth 2.0, 授权码, PKCE, token, userinfo
 * @localEn OAuth 2.0, authorization code, PKCE, token, userinfo
 */
export const PAGE_DOCS_OAUTH_KEYWORDS = 'page_docs_oauth:keywords';

/**
 * @description Page intro
 * @localZh 本文说明第三方应用如何接入本项目的通用 OAuth 2.0 授权包装层，以及本仓库示例中 demo-oauth（Brain User 登录）的部署方式。
 * @localEn How third-party apps integrate with this universal OAuth 2.0 wrapper, and how the demo-oauth reference deployment (Brain User login) is wired in this repo.
 */
export const PAGE_DOCS_OAUTH_INTRO = 'page_docs_oauth:intro';

/**
 * @description Architecture section title
 * @localZh 架构：通用内核与示例装配
 * @localEn Architecture: core vs example wiring
 */
export const PAGE_DOCS_OAUTH_SECTION_ARCHITECTURE =
  'page_docs_oauth:section__architecture';

/**
 * @description Architecture body
 * @localZh shared/oauth-wrapper 提供与上游登录 API 无关的 OAuth 2.0 服务（authorize、consent、token、PKCE、userinfo）。oauth-wrapper 负责会话、登录编排与持久化；通过实现 OAuthUserAdapterInterface 接入任意上游。本站点运行的是 demo-oauth 中的一种实现（BrainUserAdapter），并非协议本身的限制。
 * @localEn shared/oauth-wrapper is provider-agnostic OAuth 2.0 logic. oauth-wrapper handles sessions, login orchestration, and storage; you integrate upstream systems via OAuthUserAdapterInterface. This site runs one reference adapter (BrainUserAdapter)—that is not a protocol limitation.
 */
export const PAGE_DOCS_OAUTH_ARCHITECTURE_BODY =
  'page_docs_oauth:architecture__body';

/**
 * @description Demo provider section title
 * @localZh 本示例：demo-oauth + Brain User
 * @localEn This example: demo-oauth + Brain User
 */
export const PAGE_DOCS_OAUTH_SECTION_DEMO = 'page_docs_oauth:section__demo';

/**
 * @description Demo provider body
 * @localZh 终端用户通过 POST /api/oauth/verify 使用邮箱密码登录（由 DemoAuthService 调用 BrainUserAdapter）。授权页与换票流程与 Provider 无关。配置 OAUTH_WRAPPER_API_BASE、SESSION_SECRET、ENCRYPTION_KEY 等见 .env.template。替换 Provider 时修改 oauth-wrapper 与 serverIoc 绑定即可。
 * @localEn End users sign in with email/password via POST /api/oauth/verify (DemoAuthService → BrainUserAdapter). Authorize and token endpoints are provider-agnostic. See .env.template for OAUTH_WRAPPER_API_BASE and secrets. To swap providers, change oauth-wrapper and IOC bindings.
 */
export const PAGE_DOCS_OAUTH_DEMO_BODY = 'page_docs_oauth:demo__body';

/**
 * @description Overview section title
 * @localZh 协议概览
 * @localEn Protocol overview
 */
export const PAGE_DOCS_OAUTH_SECTION_OVERVIEW =
  'page_docs_oauth:section__overview';

/**
 * @description Overview body
 * @localZh 对外暴露标准 OAuth 2.0 授权码模式（RFC 6749），支持机密客户端与公共客户端（公共客户端须 PKCE）。返回给第三方的 access_token 来自上游 Provider（示例为 Brain 签发的 JWT）；本包装层还维护独立的 wrapper refresh_token 用于第三方客户端刷新。
 * @localEn Exposes the OAuth 2.0 authorization code grant (RFC 6749) for confidential and public clients (PKCE for public). access_token returned to clients comes from the upstream provider (Brain JWT in the demo); the wrapper also issues its own refresh_token for third-party refresh grants.
 */
export const PAGE_DOCS_OAUTH_OVERVIEW_BODY = 'page_docs_oauth:overview__body';

/**
 * @description Flow section title
 * @localZh 授权码流程
 * @localEn Authorization code flow
 */
export const PAGE_DOCS_OAUTH_SECTION_FLOW = 'page_docs_oauth:section__flow';

/**
 * @description Flow step 1
 * @localZh 在开发者控制台创建应用，配置 redirect_uri（须 HTTPS，localhost 除外）。
 * @localEn Create an app in the developer console and register redirect_uri values (HTTPS required except localhost).
 */
export const PAGE_DOCS_OAUTH_FLOW_STEP1 = 'page_docs_oauth:flow__step1';

/**
 * @description Flow step 2
 * @localZh 将用户重定向到 GET /oauth/authorize，携带 client_id、redirect_uri、response_type=code，公共客户端须附带 PKCE 参数。
 * @localEn Redirect the user to GET /oauth/authorize with client_id, redirect_uri, response_type=code; public clients must include PKCE parameters.
 */
export const PAGE_DOCS_OAUTH_FLOW_STEP2 = 'page_docs_oauth:flow__step2';

/**
 * @description Flow step 3
 * @localZh 终端用户先在站点登录（本示例：POST /api/oauth/verify），再在授权页同意；浏览器携带 ?code=...&state=... 回到 redirect_uri。
 * @localEn The end user signs in on this site (this demo: POST /api/oauth/verify), grants consent, then the browser returns to redirect_uri with ?code=...&state=....
 */
export const PAGE_DOCS_OAUTH_FLOW_STEP3 = 'page_docs_oauth:flow__step3';

/**
 * @description Flow step 4
 * @localZh 服务端用授权码调用 POST /oauth/token，获得 access_token（及可选 refresh_token）。
 * @localEn Your backend calls POST /oauth/token with the code to obtain access_token (and optional refresh_token).
 */
export const PAGE_DOCS_OAUTH_FLOW_STEP4 = 'page_docs_oauth:flow__step4';

/**
 * @description Flow step 5
 * @localZh 使用 Bearer access_token 调用 GET /userinfo 获取用户标识与资料。
 * @localEn Call GET /userinfo with Bearer access_token to load the user profile.
 */
export const PAGE_DOCS_OAUTH_FLOW_STEP5 = 'page_docs_oauth:flow__step5';

/**
 * @description Endpoints section title
 * @localZh 端点一览
 * @localEn Endpoints
 */
export const PAGE_DOCS_OAUTH_SECTION_ENDPOINTS =
  'page_docs_oauth:section__endpoints';

/**
 * @description Authorize endpoint row
 * @localZh 授权（浏览器）
 * @localEn Authorize (browser)
 */
export const PAGE_DOCS_OAUTH_ENDPOINT_AUTHORIZE =
  'page_docs_oauth:endpoint__authorize';

/**
 * @description Authorize endpoint description
 * @localZh 展示同意页；未登录会跳转登录后再回到本 URL。
 * @localEn Consent UI; unauthenticated users are sent to login then returned here.
 */
export const PAGE_DOCS_OAUTH_ENDPOINT_AUTHORIZE_DESC =
  'page_docs_oauth:endpoint__authorize__desc';

/**
 * @description Token endpoint row
 * @localZh 令牌（服务端）
 * @localEn Token (server)
 */
export const PAGE_DOCS_OAUTH_ENDPOINT_TOKEN = 'page_docs_oauth:endpoint__token';

/**
 * @description Token endpoint description
 * @localZh grant_type=authorization_code 或 refresh_token；支持 Basic 或表单客户端认证。
 * @localEn grant_type=authorization_code or refresh_token; client auth via Basic or form body.
 */
export const PAGE_DOCS_OAUTH_ENDPOINT_TOKEN_DESC =
  'page_docs_oauth:endpoint__token__desc';

/**
 * @description Userinfo endpoint row
 * @localZh 用户信息（服务端）
 * @localEn Userinfo (server)
 */
export const PAGE_DOCS_OAUTH_ENDPOINT_USERINFO =
  'page_docs_oauth:endpoint__userinfo';

/**
 * @description Login verify endpoint row
 * @localZh 终端用户登录（服务端）
 * @localEn End-user sign-in (server)
 */
export const PAGE_DOCS_OAUTH_ENDPOINT_VERIFY =
  'page_docs_oauth:endpoint__verify';

/**
 * @description Login verify endpoint description
 * @localZh 邮箱/密码登录，建立授权页所需会话；由 demo-oauth 编排，非 OAuth 客户端调用。
 * @localEn Email/password sign-in for the consent UI session; demo-oauth orchestration—not for OAuth clients.
 */
export const PAGE_DOCS_OAUTH_ENDPOINT_VERIFY_DESC =
  'page_docs_oauth:endpoint__verify__desc';

/**
 * @description Userinfo endpoint description
 * @localZh 需要 Authorization: Bearer；返回 sub、email、name 等声明。
 * @localEn Requires Authorization: Bearer; returns sub, email, name, and related claims.
 */
export const PAGE_DOCS_OAUTH_ENDPOINT_USERINFO_DESC =
  'page_docs_oauth:endpoint__userinfo__desc';

/**
 * @description Authorize request section title
 * @localZh 授权请求
 * @localEn Authorization request
 */
export const PAGE_DOCS_OAUTH_SECTION_AUTHORIZE =
  'page_docs_oauth:section__authorize';

/**
 * @description Authorize query params note
 * @localZh 必填：response_type=code、client_id、redirect_uri（须在应用白名单内）。可选：scope、state；公共客户端必填 code_challenge 与 code_challenge_method=S256。
 * @localEn Required: response_type=code, client_id, redirect_uri (must match a registered URI). Optional: scope, state; public clients require code_challenge and code_challenge_method=S256.
 */
export const PAGE_DOCS_OAUTH_AUTHORIZE_PARAMS =
  'page_docs_oauth:authorize__params';

/**
 * @description Token section title
 * @localZh 令牌交换
 * @localEn Token exchange
 */
export const PAGE_DOCS_OAUTH_SECTION_TOKEN = 'page_docs_oauth:section__token';

/**
 * @description Authorization code grant subtitle
 * @localZh 授权码换票
 * @localEn Exchange authorization code
 */
export const PAGE_DOCS_OAUTH_TOKEN_AUTH_CODE =
  'page_docs_oauth:token__auth__code';

/**
 * @description Refresh token grant subtitle
 * @localZh 刷新令牌
 * @localEn Refresh token
 */
export const PAGE_DOCS_OAUTH_TOKEN_REFRESH = 'page_docs_oauth:token__refresh';

/**
 * @description PKCE section title
 * @localZh PKCE（公共客户端）
 * @localEn PKCE (public clients)
 */
export const PAGE_DOCS_OAUTH_SECTION_PKCE = 'page_docs_oauth:section__pkce';

/**
 * @description PKCE body
 * @localZh 授权前生成 code_verifier，将 S256 摘要作为 code_challenge 传给授权端点；换票时在 POST /oauth/token 中提交 code_verifier。机密客户端可省略 PKCE。
 * @localEn Generate code_verifier before authorize, pass its S256 digest as code_challenge, then send code_verifier when exchanging the code. Confidential clients may omit PKCE.
 */
export const PAGE_DOCS_OAUTH_PKCE_BODY = 'page_docs_oauth:pkce__body';

/**
 * @description Userinfo section title
 * @localZh 用户信息
 * @localEn Userinfo
 */
export const PAGE_DOCS_OAUTH_SECTION_USERINFO =
  'page_docs_oauth:section__userinfo';

/**
 * @description Userinfo body
 * @localZh 成功时返回 JSON：sub（用户 ID）、email、name，以及可选 roles。无效或过期令牌返回 401 与 error=invalid_token。
 * @localEn Success returns JSON with sub (user id), email, name, and optional roles. Invalid or expired tokens yield 401 with error=invalid_token.
 */
export const PAGE_DOCS_OAUTH_USERINFO_BODY = 'page_docs_oauth:userinfo__body';

/**
 * @description Errors section title
 * @localZh 错误响应
 * @localEn Error responses
 */
export const PAGE_DOCS_OAUTH_SECTION_ERRORS = 'page_docs_oauth:section__errors';

/**
 * @description Errors body
 * @localZh 授权错误通过 redirect_uri 查询参数 error、error_description 返回；令牌与用户信息的错误为 JSON（如 invalid_request、invalid_grant、invalid_client、invalid_token）。
 * @localEn Authorization errors redirect with error and error_description query params; token and userinfo errors are JSON (e.g. invalid_request, invalid_grant, invalid_client, invalid_token).
 */
export const PAGE_DOCS_OAUTH_ERRORS_BODY = 'page_docs_oauth:errors__body';

/**
 * @description Link to playground
 * @localZh 在站内测试完整流程
 * @localEn Try the in-app playground
 */
export const PAGE_DOCS_OAUTH_LINK_PLAYGROUND =
  'page_docs_oauth:link__playground';

/**
 * @description Link to OpenAPI reference
 * @localZh 打开 OpenAPI 参考
 * @localEn Open API reference
 */
export const PAGE_DOCS_OAUTH_LINK_API = 'page_docs_oauth:link__api';

/**
 * @description Link to developer console
 * @localZh 管理 OAuth 应用
 * @localEn Manage OAuth apps
 */
export const PAGE_DOCS_OAUTH_LINK_DEVELOPER = 'page_docs_oauth:link__developer';
