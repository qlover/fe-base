# @qlover/corekit-bridge

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
