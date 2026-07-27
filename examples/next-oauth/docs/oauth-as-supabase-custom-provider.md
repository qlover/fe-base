# next-oauth：作为 IdP 对接 Supabase Custom Auth Provider

本文记录模板作为 **OAuth 授权服务器**（Developer Apps / oauth-wrapper）时，被其它项目的 Supabase Custom Provider 消费所需的约定。  
PDC ↔ PAM 完整联调踩坑见 PDC 仓库 `apps/web/docs/pam-oauth-login-troubleshooting.md`。

## 1. Token / Userinfo 必须返回扁平 RFC JSON

标准 OAuth 客户端（含 Supabase Auth）期望：

```json
{ "access_token": "...", "token_type": "Bearer", "expires_in": 3600, "refresh_token": "..." }
```

失败时：

```json
{ "error": "invalid_grant", "error_description": "..." }
```

**不要**再包一层 App API 信封 `{ "success": true, "data": { ... } }`，否则会出现：

`Unable to exchange external code: xxxx`

本模板通过 `NextApiServer.runWithOAuthJson` 输出扁平响应，用于：

- `POST /oauth/token`
- `GET /oauth/userinfo`（claims：`sub` / `email` / `email_verified` / `name`）
- `POST /oauth/revoke`

Playground 使用 `readOAuthMachineJson` 解析上述端点。

## 2. 两套「OAuth 应用」不要混用

| 位置 | 角色 |
| --- | --- |
| 本站 **Developer → Apps** | 本站 oauth-wrapper 的 Client 登记（`/oauth/authorize`） |
| 本站 **上游 Supabase → OAuth Apps** | Supabase 原生 OAuth Server（另一套端点） |
| 消费方 **Supabase → Custom Auth Provider** | 消费方把本站当 IdP（`custom:my-idp`） |

消费方 Custom Provider 的 Client ID/Secret 必须来自本站 **Developer Apps**，`redirect_uri` 必须是消费方 Supabase 的：

`https://<consumer-ref>.supabase.co/auth/v1/callback`

Authorization URL 建议带 locale：`/{locale}/oauth/authorize`；Token / Userinfo **无** locale。

## 3. 消费方 SSO 回调错误处理

`/api/callback/provider-login` 在只有 `error` / `error_description`（无 `code`）时应重定向到登录页并展示错误，避免 Zod 强制 `code: string` 误报。

`SITE_URL` 末尾若带 `/`，拼接 `/api/...` 时会得到 `//api`；`loginWithProvider` 应 strip 后再拼。

## 4. Preview 部署注意

若消费方 Supabase 要调 Preview 的 `/oauth/token`，须关闭 Vercel **Deployment Protection → Require Log In**。  
浏览器能登录 ≠ 机房能 POST；Protection Bypass header Supabase 换票时加不了。

## 5. 扩展 Custom SSO 按钮（可选）

在 `loginProviders` 增加展示名后，于 `resolveSupabaseOAuthProvider` 映射到 `custom:your-id`（见 `shared/config/common.ts`），再在消费方/本站上游 Supabase Dashboard 配置对应 Custom Provider。
