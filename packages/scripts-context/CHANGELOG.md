# @qlover/scripts-context

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
