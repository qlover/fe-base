# @qlover/create-app

## 0.4.0

### Minor Changes

#### 🐞 Bug Fixes

- **create-app:** update root path resolution to use dirname for compatibility with ES modules ([d091f0b](https://github.com/qlover/fe-base/commit/d091f0bc5ed17a6d16a7bedcac5416a41cba41d2)) ([#426](https://github.com/qlover/fe-base/pull/426))

## 0.3.8

### Patch Changes

#### 🐞 Bug Fixes

- **create-app:** update dependencies and tsup configuration for @qlover/create-app ([4a5fa84](https://github.com/qlover/fe-base/commit/4a5fa846ae6c3df97c73df5e594c3adb4fb7cda9)) ([#424](https://github.com/qlover/fe-base/pull/424))

  - Reorganized package.json to move "commander" and "ora" to dependencies from devDependencies, ensuring they are included in the production build.
  - Updated tsup.config.ts to enhance build configuration by defining external modules and adjusting minification and splitting settings for improved performance.

## 0.3.7

### Patch Changes

#### ✨ Features

- add tabify method to format commit body in GitChangelog ([5670b78](https://github.com/qlover/fe-base/commit/5670b78b1cb06a730d2cbd7ac1f5bd7e9e7df490)) ([#422](https://github.com/qlover/fe-base/pull/422))

  - Introduced a new `tabify` method to format the body of commit messages by adding indentation.
  - Updated `parseCommitlint` to utilize the `tabify` method for improved body formatting.

#### 🐞 Bug Fixes

- update @qlover/create-app to use ES module format ([5e9dffb](https://github.com/qlover/fe-base/commit/5e9dffb4d9e54dc2457588a81b11159820196067)) ([#422](https://github.com/qlover/fe-base/pull/422))

  - Changed the entry point in package.json from "dist/index.cjs" to "dist/index.js" to align with ES module standards.
  - Updated tsup.config.ts to output in ES module format instead of CommonJS.
  - Refactored index.ts to use fileURLToPath for resolving the root path, enhancing compatibility with ES modules.

## 0.3.6

### Patch Changes

#### ♻️ Refactors

- update @qlover/create-app with new build tools and dependencies ([a6d902b](https://github.com/qlover/fe-base/commit/a6d902bee8a5f8b3c37669f26cf0862bf317ef6f)) ([#420](https://github.com/qlover/fe-base/pull/420))

- Replaced Rollup with tsup for building the application, enhancing build performance and simplifying configuration.
- Updated package.json to reflect changes in dependencies and scripts, including the removal of outdated entries.
- Improved README with installation and usage instructions for better user guidance.
- Removed unnecessary files and streamlined the project structure for clarity.

## 0.3.5

### Patch Changes

#### ✨ Features

- enhance Vite configuration and add new dependencies for improved build performance ([e14ee42](https://github.com/qlover/fe-base/commit/e14ee428d46fc48decb99762103c25d6e6c8535e)) ([#418](https://github.com/qlover/fe-base/pull/418))

- Added `terser` for advanced minification options, including console log removal and improved compression.
- Introduced `vite-plugin-imp` to optimize Ant Design imports, reducing bundle size and improving load times.
- Updated Vite configuration to define manual chunks for better code splitting and chunk management.

  Co-authored-by: QRJ <renjie.qin@brain.im>

## 0.3.4

### Patch Changes

#### ✨ Features

- enhance React app with Ant Design integration and theming improvements ([374eaa3](https://github.com/qlover/fe-base/commit/374eaa36ab85b71543668721888823c41793aa23)) ([#414](https://github.com/qlover/fe-base/pull/414))

- Added Vite as a dependency for improved build performance.
- Introduced new Ant Design components and updated existing ones for a consistent UI experience.
- Enhanced theming capabilities with new CSS variables and custom themes (default, dark, pink).
- Updated localization keys for the About page and added new messages for better user feedback.
- Refactored DialogHandler to manage Ant Design's static APIs globally.
- Improved overall code structure and organization for better maintainability.

  Co-authored-by: QRJ <renjie.qin@brain.im>

- enhance React app with improved configuration management and new components ([67f88cb](https://github.com/qlover/fe-base/commit/67f88cbc7cc0ebab51cbd33be66f98117fc2cf21)) ([#414](https://github.com/qlover/fe-base/pull/414))

- Introduced centralized AppConfig class for managing application settings and environment variables.
- Added DialogHandler for handling notifications and confirmations using Ant Design components.
- Refactored RouterLoader to support dynamic route configurations and lazy loading of components.
- Updated various API adapters to utilize the new AppConfig structure for better maintainability.
- Removed outdated DialogHandler implementation and reorganized related files for improved clarity.

  Co-authored-by: QRJ <renjie.qin@brain.im>

- integrate @brain-toolkit/antd-theme-override for improved Ant D… ([4ebb081](https://github.com/qlover/fe-base/commit/4ebb081d89397424c459dd7f885817152098e322)) ([#414](https://github.com/qlover/fe-base/pull/414))

  - feat: integrate @brain-toolkit/antd-theme-override for improved Ant Design support

  * Added @brain-toolkit/antd-theme-override as a dependency to enhance theming capabilities.
  * Updated imports to utilize the new theming library, replacing the deprecated antd-overried references.
  * Removed outdated files related to the previous Ant Design integration to streamline the codebase.
  * Refactored components to leverage the new theme provider and static API interface for notifications and modals.

  Co-authored-by: QRJ <renjie.qin@brain.im>

  - feat(I18nService): add translation method for improved localization support

  * Implemented a new `t` method in the I18nService class to facilitate key-based translations.
  * The method accepts a translation key and optional parameters, returning the translated value or the key if no translation is found.
  * Enhanced localization handling to improve user experience across the application.

  ***

  Co-authored-by: QRJ <renjie.qin@brain.im>

## 0.3.3

### Patch Changes

#### ✨ Features

- **LanguageSwitcher:** add language switcher component to enhance localization ([72edba8](https://github.com/qlover/fe-base/commit/72edba8a71dabba00608fceafc355cf4bc2dfd63)) ([#411](https://github.com/qlover/fe-base/pull/411))

  - Introduced a new LanguageSwitcher component that allows users to change the application language.
  - Integrated the component into BaseHeader for improved accessibility.
  - Utilized Ant Design's Select component for a user-friendly interface.
  - Implemented language change functionality that updates the URL and i18n configuration accordingly.

- **Login:** integrate Ant Design components for enhanced user experience ([d380157](https://github.com/qlover/fe-base/commit/d380157d3360ad5b9e96d0e3edeb2639a3a6ba9f)) ([#408](https://github.com/qlover/fe-base/pull/408))

  - Added Ant Design library to the project dependencies.
  - Refactored the Login component to utilize Ant Design's Form, Input, and Button components, improving the UI and UX.
  - Implemented a structured login form with validation and Google sign-in option.
  - Enhanced layout with a brand section and feature highlights for better engagement.

- update React app with Tailwind CSS integration and Ant Design enhancements ([eff0ae2](https://github.com/qlover/fe-base/commit/eff0ae25eb2f831b2344a9d4307495377dce647f)) ([#408](https://github.com/qlover/fe-base/pull/408))

- Added Tailwind CSS and its PostCSS and Vite plugins to the project dependencies.
- Refactored the PostCSS configuration to utilize the new Tailwind CSS setup.
- Updated the Tailwind configuration to simplify theme management.
- Enhanced the Login component with Ant Design's Form and Input components, improving the UI.
- Introduced a new CSS structure for theming, including default, dark, and pink themes.
- Removed outdated Tailwind CSS files from the uikit directory to streamline styles.

- enhance React app UI with Ant Design components and improve theming ([008e69a](https://github.com/qlover/fe-base/commit/008e69a89ca0ed0fe23d60c2b368fbd88bb3f15c)) ([#408](https://github.com/qlover/fe-base/pull/408))

- Replaced various UI elements with Ant Design components for a consistent look and feel.
- Updated ErrorIdentifier and Executor components to utilize Ant Design's Button and layout features.
- Refactored styles to leverage CSS variables for better theming across components.
- Added new task management features in the Executor component, including task creation and status tracking.
- Improved overall layout and responsiveness of pages with enhanced CSS styling.

- enhance localization and error handling in React app ([f8a5398](https://github.com/qlover/fe-base/commit/f8a5398084cde69b967242a1db89d511a4b2b79e)) ([#408](https://github.com/qlover/fe-base/pull/408))
  feat: enhance localization and error handling in React app

- Introduced new localization keys for various pages including JSONStorage, Request, and Executor.
- Updated components to utilize new localization keys for improved internationalization support.
- Removed outdated error identifiers and added new ones for better clarity and consistency.
- Enhanced the Home, About, and ErrorIdentifier components with improved localization.
- Streamlined theme switcher labels to utilize localization keys for better user experience.

#### ♻️ Refactors

- **Bootstrap:** update dependencies and refactor core components ([9aeff78](https://github.com/qlover/fe-base/commit/9aeff78209925a9e3e6e4cdf1e5a7cbbcecb07f8)) ([#411](https://github.com/qlover/fe-base/pull/411))

  - Upgraded @qlover/corekit-bridge to version ^1.0.3 in package.json.
  - Refactored startup function to use 'root' instead of 'window' for better compatibility.
  - Removed InversifyIocInterface.ts as it was no longer needed.
  - Enhanced I18nService to manage loading state and language changes more effectively.
  - Introduced BootstrapsRegistry for improved bootstrap management and organization.
  - Updated various register classes to align with new IOC structure and improve dependency injection.
  - Added printBootstrap for logging successful bootstrap initialization.

- **Home, JSONStorage, Layout, BaseHeader:** enhance UI with Ant Design components and improve theming ([8023e01](https://github.com/qlover/fe-base/commit/8023e0179729859a1406f5dabf013f529c1a2b58)) ([#408](https://github.com/qlover/fe-base/pull/408))

  - Replaced button elements with Ant Design's Button component for a consistent UI experience.
  - Updated layout and background colors to utilize CSS variables for better theming.
  - Refactored navigation items in Home component for improved structure and readability.
  - Enhanced JSONStorage component styling and layout for better user interaction.
  - Improved BaseHeader styling with new background and border colors for a modern look.

- streamline UI components and enhance theming in React app ([9baf49b](https://github.com/qlover/fe-base/commit/9baf49b60b58f3c3e614f2bf473853a50abeff8e)) ([#408](https://github.com/qlover/fe-base/pull/408))

- Consolidated background and text color styles across various components to utilize CSS variables for improved theming.
- Updated 404 and 500 error pages to align with new color schemes.
- Refactored Login, About, and Executor components to enhance layout and responsiveness.
- Improved overall consistency in UI by replacing hardcoded colors with theme variables.
- Enhanced the Home and JSONStorage components for better user experience and visual appeal.

- update localization and error handling in React app ([b5617a1](https://github.com/qlover/fe-base/commit/b5617a1e04770352d92a840a59728a57955475fe)) ([#408](https://github.com/qlover/fe-base/pull/408))

- Renamed error identifier files for clarity and consistency.
- Introduced new localization identifiers for error messages and page content.
- Updated configuration to reflect new file paths for error handling.
- Removed outdated localization files to streamline the project structure.
- Enhanced the Home and About components with improved localization support.

- **Loading:** update loading component with animated bouncing dots ([83ede4b](https://github.com/qlover/fe-base/commit/83ede4b644a01843dd64e2d3e5254730f115d1ec)) ([#408](https://github.com/qlover/fe-base/pull/408))

  - Replaced the SVG spinner with a new loading animation using bouncing dots for improved visual appeal.
  - Utilized the clsx library for conditional class management, enhancing readability and maintainability.
  - Adjusted styles to support dark mode and added backdrop blur for fullscreen loading state.

## 0.3.2

### Patch Changes

#### 🐞 Bug Fixes

- **ColorFormatter.test:** remove unnecessary console.info call from test ([6f58880](https://github.com/qlover/fe-base/commit/6f588806c1db82042aaf2f9ebfa29846397e254c)) ([#389](https://github.com/qlover/fe-base/pull/389))

## 0.3.1

## 0.3.0

### Minor Changes

#### ✨ Features

- integrate @qlover/logger into corekit-bridge (#373)

  - Added @qlover/logger as a dependency across multiple files, replacing the previous logger from @qlover/fe-corekit.
  - Updated type references to LoggerInterface in Bootstrap, ApiCatchPlugin, and ApiMockPlugin.
  - Introduced ColorFormatter for enhanced logging capabilities, with tests added for ColorFormatter and ColorLogger.
  - Updated tsconfig.json to include test files for better coverage.
  - Adjusted pnpm-lock.yaml to reflect the new logger integration.

#### 🐞 Bug Fixes

- update ColorFormatter tests to utilize LogContext (#373)

  - Modified ColorFormatter tests to use the new LogContext class for improved context handling.
  - Adjusted the test setup to ensure proper formatting of color segments with the updated LogContext structure.
  - Exported LogContext from the logger package for broader accessibility.

#### ♻️ Refactors

- enhance context handling and update ColorFormatter tests (#373)

  - Refactored logger context handling to utilize a new LogContext class for better type safety and clarity.
  - Updated ColorFormatter tests to use logger.context for passing context objects.
  - Adjusted ColorFormatter methods to improve handling of color segments and context.
  - Improved documentation for context usage in logger methods.

- replace ConsoleAppender with ConsoleHandler (#373)

  - Updated tests and implementation to utilize ConsoleHandler instead of ConsoleAppender for improved logging functionality.
  - Introduced ConsoleHandler class to manage log events and formatting.
  - Adjusted Logger integration to reflect the new handler structure across various test files and implementations.

  ***

## 0.2.1

## 0.2.0

### Minor Changes

#### ✨ Features

- Update ReleaseParams to include batchTagName and modify batchBranchName format (#362)

  - Added `batchTagName` for batch release tagging with a new default format.
  - Updated `batchBranchName` format to improve clarity and consistency.
  - Enhanced the logic for generating release tags in the ReleaseParams class.

- Introduce viteMockPackage plugin and add mock implementations for env-loader and fe-corekit (#362)

  - Added a new viteMockPackage plugin to facilitate mocking of specified packages in Vite tests.
  - Implemented mock classes for Env in @qlover/env-loader and Logger in @qlover/fe-corekit.
  - Updated vite.config.ts to include alias mappings for the mocked packages.
  - Refactored tests to utilize the new mock implementations, enhancing test isolation and reliability.

#### ♻️ Refactors

- Simplify getDependencyReleaseLine function to return an empty string (#362)

  - Removed unnecessary parameters and streamlined the function for better clarity and performance.

- Update GitChangelogOptions interface and improve comments (#362)

  - Translated comments from Chinese to English for better clarity.
  - Enhanced the GitChangelogOptions interface by adding a new `formatter` property and updating existing descriptions for consistency.
  - Cleaned up comments in the GitChangelog class for improved readability.

- Enhance viteMockPackage to support dynamic alias mapping (#362)

  - Introduced `parsePackagesMap` function to dynamically generate alias mappings for specified packages in vite.config.ts.
  - Updated vite.config.ts to utilize the new function, improving maintainability and flexibility of package mocking.
  - Removed hardcoded alias mappings for a more scalable approach to package management.

  ***

## 0.1.22

### Patch Changes

#### ✨ Features

- Update ReleaseParams to include batchTagName and modify batchBranchName format (#362)

  - Added `batchTagName` for batch release tagging with a new default format.
  - Updated `batchBranchName` format to improve clarity and consistency.
  - Enhanced the logic for generating release tags in the ReleaseParams class.

- Introduce viteMockPackage plugin and add mock implementations for env-loader and fe-corekit (#362)

  - Added a new viteMockPackage plugin to facilitate mocking of specified packages in Vite tests.
  - Implemented mock classes for Env in @qlover/env-loader and Logger in @qlover/fe-corekit.
  - Updated vite.config.ts to include alias mappings for the mocked packages.
  - Refactored tests to utilize the new mock implementations, enhancing test isolation and reliability.

#### ♻️ Refactors

- Simplify getDependencyReleaseLine function to return an empty string (#362)

  - Removed unnecessary parameters and streamlined the function for better clarity and performance.

- Update GitChangelogOptions interface and improve comments (#362)

  - Translated comments from Chinese to English for better clarity.
  - Enhanced the GitChangelogOptions interface by adding a new `formatter` property and updating existing descriptions for consistency.
  - Cleaned up comments in the GitChangelog class for improved readability.

- Enhance viteMockPackage to support dynamic alias mapping (#362)

  - Introduced `parsePackagesMap` function to dynamically generate alias mappings for specified packages in vite.config.ts.
  - Updated vite.config.ts to utilize the new function, improving maintainability and flexibility of package mocking.
  - Removed hardcoded alias mappings for a more scalable approach to package management.

  ***

## 0.1.21

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 0.1.20

### Patch Changes

#### ✨ Features

- implement GitChangelog for improved changelog generation (#351)

  - Introduced a new GitChangelog class to facilitate the generation of changelogs based on Git commit history.
  - Added interfaces for PRCommit, CommitInfo, and FlatCommit to structure commit data.
  - Updated Changelog plugin to utilize GitChangelog for fetching and formatting PR commits, replacing the previous conventional-changelog implementation.
  - Enhanced default options for changelog types and formatting.

#### 🐞 Bug Fixes

- add option to push changed labels to release PRs in workflow (#353)

- Updated dependencies
  - @qlover/fe-corekit@1.2.8
  - @qlover/scripts-context@0.0.14

## 0.1.15 (2025-04-17)

### Features

- add inversify ioc ([#270](https://github.com/qlover/fe-base/issues/270)) ([8c7ba06](https://github.com/qlover/fe-base/commit/8c7ba06bc5bef63d85c59a94737afac9be59138f))
- add script-context ([#213](https://github.com/qlover/fe-base/issues/213)) ([e021441](https://github.com/qlover/fe-base/commit/e021441180d4c4bd89947b155d39224f89699fda))
- create app v0.1 ([#209](https://github.com/qlover/fe-base/issues/209)) ([b730d76](https://github.com/qlover/fe-base/commit/b730d76512a9e1ce765ec77145abfe179b585178))
- feature yarn to pnpm ([#297](https://github.com/qlover/fe-base/issues/297)) ([c3e13d5](https://github.com/qlover/fe-base/commit/c3e13d509a752267d9be29e7a5ed609d24c309ce))
- optz create-app deep ([#244](https://github.com/qlover/fe-base/issues/244)) ([c0a89ef](https://github.com/qlover/fe-base/commit/c0a89ef5dc2f3cc216b4fc1968b1b626c58947d5))
- template context ([#241](https://github.com/qlover/fe-base/issues/241)) ([9fb3046](https://github.com/qlover/fe-base/commit/9fb3046e3e67c02e5fe4fea81a9a3ef8422e3013))

### Bug Fixes

- .gitignore no file ([#207](https://github.com/qlover/fe-base/issues/207)) ([e61d468](https://github.com/qlover/fe-base/commit/e61d4683a072048326205272d927e7e67b87ba70))
- add pnpm install ([#248](https://github.com/qlover/fe-base/issues/248)) ([e1e9f48](https://github.com/qlover/fe-base/commit/e1e9f4841365c51e9b8ea7b01ac6fc70e35eec37))
- release publish npm ([#327](https://github.com/qlover/fe-base/issues/327)) ([fa26d04](https://github.com/qlover/fe-base/commit/fa26d04eab2fa1ea4baa05c4d3502e5a873d5c8c))

## 0.1.14 (2025-04-17)

## [0.1.12](https://github.com/qlover/fe-base/compare/create-app-v0.1.11...create-app-v0.1.12) (2025-03-18)

### Features

- add inversify ioc ([#270](https://github.com/qlover/fe-base/issues/270)) ([8c7ba06](https://github.com/qlover/fe-base/commit/8c7ba06bc5bef63d85c59a94737afac9be59138f))

## [0.1.11](https://github.com/qlover/fe-base/compare/create-app-v0.1.10...create-app-v0.1.11) (2025-03-12)

## [0.1.10](https://github.com/qlover/fe-base/compare/create-app-v0.1.9...create-app-v0.1.10) (2025-02-20)

## [0.1.9](https://github.com/qlover/fe-base/compare/create-app-v0.1.8...create-app-v0.1.9) (2025-02-20)

### Bug Fixes

- add pnpm install ([#248](https://github.com/qlover/fe-base/issues/248)) ([e1e9f48](https://github.com/qlover/fe-base/commit/e1e9f4841365c51e9b8ea7b01ac6fc70e35eec37))

## [0.1.8](https://github.com/qlover/fe-base/compare/create-app-v0.1.7...create-app-v0.1.8) (2025-02-19)

## [0.1.7](https://github.com/qlover/fe-base/compare/create-app-v0.1.6...create-app-v0.1.7) (2025-02-19)

### Features

- optz create-app deep ([#244](https://github.com/qlover/fe-base/issues/244)) ([c0a89ef](https://github.com/qlover/fe-base/commit/c0a89ef5dc2f3cc216b4fc1968b1b626c58947d5))

## [0.1.6](https://github.com/qlover/fe-base/compare/create-app-v0.1.5...create-app-v0.1.6) (2025-02-14)

### Features

- template context ([#241](https://github.com/qlover/fe-base/issues/241)) ([9fb3046](https://github.com/qlover/fe-base/commit/9fb3046e3e67c02e5fe4fea81a9a3ef8422e3013))

## [0.1.5](https://github.com/qlover/fe-base/compare/create-app-v0.1.4...create-app-v0.1.5) (2025-02-13)

## [0.1.4](https://github.com/qlover/fe-base/compare/create-app-v0.1.3...create-app-v0.1.4) (2025-01-20)

## [0.1.3](https://github.com/qlover/fe-base/compare/create-app-v0.1.2...create-app-v0.1.3) (2025-01-17)

## [0.1.2](https://github.com/qlover/fe-base/compare/create-app-v0.1.1...create-app-v0.1.2) (2025-01-17)

### Features

- add script-context ([#213](https://github.com/qlover/fe-base/issues/213)) ([e021441](https://github.com/qlover/fe-base/commit/e021441180d4c4bd89947b155d39224f89699fda))

## [0.1.1](https://github.com/qlover/fe-base/compare/create-app-v0.0.4...create-app-v0.1.1) (2025-01-15)

### Features

- create app v0.1 ([#209](https://github.com/qlover/fe-base/issues/209)) ([b730d76](https://github.com/qlover/fe-base/commit/b730d76512a9e1ce765ec77145abfe179b585178))

## [0.0.4](https://github.com/qlover/fe-base/compare/create-app-v0.0.3...create-app-v0.0.4) (2025-01-15)

### Bug Fixes

- .gitignore no file ([#207](https://github.com/qlover/fe-base/issues/207)) ([e61d468](https://github.com/qlover/fe-base/commit/e61d4683a072048326205272d927e7e67b87ba70))

## 0.0.1 (2025-01-14)

## 0.0.2 (2025-01-14)

### Features

- create fe app ([#200](https://github.com/qlover/fe-base/issues/200)) ([8d3668f](https://github.com/qlover/fe-base/commit/8d3668f0e69a579994a72fc7b36b5ba7d5633c70))
