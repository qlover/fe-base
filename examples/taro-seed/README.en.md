# Taro Seed

A modern Taro + React + Vite multi-end (WeChat Mini Program, H5, etc.) project template, integrated with **@qlover/corekit-bridge** and **@qlover/fe-corekit** for IOC, request, i18n, theme, and auth.

## Tech Stack

- **Framework**: Taro 4.x + React 18 + Vite
- **State**: @qlover/slice-store-react (StoreInterface-compatible)
- **Core**: @qlover/corekit-bridge, @qlover/fe-corekit, @qlover/logger
- **Styling**: Tailwind CSS 4 + weapp-tailwindcss (mini program)
- **i18n**: @brain-toolkit/ts2locales (identifier → locale JSON), custom I18nService
- **Lint**: ESLint, Prettier, Stylelint, Commitlint, Husky

## Supported Platforms

| Platform     | Build Script           | Dev Script           |
| ------------ | ---------------------- | -------------------- |
| WeChat       | `build:weapp`          | `dev:weapp`          |
| H5           | `build:h5`             | `dev:h5`             |
| Alipay       | `build:alipay`         | `dev:alipay`         |
| Baidu        | `build:swan`           | `dev:swan`           |
| ByteDance    | `build:tt`             | `dev:tt`             |
| QQ           | `build:qq`             | `dev:qq`             |
| JD           | `build:jd`             | `dev:jd`             |
| Harmony      | `build:harmony-hybrid` | `dev:harmony-hybrid` |
| React Native | `build:rn`             | `dev:rn`             |

## Project Structure

```
taro-seed/
├── config/                    # Build & tool config
│   ├── index.ts               # Taro defineConfig (alias, vite plugins, ts2locales, tailwind)
│   ├── dev.ts                 # Development overrides
│   ├── prod.ts                # Production overrides (e.g. h5 legacy)
│   └── tools/
│       └── getAllI18nIdentifierFiles.ts  # i18n identifier file discovery for ts2locales
├── src/
│   ├── app.tsx                # App root: IOC creation, BootstrapClient, I18nProvider
│   ├── app.config.ts          # Taro app config (pages, lazyCodeLoading, darkmode, window)
│   ├── globals.ts             # seedConfig, logger
│   ├── config/
│   │   ├── route.ts           # Route constants & APP_ROUTES_PAGES
│   │   ├── seed.config.ts     # usePathLocaleRoute, routerPrefix
│   │   ├── i18n.ts            # i18n config (defaultLocale, storageKey, DetectionOrder)
│   │   ├── theme.ts           # ThemeMap, themeConfig (domAttribute, target, storageKey)
│   │   ├── api.ts             # API_BASE, auth paths
│   │   ├── endpotins.ts       # Endpoint constants (EP_LOGIN_WX, EP_USER_INFO, EP_LOGOUT)
│   │   ├── mockData.ts        # Mock data for MockPlugin
│   │   ├── ioc-identifier.ts  # IOC identifiers & IOCIdentifierMap
│   │   ├── i18n-identifier/   # i18n keys with @localZh / @localEn (input for ts2locales)
│   │   └── i18n-mapping/      # Page-level i18n mapping (identifier → key)
│   ├── contexts/
│   │   ├── IOCContext.ts      # React context for IOC function
│   │   ├── I18nProvider.tsx   # Provides t + language from I18nService
│   │   └── i18nContext.ts    # I18nContext, useI18nContext, TFunction
│   ├── hooks/
│   │   ├── useIOC.ts          # Get IOC or resolve service by identifier
│   │   ├── useStore.ts        # Subscribe to StoreInterface (observe)
│   │   ├── useTranslation.ts # useI18nContext (t, language)
│   │   └── useI18nMapping.ts # translateWithMapping(t, mapping) for page keys
│   ├── impls/
│   │   ├── BootstrapClient.ts # LifecycleExecutor, plugins: app-init, testAppRequester, restoreUserService
│   │   ├── IOCIdentifierRegister.ts # Binds Logger, Config, AuthStore, I18nService, UserService, ThemeService
│   │   ├── SimpleIOCContainer.ts    # IOC container implementation
│   │   ├── SeedConfig.ts      # Implements SeedConfigInterface (env, name, version, authType)
│   │   ├── AuthStore         # (authStore.ts in stores/) UserStore with openLoginForm, code
│   │   ├── UserService.ts    # loginWithCode, logout, refreshUserInfo (AppRequester)
│   │   ├── I18nService.ts    # Locale store, t(), changeLocale(), getLocale()
│   │   ├── ThemeService.ts   # Theme store, setTheme(), getEffectiveTheme(), init() for Taro.onThemeChange
│   │   ├── AppRequester.ts   # RequestExecutor + Taro request adapter, MockPlugin, fetchWxLogin/fetchUserInfo/fetchLogout
│   │   ├── MockPlugin.ts     # ApiMockPlugin override for mini program (no global Response)
│   │   ├── kvStorage.ts      # String key-value storage
│   │   └── objectStorage.ts  # Object storage for AuthStore
│   ├── stores/
│   │   └── authStore.ts      # AuthStore (UserStore), AuthStoreStateInterface
│   ├── utils/
│   │   ├── createTaroRequestAdapter.ts  # Taro.request → RequestAdapterInterface
│   │   ├── i18nUtil.ts       # translateWithMapping
│   │   ├── restoreUserService.ts  # Bootstrap plugin: refreshUserInfo if credential exists
│   │   └── testAppRequester.ts    # Bootstrap plugin: fetchIpinfo for testing
│   ├── components/
│   │   ├── Page.tsx          # Layout + theme class (themeValueTemplate), data-theme for H5
│   │   └── LoginForm.tsx     # WeChat getPhoneNumber, UserService.loginWithCode
│   ├── pages/
│   │   └── index/
│   │       ├── index.tsx     # Home: auth state, LoginForm, useI18nMapping(pageHomeI18n), useTranslation
│   │       ├── index.config.ts
│   │       └── index.css
│   ├── styles/
│   │   ├── index.css         # Entry: tailwind, globals, themes
│   │   ├── tailwind.css      # Tailwind directives
│   │   ├── globals.css
│   │   └── themes/           # Theme CSS variables (default, color-scheme, custom-styles)
│   └── assets/
│       └── locales/          # zh.json, en.json (generated/merged by ts2locales)
├── types/
│   ├── global.d.ts
│   ├── interfaces/           # SeedConfigInterface, I18nMappingInterface, SeedBootstrapInterface, I18nInterface
│   └── schemas/
│       └── UserSchema.ts    # UserSchema, UserCredentialSchema, LoginRequestSchema
├── .env.example              # TARO_APP_ID, TARO_APP_AUTH_TYPE
├── .env.production           # Production env (optional)
├── project.config.json       # WeChat miniprogram root, appid, compileType
├── tsconfig.json
├── tsconfig.node.json
├── babel.config.js
├── eslint.config.mjs
├── stylelint.config.mjs
├── commitlint.config.mjs
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (see `browserslist` / project requirements)
- WeChat DevTools (for weapp)

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and set:

- `TARO_APP_ID`: Mini program AppID (or use `touristappid` in `project.config.json` for trial)
- `TARO_APP_AUTH_TYPE`: Auth header type (default `Bearer`), used in `SeedConfig.authType`

Optional: `VITE_API_BASE` for API base URL (see `src/config/api.ts`).

### Run

- **WeChat Mini Program**: `npm run dev:weapp` then open `dist` in WeChat DevTools
- **H5**: `npm run dev:h5`
- **Other platforms**: Use corresponding `dev:*` script from the table above

### Build

- `npm run build:weapp` / `npm run build:h5` / etc.

## Main Concepts

### IOC (Inversion of Control)

- **Container**: `SimpleIOCContainer` + `createIOCFunction<IOCIdentifierMap>()`
- **Registration**: `IOCIdentifierRegister` binds implementations to identifiers in `src/config/ioc-identifier.ts`
- **Usage**: `useIOC(I.AuthStore)`, `useIOC(I.UserService)`, etc. inside `IOCContext.Provider`

### Bootstrap

- **BootstrapClient** runs on `useLaunch`: creates `LifecycleExecutor`, runs plugins in order.
- **Plugins**:
  - `app-init`: init I18nService, ThemeService
  - `testAppRequester`: optional test request (e.g. fetchIpinfo)
  - `restoreUserService`: if credential exists, call `UserService.refreshUserInfo`

### Request & Auth

- **AppRequester**: `RequestExecutor` + `createTaroRequestAdapter` (baseURL configurable), with **MockPlugin** for development (mock login/userInfo when no backend).
- **Endpoints**: Defined in `src/config/endpotins.ts`; used in `AppRequester` (fetchWxLogin, fetchUserInfo, fetchLogout).
- **UserService**: `loginWithCode(code)` (WeChat code → backend → AuthStore), `logout()`, `refreshUserInfo(credential)`.
- **AuthStore**: `UserStore` with persistence (objectStorage), `openLoginForm`, `code` for UI.

### i18n

- **Identifiers**: Under `src/config/i18n-identifier/` (e.g. `pages.home.ts`) with JSDoc `@localZh` / `@localEn`.
- **ts2locales**: Vite plugin in `config/index.ts` scans these files and writes `src/assets/locales/{{lng}}.json`.
- **I18nService**: Reads locale from storage/system, exposes `t(key, options)` and `changeLocale(locale)`; state is `StoreInterface`, consumed by `I18nProvider`.
- **Page mapping**: `src/config/i18n-mapping/` maps short names to identifier keys; `useI18nMapping(pageHomeI18n)` returns translated object (e.g. `tt.title`, `tt.welcome`).

### Theme

- **ThemeService**: Store for `theme` and `resovleTheme` (including `system`); persists to storage; `init()` subscribes to `Taro.onThemeChange`.
- **Page component**: Applies `themeConfig.themeValueTemplate` (e.g. `fe-theme theme-{{theme}}`) and `data-theme` for H5; theme CSS in `src/styles/themes/`.

### Styling

- **Tailwind**: Entry in `src/styles/index.css`; for mini program, `weapp-tailwindcss` is enabled (rem2rpx when not H5/harmony/rn).
- **Themes**: CSS variables in `themes/default.css`, `color-scheme-default.css`, `custom-styles.css`.

## Scripts

| Script        | Description             |
| ------------- | ----------------------- |
| `dev:weapp`   | WeChat dev with watch   |
| `dev:h5`      | H5 dev with watch       |
| `build:weapp` | WeChat production build |
| `build:h5`    | H5 production build     |
| `type-check`  | `tsc --noEmit`          |
| `lint`        | ESLint                  |
| `lint:fix`    | ESLint with auto-fix    |
| `format`      | Prettier on src/types   |
| `fix`         | lint:fix + format       |

## Configuration Notes

- **Taro config**: `config/index.ts` — alias `@` → `src`, `@interfaces` → `types/interfaces`; designWidth 750; ts2locales target `src/assets/locales/{{lng}}.json`; PostCSS/Tailwind and weapp-tailwindcss.
- **WeChat**: `project.config.json` points `miniprogramRoot` to `./dist`; use your `appid` or keep `touristappid` for trial.
- **Seed**: `src/config/seed.config.ts`: `usePathLocaleRoute`, `routerPrefix`; `SeedConfig` reads `process.env.NODE_ENV`, `TARO_APP_AUTH_TYPE`.

## Dependencies (main)

- `@qlover/corekit-bridge`, `@qlover/fe-corekit`, `@qlover/logger`, `@qlover/slice-store-react`
- `@tarojs/*` 4.1.11 (taro, react, components, plugins per platform)
- `react`, `react-dom` ^18
- `@brain-toolkit/ts2locales`, `tailwindcss`, `weapp-tailwindcss`, `clsx`, `lodash-es`

## License

Private (as per `package.json`).
