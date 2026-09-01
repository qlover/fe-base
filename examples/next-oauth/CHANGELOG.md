# examples/next-oauth

## 1.4.1

### Patch Changes

- Update dependency **@qlover/next-kit** from `1.3.0` to `1.3.1`
- Update dependency **@qlover/oauth-wrapper** from `0.9.0` to `0.9.1`

## 1.4.0

### Minor Changes

#### ✨ Features

- **next-oauth:** 接入 OTP 限流与 KvCache 迁移 ([e3c8ae2](https://github.com/qlover/fe-base/commit/e3c8ae228757a6291131298dc5e6ed2206e43bb0)) ([#690](https://github.com/qlover/fe-base/pull/690))

- **next-oauth:** AuthButton 用户菜单下拉 ([037673b](https://github.com/qlover/fe-base/commit/037673bc9018636ee05f5eb0a7f7356d9c23a04a)) ([#690](https://github.com/qlover/fe-base/pull/690))

### Patch Changes

- Update dependency **@qlover/next-kit** from `1.2.1` to `1.3.0`
- Update dependency **@qlover/oauth-wrapper** from `0.8.1` to `0.9.0`

## 1.2.0

### Minor Changes

#### ✨ Features

- **next-oauth:** 引入 KvCache 并优化 session 接口性能 ([61c2498](https://github.com/qlover/fe-base/commit/61c249884fbfa07b2eacf5d8ad2685d53020b961)) ([#688](https://github.com/qlover/fe-base/pull/688))

- **oauth-wrapper:** Create/Update schema 支持 logo_uri ([9e3deed](https://github.com/qlover/fe-base/commit/9e3deed0cdfa50eba3ed76004b47178872c46f2a)) ([#687](https://github.com/qlover/fe-base/pull/687))

- **examples:** 同步 developer-apps UI 优化（logo、加载态、弹窗） ([80df729](https://github.com/qlover/fe-base/commit/80df729f4466067eac4f51ac14e661fddef8324b)) ([#687](https://github.com/qlover/fe-base/pull/687))

#### 🐞 Bug Fixes

- **Dropdown:** 修复首次弹出位置偏移，新增 menuMinWidth 属性 ([52bc87d](https://github.com/qlover/fe-base/commit/52bc87dd1ec79f87004744862a7145170b9319a7)) ([#688](https://github.com/qlover/fe-base/pull/688))

- **next-oauth:** 修复 rotate-secret URL 拼错导致 405 ([2243ee5](https://github.com/qlover/fe-base/commit/2243ee55333b2f6dfdc21c9deafe3bc1180b0219)) ([#687](https://github.com/qlover/fe-base/pull/687))

### Patch Changes

- Update dependency **@qlover/next-kit** from `1.0.1` to `1.1.0`

## 1.1.0

### Minor Changes

#### ✨ Features

- **next-oauth:** 接入本地身份并保留登录语言 ([8008fbc](https://github.com/qlover/fe-base/commit/8008fbcc558cc3bb06b5ce451d59475887ed546e)) ([#685](https://github.com/qlover/fe-base/pull/685))

#### 🐞 Bug Fixes

- **examples:** LocaleLink uses current locale ([8219c5a](https://github.com/qlover/fe-base/commit/8219c5a2a29e4c183b846b5202c8c468ee3a87ec)) ([#684](https://github.com/qlover/fe-base/pull/684))

### Patch Changes

- Update dependency **@qlover/oauth-wrapper** from `0.6.3` to `0.7.0`

## 1.0.0

### Major Changes

#### 🐞 Bug Fixes

- **vitest:** 修复 next-kit 在 create-release-pr 下的测试失败 ([1fb152c](https://github.com/qlover/fe-base/commit/1fb152c803987ce64f100b96b8f77daedac4dd70)) ([#680](https://github.com/qlover/fe-base/pull/680))

- **next-oauth:** Pages 主题与 kit 样式扫描 ([9472b11](https://github.com/qlover/fe-base/commit/9472b11dc42362d9256aad656f30ccbb2c19cebc)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **examples:** 修复 tailwind.config 重复导出 ([201c51f](https://github.com/qlover/fe-base/commit/201c51f5609eca3f9ed10d9118f8cd392ae5c3b4)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **examples:** 语言切换时保留 next-intl 动态路由 params ([dc21ff1](https://github.com/qlover/fe-base/commit/dc21ff19ccb819df67ed8142a50cfcd414842006)) ([#678](https://github.com/qlover/fe-base/pull/678))

- **next-oauth:** middleware page auth gate and Pages theme FOUC sync ([a36ba9a](https://github.com/qlover/fe-base/commit/a36ba9a39186b395b43b083b2e72cbbfbe76d6ce)) ([#677](https://github.com/qlover/fe-base/pull/677))

- **examples:** 避免裸 hidden 类被浏览器扩展覆盖显示 ([e456658](https://github.com/qlover/fe-base/commit/e456658f65b45d0785993cc1ddf6cebc929ea741)) ([#676](https://github.com/qlover/fe-base/pull/676))

- **next-oauth:** OAuth 机器端点返回扁平 RFC JSON 并完善 SSO 回调 ([6ec0793](https://github.com/qlover/fe-base/commit/6ec0793b2e818f24cd3cf8275d6d26f8ab828762)) ([#675](https://github.com/qlover/fe-base/pull/675))

- **next-oauth:** authorize 未登录跳转登录并经 redirect 回跳继续同意 ([c345c40](https://github.com/qlover/fe-base/commit/c345c4047097fb303931c7daa25f58f3ad991fe8)) ([#675](https://github.com/qlover/fe-base/pull/675))

- **next-oauth:** skip locale rewrite for OAuth endpoints and store refresh token ([cf7ee09](https://github.com/qlover/fe-base/commit/cf7ee09b5160e2222a7f5c84f2eabf269173b9e1)) ([#674](https://github.com/qlover/fe-base/pull/674))

#### ♻️ Refactors

- **next-oauth:** 接入 next-kit 包 ([59c9b66](https://github.com/qlover/fe-base/commit/59c9b6649db4d90be222bc83fc8cbd14eed8575c)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **next-oauth:** 服务端接口改用 next-kit ([19deea6](https://github.com/qlover/fe-base/commit/19deea689d0f4c3cbebdb5fc2d58d3b4112f2a29)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **examples:** 去掉 shared 与 next-kit 重复代码 ([3fe0867](https://github.com/qlover/fe-base/commit/3fe08674406c089a3180611230153be09c328c21)) ([#679](https://github.com/qlover/fe-base/pull/679))

- **ServerConfig, SupabaseOAuthProvider:** Normalize SITE_URL handling and enhance logging ([dcf824f](https://github.com/qlover/fe-base/commit/dcf824f3a309488a0528bf4f227f60f8dd94cddf)) ([#673](https://github.com/qlover/fe-base/pull/673))

- **SupabaseOAuthProvider, EmailOtpCallbackClient:** Update email login handling and improve URL management ([7eb54ce](https://github.com/qlover/fe-base/commit/7eb54ce29e1c82bc7060190dcd99f405e9ea8221)) ([#673](https://github.com/qlover/fe-base/pull/673))

- **SupabaseOAuthProvider, EmailOtpCallbackClient:** Enhance email login flow and URL handling ([05b7cdb](https://github.com/qlover/fe-base/commit/05b7cdba522d02e23a1eba8abb41d7394bd80114)) ([#673](https://github.com/qlover/fe-base/pull/673))

### Patch Changes

- Update dependency **@qlover/next-kit** from `0.0.2` to `1.0.0`

## 0.3.0

### Minor Changes

#### ✨ Features

- **i18n:** Introduce locale support and update path resolutions ([7366382](https://github.com/qlover/fe-base/commit/736638222983f1952c6191c48ed0aef84463afcb)) ([#669](https://github.com/qlover/fe-base/pull/669))

### Patch Changes

- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.4.0`
- Update dependency **@qlover/fe-corekit** from `3.4.4` to `3.5.0`
- Update dependency **@qlover/tailwind-theme** from `0.2.1` to `0.3.0`
- Update dependency **@qlover/oauth-wrapper** from `0.6.3` to `0.6.4`

## 0.2.4

### Patch Changes

#### ✨ Features

- **create-app:** Update package.json files across examples to enhance descriptions and improve clarity ([7cadb9b](https://github.com/qlover/fe-base/commit/7cadb9b48b54658184a93a9a68e96aa725cd31dd)) ([#661](https://github.com/qlover/fe-base/pull/661))

- **next-oauth:** introduce i18n key utilities and refactor schema validation ([681c946](https://github.com/qlover/fe-base/commit/681c94618eaa9ef73bb2279480dd899bb357329c)) ([#657](https://github.com/qlover/fe-base/pull/657))

- **next-oauth:** enhance accessibility and styling in UI components ([e97c6df](https://github.com/qlover/fe-base/commit/e97c6df6d52b75d124378a1026585f48060cea81)) ([#657](https://github.com/qlover/fe-base/pull/657))

- **next-oauth:** enhance styling and theme generation for improved UI consistency ([c225d16](https://github.com/qlover/fe-base/commit/c225d164d09c5c71070c309022203295a840c024)) ([#657](https://github.com/qlover/fe-base/pull/657))

- **next-oauth:** integrate Brain User as an optional OAuth upstream provider ([9cc22df](https://github.com/qlover/fe-base/commit/9cc22df8f0dfe01d93900104bf906a262942522f)) ([#656](https://github.com/qlover/fe-base/pull/656))

- add new icons and update manifest for improved branding ([ac91992](https://github.com/qlover/fe-base/commit/ac91992f843614d3b71774d854775ecdf977e80d)) ([#655](https://github.com/qlover/fe-base/pull/655))

- add Tooltip component for enhanced UI interactions ([47e918e](https://github.com/qlover/fe-base/commit/47e918e2c2757a02f6415bbfad4cf2499e4c54d1)) ([#655](https://github.com/qlover/fe-base/pull/655))

- introduce Button component and refactor button usage across the application ([9818799](https://github.com/qlover/fe-base/commit/981879924db5594d9f26dfe618ae74d9c422a81a)) ([#655](https://github.com/qlover/fe-base/pull/655))

- implement Dropdown component for enhanced UI selection ([daff2fb](https://github.com/qlover/fe-base/commit/daff2fb64d4364a63d41a0fbeade5481a379f2a4)) ([#655](https://github.com/qlover/fe-base/pull/655))

- integrate sonner for toast notifications and enhance dialog handling ([70749cc](https://github.com/qlover/fe-base/commit/70749ccb5cf880dda70d0cd66651b4413b65990e)) ([#655](https://github.com/qlover/fe-base/pull/655))

- enhance demo UI with internationalization and Ant Design integration ([d1c871e](https://github.com/qlover/fe-base/commit/d1c871e6833046025e18659e12ae3933f114e75d)) ([#655](https://github.com/qlover/fe-base/pull/655))

- enhance table component with pagination and internationalization support ([76ce604](https://github.com/qlover/fe-base/commit/76ce604b5a9fe0ebf5314ccf01739894c46f83b4)) ([#655](https://github.com/qlover/fe-base/pull/655))

- add clear request logs functionality with internationalization support ([a6bf119](https://github.com/qlover/fe-base/commit/a6bf11987260cc8491060acbcf30e47a92feb7a2)) ([#655](https://github.com/qlover/fe-base/pull/655))

- enhance Dialog and Modal components with customizable class names ([9c9bc09](https://github.com/qlover/fe-base/commit/9c9bc09c385f1d7d530e23716f5d9383711b9ad4)) ([#655](https://github.com/qlover/fe-base/pull/655))

- add demo UI route and internationalization support ([5d70ee0](https://github.com/qlover/fe-base/commit/5d70ee04a5919d71b4ce2ecdf2d39f8b9d8a7bd6)) ([#655](https://github.com/qlover/fe-base/pull/655))

#### 🐞 Bug Fixes

- **next-oauth:** enhance TokenEncryption utility functions and type safety ([695e2b9](https://github.com/qlover/fe-base/commit/695e2b920b863f148a4bad32e695c5c97e04e3ec)) ([#656](https://github.com/qlover/fe-base/pull/656))

#### ♻️ Refactors

- **next-oauth:** replace lodash with lodash-es for improved tree-shaking and bundle size ([ac477bf](https://github.com/qlover/fe-base/commit/ac477bf24a7059e4718a3bb9af3e2a51f9abf7c9)) ([#657](https://github.com/qlover/fe-base/pull/657))

- **next-oauth:** update imports from fe-corekit for improved module structure ([e6ef3c6](https://github.com/qlover/fe-base/commit/e6ef3c6117849afdfa477c6c8ae441f87fde8932)) ([#657](https://github.com/qlover/fe-base/pull/657))

- **next-oauth:** standardize OAuth upstream provider handling ([d33b6f8](https://github.com/qlover/fe-base/commit/d33b6f8be1cdbf15cba94ba0c814d11d808bda1b)) ([#656](https://github.com/qlover/fe-base/pull/656))

- update OAuth client and user services for improved session handling ([1b1dbc6](https://github.com/qlover/fe-base/commit/1b1dbc60a2b5b8d5ff2273c3025a0fd068778b77)) ([#655](https://github.com/qlover/fe-base/pull/655))

- replace Ant Design icons with Heroicons in next-oauth example ([45b31d6](https://github.com/qlover/fe-base/commit/45b31d64db060e84436dbfca02e2c25118192555)) ([#655](https://github.com/qlover/fe-base/pull/655))

- improve code readability and organization across multiple components ([4ee65f4](https://github.com/qlover/fe-base/commit/4ee65f443a289768bba09a2c4c23563bb792e50b)) ([#655](https://github.com/qlover/fe-base/pull/655))
- Update dependency **@qlover/fe-corekit** from `3.4.3` to `3.4.4`
- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.3.1`
- Update dependency **@qlover/oauth-wrapper** from `0.6.3` to `0.6.4`

## 0.1.3

### Patch Changes

- Update dependency **@qlover/logger** from `1.2.0` to `1.2.1`
- Update dependency **@qlover/oauth-wrapper** from `0.6.2` to `0.6.3`
- Update dependency **@qlover/tailwind-theme** from `0.2.0` to `0.2.1`
- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.3.1`
