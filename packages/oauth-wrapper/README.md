# @qlover/oauth-wrapper

> English: [README_EN.md](./README_EN.md)

与上游登录 API 无关的 **OAuth 2.0 授权服务器协议内核**：授权码流、PKCE、consent 编排、换票、`userinfo` 映射、OAuth Client 管理逻辑。

通过 Port 接口接入任意用户系统（`OAuthUserAdapterInterface`）、持久化（`OAuthWrapperRepositoryInterface`）与会话（`OAuthSessionInterface`）。本包**不包含**具体 Adapter、数据库实现或 Web 框架路由。

## 安装

```bash
pnpm add @qlover/oauth-wrapper zod
```

## 快速开始

```ts
import {
  OAuthWrapperService,
  OAuthTokenService,
  OAuthClientsService,
  type OAuthUserAdapterInterface,
  type OAuthWrapperRepositoryInterface,
  type OAuthSessionInterface,
  OAuthRfcCodes
} from '@qlover/oauth-wrapper';
```

实现三个 Port 后，组装 `OAuthWrapperService` 即可挂载到任意 HTTP 框架（Next.js、Express 等）。

## 模块

| 路径 | 说明 |
| ---- | ---- |
| `OAuthWrapperService` | 授权页解析、`processConsent`、换票委托、`getUserInfo` |
| `OAuthTokenService` | `authorization_code` / `refresh_token` 换票 |
| `OAuthClientsService` | 开发者控制台 Client CRUD |
| `schema/` | Zod Schema 与类型 |
| `utils/` | PKCE、redirect、client secret hash |

完整示例见 monorepo 内 `examples/next-oauth-wrapper`。
