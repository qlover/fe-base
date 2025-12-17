# @qlover/fe-corekit

## 2.3.3

### Patch Changes

## 2.3.1

### Patch Changes

#### ♻️ Refactors

- Update TypeScript class accessibility and improve code clarity ([62f6203](https://github.com/qlover/fe-base/commit/62f620399d79530273fb33e45cb7469e2f241461)) ([#551](https://github.com/qlover/fe-base/pull/551))
  - Explicitly defined 'public' accessibility for class properties and methods across multiple TypeScript files to enhance clarity and maintainability.
  - Refactored tests to ensure consistent accessibility modifiers, improving overall code readability.
  - Updated ESLint configuration to enforce best practices in TypeScript coding standards.

  These changes aim to streamline code quality and maintainability in the project.

## 2.3.0

### Minor Changes

#### 🐞 Bug Fixes

- **KeyStorage:** Enhance error handling for storage operations ([02ad7fc](https://github.com/qlover/fe-base/commit/02ad7fc7ec136e333c9895e3df2faa66907ad3d9)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Updated KeyStorage class to gracefully handle failures during storage operations, including get, set, and remove methods.
  - Improved test cases to verify that the constructor and operations do not throw errors on storage access failures, ensuring robust functionality.
  - Refactored KeyStorageInterface to include methods for retrieving the storage key and current in-memory value, enhancing usability and clarity.

#### 📝 Documentation

- **fe-corekit:** Update default values in executor documentation ([22b1332](https://github.com/qlover/fe-base/commit/22b1332b55ace481e46b14c85d3948c5cdca514c)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Changed default values for `config` in AsyncExecutor, SyncExecutor, and related interfaces from `...` to `{}` for clarity.
  - Enhanced documentation across multiple files to reflect accurate default configurations for better user understanding.
  - Added new AbortPlugin documentation to provide comprehensive details on its functionality and usage examples.

- Update type annotations and module descriptions across multiple documentation files ([d0a5535](https://github.com/qlover/fe-base/commit/d0a5535aceffeb9b03b2fc8d578116fe55ab85b5)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Added type annotations for various modules and interfaces in the documentation, enhancing clarity and understanding of their functionalities.
  - Updated descriptions for modules such as `FeCode2Markdown`, `corekit-bridge`, and `user-auth`, ensuring accurate representation of their purposes.
  - Improved overall documentation quality by standardizing type definitions and enhancing the user experience with clearer explanations.

## 2.2.0

### Minor Changes

#### ✨ Features

- **fe-corekit:** add AbortPlugin for request cancellation and timeout management ([2962840](https://github.com/qlover/fe-base/commit/2962840466aca3f2ede4e19e788f496fabc2def3)) ([#537](https://github.com/qlover/fe-base/pull/537))
  - Introduced AbortPlugin to manage request cancellations and timeouts, enhancing control over asynchronous operations.
  - Implemented AbortError class for detailed error handling related to abort operations.
  - Added comprehensive tests for AbortPlugin functionality, covering various scenarios including timeout handling and resource cleanup.
  - Updated package.json to include @qlover/logger as a dependency for logging capabilities.

  These changes aim to improve the robustness and reliability of asynchronous request handling within the application.

#### ♻️ Refactors

- **AbortPlugin:** simplify generic type declaration ([507170f](https://github.com/qlover/fe-base/commit/507170f2c1ba54f16b73956b1b95c67ce271129a)) ([#537](https://github.com/qlover/fe-base/pull/537))
  - Removed default type parameter from AbortPlugin class, streamlining the type definition for better clarity and maintainability.
  - This change enhances the overall readability of the code while maintaining the functionality of the AbortPlugin.

- **fe-corekit:** reorganize dependencies and enhance tsup configuration ([47dbd72](https://github.com/qlover/fe-base/commit/47dbd7222a6a8333303a02624f4ec085efd89f94)) ([#537](https://github.com/qlover/fe-base/pull/537))
  - Moved '@types/lodash' to devDependencies in package.json for better dependency management.
  - Updated pnpm-lock.yaml to reflect the new structure of dependencies.
  - Enhanced tsup configuration by adding external modules and a new IIFE build format, improving the build process and output management.

  These changes aim to streamline the dependency structure and optimize the build configuration for better performance and maintainability.

## 2.1.0

### Minor Changes

## 2.0.1

### Patch Changes

#### ✨ Features

- **tests:** enhance testing guide with comprehensive function testing strategies ([3a94940](https://github.com/qlover/fe-base/commit/3a949404316a66afe334e1b369c5095ce872cdbc)) ([#470](https://github.com/qlover/fe-base/pull/470))
  - Added a new section on function testing to the testing guide, covering parameter combination testing and boundary value testing.
  - Included detailed examples for various test cases, demonstrating how to handle different parameter combinations and edge cases.
  - Organized test cases using nested describe blocks for better clarity and structure.
  - Updated both English and Chinese versions of the testing guide to ensure consistency across documentation.

  These changes aim to improve the testing framework and provide clearer guidelines for developers on how to effectively test functions.

#### 📝 Documentation

- add @since 2.1.0 annotations to AsyncExecutor, SyncExecutor, ContextHandler, and Executor interfaces ([7f1cab3](https://github.com/qlover/fe-base/commit/7f1cab32f3f6510263c4982525792d07bb13d859)) ([#470](https://github.com/qlover/fe-base/pull/470))
  - Updated documentation in AsyncExecutor, SyncExecutor, ContextHandler, and Executor interfaces to include a `@since 2.1.0` annotation, indicating the version in which these features were introduced.
  - This change enhances clarity for developers regarding the version history of the codebase and improves overall documentation consistency.

- update documentation for various modules in fe-corekit ([e996dcb](https://github.com/qlover/fe-base/commit/e996dcb2a9e195f30c56d3a5c61bb0b33c504651)) ([#470](https://github.com/qlover/fe-base/pull/470))
  - Enhanced documentation for modules including `AsyncExecutor`, `SyncExecutor`, `ContextHandler`, and `Executor`, adding `@since` annotations to clarify version history.
  - Improved structure and clarity in documentation for `RequestAdapter`, `RequestManager`, and storage-related interfaces, ensuring consistency across the codebase.
  - Added new modules for `KeyStorage`, `ObjectStorage`, and `SyncStorage`, providing comprehensive details on their functionalities and usage examples.

  These changes aim to improve the overall documentation quality and usability for developers working with the fe-corekit package.

## 2.0.0

### Major Changes

## 1.5.0

### Minor Changes

#### ✨ Features

- **fe-corekit:** add comprehensive tests for Base64Serializer and introduce KeyStorage and ObjectStorage implementations ([6073a99](https://github.com/qlover/fe-base/commit/6073a9982aeb6b7a71db25a1dbd179ff89c4a8f1)) ([#458](https://github.com/qlover/fe-base/pull/458))
  - Added a new test suite for Base64Serializer, covering serialization and deserialization of strings, UTF-8 characters, empty strings, and long strings.
  - Implemented URL-safe encoding tests to ensure correct handling of special characters.
  - Introduced performance tests for large data handling and regression tests for backward compatibility.
  - Created new test files for KeyStorage and ObjectStorage, implementing various storage functionalities and ensuring type safety.
  - Removed the outdated JSONStorage test file to streamline the test suite.

  These changes enhance the testing coverage and reliability of the serialization and storage functionalities within the corekit package.

- **fe-corekit:** migrate build process to tsup and update package configuration ([0dd27fa](https://github.com/qlover/fe-base/commit/0dd27fa29a710e6c297c1f12b27661e6708fc199)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Changed the main entry point in `package.json` to `index.cjs` for CommonJS compatibility.
  - Added a "browser" field in `package.json` to support IIFE format.
  - Replaced the build script in `package.json` to utilize `tsup`, enhancing the build process.
  - Introduced a new `project.json` file to define build targets and improve integration with NX.
  - Created a new `tsup.config.ts` file for configuring the build process, supporting both ESM and CommonJS formats.
  - Removed the obsolete `rollup.config.js` file to streamline the project structure.
  - Updated dependency management by replacing `merge` with `lodash/merge` for consistency.

  These changes enhance the build orchestration and configuration for the fe-corekit package.

#### 🐞 Bug Fixes

- **storage:** handle null values in ObjectStorage and SyncStorage retrieval ([5878afb](https://github.com/qlover/fe-base/commit/5878afbd8dabe2dceef6543882c64108355f4853)) ([#458](https://github.com/qlover/fe-base/pull/458))
  - Updated ObjectStorage and SyncStorage implementations to ensure that null values are correctly handled when setting and retrieving items.
  - Modified the setItem method to default to null if the value is undefined, and adjusted the getItem method to return null if no value is found.

  These changes improve the robustness of the storage system by ensuring consistent behavior when dealing with null values.

## 1.4.1

### Patch Changes

#### ✨ Features

- **RequestScheduler:** enhance request type handling and add new test case ([585e09f](https://github.com/qlover/fe-base/commit/585e09fc7a957f3cadc374c334a6d227c70bcd13)) ([#436](https://github.com/qlover/fe-base/pull/436))
  - Updated the RequestScheduler methods to swap the generic parameters for Request and Response, improving clarity and consistency in type usage.
  - Added a new test case to validate the correct handling of response and request types in the RequestScheduler, ensuring robust type safety and functionality.

  This update enhances the type management within the RequestScheduler, providing better developer experience and reliability in request handling.

## 1.4.0

### Minor Changes

#### ♻️ Refactors

- **fe-corekit:** update documentation structure and enhance build scripts ([b886224](https://github.com/qlover/fe-base/commit/b886224881bf3a2fc7ae46699d19842b196661c7)) ([#401](https://github.com/qlover/fe-base/pull/401))
  - Removed outdated documentation files and added new markdown files for various components.
  - Updated package.json scripts for documentation generation to reflect new paths and formats.
  - Enhanced the build process for documentation to include new type aliases and interfaces.
  - Introduced new examples and improved clarity in existing documentation for better developer experience.

## 1.3.1

### Patch Changes

#### ♻️ Refactors

- fe corekit (#383)

  ***

## 1.3.0

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

## 1.2.10

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

## 1.2.9

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 1.2.8

### Patch Changes

#### ✨ Features

- implement GitChangelog for improved changelog generation (#351)
  - Introduced a new GitChangelog class to facilitate the generation of changelogs based on Git commit history.
  - Added interfaces for PRCommit, CommitInfo, and FlatCommit to structure commit data.
  - Updated Changelog plugin to utilize GitChangelog for fetching and formatting PR commits, replacing the previous conventional-changelog implementation.
  - Enhanced default options for changelog types and formatting.

- request manager (#284)
- add fe-corekit dir, remove fe-utils (#281)

#### 🐞 Bug Fixes

- add option to push changed labels to release PRs in workflow (#353)
- find module root path (#297)

#### 📝 Documentation

- request transaction (#284)
- add index docs (#281)

  ***

## 1.2.5 (2025-04-17)

### Features

- fe corekit and remove fe utils ([#281](https://github.com/qlover/fe-base/issues/281)) ([e333c7f](https://github.com/qlover/fe-base/commit/e333c7fe0518cb5ec34ecc7423dffb511f835324))
- feature yarn to pnpm ([#297](https://github.com/qlover/fe-base/issues/297)) ([c3e13d5](https://github.com/qlover/fe-base/commit/c3e13d509a752267d9be29e7a5ed609d24c309ce))

### Features

- request manager ([#284](https://github.com/qlover/fe-base/issues/284)) ([2351827](https://github.com/qlover/fe-base/pull/284/commits/2351827e1def9c8d9c62783d974b674dd8ad256e))

### Documentation

- request transaction ([#284](https://github.com/qlover/fe-base/issues/284)) ([f7fea1](https://github.com/qlover/fe-base/pull/284/commits/f7fea15db5ca3c5df5f9351aca807510626a396c))

## [1.2.1](https://github.com/qlover/fe-base/compare/fe-utils-v1.1.4...fe-utils-v1.2.1) (2025-03-21)

### Features

- fe corekit and remove fe utils ([#281](https://github.com/qlover/fe-base/issues/281)) ([e333c7f](https://github.com/qlover/fe-base/commit/e333c7fe0518cb5ec34ecc7423dffb511f835324))

## [1.1.4](https://github.com/qlover/fe-base/compare/fe-utils-v1.1.3...fe-utils-v1.1.4) (2025-03-20)

### Features

- remove first error default break chain ([#279](https://github.com/qlover/fe-base/issues/279)) ([bdabf8a](https://github.com/qlover/fe-base/commit/bdabf8aa1bdf37fc9121ca75a4a5924d52b21af0))

## [1.1.3](https://github.com/qlover/fe-base/compare/fe-utils-v1.1.2...fe-utils-v1.1.3) (2024-12-27)

## [1.1.2](https://github.com/qlover/fe-base/compare/fe-utils-v1.1.1...fe-utils-v1.1.2) (2024-12-25)

### Features

- Template fe react ([#183](https://github.com/qlover/fe-base/issues/183)) ([d044a49](https://github.com/qlover/fe-base/commit/d044a49917f647179eb4d8c391a13a785627e02c))

## [1.1.1](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.19...fe-utils-v1.1.1) (2024-12-17)

### Features

- fe code2md use typescript ([#180](https://github.com/qlover/fe-base/issues/180)) ([5f086b1](https://github.com/qlover/fe-base/commit/5f086b11fbe98aa410996ce95f8c0b5b5f06b6e5))

## [1.0.19](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.18...fe-utils-v1.0.19) (2024-12-13)

### Features

- fe utils interface ([#172](https://github.com/qlover/fe-base/issues/172)) ([ad32dd8](https://github.com/qlover/fe-base/commit/ad32dd815d80cf839103ae08ee5174ad73522624))

### Bug Fixes

- eslint config ([#171](https://github.com/qlover/fe-base/issues/171)) ([fc14f4b](https://github.com/qlover/fe-base/commit/fc14f4b2fb3196394d3b470eaa25bcfb428c7861))
- test file use browser globals ([#173](https://github.com/qlover/fe-base/issues/173)) ([acaa0a4](https://github.com/qlover/fe-base/commit/acaa0a4417ee0c4f40982fe7c995744be3338a23))

## [1.0.18](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.17...fe-utils-v1.0.18) (2024-12-11)

## [1.0.17](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.16...fe-utils-v1.0.17) (2024-12-10)

### Features

- Storage interface, and JSONStorage ([#167](https://github.com/qlover/fe-base/issues/167)) ([7313aad](https://github.com/qlover/fe-base/commit/7313aad85682e6f5f3429e7a86f2c44f702abc5e))

## [1.0.16](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.15...fe-utils-v1.0.16) (2024-12-10)

## [1.0.15](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.14...fe-utils-v1.0.15) (2024-12-10)

### Documentation

- update fe-utils ([#162](https://github.com/qlover/fe-base/issues/162)) ([10c7144](https://github.com/qlover/fe-base/commit/10c71442672066e243591ab1d0fd923ef97dd2a6))

## [1.0.14](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.13...fe-utils-v1.0.14) (2024-12-09)

## [1.0.13](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.12...fe-utils-v1.0.13) (2024-12-03)

### Bug Fixes

- fe-scripts type ([#153](https://github.com/qlover/fe-base/issues/153)) ([99da575](https://github.com/qlover/fe-base/commit/99da575a75eb13cdbc2e7546e13a851cb1329abc))

## [1.0.12](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.11...fe-utils-v1.0.12) (2024-11-30)

### Bug Fixes

- code2markdown table decription ([#146](https://github.com/qlover/fe-base/issues/146)) ([39db11e](https://github.com/qlover/fe-base/commit/39db11e56f225a4364398f090db299840f6a2ac5))

## [1.0.11](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.10...fe-utils-v1.0.11) (2024-11-30)

### Features

- Serializer JSON and Base64 ([#144](https://github.com/qlover/fe-base/issues/144)) ([9fcfa1a](https://github.com/qlover/fe-base/pull/144/commits/9fcfa1adc336a75851b5d057540262af7514b2a3))

### Documentation

- new fe-utils docs ([#144](https://github.com/qlover/fe-base/issues/144)) ([2636773](https://github.com/qlover/fe-base/pull/144/commits/263677347edcffb44651d6663fdda53d39e109d9))

## [1.0.10](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.9...fe-utils-v1.0.10) (2024-11-29)

## [1.0.9](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.7...fe-utils-v1.0.9) (2024-11-29)

### Features

- fe code to markdown ([#136](https://github.com/qlover/fe-base/issues/136)) ([f320ccb](https://github.com/qlover/fe-base/commit/f320ccb08d59caabb83357c65a09fb05732cb146))

## [1.0.8](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.7...fe-utils-v1.0.8) (2024-11-28)

### Features

- fe code to markdown ([#136](https://github.com/qlover/fe-base/issues/136)) ([f320ccb](https://github.com/qlover/fe-base/commit/f320ccb08d59caabb83357c65a09fb05732cb146))

## [1.0.7](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.6...fe-utils-v1.0.7) (2024-11-22)

## [1.0.6](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.5...fe-utils-v1.0.6) (2024-11-21)

### Bug Fixes

- fetchRequest type defined ([#132](https://github.com/qlover/fe-base/issues/132)) ([de0a655](https://github.com/qlover/fe-base/commit/de0a655a9b34c39b1a8932b43c02a27787c4faad))

## [1.0.5](https://github.com/qlover/fe-base/compare/fe-utils-v1.0.4...fe-utils-v1.0.5) (2024-11-21)

### Bug Fixes

- comm commitizen ([#128](https://github.com/qlover/fe-base/issues/128)) ([042ff3a](https://github.com/qlover/fe-base/commit/042ff3a71ab6bec039ee4fa1bc3f4fc116f9dd35))

## 1.0.4 (2024-11-18)

### Features

- **.env:** use dotenv load .env ([3879596](https://github.com/qlover/fe-base/commit/3879596f6ca4017b1f12e4fc3ea5c928dc575fd0))
- add packages/work ([18f528e](https://github.com/qlover/fe-base/commit/18f528e9d41ca43abe615b57863c8acde96952ca))
- add request exec ([#118](https://github.com/qlover/fe-base/issues/118)) ([7e4783b](https://github.com/qlover/fe-base/commit/7e4783b250dc585cb030ced9849ba093a56d7aec))
- **ci.yml:** add ci ([df24b88](https://github.com/qlover/fe-base/commit/df24b883138c710a3f1b8d2f97acf415d5e3c5e7))
- clean branch ([075952b](https://github.com/qlover/fe-base/commit/075952b5230a4518a7243c9d716e3a245eac1115))
- clean branch ([b5156ce](https://github.com/qlover/fe-base/commit/b5156ceebb5caa3266147a0255eeefc451f27a28))
- complete the CI/CD workflow ([ff77af7](https://github.com/qlover/fe-base/commit/ff77af71a508b8f1cff5730ddf881cddaa309b01))
- dotenv ([2c75bff](https://github.com/qlover/fe-base/commit/2c75bffb07ec5c60d70414963e437b7612268c78))
- eslint & typescript & prettier ([6df84a4](https://github.com/qlover/fe-base/commit/6df84a47a2fd7ff686ace9ffe43830481feb47d8))
- eslint and typescript ([98369d0](https://github.com/qlover/fe-base/commit/98369d0cf3b77f51a8a42888fe12087327d46f20))
- many eslint config ([0280a41](https://github.com/qlover/fe-base/commit/0280a414fcaf6d6a9aafd73b8c18609c89892d7c))
- new ci flow ([#88](https://github.com/qlover/fe-base/issues/88)) ([d4cb449](https://github.com/qlover/fe-base/commit/d4cb449718120ddf9a0b709fb83faf2819e9becd))
- release ci ([5277164](https://github.com/qlover/fe-base/commit/52771642fd7f70c9a79943c14f4b9f6a6c340fb5))
- remove auto merge ([#121](https://github.com/qlover/fe-base/issues/121)) ([434b198](https://github.com/qlover/fe-base/commit/434b198e174963c2f683362c22cc5295173a7a63))

### Bug Fixes

- **.eslintrc:** distinguish .js or .ts ([d501121](https://github.com/qlover/fe-base/commit/d501121fee68657c2c5bb448b90920bf185520cc))
- **.gitattributes:** change file format ([5e37c45](https://github.com/qlover/fe-base/commit/5e37c45e5afca0ff53bc4c1784f9223063c44086))
- change pr branche name ([c35b267](https://github.com/qlover/fe-base/commit/c35b2679b0f7fecdec3c1749896e5a4b9802c811))
- change pr branche name ([156d9a3](https://github.com/qlover/fe-base/commit/156d9a3cb6cc7c56eba295465b855a1725e192ed))
- get release pr-branch ([981276b](https://github.com/qlover/fe-base/commit/981276b95d6213486b23567b33db3bbef9401ddb))
- import path.config path ([a3766e1](https://github.com/qlover/fe-base/commit/a3766e1877ef38a1661bc3bb55f4bb37bf436bbb))
- package files ([1263155](https://github.com/qlover/fe-base/commit/12631559ffdaaaba0c431c460663de771171c607))
- package version ([74eb8bf](https://github.com/qlover/fe-base/commit/74eb8bf060e85004d9574c009e1e0cce9183155a))
- package version ([#14](https://github.com/qlover/fe-base/issues/14)) ([fc344a2](https://github.com/qlover/fe-base/commit/fc344a2b3825d2673aa63dcc90b2411e4fb304b0))
- package version ([#17](https://github.com/qlover/fe-base/issues/17)) ([fe2088f](https://github.com/qlover/fe-base/commit/fe2088fb5bb24d04b52c4ec7160a6d73f8e6ef4c))
- package version ([#18](https://github.com/qlover/fe-base/issues/18)) ([c6b47f1](https://github.com/qlover/fe-base/commit/c6b47f19920ebed721bcfff287086e8d1bb6630f))
- **package.json:** add description ([cfd0ef6](https://github.com/qlover/fe-base/commit/cfd0ef6a3cf2477cafc0ac827dd4459defdebda2))
- **package.json:** change release scripts ([393ae27](https://github.com/qlover/fe-base/commit/393ae271ac217ea27ec65667f50d813b6b1a5232))
- **package.json:** change release scripts ([3cd1fee](https://github.com/qlover/fe-base/commit/3cd1feeae8049d406523aa2a1285fc13c8d7b75a))
- **package.json:** change release scripts ([971405b](https://github.com/qlover/fe-base/commit/971405bb9ff3fed919a9036b3723cd4ac50ac4d6))
- **package.json:** change version ([5454eac](https://github.com/qlover/fe-base/commit/5454eacad4e7550c063912fe2b77a00793f46cf3))
- packages ([32a67a9](https://github.com/qlover/fe-base/commit/32a67a9441c69981422d0fe2b5246ea0f6de647d))
- push github release ([6132bb1](https://github.com/qlover/fe-base/commit/6132bb1cb8b6be67c483057ace8945b08c625f27))
- release ignore changelog ([#125](https://github.com/qlover/fe-base/issues/125)) ([d738a72](https://github.com/qlover/fe-base/commit/d738a72875020273401b1bd3b92e1f1108a1e116))
- release merge target branch ([7a39157](https://github.com/qlover/fe-base/commit/7a39157c41a24ece97eae8070037f2edd4520647))
- release push changlog.md ([#123](https://github.com/qlover/fe-base/issues/123)) ([1952ae1](https://github.com/qlover/fe-base/commit/1952ae1caad2a965ec233eca18092bb0b356987b))
- scripts pkg name ([cda4731](https://github.com/qlover/fe-base/commit/cda4731d244eb8f4c14ea374b98b4d995d886d5b))
- update-version script ([#89](https://github.com/qlover/fe-base/issues/89)) ([70c02dd](https://github.com/qlover/fe-base/commit/70c02dde5ec086038bc256ac8a0f7bda74007375))
- version ([a8004a1](https://github.com/qlover/fe-base/commit/a8004a1d3867dc4da7c6a450e1e92a2a9c96f847))
- version ([821504e](https://github.com/qlover/fe-base/commit/821504e0e0051468ed5a45d941d025192c74665a))
- version ([17da9d2](https://github.com/qlover/fe-base/commit/17da9d2bd4149717b92c98a82caf1f1d17616841))

### Reverts

- Revert "build: add quick script name (#76)" (#77) ([9768385](https://github.com/qlover/fe-base/commit/9768385c4ab50446f557b1e68702183c257e1049)), closes [#76](https://github.com/qlover/fe-base/issues/76) [#77](https://github.com/qlover/fe-base/issues/77)
