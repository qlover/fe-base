# @qlover/tailwind-theme

## 0.1.1

### Patch Changes

#### 🐞 Bug Fixes

- **tailwind-theme:** update package.json main and require fields for module compatibility ([07d4248](https://github.com/qlover/fe-base/commit/07d424898731a122bfccb6f50cb098f3bebb9220)) ([#611](https://github.com/qlover/fe-base/pull/611))
  - Changed the "main" field from "./dist/index.umd.js" to "./dist/index.js" for better module resolution.
  - Updated the "require" field from "./dist/index.umd.js" to "./dist/index.cjs" to align with CommonJS standards.

  These modifications aim to enhance compatibility and streamline module imports for the tailwind-theme package.

## 0.1.0

### Minor Changes

#### ♻️ Refactors

- **theme:** rename ui-theme to tailwind-theme and update dependencies ([6eb08ac](https://github.com/qlover/fe-base/commit/6eb08ac6d7f808b900365407b24ec6fa7a033ce1)) ([#609](https://github.com/qlover/fe-base/pull/609))
  - Replaced all instances of '@qlover/ui-theme' with '@qlover/tailwind-theme' across various files to reflect the new package name.
  - Updated the pnpm-lock.yaml to link the new tailwind-theme package and adjust dependencies accordingly.
  - Modified configuration files and example projects to utilize the new tailwind-theme for improved theming support.
  - Enhanced documentation in README files to guide users on the new theme integration.

  These changes aim to streamline the theming experience and ensure consistency across the application.
