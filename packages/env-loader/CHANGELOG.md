# @qlover/env-loader

## 0.4.0

### Minor Changes

## 0.3.3

### Patch Changes

## 0.3.1

### Patch Changes

#### ✨ Features

- **env-loader:** migrate build process to tsup and introduce project configuration ([76382b1](https://github.com/qlover/fe-base/commit/76382b1f3c65f04d5ffa17ff9cd0006ba1aaf9e5)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Updated the build script in `package.json` to use `tsup` instead of `rollup`, streamlining the build process.
  - Added a new `project.json` file to define build targets and enhance integration with NX.
  - Created a new `tsup.config.ts` file for configuring the build process, including support for both CommonJS and ESM formats.
  - Removed the obsolete `rollup.config.js` file to clean up the project structure.

  These changes improve the build orchestration and configuration for the env-loader package.

#### ♻️ Refactors

- Update TypeScript class accessibility and improve code clarity ([62f6203](https://github.com/qlover/fe-base/commit/62f620399d79530273fb33e45cb7469e2f241461)) ([#551](https://github.com/qlover/fe-base/pull/551))
  - Explicitly defined 'public' accessibility for class properties and methods across multiple TypeScript files to enhance clarity and maintainability.
  - Refactored tests to ensure consistent accessibility modifiers, improving overall code readability.
  - Updated ESLint configuration to enforce best practices in TypeScript coding standards.

  These changes aim to streamline code quality and maintainability in the project.

## 0.3.0

### Minor Changes

#### ♻️ Refactors

- replace @qlover/fe-corekit with @qlover/logger (#375)
  - Updated dependencies in package.json and pnpm-lock.yaml to use @qlover/logger instead of @qlover/fe-corekit.
  - Changed type references from Logger to LoggerInterface in Env.ts and Env.test.ts for improved type safety.
  - Adjusted logger handling in the Env class to align with the new logger interface.

  ## Co-authored-by: QRenjie <renjie.qin@brain.im>

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

## 0.1.2

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

## 0.1.1

### Patch Changes

#### ✨ Features

- Enable bumping versions with workspace protocol only in changeset configuration (#360)

  ***

#### 🐞 Bug Fixes

- Enhance Changelog plugin to include '--update-dependencies' option in changesets CLI command for improved dependency management during versioning. (#360)
- Updated dependencies

## 0.0.8

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 0.0.7

### Patch Changes

#### ✨ Features

- env-loader (#220)
- env-loader (#220)

#### 🐞 Bug Fixes

- add option to push changed labels to release PRs in workflow (#353)
- find module root path (#297)

#### 📝 Documentation

- env-loader (#220)

## 0.0.4 (2025-04-17)

### Features

- feature yarn to pnpm ([#297](https://github.com/qlover/fe-base/issues/297)) ([c3e13d5](https://github.com/qlover/fe-base/commit/c3e13d509a752267d9be29e7a5ed609d24c309ce))

## 0.0.3 (2025-04-17)
