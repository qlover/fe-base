# @qlover/scripts-context

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

## 0.1.1

### Patch Changes

#### ✨ Features

- integrate @qlover/logger into scripts-context package (#371)

  - Added @qlover/logger as a dependency, replacing the previous logger from @qlover/fe-corekit.
  - Updated Shell, ScriptContext, and ScriptsLogger to utilize the new LoggerInterface from @qlover/logger.
  - Enhanced logging capabilities with a new ColorFormatter for improved log output.
  - Updated tests to reflect changes in logger implementation, ensuring compatibility and functionality.

- update logger package configuration and add mock (#371)

  - Added 'logger' to the Vite alias configuration for improved module resolution.
  - Updated package.json to include a 'default' export alongside 'require'.
  - Refactored tsup configuration for cleaner setup and ensured TypeScript definitions are generated.
  - Introduced a mock for the logger package to facilitate testing.

- integrate @qlover/logger into fe-release package (#371)

  - Added @qlover/logger as a dependency in package.json and pnpm-lock.yaml.
  - Updated logger type references from @qlover/fe-corekit to LoggerInterface from @qlover/logger.
  - Refactored logging calls from verbose to debug level for consistency across the codebase.
  - Adjusted tests to accommodate the new logger implementation and ensure compatibility.

#### 🐞 Bug Fixes

- update logger type to 'any' in ExecPromiseShell and Shell tests to resolve TypeScript linting issues (#371)

#### 📝 Documentation

- add basic usage examples and configuration search for FeScriptContext (#371)

#### ♻️ Refactors

- restructure implementation files and remove deprecated dependencies (#371)

  - Moved implementation files for ConfigSearch, Shell, and related utilities to a new 'implement' directory for better organization.
  - Removed the dependency on '@qlover/fe-corekit' from pnpm-lock.yaml.
  - Updated test files to reflect the new import paths and ensure compatibility with the refactored structure.
  - Introduced a new ColorFormatter for enhanced logging capabilities.

- change logging level from verbose to debug in check-packages.ts for consistency (#371)

- update tsup configuration to support multiple build formats and disable TypeScript definitions for the main entry (#371)

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

## 0.0.15

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 0.0.14

### Patch Changes

- ### ✨ Features

  - implement GitChangelog for improved changelog generation (#351)

    - Introduced a new GitChangelog class to facilitate the generation of changelogs based on Git commit history.
    - Added interfaces for PRCommit, CommitInfo, and FlatCommit to structure commit data.
    - Updated Changelog plugin to utilize GitChangelog for fetching and formatting PR commits, replacing the previous conventional-changelog implementation.
    - Enhanced default options for changelog types and formatting.

  - release branchName arg (#291)
  - add pkgName to branchName tpl (#291)
  - add script-context (#213)

  ### 🐞 Bug Fixes

  - add option to push changed labels to release PRs in workflow (#353)
  - find module root path (#297)
  - merge search config (#224)

- Updated dependencies
  - @qlover/fe-corekit@1.2.8

## 0.0.11 (2025-04-17)

### Features

- add cache controller ([#310](https://github.com/qlover/fe-base/issues/310)) ([2a76aea](https://github.com/qlover/fe-base/commit/2a76aeaa53f0d681c637b48febfe62979a1e7496))
- add script-context ([#213](https://github.com/qlover/fe-base/issues/213)) ([e021441](https://github.com/qlover/fe-base/commit/e021441180d4c4bd89947b155d39224f89699fda))
- fe-release branchName arg, and change default branchName tpl:release-${pkgName}-${tagName} ([#291](https://github.com/qlover/fe-base/issues/291)) ([e89652c](https://github.com/qlover/fe-base/commit/e89652c499b8e20753b602eeb49865b303615e12))
- feature yarn to pnpm ([#297](https://github.com/qlover/fe-base/issues/297)) ([c3e13d5](https://github.com/qlover/fe-base/commit/c3e13d509a752267d9be29e7a5ed609d24c309ce))
- release scripts-contextV0.0.3 ([#216](https://github.com/qlover/fe-base/issues/216)) ([e6f92fb](https://github.com/qlover/fe-base/commit/e6f92fbe464c868c67d1e47f53464356dc13b9fe))
- remove shelljs dep, add dep inject ([#260](https://github.com/qlover/fe-base/issues/260)) ([c38112f](https://github.com/qlover/fe-base/commit/c38112f4540d6bd5dd89c419c6ecfa11f195dcbd))

### Bug Fixes

- **execPromise:** throw an Error ([#263](https://github.com/qlover/fe-base/issues/263)) ([816c9f9](https://github.com/qlover/fe-base/commit/816c9f9e442e8b6e7fa05feb9977d8a31bbfc677))
- script-context merge config ([#224](https://github.com/qlover/fe-base/issues/224)) ([8519dec](https://github.com/qlover/fe-base/commit/8519dec765bf560601c6081ddc5109d4395b6f3d))

## 0.0.10 (2025-04-17)

## [0.0.8](https://github.com/qlover/fe-base/compare/scripts-context-v0.0.7...scripts-context-v0.0.8) (2025-04-15)

### Features

- add cache controller ([#310](https://github.com/qlover/fe-base/issues/310)) ([2a76aea](https://github.com/qlover/fe-base/commit/2a76aeaa53f0d681c637b48febfe62979a1e7496))

## [0.0.7](https://github.com/qlover/fe-base/compare/scripts-context-v0.0.6...scripts-context-v0.0.7) (2025-03-25)

### Features

- fe-release branchName arg, and change default branchName tpl:release-${pkgName}-${tagName} ([#291](https://github.com/qlover/fe-base/issues/291)) ([e89652c](https://github.com/qlover/fe-base/commit/e89652c499b8e20753b602eeb49865b303615e12))

## [0.0.6](https://github.com/qlover/fe-base/compare/scripts-context-v0.0.5...scripts-context-v0.0.6) (2025-02-25)

### Bug Fixes

- **execPromise:** throw an Error ([#263](https://github.com/qlover/fe-base/issues/263)) ([816c9f9](https://github.com/qlover/fe-base/commit/816c9f9e442e8b6e7fa05feb9977d8a31bbfc677))

## [0.0.5](https://github.com/qlover/fe-base/compare/scripts-context-v0.0.4...scripts-context-v0.0.5) (2025-02-25)

### Features

- remove shelljs dep, add dep inject ([#260](https://github.com/qlover/fe-base/issues/260)) ([c38112f](https://github.com/qlover/fe-base/commit/c38112f4540d6bd5dd89c419c6ecfa11f195dcbd))

## 0.0.4 (2025-01-20)

### Bug Fixes

- fix: merge default and discovered configurations (deep merge) ([#224](https://github.com/qlover/fe-base/pull/224)) ([19011d2](https://github.com/qlover/fe-base/pull/224/commits/19011d2e0850c329f7aa4f784faf4b70068ee597))

## 0.0.3 (2025-01-17)

### Features

- add script-context ([#213](https://github.com/qlover/fe-base/issues/213)) ([e021441](https://github.com/qlover/fe-base/commit/e021441180d4c4bd89947b155d39224f89699fda))
- release scripts-contextV0.0.3 ([#216](https://github.com/qlover/fe-base/issues/216)) ([e6f92fb](https://github.com/qlover/fe-base/commit/e6f92fbe464c868c67d1e47f53464356dc13b9fe))
