# @qlover/create-app

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
