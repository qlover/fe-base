# @qlover/next-kit

## 1.1.0

### Minor Changes

#### 🐞 Bug Fixes

- **Dropdown:** 修复首次弹出位置偏移，新增 menuMinWidth 属性 ([52bc87d](https://github.com/qlover/fe-base/commit/52bc87dd1ec79f87004744862a7145170b9319a7)) ([#688](https://github.com/qlover/fe-base/pull/688))

## 1.0.1

### Patch Changes

#### 🐞 Bug Fixes

- **next-kit:** 修复 SupabaseRepo IN 查询生成非法 PostgREST 过滤器 ([678a738](https://github.com/qlover/fe-base/commit/678a738302a209eae960e0243d8f408055b87ba5)) ([#682](https://github.com/qlover/fe-base/pull/682))

## 1.0.0

### Major Changes

#### ✨ Features

- **next-kit:** scaffold package with common/server/browser entries ([44fbbbc](https://github.com/qlover/fe-base/commit/44fbbbcad712e847369c62360fac681ff8f64e82)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **next-kit:** add isomorphic common shell modules ([ff5166a](https://github.com/qlover/fe-base/commit/ff5166ad8bbf3d071c762658710a9d2ae436f5e8)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **next-kit:** add server runtime base (ApiServer, SupabaseRepo) ([42b3883](https://github.com/qlover/fe-base/commit/42b38834750d469b0966af17c9290ea8784ed9f5)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **next-kit:** rename browser to client and add first client slice ([1b6fd8e](https://github.com/qlover/fe-base/commit/1b6fd8e3ddcd3c4cf01c715e7e3213219db5055e)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **next-kit:** add client UI shell, hooks, and IOC/i18n helpers ([cf0c8a6](https://github.com/qlover/fe-base/commit/cf0c8a6267a3b6ca2ae78b18c0f3cf487326b6fd)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **next-kit:** 将 i18n 工具移入 common ([9d84c31](https://github.com/qlover/fe-base/commit/9d84c318add108b6a4e04a31f2ff5ccc71a6d5fd)) ([#679](https://github.com/qlover/fe-base/pull/679))

#### 🐞 Bug Fixes

- **vitest:** 修复 next-kit 在 create-release-pr 下的测试失败 ([1fb152c](https://github.com/qlover/fe-base/commit/1fb152c803987ce64f100b96b8f77daedac4dd70)) ([#680](https://github.com/qlover/fe-base/pull/680))

- **next-kit:** 修复 monorepo type-check ([48ec3b7](https://github.com/qlover/fe-base/commit/48ec3b7589ca250e59410da85253ab98ebce57b3)) ([#679](https://github.com/qlover/fe-base/pull/679))

## 0.0.1

### Minor Changes

- Initial package scaffold with `common` / `server` / `client` entry points.
- Migrate isomorphic app-shell building blocks into `common` (container, schemas, validators, cookies, encryptor, supabase env constants).
- Keep `reflect-metadata` as an app-entry side effect; use `next_kit:` i18n key namespace.
- Add first `server` slice: BootstrapServer (injected deps), ApiServer, NextApiHandler, CORS/logger/crypto utils, BaseRepository.
- Add `SupabaseRepo` and `RequestLogsRepository` (client factories injected; no IOC decorators).
