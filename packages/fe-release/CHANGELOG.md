# @qlover/fe-release

## 3.1.0

### Minor Changes

#### ♻️ Refactors

- **release:** streamline ReleaseContext and plugin integration ([95c7383](https://github.com/qlover/fe-base/commit/95c738321045b6c5523753dbe62fa43e519cb5ca)) ([#454](https://github.com/qlover/fe-base/pull/454))
  - Refactored ReleaseContext to extend ScriptContext, enhancing the options structure and improving consistency across the codebase.
  - Updated various plugins to inherit from ScriptPlugin, ensuring better lifecycle management and configuration handling.
  - Removed the outdated Plugin class, consolidating plugin functionality under the new ScriptPlugin structure.
  - Enhanced the handling of shared options and context initialization, improving clarity and maintainability.

  These changes improve the overall architecture of the release process, ensuring a more robust and organized codebase.

## 3.0.0

### Major Changes

#### ♻️ Refactors

- **release:** streamline ReleaseContext and plugin integration ([95c7383](https://github.com/qlover/fe-base/commit/95c738321045b6c5523753dbe62fa43e519cb5ca)) ([#454](https://github.com/qlover/fe-base/pull/454))
  - Refactored ReleaseContext to extend ScriptContext, enhancing the options structure and improving consistency across the codebase.
  - Updated various plugins to inherit from ScriptPlugin, ensuring better lifecycle management and configuration handling.
  - Removed the outdated Plugin class, consolidating plugin functionality under the new ScriptPlugin structure.
  - Enhanced the handling of shared options and context initialization, improving clarity and maintainability.

  These changes improve the overall architecture of the release process, ensuring a more robust and organized codebase.

## 2.3.5

### Patch Changes

#### ✨ Features

- **fe-release:** migrate build process to tsup and introduce project configuration ([a2d9e95](https://github.com/qlover/fe-base/commit/a2d9e954883323a74ff09d9656fcf68bd70129d9)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Updated the build script in `package.json` to use `tsup`, replacing the previous Rollup configuration.
  - Added a new `project.json` file to define build targets and improve integration with NX.
  - Created a new `tsup.config.ts` file for configuring the build process, supporting both ESM and CommonJS formats.
  - Removed the obsolete `rollup.config.js` file to streamline the project structure.

  These changes enhance the build orchestration and configuration for the fe-release package.

## 2.3.4

### Patch Changes

#### ✨ Features

- **pather:** add cross-platform path utility and comprehensive tests ([b87a269](https://github.com/qlover/fe-base/commit/b87a269c9215c34df3646e5511792c5c6818e736)) ([#445](https://github.com/qlover/fe-base/pull/445))
  - Introduced the Pather class for reliable path normalization and comparison across Windows and POSIX systems, providing methods like `toLocalPath`, `isSubPath`, `startsWith`, and `containsPath`.
  - Added extensive unit tests for the Pather class to ensure functionality and edge case handling.
  - Updated Changelog and GithubChangelog plugins to utilize the new Pather utility for improved path handling in commit filtering.

  These enhancements improve path management capabilities within the project, ensuring consistent behavior across different operating systems.

## 2.3.3

### Patch Changes

## 2.3.2

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

## 2.3.1

### Patch Changes

#### 🐞 Bug Fixes

- **changelog:** conditionally execute git restore for unchanged packages ([b419a2a](https://github.com/qlover/fe-base/commit/b419a2a42d810c89a6d5c04be61fc100724f43ad)) ([#403](https://github.com/qlover/fe-base/pull/403))
  - Added a check to ensure that the git restore command is only executed if there are packages that have not changed, improving the efficiency of the Changelog plugin.

## 2.3.0

### Minor Changes

#### ✨ Features

- **changelog:** add support for commit body in changelog generation ([5383055](https://github.com/qlover/fe-base/commit/5383055d2abb095df40575ce2d40e4c40827e422)) ([#398](https://github.com/qlover/fe-base/pull/398))
  - Updated GitChangelog to parse and include commit body along with the title.
  - Enhanced GitChangelogFormatter to conditionally format and display commit body in the changelog.
  - Introduced commitBody option in GitChangelogOptions to control the inclusion of commit body in the output.
  - Updated related interfaces to accommodate the new body field in commitlint.

  Co-authored-by: QRJ <renjie.qin@brain.im>

## 2.2.0

### Minor Changes

#### ✨ Features

- **githubPR:** add GithubChangelog plugin to enhance changelog management ([a5c5913](https://github.com/qlover/fe-base/commit/a5c591316a2ee1a80becb5d4ec0dd503877e2459)) ([#395](https://github.com/qlover/fe-base/pull/395))
  feat(githubPR): add GithubChangelog plugin to enhance changelog management

- **GithubChangelog:** add debug logging for workspaces in changelog plugin ([c57ffb8](https://github.com/qlover/fe-base/commit/c57ffb87e23ec4d4188890a2e6f4cf0a4c11e3bb)) ([#395](https://github.com/qlover/fe-base/pull/395))
  feat(GithubChangelog): add debug logging for workspaces in changelog plugin

- **changelog:** implement GitChangelog and GitChangelogFormatter for enhanced changelog generation ([f9901d6](https://github.com/qlover/fe-base/commit/f9901d65adbf01588b2b96f1666608e5fdb78aa2)) ([#395](https://github.com/qlover/fe-base/pull/395))
  feat(changelog): implement GitChangelog and GitChangelogFormatter for enhanced changelog generation

- **changelog:** integrate gitlog for enhanced commit logging and changelog generation ([c29d502](https://github.com/qlover/fe-base/commit/c29d502885d49240d2130cecb705a43a8aae1d46)) ([#395](https://github.com/qlover/fe-base/pull/395))
  feat(changelog): integrate gitlog for enhanced commit logging and changelog generation

- **changelog:** enhance changelog formatting and introduce GitChangelog class ([86a8f2a](https://github.com/qlover/fe-base/commit/86a8f2a835260660f1683a69a0b504099cf4a93e)) ([#395](https://github.com/qlover/fe-base/pull/395))
  feat(changelog): enhance changelog formatting and introduce GitChangelog class

#### 🐞 Bug Fixes

- **githubPR:** enhance PR handling logic and introduce publishPR method ([5e2a2eb](https://github.com/qlover/fe-base/commit/5e2a2eb463294c847c606f472367a206dcdb7e2d)) ([#396](https://github.com/qlover/fe-base/pull/396))
  fix(githubPR): enhance PR handling logic and introduce publishPR method

- **changelog:** update onExec method to accept ExecutorReleaseContext and enhance onSuccess handling ([eacb97e](https://github.com/qlover/fe-base/commit/eacb97e175dff121a399714f41ddf514bbb68066)) ([#395](https://github.com/qlover/fe-base/pull/395))
  fix(changelog): update onExec method to accept ExecutorReleaseContext and enhance onSuccess handling

- **ColorFormatter.test:** remove unnecessary console.info call from test ([6f58880](https://github.com/qlover/fe-base/commit/6f588806c1db82042aaf2f9ebfa29846397e254c)) ([#389](https://github.com/qlover/fe-base/pull/389))
  fix(ColorFormatter.test): remove unnecessary console.info call from test

#### ♻️ Refactors

- update branch references from master to test-release in configuration files ([c2f7cad](https://github.com/qlover/fe-base/commit/c2f7cad1512fc77982834a4e344580636061a0a4)) ([#395](https://github.com/qlover/fe-base/pull/395))
  refactor: update branch references from master to test-release in configuration files

- **changelog:** streamline changelog configuration and enhance formatting logic ([25b8547](https://github.com/qlover/fe-base/commit/25b8547ad00877c9d7ed9375ca4b0a4c453c784f)) ([#395](https://github.com/qlover/fe-base/pull/395))
  refactor(changelog): streamline changelog configuration and enhance formatting logic

## 2.1.6

### Patch Changes

## 2.1.5

### Patch Changes

#### ✨ Features

- add option to ignore non-updated packages and enhance workspace handling (#385)
  - Introduced `--changelog.ignore-non-updated-packages` CLI option to allow skipping non-updated packages in changelog generation.
  - Updated `ChangelogProps` to include `ignoreNonUpdatedPackages` configuration.
  - Enhanced `WorkspacesProps` to manage `changedPaths` and `packages` more effectively.
  - Implemented `restoreIgnorePackages` method to restore non-changed packages during the changelog process.
  - Adjusted package manager fallback from `npm` to `npx` for executing changeset commands.

  ***

## 2.1.4

## 2.1.3

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
