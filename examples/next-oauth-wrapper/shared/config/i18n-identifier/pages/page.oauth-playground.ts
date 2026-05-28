/**
 * @description OAuth playground page title
 * @localZh OAuth 流程测试
 * @localEn OAuth Flow Playground
 */
export const PAGE_OAUTH_PLAYGROUND_TITLE = 'page_oauth_playground:title';

/**
 * @description OAuth playground meta description
 * @localZh 在站内调试通用 OAuth 包装层完整流程（本示例使用 Brain User 登录）
 * @localEn Debug the full universal OAuth wrapper flow in-app (this demo uses Brain User login)
 */
export const PAGE_OAUTH_PLAYGROUND_DESCRIPTION =
  'page_oauth_playground:description';

/**
 * @description OAuth playground content
 * @localZh OAuth 测试台
 * @localEn OAuth playground
 */
export const PAGE_OAUTH_PLAYGROUND_CONTENT = 'page_oauth_playground:content';

/**
 * @description OAuth playground keywords
 * @localZh OAuth, 测试, 授权
 * @localEn OAuth, test, authorization
 */
export const PAGE_OAUTH_PLAYGROUND_KEYWORDS = 'page_oauth_playground:keywords';

/**
 * @description Page intro
 * @localZh 使用已注册客户端的真实参数，在站内完成授权、换票与 userinfo（不跳转到外部 redirect_uri）。步骤 1 需先用本示例的登录页或 POST /api/oauth/verify 建立会话（demo-oauth 接 Brain User）；OAuth 协议步骤本身与上游 Provider 无关。
 * @localEn Use real registered-client parameters to authorize, exchange tokens, and call userinfo without an external redirect. Step 1 requires a session via the login page or POST /api/oauth/verify (demo-oauth + Brain User in this repo); the OAuth steps themselves are provider-agnostic.
 */
export const PAGE_OAUTH_PLAYGROUND_INTRO = 'page_oauth_playground:intro';

/**
 * @description Demo provider note banner
 * @localZh 提示：当前站点示例在 oauth-wrapper 中使用 Brain User 作为上游登录 API；你 fork 时可替换为任意 Provider。
 * @localEn Note: this deployment uses Brain User under oauth-wrapper as the upstream login API—you can swap any provider in your fork.
 */
export const PAGE_OAUTH_PLAYGROUND_DEMO_NOTE =
  'page_oauth_playground:demo__note';

/**
 * @description Step: session
 * @localZh 1. 登录会话
 * @localEn 1. Session
 */
export const PAGE_OAUTH_PLAYGROUND_STEP_SESSION =
  'page_oauth_playground:step__session';

/**
 * @description Step: client
 * @localZh 2. 选择客户端
 * @localEn 2. Client
 */
export const PAGE_OAUTH_PLAYGROUND_STEP_CLIENT =
  'page_oauth_playground:step__client';

/**
 * @description Step: authorize
 * @localZh 3. 授权确认
 * @localEn 3. Authorization
 */
export const PAGE_OAUTH_PLAYGROUND_STEP_AUTHORIZE =
  'page_oauth_playground:step__authorize';

/**
 * @description Step: token
 * @localZh 4. 换取 Token
 * @localEn 4. Token
 */
export const PAGE_OAUTH_PLAYGROUND_STEP_TOKEN =
  'page_oauth_playground:step__token';

/**
 * @description Step: userinfo
 * @localZh 5. Userinfo
 * @localEn 5. Userinfo
 */
export const PAGE_OAUTH_PLAYGROUND_STEP_USERINFO =
  'page_oauth_playground:step__userinfo';

/**
 * @description Logged in as
 * @localZh 当前登录
 * @localEn Signed in as
 */
export const PAGE_OAUTH_PLAYGROUND_SIGNED_IN_AS =
  'page_oauth_playground:signed__in__as';

/**
 * @description Login required
 * @localZh 请先登录（/auth/login 或 /api/oauth/verify）后再模拟授权。
 * @localEn Sign in first (/auth/login or /api/oauth/verify) before simulating authorization.
 */
export const PAGE_OAUTH_PLAYGROUND_LOGIN_REQUIRED =
  'page_oauth_playground:login__required';

/**
 * @description Go to login
 * @localZh 去登录
 * @localEn Sign in
 */
export const PAGE_OAUTH_PLAYGROUND_GO_LOGIN = 'page_oauth_playground:go__login';

/**
 * @description Client label
 * @localZh 客户端
 * @localEn Client
 */
export const PAGE_OAUTH_PLAYGROUND_CLIENT_LABEL =
  'page_oauth_playground:client__label';

/**
 * @description Redirect URI label
 * @localZh redirect_uri
 * @localEn redirect_uri
 */
export const PAGE_OAUTH_PLAYGROUND_REDIRECT_LABEL =
  'page_oauth_playground:redirect__label';

/**
 * @description Scope label
 * @localZh scope
 * @localEn scope
 */
export const PAGE_OAUTH_PLAYGROUND_SCOPE_LABEL =
  'page_oauth_playground:scope__label';

/**
 * @description State label
 * @localZh state（可选）
 * @localEn state (optional)
 */
export const PAGE_OAUTH_PLAYGROUND_STATE_LABEL =
  'page_oauth_playground:state__label';

/**
 * @description Client secret label
 * @localZh client_secret
 * @localEn client_secret
 */
export const PAGE_OAUTH_PLAYGROUND_SECRET_LABEL =
  'page_oauth_playground:secret__label';

/**
 * @description Validate params button
 * @localZh 校验参数
 * @localEn Validate parameters
 */
export const PAGE_OAUTH_PLAYGROUND_VALIDATE = 'page_oauth_playground:validate';

/**
 * @description Authorize URL label
 * @localZh 授权 URL（真实参数）
 * @localEn Authorize URL (real params)
 */
export const PAGE_OAUTH_PLAYGROUND_AUTHORIZE_URL =
  'page_oauth_playground:authorize__url';

/**
 * @description Allow button
 * @localZh 模拟允许
 * @localEn Simulate allow
 */
export const PAGE_OAUTH_PLAYGROUND_ALLOW = 'page_oauth_playground:allow';

/**
 * @description Deny button
 * @localZh 模拟拒绝
 * @localEn Simulate deny
 */
export const PAGE_OAUTH_PLAYGROUND_DENY = 'page_oauth_playground:deny';

/**
 * @description Exchange token button
 * @localZh 换取 access_token
 * @localEn Exchange access_token
 */
export const PAGE_OAUTH_PLAYGROUND_EXCHANGE = 'page_oauth_playground:exchange';

/**
 * @description Fetch userinfo button
 * @localZh 请求 userinfo
 * @localEn Fetch userinfo
 */
export const PAGE_OAUTH_PLAYGROUND_FETCH_USERINFO =
  'page_oauth_playground:fetch__userinfo';

/**
 * @description Callback result label
 * @localZh 模拟回调结果（未外跳）
 * @localEn Simulated callback (no redirect)
 */
export const PAGE_OAUTH_PLAYGROUND_CALLBACK = 'page_oauth_playground:callback';

/**
 * @description Response label
 * @localZh 响应
 * @localEn Response
 */
export const PAGE_OAUTH_PLAYGROUND_RESPONSE = 'page_oauth_playground:response';

/**
 * @description Validation ok
 * @localZh 参数有效，可进行授权。
 * @localEn Parameters are valid. You can authorize.
 */
export const PAGE_OAUTH_PLAYGROUND_VALID_OK = 'page_oauth_playground:valid__ok';

/**
 * @description Copy
 * @localZh 复制
 * @localEn Copy
 */
export const PAGE_OAUTH_PLAYGROUND_COPY = 'page_oauth_playground:copy';

/**
 * @description Random state
 * @localZh 随机 state
 * @localEn Random state
 */
export const PAGE_OAUTH_PLAYGROUND_RANDOM_STATE =
  'page_oauth_playground:random__state';

/**
 * @description Developer apps link
 * @localZh OAuth 测试台
 * @localEn OAuth playground
 */
export const PAGE_OAUTH_PLAYGROUND_NAV_LINK = 'page_oauth_playground:nav__link';

/**
 * @description Footer note about simulated redirect
 * @localZh 仅在站内模拟回调，不会跳转到外部 redirect_uri。
 * @localEn Simulated callback only — no navigation to external redirect_uri.
 */
export const PAGE_OAUTH_PLAYGROUND_SIMULATED_NOTE =
  'page_oauth_playground:simulated__note';

/**
 * @description PKCE section title
 * @localZh PKCE（公共客户端）
 * @localEn PKCE (public client)
 */
export const PAGE_OAUTH_PLAYGROUND_PKCE_TITLE =
  'page_oauth_playground:pkce__title';

/**
 * @description PKCE mode badge when active
 * @localZh 已启用 PKCE 测试
 * @localEn PKCE test enabled
 */
export const PAGE_OAUTH_PLAYGROUND_PKCE_ENABLED =
  'page_oauth_playground:pkce__enabled';

/**
 * @description code_verifier label
 * @localZh code_verifier
 * @localEn code_verifier
 */
export const PAGE_OAUTH_PLAYGROUND_PKCE_VERIFIER =
  'page_oauth_playground:pkce__verifier';

/**
 * @description code_challenge label
 * @localZh code_challenge (S256)
 * @localEn code_challenge (S256)
 */
export const PAGE_OAUTH_PLAYGROUND_PKCE_CHALLENGE =
  'page_oauth_playground:pkce__challenge';

/**
 * @description Regenerate PKCE pair button
 * @localZh 重新生成 PKCE
 * @localEn Regenerate PKCE
 */
export const PAGE_OAUTH_PLAYGROUND_PKCE_REGENERATE =
  'page_oauth_playground:pkce__regenerate';

/**
 * @description PKCE hint for public clients
 * @localZh 公共客户端自动使用 PKCE；换票时提交 code_verifier，无需 client_secret。
 * @localEn Public clients use PKCE automatically; exchange tokens with code_verifier (no client_secret).
 */
export const PAGE_OAUTH_PLAYGROUND_PKCE_HINT =
  'page_oauth_playground:pkce__hint';

/**
 * @description Optional PKCE toggle for confidential clients
 * @localZh 可选：测试 PKCE（机密客户端）
 * @localEn Optional: test PKCE (confidential client)
 */
export const PAGE_OAUTH_PLAYGROUND_PKCE_OPTIONAL =
  'page_oauth_playground:pkce__optional';

/**
 * @description Client type label in playground
 * @localZh 客户端类型
 * @localEn Client type
 */
export const PAGE_OAUTH_PLAYGROUND_CLIENT_TYPE =
  'page_oauth_playground:client__type';
