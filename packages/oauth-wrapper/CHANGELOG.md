# Changelog

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
