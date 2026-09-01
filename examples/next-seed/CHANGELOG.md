# examples/next-seed

## 2.2.1

### Patch Changes

- Update dependency **@qlover/next-kit** from `1.3.0` to `1.3.1`

## 2.2.0

### Minor Changes

#### ✨ Features

- **next-seed:** 登录页 return_to 重定向 ([cf9d8cf](https://github.com/qlover/fe-base/commit/cf9d8cf658fe4cfcd039e4a55e318ac5d0d09595)) ([#690](https://github.com/qlover/fe-base/pull/690))

#### 🐞 Bug Fixes

- **examples:** LocaleLink uses current locale ([8219c5a](https://github.com/qlover/fe-base/commit/8219c5a2a29e4c183b846b5202c8c468ee3a87ec)) ([#684](https://github.com/qlover/fe-base/pull/684))

### Patch Changes

- Update dependency **@qlover/next-kit** from `1.2.1` to `1.3.0`

## 2.0.0

### Major Changes

#### 🐞 Bug Fixes

- **vitest:** 修复 next-kit 在 create-release-pr 下的测试失败 ([1fb152c](https://github.com/qlover/fe-base/commit/1fb152c803987ce64f100b96b8f77daedac4dd70)) ([#680](https://github.com/qlover/fe-base/pull/680))

- **next-seed:** Pages 主题与 kit 样式扫描 ([c5999d1](https://github.com/qlover/fe-base/commit/c5999d13d45f65d2ce8d7c86e2b0896de80f7c41)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **examples:** 修复 tailwind.config 重复导出 ([201c51f](https://github.com/qlover/fe-base/commit/201c51f5609eca3f9ed10d9118f8cd392ae5c3b4)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **examples:** 语言切换时保留 next-intl 动态路由 params ([dc21ff1](https://github.com/qlover/fe-base/commit/dc21ff19ccb819df67ed8142a50cfcd414842006)) ([#678](https://github.com/qlover/fe-base/pull/678))

- **next-seed:** middleware page auth gate and Pages theme FOUC sync ([51c7624](https://github.com/qlover/fe-base/commit/51c7624e4d37c6df56962bdea73c16d03a9bbe3a)) ([#677](https://github.com/qlover/fe-base/pull/677))

- **examples:** 避免裸 hidden 类被浏览器扩展覆盖显示 ([e456658](https://github.com/qlover/fe-base/commit/e456658f65b45d0785993cc1ddf6cebc929ea741)) ([#676](https://github.com/qlover/fe-base/pull/676))

#### ♻️ Refactors

- **next-seed:** 接入 next-kit 包 ([5c8ba8a](https://github.com/qlover/fe-base/commit/5c8ba8af454c6776988b76500c26f43e8e42a19e)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **next-seed:** 服务端接口改用 next-kit ([b9ed2f0](https://github.com/qlover/fe-base/commit/b9ed2f000a06b153899c8d977928154feecb9127)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **examples:** 去掉 shared 与 next-kit 重复代码 ([3fe0867](https://github.com/qlover/fe-base/commit/3fe08674406c089a3180611230153be09c328c21)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **ServerConfig, SupabaseOAuthProvider:** Normalize SITE_URL handling and enhance logging ([dcf824f](https://github.com/qlover/fe-base/commit/dcf824f3a309488a0528bf4f227f60f8dd94cddf)) ([#673](https://github.com/qlover/fe-base/pull/673))

- **SupabaseOAuthProvider, EmailOtpCallbackClient:** Update email login handling and improve URL management ([7eb54ce](https://github.com/qlover/fe-base/commit/7eb54ce29e1c82bc7060190dcd99f405e9ea8221)) ([#673](https://github.com/qlover/fe-base/pull/673))

- **SupabaseOAuthProvider, EmailOtpCallbackClient:** Enhance email login flow and URL handling ([05b7cdb](https://github.com/qlover/fe-base/commit/05b7cdba522d02e23a1eba8abb41d7394bd80114)) ([#673](https://github.com/qlover/fe-base/pull/673))

### Patch Changes

- Update dependency **@qlover/next-kit** from `0.0.2` to `1.0.0`

## 1.4.0

### Minor Changes

#### ✨ Features

- **i18n:** Introduce locale support and update path resolutions ([7366382](https://github.com/qlover/fe-base/commit/736638222983f1952c6191c48ed0aef84463afcb)) ([#669](https://github.com/qlover/fe-base/pull/669))

### Patch Changes

- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.4.0`
- Update dependency **@qlover/fe-corekit** from `3.4.4` to `3.5.0`
- Update dependency **@qlover/tailwind-theme** from `0.2.1` to `0.3.0`

## 1.3.4

### Patch Changes

#### ✨ Features

- **create-app:** Update package.json files across examples to enhance descriptions and improve clarity ([7cadb9b](https://github.com/qlover/fe-base/commit/7cadb9b48b54658184a93a9a68e96aa725cd31dd)) ([#661](https://github.com/qlover/fe-base/pull/661))

- **next-oauth:** enhance styling and theme generation for improved UI consistency ([c225d16](https://github.com/qlover/fe-base/commit/c225d164d09c5c71070c309022203295a840c024)) ([#657](https://github.com/qlover/fe-base/pull/657))

#### ♻️ Refactors

- **next-seed:** Update dependencies, ESLint configuration, and environment settings ([9bf2815](https://github.com/qlover/fe-base/commit/9bf2815bac8ed1459a1e7f43e8626402d5ff0bab)) ([#660](https://github.com/qlover/fe-base/pull/660))

- **user-service:** Update UserService and AppUserGateway to return GatewayResult types for improved error handling ([f9e0b64](https://github.com/qlover/fe-base/commit/f9e0b64dbecd45c1caa3d98a55095972322964b1)) ([#625](https://github.com/qlover/fe-base/pull/625))
- Update dependency **@qlover/fe-corekit** from `3.4.3` to `3.4.4`
- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.3.1`

## 0.1.3

### Patch Changes

- Update dependency **@qlover/logger** from `1.2.0` to `1.2.1`
- Update dependency **@qlover/oauth-wrapper** from `0.6.2` to `0.6.3`
- Update dependency **@qlover/tailwind-theme** from `0.2.0` to `0.2.1`
- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.3.1`
