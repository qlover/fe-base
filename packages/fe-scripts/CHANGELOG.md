# @qlover/fe-scripts

## 1.0.4

### Patch Changes

## 1.0.2

### Patch Changes

## 1.0.0

### Major Changes

#### ✨ Features

- **fe-scripts:** add project configuration and build target for NX integration ([dafe66a](https://github.com/qlover/fe-base/commit/dafe66a69762e25186774dfd23397cad6682ab6b)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Introduced a new `project.json` file for the `@qlover/fe-scripts` package to define build targets.
  - Configured the build process to utilize `pnpm build`, enhancing integration with NX and streamlining the build orchestration.

  These changes improve the project structure and build management for the fe-scripts package.

#### ♻️ Refactors

- **scripts:** update context interfaces to use ScriptContext and enhance options structure ([b86a733](https://github.com/qlover/fe-base/commit/b86a7330466f193ea3536a72f09e56bf72afd62f)) ([#454](https://github.com/qlover/fe-base/pull/454))
  - Replaced instances of FeScriptContext with ScriptContext and ScriptContextInterface across multiple script files, including check-packages, clean-branch, clean, commit, and setup-husky.
  - Extended existing options interfaces to inherit from ScriptSharedInterface, improving consistency and maintainability.
  - Updated the instantiation of context objects to align with the new ScriptContext structure, enhancing clarity in the codebase.

  These changes streamline the script implementations and improve the overall structure of the context handling within the project.

## 0.11.6

### Patch Changes

## 0.11.5

## 0.11.4

### Patch Changes

#### 🐞 Bug Fixes

- update build script to include rebuild step (#377)
  - Modified the build script in package.json to append a rebuild command, ensuring that dependencies are rebuilt after the main build process.

  ***

#### ♻️ Refactors

- migrate build system from Rollup to tsup (#377)
  - Updated package.json to change entry points and output directories for the new build system.
  - Removed Rollup configuration file and replaced it with tsup configuration for better performance and simplicity.
  - Added new CLI scripts for various functionalities, including check-packages, clean-branch, clean, commit, and setup-husky.
  - Adjusted TypeScript configuration to disable source maps for production builds.
  - Removed deprecated files and dependencies related to the previous build system.

- update CLI script paths and build configuration (#377)
  - Changed CLI script file extensions from .mjs to .js in package.json for consistency.
  - Updated tsup configuration to output only ESM format and removed unnecessary outExtension logic.
  - Adjusted output directory settings for better organization of build artifacts.

## 0.11.3

## 0.11.2

## 0.11.1

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

## 0.11.0

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

## 0.10.10

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

## 0.10.9

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 0.10.8

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
  - @qlover/env-loader@0.0.7
  - @qlover/fe-corekit@1.2.8
  - @qlover/scripts-context@0.0.14

## [0.10.4](https://github.com/qlover/fe-base/compare/@qlover/fe-scripts-v0.10.3...@qlover/fe-scripts-v0.10.4) (2025-04-17)

### Bug Fixes

- release publish npm ([#327](https://github.com/qlover/fe-base/issues/327)) ([fa26d04](https://github.com/qlover/fe-base/commit/fa26d04eab2fa1ea4baa05c4d3502e5a873d5c8c))

## 0.10.3 (2025-04-17)

## [0.10.1](https://github.com/qlover/fe-base/compare/fe-scripts-v0.10.0...fe-scripts-v0.10.1) (2025-02-20)

## [0.9.2](https://github.com/qlover/fe-base/compare/fe-scripts-v0.7.1...fe-scripts-v0.9.2) (2025-02-08)

### Bug Fixes

- fe-release publish path check ([#236](https://github.com/qlover/fe-base/issues/236)) ([364984e](https://github.com/qlover/fe-base/commit/364984e3b3c27ed3a1e5cd3cc12d3c1184916fab))

## [0.7.2](https://github.com/qlover/fe-base/compare/fe-scripts-v0.7.1...fe-scripts-v0.7.2) (2025-02-07)

## [0.7.1](https://github.com/qlover/fe-base/compare/fe-scripts-v0.5.3...fe-scripts-v0.7.1) (2025-01-20)

### Features

- remove ConfigSearch,FeScriptContext,ScriptLogger, Shell. use @qlover/script-context ([#223](https://github.com/qlover/fe-base/issues/223)) ([2e07e65](https://github.com/qlover/fe-base/commit/2e07e655ca32d56debe0bb5409958082e32cb1d4))

### Bug Fixes

- script-context merge config ([#224](https://github.com/qlover/fe-base/issues/224)) ([8519dec](https://github.com/qlover/fe-base/commit/8519dec765bf560601c6081ddc5109d4395b6f3d))

## [0.5.3](https://github.com/qlover/fe-base/compare/fe-scripts-v0.5.2...fe-scripts-v0.5.3) (2025-01-15)

## [0.5.2](https://github.com/qlover/fe-base/compare/fe-scripts-v0.5.1...fe-scripts-v0.5.2) (2025-01-13)

### Features

- check packages release ci scripts ([#198](https://github.com/qlover/fe-base/issues/198)) ([ea49c84](https://github.com/qlover/fe-base/commit/ea49c847a05875d693876c0e4c35547c891117a2))

## [0.5.1](https://github.com/qlover/fe-base/compare/fe-scripts-v0.4.4...fe-scripts-v0.5.1) (2024-12-17)

### Features

- fe code2md use typescript ([#180](https://github.com/qlover/fe-base/issues/180)) ([5f086b1](https://github.com/qlover/fe-base/commit/5f086b11fbe98aa410996ce95f8c0b5b5f06b6e5))

## [0.4.4](https://github.com/qlover/fe-base/compare/fe-scripts-v0.4.3...fe-scripts-v0.4.4) (2024-12-16)

### Features

- fe utils interface ([#172](https://github.com/qlover/fe-base/issues/172)) ([ad32dd8](https://github.com/qlover/fe-base/commit/ad32dd815d80cf839103ae08ee5174ad73522624))

### Bug Fixes

- eslint config ([#171](https://github.com/qlover/fe-base/issues/171)) ([fc14f4b](https://github.com/qlover/fe-base/commit/fc14f4b2fb3196394d3b470eaa25bcfb428c7861))

## [0.4.3](https://github.com/qlover/fe-base/compare/fe-scripts-v0.4.2...fe-scripts-v0.4.3) (2024-12-10)

## [0.4.2](https://github.com/qlover/fe-base/compare/fe-scripts-v0.4.1...fe-scripts-v0.4.2) (2024-12-04)

### Features

- clean branch command options ([#158](https://github.com/qlover/fe-base/issues/158)) ([387e3c7](https://github.com/qlover/fe-base/commit/387e3c7aba1303b4caaef0053683d9e67ba981fa))

## [0.4.1](https://github.com/qlover/fe-base/compare/fe-scripts-v0.4.0...fe-scripts-v0.4.1) (2024-12-03)

### Bug Fixes

- fe-scripts type ([#153](https://github.com/qlover/fe-base/issues/153)) ([99da575](https://github.com/qlover/fe-base/commit/99da575a75eb13cdbc2e7546e13a851cb1329abc))

## [0.3.11](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.10...fe-scripts-v0.3.11) (2024-12-02)

### Features

- fe scripts context ([#150](https://github.com/qlover/fe-base/issues/150)) ([64ef1a0](https://github.com/qlover/fe-base/commit/64ef1a05b170deefd3f7dc03625a03510ae2599e))

### Bug Fixes

- **fe-scripts/scripts/release.js:** not clear github_token var ([#148](https://github.com/qlover/fe-base/issues/148)) ([1538ae1](https://github.com/qlover/fe-base/commit/1538ae15c1af038702897b47ce01a148dbf0e8d4))

## [0.3.10](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.9...fe-scripts-v0.3.10) (2024-11-29)

## [0.3.9](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.8...fe-scripts-v0.3.9) (2024-11-18)

### Bug Fixes

- comm commitizen ([#128](https://github.com/qlover/fe-base/issues/128)) ([042ff3a](https://github.com/qlover/fe-base/commit/042ff3a71ab6bec039ee4fa1bc3f4fc116f9dd35))

## [0.3.8](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.4...fe-scripts-v0.3.8) (2024-11-18)

### Features

- remove auto merge ([#121](https://github.com/qlover/fe-base/issues/121)) ([434b198](https://github.com/qlover/fe-base/commit/434b198e174963c2f683362c22cc5295173a7a63))

### Bug Fixes

- release ignore changelog ([#125](https://github.com/qlover/fe-base/issues/125)) ([d738a72](https://github.com/qlover/fe-base/commit/d738a72875020273401b1bd3b92e1f1108a1e116))
- release push changlog.md ([#123](https://github.com/qlover/fe-base/issues/123)) ([1952ae1](https://github.com/qlover/fe-base/commit/1952ae1caad2a965ec233eca18092bb0b356987b))

## [0.3.7](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.4...fe-scripts-v0.3.7) (2024-11-18)

### Features

- remove auto merge ([#121](https://github.com/qlover/fe-base/issues/121)) ([434b198](https://github.com/qlover/fe-base/commit/434b198e174963c2f683362c22cc5295173a7a63))

### Bug Fixes

- release push changlog.md ([#123](https://github.com/qlover/fe-base/issues/123)) ([1952ae1](https://github.com/qlover/fe-base/commit/1952ae1caad2a965ec233eca18092bb0b356987b))

## [0.3.6](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.4...fe-scripts-v0.3.6) (2024-11-18)

### Features

- remove auto merge ([#121](https://github.com/qlover/fe-base/issues/121)) ([434b198](https://github.com/qlover/fe-base/commit/434b198e174963c2f683362c22cc5295173a7a63))

## [0.3.5](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.4...fe-scripts-v0.3.5) (2024-11-18)

## [0.3.4](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.3...fe-scripts-v0.3.4) (2024-11-04)

### Bug Fixes

- checkout-repo ([#109](https://github.com/qlover/fe-base/issues/109)) ([49f7c63](https://github.com/qlover/fe-base/commit/49f7c634b65631bc3d8e9dc577acaf08dc7957d3))

### Reverts

- Revert "build: fe-scripts test 0.3.4 CI (#106)" (#107) ([fc6826a](https://github.com/qlover/fe-base/commit/fc6826ab85d89db770323062b8b13c7aeb93aa57)), closes [#106](https://github.com/qlover/fe-base/issues/106) [#107](https://github.com/qlover/fe-base/issues/107)

## [0.3.3](https://github.com/qlover/fe-base/compare/fe-scripts-v0.3.2...fe-scripts-v0.3.3) (2024-11-04)

## [0.3.2](https://github.com/qlover/fe-base/compare/fe-scripts-v0.2.0...fe-scripts-v0.3.2) (2024-11-04)

## [0.3.2](https://github.com/qlover/fe-base/compare/fe-scripts-v0.2.0...fe-scripts-v0.3.2) (2024-11-04)

## [0.3.0](https://github.com/qlover/fe-base/pull/104)

- format ([#101](https://github.com/qlover/fe-base/issues/101))
- update-version script ([#89](https://github.com/qlover/fe-base/issues/89))
- add build run ([#99](https://github.com/qlover/fe-base/issues/99))
- base fe-utils ([#93](https://github.com/qlover/fe-base/issues/93))
- base release ([#96](https://github.com/qlover/fe-base/issues/96))
- Fe standard ([#94](https://github.com/qlover/fe-base/issues/94))
- new ci flow ([#88](https://github.com/qlover/fe-base/issues/88))

## [0.1.0 before](https://github.com/qlover/fe-base-scripts/blob/master/CHANGELOG.md)
