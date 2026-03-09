# Taro Seed

基于 Taro + React + Vite 的多端（微信小程序、H5 等）项目模板，集成 **@qlover/corekit-bridge** 与 **@qlover/fe-corekit**，提供 IOC、请求、国际化、主题与鉴权能力。

## 技术栈

- **框架**: Taro 4.x + React 18 + Vite
- **状态**: @qlover/slice-store-react（兼容 StoreInterface）
- **核心**: @qlover/corekit-bridge、@qlover/fe-corekit、@qlover/logger
- **样式**: Tailwind CSS 4 + weapp-tailwindcss（小程序）
- **国际化**: @brain-toolkit/ts2locales（标识符 → 语言 JSON），自定义 I18nService
- **规范**: ESLint、Prettier、Stylelint、Commitlint、Husky

## 支持平台

| 平台         | 构建脚本               | 开发脚本             |
| ------------ | ---------------------- | -------------------- |
| 微信         | `build:weapp`          | `dev:weapp`          |
| H5           | `build:h5`             | `dev:h5`             |
| 支付宝       | `build:alipay`         | `dev:alipay`         |
| 百度         | `build:swan`           | `dev:swan`           |
| 字节跳动     | `build:tt`             | `dev:tt`             |
| QQ           | `build:qq`             | `dev:qq`             |
| 京东         | `build:jd`             | `dev:jd`             |
| 鸿蒙         | `build:harmony-hybrid` | `dev:harmony-hybrid` |
| React Native | `build:rn`             | `dev:rn`             |

## 项目结构

```
taro-seed/
├── config/                    # 构建与工具配置
│   ├── index.ts               # Taro defineConfig（alias、vite 插件、ts2locales、tailwind）
│   ├── dev.ts                 # 开发环境覆盖
│   ├── prod.ts                # 生产环境覆盖（如 h5 legacy）
│   └── tools/
│       └── getAllI18nIdentifierFiles.ts  # ts2locales 的 i18n 标识符文件发现
├── src/
│   ├── app.tsx                # 应用根：IOC 创建、BootstrapClient、I18nProvider
│   ├── app.config.ts          # Taro 应用配置（pages、lazyCodeLoading、darkmode、window）
│   ├── globals.ts             # seedConfig、logger
│   ├── config/
│   │   ├── route.ts           # 路由常量与 APP_ROUTES_PAGES
│   │   ├── seed.config.ts     # usePathLocaleRoute、routerPrefix
│   │   ├── i18n.ts            # 国际化配置（defaultLocale、storageKey、DetectionOrder）
│   │   ├── theme.ts           # ThemeMap、themeConfig（domAttribute、target、storageKey）
│   │   ├── api.ts             # API_BASE、鉴权路径
│   │   ├── endpotins.ts       # 接口常量（EP_LOGIN_WX、EP_USER_INFO、EP_LOGOUT）
│   │   ├── mockData.ts        # MockPlugin 用 mock 数据
│   │   ├── ioc-identifier.ts  # IOC 标识符与 IOCIdentifierMap
│   │   ├── i18n-identifier/   # 带 @localZh / @localEn 的 i18n 键（ts2locales 输入）
│   │   └── i18n-mapping/      # 页面级 i18n 映射（identifier → key）
│   ├── contexts/
│   │   ├── IOCContext.ts      # IOC 函数的 React context
│   │   ├── I18nProvider.tsx   # 提供 I18nService 的 t + language
│   │   └── i18nContext.ts     # I18nContext、useI18nContext、TFunction
│   ├── hooks/
│   │   ├── useIOC.ts          # 获取 IOC 或按标识符解析服务
│   │   ├── useStore.ts        # 订阅 StoreInterface（observe）
│   │   ├── useTranslation.ts  # useI18nContext（t、language）
│   │   └── useI18nMapping.ts  # 页面键的 translateWithMapping(t, mapping)
│   ├── impls/
│   │   ├── BootstrapClient.ts # LifecycleExecutor，插件：app-init、testAppRequester、restoreUserService
│   │   ├── IOCIdentifierRegister.ts # 注册 Logger、Config、AuthStore、I18nService、UserService、ThemeService
│   │   ├── SimpleIOCContainer.ts    # IOC 容器实现
│   │   ├── SeedConfig.ts      # 实现 SeedConfigInterface（env、name、version、authType）
│   │   ├── AuthStore          # （stores/authStore.ts）带 openLoginForm、code 的 UserStore
│   │   ├── UserService.ts     # loginWithCode、logout、refreshUserInfo（AppRequester）
│   │   ├── I18nService.ts     # 语言存储，t()、changeLocale()、getLocale()
│   │   ├── ThemeService.ts    # 主题存储，setTheme()、getEffectiveTheme()，init() 订阅 Taro.onThemeChange
│   │   ├── AppRequester.ts    # RequestExecutor + Taro 请求适配器，MockPlugin，fetchWxLogin/fetchUserInfo/fetchLogout
│   │   ├── MockPlugin.ts      # 小程序用 ApiMockPlugin 覆盖（无全局 Response）
│   │   ├── kvStorage.ts       # 字符串键值存储
│   │   └── objectStorage.ts   # AuthStore 用对象存储
│   ├── stores/
│   │   └── authStore.ts       # AuthStore（UserStore）、AuthStoreStateInterface
│   ├── utils/
│   │   ├── createTaroRequestAdapter.ts  # Taro.request → RequestAdapterInterface
│   │   ├── i18nUtil.ts        # translateWithMapping
│   │   ├── restoreUserService.ts  # Bootstrap 插件：有凭证时 refreshUserInfo
│   │   └── testAppRequester.ts    # Bootstrap 插件：测试用 fetchIpinfo
│   ├── components/
│   │   ├── Page.tsx           # 布局 + 主题 class（themeValueTemplate），H5 的 data-theme
│   │   └── LoginForm.tsx      # 微信 getPhoneNumber、UserService.loginWithCode
│   ├── pages/
│   │   └── index/
│   │       ├── index.tsx      # 首页：鉴权状态、LoginForm、useI18nMapping(pageHomeI18n)、useTranslation
│   │       ├── index.config.ts
│   │       └── index.css
│   ├── styles/
│   │   ├── index.css          # 入口：tailwind、globals、themes
│   │   ├── tailwind.css       # Tailwind 指令
│   │   ├── globals.css
│   │   └── themes/            # 主题 CSS 变量（default、color-scheme、custom-styles）
│   └── assets/
│       └── locales/           # zh.json、en.json（ts2locales 生成/合并）
├── types/
│   ├── global.d.ts
│   ├── interfaces/            # SeedConfigInterface、I18nMappingInterface、SeedBootstrapInterface、I18nInterface
│   └── schemas/
│       └── UserSchema.ts      # UserSchema、UserCredentialSchema、LoginRequestSchema
├── .env.example               # TARO_APP_ID、TARO_APP_AUTH_TYPE
├── .env.production            # 生产环境变量（可选）
├── project.config.json        # 微信小程序根配置，appid，compileType
├── tsconfig.json
├── tsconfig.node.json
├── babel.config.js
├── eslint.config.mjs
├── stylelint.config.mjs
├── commitlint.config.mjs
└── package.json
```

## 快速开始

### 环境要求

- Node.js（见 `browserslist` / 项目要求）
- 微信开发者工具（用于 weapp）

### 安装

```bash
npm install
```

### 环境变量

将 `.env.example` 复制为 `.env` 并配置：

- `TARO_APP_ID`: 小程序 AppID（或使用 `project.config.json` 中的 `touristappid` 体验）
- `TARO_APP_AUTH_TYPE`: 鉴权头类型（默认 `Bearer`），用于 `SeedConfig.authType`

可选：`VITE_API_BASE` 配置 API 基础地址（见 `src/config/api.ts`）。

### 运行

- **微信小程序**: 执行 `npm run dev:weapp`，在微信开发者工具中打开 `dist` 目录
- **H5**: `npm run dev:h5`
- **其他平台**: 使用上表中对应的 `dev:*` 脚本

### 构建

- `npm run build:weapp` / `npm run build:h5` / 等

## 核心概念

### IOC（控制反转）

- **容器**: `SimpleIOCContainer` + `createIOCFunction<IOCIdentifierMap>()`
- **注册**: `IOCIdentifierRegister` 在 `src/config/ioc-identifier.ts` 中将实现绑定到标识符
- **使用**: 在 `IOCContext.Provider` 内使用 `useIOC(I.AuthStore)`、`useIOC(I.UserService)` 等

### Bootstrap

- **BootstrapClient** 在 `useLaunch` 时执行：创建 `LifecycleExecutor`，按顺序执行插件。
- **插件**:
  - `app-init`: 初始化 I18nService、ThemeService
  - `testAppRequester`: 可选测试请求（如 fetchIpinfo）
  - `restoreUserService`: 若存在凭证，调用 `UserService.refreshUserInfo`

### 请求与鉴权

- **AppRequester**: `RequestExecutor` + `createTaroRequestAdapter`（可配置 baseURL），开发环境使用 **MockPlugin**（无后端时 mock 登录/用户信息）。
- **接口**: 在 `src/config/endpotins.ts` 定义；供 AppRequester 使用（fetchWxLogin、fetchUserInfo、fetchLogout）。
- **UserService**: `loginWithCode(code)`（微信 code → 后端 → AuthStore）、`logout()`、`refreshUserInfo(credential)`。
- **AuthStore**: 带持久化的 `UserStore`（objectStorage），`openLoginForm`、`code` 供 UI 使用。

### 国际化（i18n）

- **标识符**: 位于 `src/config/i18n-identifier/`（如 `pages.home.ts`），使用 JSDoc `@localZh` / `@localEn`。
- **ts2locales**: `config/index.ts` 中的 Vite 插件扫描上述文件并写入 `src/assets/locales/{{lng}}.json`。
- **I18nService**: 从存储/系统读取语言，提供 `t(key, options)` 和 `changeLocale(locale)`；状态为 `StoreInterface`，由 `I18nProvider` 消费。
- **页面映射**: `src/config/i18n-mapping/` 将短名称映射到标识符 key；`useI18nMapping(pageHomeI18n)` 返回翻译后的对象（如 `tt.title`、`tt.welcome`）。

### 主题

- **ThemeService**: 存储 `theme` 与 `resovleTheme`（含 `system`）；持久化到存储；`init()` 订阅 `Taro.onThemeChange`。
- **页面组件**: 应用 `themeConfig.themeValueTemplate`（如 `fe-theme theme-{{theme}}`）及 H5 的 `data-theme`；主题 CSS 在 `src/styles/themes/`。

### 样式

- **Tailwind**: 入口为 `src/styles/index.css`；小程序启用 `weapp-tailwindcss`（非 H5/harmony/rn 时 rem2rpx）。
- **主题**: CSS 变量在 `themes/default.css`、`color-scheme-default.css`、`custom-styles.css`。

## 脚本说明

| 脚本          | 说明                       |
| ------------- | -------------------------- |
| `dev:weapp`   | 微信开发 + watch           |
| `dev:h5`      | H5 开发 + watch            |
| `build:weapp` | 微信生产构建               |
| `build:h5`    | H5 生产构建                |
| `type-check`  | `tsc --noEmit`             |
| `lint`        | ESLint                     |
| `lint:fix`    | ESLint 自动修复            |
| `format`      | 对 src/types 执行 Prettier |
| `fix`         | lint:fix + format          |

## 配置说明

- **Taro 配置**: `config/index.ts` — alias `@` → `src`，`@interfaces` → `types/interfaces`；designWidth 750；ts2locales 输出 `src/assets/locales/{{lng}}.json`；PostCSS/Tailwind 与 weapp-tailwindcss。
- **微信**: `project.config.json` 中 `miniprogramRoot` 指向 `./dist`；填写你的 `appid` 或保留 `touristappid` 用于体验。
- **Seed**: `src/config/seed.config.ts`：`usePathLocaleRoute`、`routerPrefix`；`SeedConfig` 读取 `process.env.NODE_ENV`、`TARO_APP_AUTH_TYPE`。

## 主要依赖

- `@qlover/corekit-bridge`、`@qlover/fe-corekit`、`@qlover/logger`、`@qlover/slice-store-react`
- `@tarojs/*` 4.1.11（taro、react、components、各平台 plugins）
- `react`、`react-dom` ^18
- `@brain-toolkit/ts2locales`、`tailwindcss`、`weapp-tailwindcss`、`clsx`、`lodash-es`

## 许可证

私有（以 `package.json` 为准）。
