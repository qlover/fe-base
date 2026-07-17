# Next Seed（`examples/next-seed`）

> English: [README.en.md](./README.en.md)

**模板定位**：基于 Next.js 16 的精简应用壳（App Router 为主，另含 Pages Router `/admin` 示例），开箱包含 **主题**、**国际化**、**登录/注册/会话**。

> 这不是 OAuth 2.0 授权服务器示例（无 `/oauth/authorize`、`/oauth/token`、开发者控制台或客户端管理）。OAuth AS 请看 `examples/next-oauth`。

## 包含内容

- **主题**：亮色 / 暗色切换（`ThemeSwitcher`），基于 `@wrksz/themes`、`@qlover/tailwind-theme` 与 Tailwind CSS
- **国际化**：`next-intl`，项目内 `i18n-identifier` / `i18n-mapping` 约定，`en` / `zh` 带 locale 前缀路由
- **鉴权**：基于 Supabase Auth 的邮箱密码登录与注册、邮箱/手机 OTP、第三方登录（GitHub / Google SSO），以及 HttpOnly JWT 会话 Cookie
- **简单后台**：`/admin` 模板页（Pages Router），需登录后访问

## 不包含

- OAuth 授权服务器 / 客户端 / Playground
- `@qlover/oauth-wrapper`
- 请求日志、AI、Swagger 等扩展能力（完整示例见 `next-oauth`）

## 技术栈

| 类别       | 技术                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| 框架       | Next.js 16、App Router（主）+ Pages Router（`/admin`）、React 19                  |
| 鉴权与数据 | Supabase（`@supabase/supabase-js`、`@supabase/ssr`）；HttpOnly 会话 Cookie（JWT） |
| 校验       | Zod                                                                               |
| UI         | Tailwind CSS 4 + 自研组件（Heroicons、sonner）；部分页面使用 antd                 |
| i18n       | next-intl                                                                         |
| DI         | Inversify、自研 `SimpleIOCContainer`                                              |
| 状态       | zustand / `@qlover/slice-store-react`                                             |
| 质量       | TypeScript、ESLint 10、Prettier、Vitest                                           |

**运行时：** Node.js `^20.19.0` 或 `^22.13.0` / `>=24`，npm `>=10.0.0`（见 `package.json` 的 `engines`）。

## 快速开始

在 monorepo 根目录：

```bash
pnpm --filter examples/next-seed install
cp examples/next-seed/.env.template examples/next-seed/.env.local
# 按注释填写 Supabase 与 SESSION_* 等变量
```

**必填环境变量**（完整列表见 `.env.template`）：

| 变量                                           | 用途                                |
| ---------------------------------------------- | ----------------------------------- |
| `SITE_URL` / `NEXT_PUBLIC_SITE_URL`            | 站点对外 URL                        |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY`           | Supabase 项目连接                   |
| `SESSION_SECRET`                               | 签发 HttpOnly 登录会话 Cookie       |
| `SESSION_KEY`（兼容别名：`OAUTH_SESSION_KEY`） | 会话 Cookie 名称                    |
| `NEXT_PUBLIC_STRING_ENCRYPT_KEY`               | 登录/注册表单密码字段加解密共用密钥 |

如需基础表结构，可在 Supabase SQL 编辑器执行 `makes/sql/001-base-tables.sql`，然后：

```bash
pnpm --filter examples/next-seed dev          # http://localhost:3010
pnpm --filter examples/next-seed start        # 构建后默认 3011
```

常用脚本：`type-check`、`test`（Vitest）、`lint`、`format` — 详见 `package.json`。

默认端口：**3010**（dev）、**3011**（start）。

## 目录结构

```
server/   # 后端：controllers、services、providers（SupabaseAuthProvider）、repositorys、IOC
src/      # 前端：app/（App Router 页面 + API）、pages/（Pages Router，如 /admin）、uikit/、impls/
shared/   # 前后端共用：config（路由、i18n）、interfaces、schemas、validators
```

- **路由常量**：`shared/config/route.ts`、`shared/config/apiRoutes.ts`（后者由 `tools/generateApiRoutes.ts` 在 `next dev` / `build` 时自动生成，勿手改）
- **i18n 约定**：`shared/config/i18n-identifier/`（带 `@localZh` / `@localEn` 的文案键）→ `shared/config/i18n-mapping/`（页面/组件所需子集）。说明见 [docs/i18n.md](./docs/i18n.md)
- **鉴权实现**：`server/providers/SupabaseAuthProvider.ts`、`server/services/SessionService.ts`、`server/services/AuthUserService.ts`

## 页面与接口

| 路径                                                    | 说明                               |
| ------------------------------------------------------- | ---------------------------------- |
| `/[locale]`                                             | 首页（主题 / i18n / 鉴权能力概览） |
| `/[locale]/auth/login`、`/[locale]/auth/register`       | 登录 / 注册                        |
| `/[locale]/admin`                                       | 简单后台模板                       |
| `/api/user/login`、`/register`、`/logout`、`/session`   | 鉴权 API                           |
| `/api/user/otp/login`、`/otp/verify`                    | 邮箱/手机 OTP 登录                 |
| `/api/user/login/provider`                              | 第三方登录（Supabase SSO）         |
| `/api/callback/email-login`、`/callback/provider-login` | 登录回调                           |
| `/api/locales/json`                                     | i18n 文案 JSON                     |

---

以上为概览；实现细节见 `server/`、`src/`、`shared/`。
