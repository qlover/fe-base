# React Seed

> 中文: [README.md](./README.md)

A **Vite 7** + **React 19** SPA template with **@qlover/corekit-bridge**, **@qlover/fe-corekit**, and **@qlover/slice-store-react**: IOC, Bootstrap, routing, i18n (i18next + ts2locales), Tailwind CSS 4, and dev-time **mock APIs** via `vite-plugin-mock`.

## Tech stack

| Area | Stack |
| --- | --- |
| UI | React 19, React Router 7, Vite 7 |
| Core | @qlover/corekit-bridge, @qlover/fe-corekit, @qlover/logger, @qlover/slice-store-react |
| i18n | i18next, react-i18next, @brain-toolkit/ts2locales (Vite plugin) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Validation | zod |
| Tests | Vitest, jsdom |
| Quality | ESLint, Prettier (`prettier` script) |

## Quick start

After installing dependencies at the monorepo root, run from this package:

```bash
cd examples/react-seed
npm install
npm run dev
```

`dev` uses Vite mode `localhost` (see `package.json`). Other modes:

- `npm run dev:staging` — `staging`
- `npm run dev:prod` — `production`
- `npm run dev:force` — local dev with `--force` for dependency pre-bundling

Production build and preview:

```bash
npm run build
npm run preview
```

Other useful scripts: `type-check`, `test`, `lint` / `lint:fix`, `build:analyze` (writes `dist/stats.html` when `ANALYZE=true`).

## Environment variables

No `.env` is required for a basic run. `vite.config.ts` injects `name` and `version` from `package.json` as `import.meta.env.VITE_APP_NAME` and `VITE_APP_VERSION`. For more, add `.env` / `.env.*` and use the `VITE_` prefix per Vite rules.

## Directory layout (high level)

```
react-seed/
├── config/                 # Router, i18n, endpoints, mock, IOC ids, etc.
│   ├── router.ts
│   ├── i18n.ts
│   ├── seed.config.ts
│   ├── i18n-identifier/    # ts2locales input (@localZh / @localEn)
│   ├── i18n-mapping/       # Page maps for useI18nMapping
│   ├── endpoints/
│   └── mock/               # Dev mocks (vite-plugin-mock)
├── public/locales/         # Generated {{lng}}.json from ts2locales
├── src/
│   ├── main.tsx            # BootstrapClient + React root
│   ├── App.tsx
│   ├── pages/              # Pages (default export for lazy loading)
│   ├── impls/              # IOC, Bootstrap, AppApiRequester, etc.
│   ├── hooks/
│   └── styles/             # Tailwind entry + themes/
└── vite.config.ts
```

## Core concepts

### Bootstrap and IOC

`src/main.tsx` runs `new BootstrapClient(IOC).startup(window, IOCIdentifierRegister)` before render: global injection and plugins (I18n init, `AppApiRequester` auth plugin, user route plugin, etc.). See `src/impls/BootstrapClient.ts` for order and details.

### HTTP and mocks

- `AppApiRequester` uses `baseURL: '/api'` (see `src/impls/AppApiRequester.ts`).
- In development, `vite-plugin-mock` loads `config/mock/` and aligns with paths in `config/endpoints/` so you can try login/register/user flows without a real backend.

### i18n

- Declare keys under `config/i18n-identifier/` with `@localZh` / `@localEn`; **ts2locales** merges into `public/locales/{{lng}}.json` on dev/build (see `i18nLoadPath` in `config/i18n.ts`).
- When `usePathLocaleRoute` is `true` in `config/seed.config.ts`, routes include a locale segment (e.g. `/:lng/...` per `routePathLocaleParamKey`). Detection order is in `DetectionOrder` inside `config/i18n.ts`.

### Router base

`routerPrefix` in `config/seed.config.ts` is passed to Vite `base`; change it when deploying under a subpath.

---

## Adding a new page

Example: HomePage.

1. Add an identifier file under `config/i18n-identifier/` (e.g. `page.home.ts`) with JSDoc; ts2locales updates locale JSON on dev/build.

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

2. Add a mapping under `config/i18n-mapping/` for `useI18nMapping`.

```ts
import * as i18nKeys from '../i18n-identifier/page.home';

export const pageHomeI18n = {
  title: i18nKeys.PAGE_HOME_TITLE,
  description: i18nKeys.PAGE_HOME_DESCRIPTION,
  content: i18nKeys.PAGE_HOME_DESCRIPTION,
  keywords: i18nKeys.PAGE_HOME_KEYWORDS
} as const;
```

3. Register the route in `config/router.ts`; `element` is the path under `src/pages/` (e.g. `base/HomePage` → `src/pages/base/HomePage.tsx`).

4. Create the page component with a **default export** function component so glob-based lazy loading works.

5. Use `useI18nMapping(pageHomeI18n)` for translated copy objects.

6. Prefer Tailwind and variables under `src/styles/themes/`; optional `.css` / `.module.css` per page.

## License

Private (see `package.json`).
