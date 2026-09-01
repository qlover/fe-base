# Changelog

## 0.9.0

### Minor Changes

#### ✨ Features

- **oauth-wrapper:** 新增 NoOpOAuthWrapperRepository ([e21c0f1](https://github.com/qlover/fe-base/commit/e21c0f161e3a02d548405d47bc0e80cb980b9117)) ([#690](https://github.com/qlover/fe-base/pull/690))

- **oauth-wrapper:** Create/Update schema 支持 logo_uri ([9e3deed](https://github.com/qlover/fe-base/commit/9e3deed0cdfa50eba3ed76004b47178872c46f2a)) ([#687](https://github.com/qlover/fe-base/pull/687))

## 0.8.0

### Minor Changes

#### ✨ Features

- **oauth-wrapper:** 新增 NoOpOAuthWrapperRepository ([e21c0f1](https://github.com/qlover/fe-base/commit/e21c0f161e3a02d548405d47bc0e80cb980b9117)) ([#690](https://github.com/qlover/fe-base/pull/690))

- **oauth-wrapper:** Create/Update schema 支持 logo_uri ([9e3deed](https://github.com/qlover/fe-base/commit/9e3deed0cdfa50eba3ed76004b47178872c46f2a)) ([#687](https://github.com/qlover/fe-base/pull/687))

## 0.7.0

### Minor Changes

#### ✨ Features

- **oauth-wrapper:** 增加本地身份映射并 await 会话 ([b9b228e](https://github.com/qlover/fe-base/commit/b9b228ef65e730aa624f431c88164be13ba840a9)) ([#685](https://github.com/qlover/fe-base/pull/685))

#### 🐞 Bug Fixes

- **oauth-wrapper:** 修复 identity store 测试类型错误 ([0955288](https://github.com/qlover/fe-base/commit/0955288a019bab5490cdbe2bc066663ff05152a0)) ([#685](https://github.com/qlover/fe-base/pull/685))

## 0.6.3

### Patch Changes

- Update dependency **@qlover/logger** from `1.2.0` to `1.2.1`
- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.3.1`

## 0.2.1

### Patch Changes

#### ♻️ Refactors

- **oauth-wrapper:** change userId type from number to string across interfaces and schemas ([bfe85fa](https://github.com/qlover/fe-base/commit/bfe85fa6e82561164a936dca7e8a9d8e1ca6b7e3)) ([#618](https://github.com/qlover/fe-base/pull/618))
  - Updated the `ownerUserId` and `userId` parameters in various interfaces and schemas to use `string` instead of `number` for better compatibility with string-based identifiers.
  - Adjusted related service methods to reflect the new type, ensuring consistency across the OAuth wrapper implementation.
  - Enhanced the `OAuthClientRowSchema` and other schemas to align with the updated user ID type, improving data validation and integrity.

## 0.2.0

### Minor Changes

#### ✨ Features

- **oauth-wrapper:** extract OAuth 2.0 core into @qlover/oauth-wrapper package ([d7f7f5c](https://github.com/qlover/fe-base/commit/d7f7f5c3a1d1f46b1ebf10f586426c3797c8c061)) ([#616](https://github.com/qlover/fe-base/pull/616))

  Move server, client, and core modules from the next-oauth-wrapper example into a standalone publishable package with PKCE support, tests, and documentation.

- **react-seed:** add useLocale hook for locale management ([9fcd9f8](https://github.com/qlover/fe-base/commit/9fcd9f8645d5454e516fe0fdd4e75fca00598f76)) ([#616](https://github.com/qlover/fe-base/pull/616))

  Introduced a new `useLocale` hook to manage locale settings within the application. This hook retrieves the current locale from route parameters or defaults to the configured locale, and provides a method to change the locale, updating the navigation accordingly. Additionally, updated `useOAuthLogin` to utilize the new `useLocale` hook for locale configuration during OAuth login processes.

  Also, added a `patchConfig` method in the `OAuthClient` class to allow dynamic updates to the client configuration, including locale settings.

#### 🐞 Bug Fixes

- **next-oauth-wrapper:** update local server ports in configuration files ([4fbb447](https://github.com/qlover/fe-base/commit/4fbb447e2a333435ae2824327b2d066eb3355972)) ([#616](https://github.com/qlover/fe-base/pull/616))

  Changed the default local server ports in `robots.txt` and various files from 3120 to 3102 for consistency across the next-oauth-wrapper example. Additionally, added titles to `LocaleLink` components in the login page for better accessibility and user experience. This update ensures a smoother development environment and improves the clarity of navigation links.

## 0.1.0

- Initial publish: extract OAuth 2.0 protocol core from `examples/next-oauth-wrapper/shared/oauth-wrapper`.
