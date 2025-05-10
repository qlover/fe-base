# @qlover/fe-release

## 2.1.2

## 2.1.1

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

## 2.1.0

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

- Enhance createRelease method with error handling and logging improvements (#364)

  - Updated the createRelease method to include a try-catch block for better error management during release creation.
  - Modified logging messages to indicate dry run status and success or failure of the release creation process.
  - Cleaned up the method signature for clarity.

  Co-authored-by: QRJ <renjie.qin@brain.im>

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

## 2.0.14

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

- Enhance createRelease method with error handling and logging improvements (#364)

  - Updated the createRelease method to include a try-catch block for better error management during release creation.
  - Modified logging messages to indicate dry run status and success or failure of the release creation process.
  - Cleaned up the method signature for clarity.

  Co-authored-by: QRJ <renjie.qin@brain.im>

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

## 2.0.13

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

## 2.0.12

### Patch Changes

#### ✨ Features

- Enable bumping versions with workspace protocol only in changeset configuration (#360)

#### 🐞 Bug Fixes

- Enhance Changelog plugin to include '--update-dependencies' option in changesets CLI command for improved dependency management during versioning. (#360)

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 2.0.11

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 2.0.10

### Patch Changes

#### ✨ Features

- implement GitChangelog for improved changelog generation (#351)

  - Introduced a new GitChangelog class to facilitate the generation of changelogs based on Git commit history.
  - Added interfaces for PRCommit, CommitInfo, and FlatCommit to structure commit data.
  - Updated Changelog plugin to utilize GitChangelog for fetching and formatting PR commits, replacing the previous conventional-changelog implementation.
  - Enhanced default options for changelog types and formatting.

- add option to push changed labels to release PRs and update dependencies (#350)

  - Introduced a new command-line option `--githubPR.push-change-labels` to allow pushing changed labels to the release PR.
  - Updated the `GithubPR` class to handle the new option and push relevant labels if specified.
  - Updated dependencies in `pnpm-lock.yaml` to ensure compatibility with the latest versions.
  - Enhanced the GitHub Actions workflow to conditionally run checks based on the presence of the `CI-Release` label.

  ***

#### 🐞 Bug Fixes

- add option to push changed labels to release PRs in workflow (#353)
- format array output in changelog generation to use toString method for improved readability (#350)

- Updated dependencies
  - @qlover/env-loader@0.0.7
  - @qlover/fe-corekit@1.2.8
  - @qlover/scripts-context@0.0.14

## 2.0.5

### Patch Changes

#### Bug Fixes

- **changelog:** improve tag handling and error logging in changelog generation ([#344](https://github.com/qlover/fe-base/issues/344)) ([32abcbd](https://github.com/qlover/fe-base/commit/32abcbdc6681ee6fad1c1ca2e60ae7ca08977d82))
- **release:** update batch branch name format and refactor commit handling ([#345](https://github.com/qlover/fe-base/issues/345)) ([c4bb9cc](https://github.com/qlover/fe-base/commit/c4bb9cca78341956029defdf7f2ac8edeffaa3d8))

## 2.0.4

### Patch Changes

#### Bug Fixes

- **release:** change skip-changeset arg ([#340](https://github.com/qlover/fe-base/issues/340)) ([fffc35a](https://github.com/qlover/fe-base/commit/fffc35a52e768cf2739564e748d8abadab5dc3db))

## 2.0.0

### Major Changes

- ## 1.0.10 (2025-04-23)

## 1.0.10

### Patch Changes

- ## 1.0.9 (2025-04-23)

  #### Bug Fixes

  - no workspace tagname ([#333](https://github.com/qlover/fe-base/issues/333)) ([595fefe](https://github.com/qlover/fe-base/commit/595fefe4e1bce4f97ade1899a5691af39c55e67d))

### Patch Changes

- ## 1.0.8 (2025-04-22)

  ### Features

  - use changset publish/release ([#329](https://github.com/qlover/fe-base/issues/329)) ([#330](https://github.com/qlover/fe-base/issues/330)) ([8ef77ba](https://github.com/qlover/fe-base/commit/8ef77ba7f0ecf4eb2fa4b52d92ee89aa27b4285a))

## [1.0.8](https://github.com/qlover/fe-base/compare/@qlover/fe-release-v1.0.5...@qlover/fe-release-v1.0.8) (2025-04-17)

### Features

- feature yarn to pnpm ([#297](https://github.com/qlover/fe-base/issues/297)) ([c3e13d5](https://github.com/qlover/fe-base/commit/c3e13d509a752267d9be29e7a5ed609d24c309ce))

### Bug Fixes

- fe-relesae build cli ([#325](https://github.com/qlover/fe-base/issues/325)) ([aa7447b](https://github.com/qlover/fe-base/commit/aa7447b51a3dc755689de0783e8fd211ff99672e))
- release publish npm ([#327](https://github.com/qlover/fe-base/issues/327)) ([fa26d04](https://github.com/qlover/fe-base/commit/fa26d04eab2fa1ea4baa05c4d3502e5a873d5c8c))

## [1.0.7](https://github.com/qlover/fe-base/compare/@qlover/fe-release-v1.0.5...@qlover/fe-release-v1.0.7) (2025-04-17)

## 1.0.5 (2025-04-16)

## [0.1.7](https://github.com/qlover/fe-base/compare/fe-release-v0.1.6...fe-release-v0.1.7) (2025-03-25)

### Features

- check env add pkgjson ([#301](https://github.com/qlover/fe-base/pull/301)) ([14dc38b](https://github.com/qlover/fe-base/pull/301/commits/14dc38b54c20ba2c9c138a421ffce36054fbf3cf))
- check ModifyPublishPackage ([#301](https://github.com/qlover/fe-base/pull/301)) ([14dc38b](https://github.com/qlover/fe-base/pull/301/commits/d5178422cc404770fe8946ea66fa39616e25d163))
- defaults value ([#301](https://github.com/qlover/fe-base/pull/301)) ([14dc38b](https://github.com/qlover/fe-base/pull/301/commits/6f0447da8c94488138591798d58319cba228fc79))
- increment args ([#301](https://github.com/qlover/fe-base/pull/301)) ([14dc38b](https://github.com/qlover/fe-base/pull/301/commits/07109bba4eb52e741fbddc2ecc135850c6a253f3))
- add config namesapce ([#299](https://github.com/qlover/fe-base/pull/299)) ([d7f8303](https://github.com/qlover/fe-base/pull/301/commits/d7f830387a87d480eb8b25d03668b0725ca926a5))
- load plugin use async ([#300](https://github.com/qlover/fe-base/pull/300) ([a49228](https://github.com/qlover/fe-base/pull/301/commits/a49228de6de31c16327b4b4bbc37db62c6e6394d))
- support mulit entry ([#303](https://github.com/qlover/fe-base/pull/303) ([ad08aa0](https://github.com/qlover/fe-base/pull/301/commits/ad08aa0dc2f83925975adec09d5aa5c2a7c23b4e))
- plugins test ([#304](https://github.com/qlover/fe-base/pull/304) ([eb1e1ac](https://github.com/qlover/fe-base/pull/301/commits/eb1e1ac6501012bde29528840a29774955382d46))
- Merge release pr and publish ([#315](https://github.com/qlover/fe-base/pull/315) ([eaf9cb9](https://github.com/qlover/fe-base/pull/301/commits/eaf9cb979b8038a40ecafffc39d524229f1255a8))
- change lable control release package ([#316](https://github.com/qlover/fe-base/pull/316) ([d361b40](https://github.com/qlover/fe-base/pull/301/commits/d361b40d2d2ba13531f5cf31bad7889322cf2fab))
- fe-release branchName arg, and change default branchName tpl:release-${pkgName}-${tagName} ([#291](https://github.com/qlover/fe-base/issues/291)) ([e89652c](https://github.com/qlover/fe-base/commit/e89652c499b8e20753b602eeb49865b303615e12))

### Bug fixes

- multi packages release branch error ([#314](https://github.com/qlover/fe-base/pull/314) ([99169f1](https://github.com/qlover/fe-base/pull/301/commits/99169f18055110cc8126fec7d7886b29ef9e3099))
- publish path use target workspace ([cc7eb8c](https://github.com/qlover/fe-base/pull/301/commits/cc7eb8cc6555b3c9aeee127591b19fb58c15b513))

## [0.1.6](https://github.com/qlover/fe-base/compare/fe-release-v0.1.5...fe-release-v0.1.6) (2025-02-25)

### Features

- support release plugin ([#266](https://github.com/qlover/fe-base/issues/266)) ([23fba14](https://github.com/qlover/fe-base/commit/23fba1455919f794e5609ddab03cfb99c40ad3b8))

## [0.1.5](https://github.com/qlover/fe-base/compare/fe-release-v0.1.4...fe-release-v0.1.5) (2025-02-25)

### Bug Fixes

- type error ([#262](https://github.com/qlover/fe-base/issues/262)) ([cf18195](https://github.com/qlover/fe-base/commit/cf18195b4a3a13de45eb4396745e55c236aa2a43))

## 0.1.4 (2025-02-24)

### Bug Fixes

- fe-release publish path ([#231](https://github.com/qlover/fe-base/issues/231)) ([d780b0d](https://github.com/qlover/fe-base/commit/d780b0d0c3c2be2955b31c58eb857e00f3df783a))
- fe-release publish path check ([#236](https://github.com/qlover/fe-base/issues/236)) ([364984e](https://github.com/qlover/fe-base/commit/364984e3b3c27ed3a1e5cd3cc12d3c1184916fab))
- update fe-release version flag ([#256](https://github.com/qlover/fe-base/issues/256)) ([2523f35](https://github.com/qlover/fe-base/commit/2523f3554664a59bd9dc92eb5963e06cebf89478))
