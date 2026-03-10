# Browser Plugin Seed

基于 **Plasmo** + **React** 的浏览器扩展项目模板，集成 **@qlover/corekit-bridge** 与 **@qlover/fe-corekit**，提供 IOC、请求、国际化、主题与鉴权能力，适用于 Chrome 等支持 Manifest V3 的浏览器扩展开发。

## 技术栈

- **框架**: Plasmo 0.90 + React 18
- **路由**: React Router 7
- **状态**: @qlover/slice-store（兼容 StoreInterface）
- **核心**: @qlover/corekit-bridge、@qlover/fe-corekit、@qlover/logger
- **样式**: Tailwind CSS 4
- **国际化**: @brain-toolkit/ts2locales（标识符 → 语言 JSON），自定义 I18nService
- **规范**: ESLint、Prettier

## 扩展形态

| 形态           | 说明                         | 入口/配置          |
| -------------- | ---------------------------- | ------------------ |
| Popup         | 点击扩展图标打开的弹窗       | `src/popup.tsx`    |
| Content Script| 注入页面的脚本（含 Shadow DOM UI） | `src/content.tsx`  |
| 其他          | 可按 Plasmo 约定扩展 background、options 等 | - |

Popup 内使用 React Router + 懒加载页面（首页、登录/注册、404/500 等），与 seed 的鉴权、i18n、主题体系一致。

## 项目结构

```
browser-plugin-seed/
├── shared/                      # 共享配置与契约
│   ├── config/
│   │   ├── router.ts            # 路由表（baseRoutes、authRoutes、静态路由）
│   │   ├── seed.config.ts       # 全局注入名、路由前缀、本地化路径等
│   │   ├── i18n.ts              # 国际化配置
│   │   ├── theme.ts             # 主题配置
│   │   ├── endpoints/           # 接口路径（_endpoint、user 等）
│   │   ├── i18n-identifier/     # i18n 标识符（@localZh / @localEn）
│   │   ├── i18n-mapping/        # 页面级 i18n 映射
│   │   └── ioc-identifier.ts    # IOC 标识符与 IOCIdentifierMap
│   ├── interfaces/              # 共享接口（RouteLoader、SeedConfig、I18n 等）
│   └── schemas/                 # 如 UserSchema
├── src/
│   ├── popup.tsx                # Popup 入口：IOC、BootstrapClient、I18nProvider、RouterProvider
│   ├── content.tsx              # Content Script 入口（含 getStyle 适配 Shadow DOM rem）
│   ├── style.css                # Popup 全局样式入口
│   ├── components/
│   │   └── RouterProvider.tsx   # 基于 baseRoutes 的懒加载路由
│   ├── contexts/
│   │   ├── IOCContext.ts        # IOC 的 React context
│   │   ├── I18nProvider.tsx     # I18nService 的 t + language
│   │   └── RouterContext.tsx    # 路由上下文
│   ├── hooks/
│   │   ├── useIOC.ts            # 按标识符解析服务
│   │   ├── useStore.ts          # 订阅 StoreInterface
│   │   ├── useTranslation.ts    # t、language
│   │   └── useI18nMapping.ts    # 页面键的 translateWithMapping
│   ├── impls/
│   │   ├── BootstrapClient.ts   # LifecycleExecutor，插件：I18nService 等
│   │   ├── IOCIdentifierRegister.ts  # 注册 Logger、Config、I18nService、ThemeService、UserService
│   │   ├── SimpleIOCContainer.ts
│   │   ├── ReactSeedConfig.ts   # SeedConfigInterface 实现
│   │   ├── I18nService.ts       # 语言存储、t()、changeLocale()
│   │   ├── UserService.ts       # 登录/登出/刷新用户（AppRequester）
│   │   ├── AppRequester.ts      # 请求封装
│   │   ├── globals.ts           # seedConfig、logger
│   │   ├── kvStorage.ts / objectStorage.ts
│   │   └── ...
│   ├── stores/
│   │   └── authStore.ts         # 鉴权状态
│   ├── pages/                   # Popup 内页面（Home、Login、Register、404、500 等）
│   ├── features/                # 如 content 用的 count-button
│   ├── styles/                  # Tailwind、主题、工具类
│   ├── assets/
│   │   └── locales/             # zh.json、en.json（ts2locales）
│   └── init-slice-store.ts
├── srcripts/
│   ├── startup.js               # 启动前脚本（如 patch、生成 locales）
│   └── generate-locales.js      # 国际化生成
├── patches/                    # pnpm 对 @qlover 包的补丁
├── .env.example
├── tsconfig.json
├── package.json                 # Plasmo 配置、manifest.host_permissions 等
└── README.md
```

## 快速开始

### 环境要求

- Node.js（见项目或 browserslist 要求）
- pnpm（推荐，用于 patchedDependencies）

### 安装

```bash
pnpm install
```

### 环境变量

将 `.env.example` 复制为 `.env` 并按需配置（如 API 基础地址等）。

### 运行

```bash
pnpm run dev
```

会先执行 `startup`（如生成 locales），再启动 Plasmo 开发模式。在浏览器中加载扩展（如 Chrome：`chrome://extensions` → 加载已解压的扩展，选择项目下的 `build/chrome-mv3-dev` 或 Plasmo 输出目录）。

### 构建与打包

- `pnpm run build` — 生产构建
- `pnpm run package` — 打包为可分发格式

## 核心概念

### IOC（控制反转）

- **容器**: `SimpleIOCContainer` + `createIOCFunction<IOCIdentifierMap>()`
- **注册**: `IOCIdentifierRegister` 在 `shared/config/ioc-identifier.ts` 中将实现绑定到标识符（Logger、Config、I18nService、ThemeService、UserService）
- **使用**: 在 `IOCContext.Provider` 内使用 `useIOC(I.I18nService)`、`useIOC(I.UserService)` 等

### Bootstrap

- **BootstrapClient** 在 Popup 根组件中执行：创建 `LifecycleExecutor`，按顺序执行插件（如 I18nService 初始化等）。
- 与 taro-seed / react-seed 同源，便于复用启动与插件逻辑。

### 请求与鉴权

- **AppRequester**: 封装请求，可配置 baseURL；与 UserService、AuthStore 配合完成登录/登出与用户信息刷新。
- **AuthStore**: 持久化用户/凭证状态，供 Popup 内登录态与路由守卫使用。

### 国际化（i18n）

- **标识符**: 位于 `shared/config/i18n-identifier/`（如 `page.home.ts`），使用 JSDoc `@localZh` / `@localEn`。
- **ts2locales**: 通过 `srcripts` 或构建流程扫描并生成 `src/assets/locales/{{lng}}.json`。
- **I18nService**: 提供 `t(key, options)`、`changeLocale(locale)`；由 `I18nProvider` 消费。
- **页面映射**: `shared/config/i18n-mapping/` 将短名称映射到标识符；`useI18nMapping(pageHomeI18n)` 得到翻译后的文案对象。

### Content Script 与样式

- **content.tsx**: 使用 Plasmo 的 Content Script 能力，可配合 `getStyle()` 将 Tailwind 等样式注入 Shadow DOM，并把 `:root` 替换为 `:host(fe-csui)`、rem 转为 px，避免受宿主页面根字体影响。

### 主题与样式

- **ThemeService**: 主题存储与解析（含 `system`），持久化到存储。
- **Tailwind**: 入口为 `src/style.css` 等；主题 CSS 变量在 `src/styles/themes/`。

## 脚本说明

| 脚本         | 说明                 |
| ------------ | -------------------- |
| `dev`        | 先 startup 再 Plasmo 开发 |
| `build`      | 先 startup 再 Plasmo 生产构建 |
| `package`    | 先 startup 再 Plasmo 打包 |
| `startup`    | 启动前脚本（patch、生成 locales 等） |
| `type-check` | `tsc --noEmit`       |
| `lint` / `lint:fix` | ESLint        |
| `format`     | Prettier 写 src      |
| `fix`        | lint:fix + format    |

## 配置说明

- **Plasmo**: 根目录 `package.json` 中可配置 `manifest`（如 `host_permissions`）、`alias` 等；扩展名来自 `displayName`。
- **Seed**: `shared/config/seed.config.ts` 中配置 `routerPrefix`、`usePathLocaleRoute`、`omitInjectedGlobals` 等；与 react-seed 风格一致。
- **依赖补丁**: `pnpm.patchedDependencies` 指向 `patches/@qlover__*.patch`，用于对 corekit-bridge、fe-corekit 做本地适配。

## 主要依赖

- `@qlover/corekit-bridge`、`@qlover/fe-corekit`、`@qlover/logger`
- `plasmo` 0.90.5
- `react`、`react-dom` 18、`react-router-dom` 7
- `@brain-toolkit/ts2locales`、`tailwindcss` 4

## 许可证

私有（以 `package.json` 为准）。
