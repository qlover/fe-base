# @qlover/corekit-bridge

## 1.0.2

### Patch Changes

#### ♻️ Refactors

- **theme-service:** enhance theme configuration and remove unused tw-generator ([1f11c20](https://github.com/qlover/fe-base/commit/1f11c20b8fda9e4208cd568e544b264b42f1b0c0)) ([#406](https://github.com/qlover/fe-base/pull/406))

  - Introduced a default theme configuration with properties for DOM attribute, default theme, target element, supported themes, storage key, initialization, and store prioritization.
  - Updated ThemeService to utilize the new configuration and improved theme binding logic.
  - Enhanced ThemeStateGetter to conditionally access storage based on the new prioritizeStore property.
  - Removed the unused tw-generator file to streamline the theme service module.

- **theme-service:** add cacheTarget option and improve target element handling ([3a290dc](https://github.com/qlover/fe-base/commit/3a290dc022878858bfc7a9ef0a47c49d05c74702)) ([#406](https://github.com/qlover/fe-base/pull/406))

  - Introduced a new cacheTarget property in the theme configuration to optimize target element retrieval.
  - Enhanced ThemeService to cache the target element for improved performance.
  - Updated bindToTheme method to utilize the new getTarget method for better clarity and efficiency.
  - Removed redundant storage handling from changeTheme method to streamline theme updates.

## 1.0.1

### Patch Changes

#### 🐞 Bug Fixes

- restore types entry and enhance exports in package.json (#392)

  ***

## 1.0.0

### Major Changes

#### ✨ Features

- enhance build configuration and export structure (#390)

  - Updated Rollup configuration to utilize createBaseRollup for streamlined builds.
  - Added new TypeScript configuration files for building and ESM support.
  - Modified package.json to include main and module entries for better module resolution.
  - Expanded exports in core index file to include additional dependencies.
  - Refactored ColorFormatter to improve method visibility and added override annotation.

#### 🐞 Bug Fixes

- remove unnecessary console.info call from test (#389)

#### 📝 Documentation

- update import paths and refactor logger usage in documentation (#390)

  - Changed import paths in README files to remove 'build' directory references for Tailwind, Vite, and TypeScript tools.
  - Refactored logger example to use new Logger and ColorFormatter classes, improving clarity in usage.

## 0.2.1

## 0.2.0

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

## 0.1.0

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

## 0.0.10

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

## 0.0.9

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 0.0.8

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

## 0.0.4 (2025-04-17)

### Features

- corekit-bridge ([#294](https://github.com/qlover/fe-base/issues/294)) ([e5e2237](https://github.com/qlover/fe-base/commit/e5e2237f8f5cd2294fd4667e08a1714999c52fa1))
- feature yarn to pnpm ([#297](https://github.com/qlover/fe-base/issues/297)) ([c3e13d5](https://github.com/qlover/fe-base/commit/c3e13d509a752267d9be29e7a5ed609d24c309ce))

## 0.0.3 (2025-04-17)

## 0.0.1 (2025-03-25)

### Features

- corekit-bridge ([#294](https://github.com/qlover/fe-base/issues/294)) ([e5e2237](https://github.com/qlover/fe-base/commit/e5e2237f8f5cd2294fd4667e08a1714999c52fa1))
