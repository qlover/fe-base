# Browser Plugin Seed

> 中文: [README.md](./README.md)

**TL;DR**: `npm install` (or `pnpm install`) → copy `.env.example` to `.env` → `npm run dev` → in Chrome open `chrome://extensions` and load `build/chrome-mv3-dev` (or the dev output Plasmo prints) → production: `npm run build:prod`, package: `npm run package`.

A **Plasmo** + **React** browser extension template with **@qlover/corekit-bridge** and **@qlover/fe-corekit**: IOC, HTTP, i18n, theme, and auth. Targets Chromium-family browsers with **Manifest V3**.

## Tech stack

- **Framework**: Plasmo 0.90 + React 18
- **Routing**: React Router 7
- **State**: @qlover/slice-store (StoreInterface-compatible)
- **Core**: @qlover/corekit-bridge, @qlover/fe-corekit, @qlover/logger
- **Styling**: Tailwind CSS 4
- **i18n**: @brain-toolkit/ts2locales (identifiers → locale JSON), custom I18nService
- **Lint**: ESLint, Prettier

## Extension surfaces

| Surface | Description | Entry |
| --- | --- | --- |
| Popup | Opens when the user clicks the extension icon | `src/popup.tsx` |
| Content script | Injected into pages (Shadow DOM UI supported) | `src/content.tsx` |
| Other | Background, options, etc. per Plasmo conventions | — |

The popup uses React Router and lazy-loaded pages (home, login/register, 404/500, etc.) aligned with the seed’s auth, i18n, and theme setup.

## Project layout

```
browser-plugin-seed/
├── shared/                      # Shared config and contracts
│   ├── config/
│   │   ├── router.ts            # baseRoutes, authRoutes, static routes
│   │   ├── seed.config.ts       # global inject name, router prefix, locale path, etc.
│   │   ├── i18n.ts
│   │   ├── theme.ts
│   │   ├── endpoints/           # API paths (_endpoint, user, …)
│   │   ├── i18n-identifier/     # @localZh / @localEn
│   │   ├── i18n-mapping/
│   │   └── ioc-identifier.ts
│   ├── interfaces/
│   └── schemas/
├── src/
│   ├── popup.tsx
│   ├── content.tsx
│   ├── style.css                # Popup global CSS entry
│   ├── components/
│   │   └── RouterProvider.tsx
│   ├── contexts/
│   ├── hooks/
│   ├── impls/
│   ├── stores/
│   ├── pages/
│   ├── features/
│   ├── styles/
│   ├── assets/locales/          # zh.json, en.json (ts2locales)
│   └── init-slice-store.ts
├── srcripts/                    # Build/helper scripts (folder name is historical spelling)
│   ├── startup.js
│   └── generate-locales.js
├── patches/                     # Patch files for @qlover packages (apply per package-manager setup)
├── .env.example
├── tsconfig.json
├── package.json                 # Plasmo config, manifest.host_permissions, etc.
└── README.md / README.en.md
```

## Getting started

### Prerequisites

- Node.js (match the monorepo root policy if any)

### Install

```bash
npm install
```

You may use `pnpm install` instead if that matches the workspace.

### Environment

Copy `.env.example` to `.env` and set variables as needed (e.g. API base URL).

### Run

```bash
npm run dev
```

Runs `startup` (patches, locale generation, etc.) then Plasmo dev. Load the unpacked extension from `build/chrome-mv3-dev` or the path Plasmo logs.

### Build and package

- `npm run build:prod` — production build (script name in `package.json`)
- `npm run package` — produce a distributable package

## Core concepts

### IOC

- **Container**: `SimpleIOCContainer` + `createIOCFunction<IOCIdentifierMap>()`
- **Registration**: `IOCIdentifierRegister` binds implementations in `shared/config/ioc-identifier.ts` (Logger, Config, I18nService, ThemeService, UserService, …)
- **Usage**: `useIOC(I.I18nService)`, `useIOC(I.UserService)`, etc. under `IOCContext.Provider`

### Bootstrap

- **BootstrapClient** runs from the popup root: `LifecycleExecutor` and ordered plugins (e.g. I18nService init).
- Same ideas as taro-seed / react-seed for reusable startup logic.

### HTTP and auth

- **AppRequester**: configurable `baseURL`; works with UserService and AuthStore for login/logout and user refresh.
- **AuthStore**: persisted auth state for popup routes and guards.

### i18n

- **Identifiers**: `shared/config/i18n-identifier/` (e.g. `page.home.ts`) with JSDoc `@localZh` / `@localEn`.
- **ts2locales**: `srcripts/` / build flow writes `src/assets/locales/{{lng}}.json`.
- **I18nService**: `t(key, options)`, `changeLocale(locale)`; consumed via `I18nProvider`.
- **Page mapping**: `shared/config/i18n-mapping/` + `useI18nMapping(pageHomeI18n)`.

### Content script and styles

- **content.tsx**: Plasmo content script; optional `getStyle()` to inject Tailwind into Shadow DOM, mapping `:root` → `:host(fe-csui)` and rem → px so host page fonts do not break layout.

### Theme

- **ThemeService**: theme storage and resolution (including `system`), persisted.
- **Tailwind**: entry e.g. `src/style.css`; theme tokens under `src/styles/themes/`.

## Scripts

| Script | Description |
| --- | --- |
| `dev` | `startup` then Plasmo dev |
| `build:prod` | `startup` then Plasmo production build |
| `package` | `startup` then Plasmo package |
| `startup` | Pre-start scripts (patch, locales, …) |
| `postinstall` | Runs `startup` after install |
| `type-check` | `tsc --noEmit` |
| `lint` / `lint:fix` | ESLint |
| `format` | Prettier on `src` |
| `fix` | `lint:fix` + `format` |

## Configuration

- **Plasmo**: `package.json` — `manifest` (e.g. `host_permissions`), `alias`, `displayName`, etc.
- **Seed**: `shared/config/seed.config.ts` — `routerPrefix`, `usePathLocaleRoute`, `omitInjectedGlobals`, etc. (similar to react-seed).
- **Patches**: files under `patches/`; wire via `pnpm.patchedDependencies` or your repo’s policy.

## Main dependencies

- `@qlover/corekit-bridge`, `@qlover/fe-corekit`, `@qlover/logger`
- `plasmo` 0.90.5
- `react`, `react-dom` 18, `react-router-dom` 7
- `@brain-toolkit/ts2locales`, `tailwindcss` 4

## License

Private (see `package.json`).
