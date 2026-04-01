# React Seed

> English: [README.en.md](./README.en.md)

基于 **Vite 7** + **React 19** 的单页应用模板，集成 **@qlover/corekit-bridge**、**@qlover/fe-corekit** 与 **@qlover/slice-store-react**，提供 IOC、Bootstrap、路由、国际化（i18next + ts2locales）、Tailwind CSS 4，以及开发态 **Mock API**（`vite-plugin-mock`）。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | React 19、React Router 7、Vite 7 |
| 核心 | @qlover/corekit-bridge、@qlover/fe-corekit、@qlover/logger、@qlover/slice-store-react |
| 国际化 | i18next、react-i18next、@brain-toolkit/ts2locales（Vite 插件） |
| 样式 | Tailwind CSS 4（`@tailwindcss/vite`） |
| 校验 | zod |
| 测试 | Vitest、jsdom |
| 质量 | ESLint、Prettier（脚本 `prettier`） |

## 快速开始

在 monorepo 根目录安装依赖后，进入本目录执行脚本即可（也可仅在仓库根执行 workspace 相关命令，视你们团队约定而定）。

```bash
cd examples/react-seed
npm install
npm run dev
```

默认使用 Vite 模式 `localhost`（见 `package.json` 的 `dev`）。其他模式：

- `npm run dev:staging` — `staging`
- `npm run dev:prod` — `production`
- `npm run dev:force` — 本地开发并 `--force` 刷新依赖预构建

生产构建与预览：

```bash
npm run build
npm run preview
```

常用脚本：`type-check`、`test`、`lint` / `lint:fix`、`build:analyze`（`ANALYZE=true` 时生成 `dist/stats.html`）。

## 环境变量

本 seed 未强制要求 `.env` 即可运行。`vite.config.ts` 会将 `package.json` 的 `name`、`version` 注入为 `import.meta.env.VITE_APP_NAME` / `VITE_APP_VERSION`。若需扩展，可新增 `.env` / `.env.*` 并按 Vite 约定使用 `VITE_` 前缀。

## 目录结构（摘要）

```
react-seed/
├── config/                 # 路由、i18n、端点、mock、IOC 标识等
│   ├── router.ts
│   ├── i18n.ts
│   ├── seed.config.ts
│   ├── i18n-identifier/    # ts2locales 输入（JSDoc @localZh / @localEn）
│   ├── i18n-mapping/       # 页面级映射，配合 useI18nMapping
│   ├── endpoints/          # API 路径常量
│   └── mock/               # 开发态 mock（vite-plugin-mock）
├── public/locales/         # ts2locales 生成的 {{lng}}.json（勿手改为主流程）
├── src/
│   ├── main.tsx            # BootstrapClient + React 挂载
│   ├── App.tsx
│   ├── pages/              # 页面（需 default export，供懒加载）
│   ├── impls/              # IOC 实现、Bootstrap、AppApiRequester 等
│   ├── hooks/              # useIOC、useI18nMapping、useStore 等
│   └── styles/             # Tailwind 入口与 themes/
└── vite.config.ts
```

## 核心概念

### Bootstrap 与 IOC

`src/main.tsx` 在渲染前执行 `new BootstrapClient(IOC).startup(window, IOCIdentifierRegister)`，完成全局注入与插件链（如 I18n 初始化、`AppApiRequester` 鉴权插件、用户路由插件等）。具体插件顺序见 `src/impls/BootstrapClient.ts`。

### 请求与 Mock

- `AppApiRequester` 默认 `baseURL` 为 `/api`（见 `src/impls/AppApiRequester.ts`）。
- 开发环境下 `vite-plugin-mock` 读取 `config/mock/`，与 `config/endpoints/` 中的路径对齐，可在无后端时调试登录/注册/用户信息等。

### 国际化

- 在 `config/i18n-identifier/` 中声明带 `@localZh` / `@localEn` 的键；dev/build 时 **ts2locales** 生成合并到 `public/locales/{{lng}}.json`（路径与 `config/i18n.ts` 中 `i18nLoadPath` 一致）。
- `config/seed.config.ts` 中 `usePathLocaleRoute` 为 `true` 时，路由带语言段（如 `/:lng/...`，参数名见 `routePathLocaleParamKey`）；语言检测顺序见 `config/i18n.ts` 的 `DetectionOrder`。

### 路由前缀

`config/seed.config.ts` 的 `routerPrefix` 会作为 Vite `base`，部署到子路径时需同步修改。

---

## 如何新增页面

以 HomePage 为例，描述如何创建一个功能完善的页面。

1. 在 `config/i18n-identifier/` 下新增页面标识文件（如 `page.home.ts`），使用 JSDoc；启动或 build 时 ts2locales 会生成/更新语言 JSON。

```ts
/**
 * @description Home page title
 * @localZh 首页
 * @localEn Home
 */
export const PAGE_HOME_TITLE = 'page_home:title';

/**
 * @description Home page description
 * @localZh 一个现代前端实用库集合，提供各种实用工具和组件
 * @localEn A modern frontend utility library collection providing various practical tools and components
 */
export const PAGE_HOME_DESCRIPTION = 'page_home:description';

/**
 * @description Home page keywords
 * @localZh 前端,工具,组件
 * @localEn frontend,tools,components
 */
export const PAGE_HOME_KEYWORDS = 'page_home:keywords';
```

2. 在 `config/i18n-mapping/` 下新增映射对象，便于 `useI18nMapping` 使用。

```ts
import * as i18nKeys from '../i18n-identifier/page.home';

export const pageHomeI18n = {
  title: i18nKeys.PAGE_HOME_TITLE,
  description: i18nKeys.PAGE_HOME_DESCRIPTION,
  content: i18nKeys.PAGE_HOME_DESCRIPTION,
  keywords: i18nKeys.PAGE_HOME_KEYWORDS
} as const;
```

3. 在 `config/router.ts` 中把页面加入路由表；`element` 对应 `src/pages/` 下的模块路径（如 `base/HomePage` → `src/pages/base/HomePage.tsx`）。

4. 创建 `src/pages/.../YourPage.tsx`，**必须 `export default` 默认函数组件**，以便 glob 懒加载匹配。

5. 在组件内使用 `useI18nMapping(pageHomeI18n)` 获取已按当前语言解析的文案对象。

6. 样式优先使用 Tailwind 与 `src/styles/themes/` 中的主题变量；也可为页面增加 `.css` / `.module.css`。

## 许可证

私有（以 `package.json` 为准）。
