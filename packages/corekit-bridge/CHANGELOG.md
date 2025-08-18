# @qlover/corekit-bridge

## 1.6.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** add documentation generation script and enhance module documentation ([d413857](https://github.com/qlover/fe-base/commit/d413857cbfc87a887c6b90329e053fbf57ab2830)) ([#483](https://github.com/qlover/fe-base/pull/483))
  - Introduced a new build script `build:docs` in package.json to generate documentation from source files using `fe-code2md`.
  - Updated project.json to include a new build target for documentation generation, improving the build process.
  - Expanded the documentation in `index.ts` to provide comprehensive details about the corekit-bridge module, including installation instructions, main features, and usage examples.

  These changes aim to improve the usability and clarity of the corekit-bridge library for developers.

## 1.5.0

### Minor Changes

#### ✨ Features

- **response-stream:** add comprehensive test suites for stream processing components ([76cbd7e](https://github.com/qlover/fe-base/commit/76cbd7ee7185cfe74bb21e8bedc0b77332314433)) ([#484](https://github.com/qlover/fe-base/pull/484))
  - Introduced test files for LineStreamProcessor, ResponseStream, SSEStreamProcessor, StreamEvent, and their respective functionalities.
  - Implemented tests covering constructor behavior, chunk processing, final data handling, edge cases, and integration scenarios.
  - Enhanced overall test coverage to ensure robust validation of stream processing logic and error handling.

  These changes aim to improve the reliability and maintainability of the response-stream module.

## 1.4.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** enhance user authentication state management ([1db2fba](https://github.com/qlover/fe-base/commit/1db2fba323e80b5f8750bb6282fe3be1a428b6ab)) ([#476](https://github.com/qlover/fe-base/pull/476))
  - Added a new test case to verify that the login status is set to SUCCESS when both user info and credential are present.
  - Updated the UserAuthState constructor to automatically set the login status to SUCCESS if user info and credential are provided.
  - Improved documentation in UserAuthStore to clarify the behavior regarding login status.

  These changes aim to improve the reliability of user authentication state handling and enhance test coverage.

  Co-authored-by: QRJ <renjie.qin@brain.im>

## 1.3.4

### Patch Changes

#### 🐞 Bug Fixes

- **corekit-bridge:** streamline environment variable injection in Vite plugin ([bb6e7f1](https://github.com/qlover/fe-base/commit/bb6e7f1f1e608c652265963b50b85cd727cddf8b)) ([#472](https://github.com/qlover/fe-base/pull/472))
  - Removed the injectPkgConfig function and integrated its functionality directly into the plugin's config method for better clarity and maintainability.
  - Enhanced the config method to define environment variables for import.meta.env, improving the injection process.
  - Updated the overall structure of the ViteEnvConfigOptions to simplify the configuration process.

  These changes aim to improve the efficiency and readability of the environment variable management within the corekit-bridge package.

## 1.3.3

### Patch Changes

#### ✨ Features

- **corekit-bridge:** enhance testing and documentation for user authentication ([b557082](https://github.com/qlover/fe-base/commit/b557082f2d8a0989c7a793614fe2f320d7811c95)) ([#466](https://github.com/qlover/fe-base/pull/466))
  - Updated the testing guide to include a comprehensive test strategy and examples for organizing test files and grouping tests effectively.
  - Modified the TypeScript rules to exclude test files from documentation generation, allowing for cleaner documentation output.
  - Introduced a new mock storage implementation for testing user authentication, improving the flexibility and reliability of tests.
  - Enhanced the createStore function to support various store configurations, ensuring better handling of user and credential storage options.

  These changes improve the clarity and usability of the user authentication system within the corekit-bridge package, while also enhancing test coverage and documentation.

#### ♻️ Refactors

- **corekit-bridge:** update UserAuthStore and createState for improved state management ([6ab3aa9](https://github.com/qlover/fe-base/commit/6ab3aa9f2ae48af9bd3f9a469e310351dfc27cec)) ([#466](https://github.com/qlover/fe-base/pull/466))
  - Refactored UserAuthStore to utilize a defaultState option instead of createState, enhancing clarity and flexibility in state initialization.
  - Updated createState function to support both direct state instances and factory functions for state creation, improving usability.
  - Adjusted UserAuthStoreOptions interface to reflect changes in state management options, ensuring type safety and consistency.
  - Enhanced test coverage for UserAuthStore and createState, validating various initialization scenarios and error handling.

  These changes improve the overall architecture and maintainability of the user authentication system within the corekit-bridge package.

## 1.3.2

### Patch Changes

#### ♻️ Refactors

- **corekit-bridge:** state emission in store interfaces to utilize cloneState method for immutability ([4f886c0](https://github.com/qlover/fe-base/commit/4f886c0d7520a95d3381de6d45fbd6ee476b33ae)) ([#464](https://github.com/qlover/fe-base/pull/464))
  - Updated CounterStore, ThemeService, and UserAuthStore to emit state changes using the cloneState method, enhancing immutability and ensuring consistent state management.
  - Adjusted method parameters in UserAuthStore for clarity, changing 'params' to 'userInfo' in the setUserInfo method.

  These changes improve the reliability of state management across the corekit-bridge package.

## 1.3.1

### Patch Changes

#### ✨ Features

- **corekit-bridge:** implement shallow clone utility and add tests for store state management ([fc596f3](https://github.com/qlover/fe-base/commit/fc596f33b91b3f457ab9d4c1e066b897c70c7f25)) ([#462](https://github.com/qlover/fe-base/pull/462))
  - Introduced a `clone` utility for shallow cloning objects, arrays, and special instances (Date, RegExp, Set, Map).
  - Added comprehensive tests for the `clone` function, ensuring correct behavior with various data types and structures.
  - Implemented a `StoreInterface` with state management capabilities, including `resetState` and `cloneState` methods.
  - Developed tests for `StoreInterface` to validate state initialization, cloning, and resetting functionality, ensuring robust state management.

  These changes enhance the corekit-bridge package by providing essential cloning utilities and improving state management through comprehensive testing.

- **corekit-bridge:** enhance UserAuthStore with comprehensive state change tests ([efb673f](https://github.com/qlover/fe-base/commit/efb673f1a05335af6183981cab77d168c63c70c9)) ([#462](https://github.com/qlover/fe-base/pull/462))
  - Added a new test suite for verifying state changes in UserAuthStore, focusing on immutability and consistency during credential and authentication state transitions.
  - Implemented tests for various scenarios including setting credentials, starting authentication, handling success and failure states, and ensuring state consistency across multiple changes.
  - Updated UserAuthStore methods to utilize cloneState for state management, ensuring immutability and proper state transitions.
  - Enhanced StoreInterface with optional source parameter in cloneState method for improved flexibility.

  These changes improve the reliability and robustness of the user authentication state management within the corekit-bridge package.

## 1.3.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** add comprehensive tests for user authentication state and store ([34f3556](https://github.com/qlover/fe-base/commit/34f35569feae01b8137bb48b9a9ab78478bdc9af)) ([#460](https://github.com/qlover/fe-base/pull/460))
  - Introduced new test files for `createState` and `createStore`, covering various scenarios for user authentication state management.
  - Implemented tests for default state creation, state initialization from storage, and edge cases handling in `createState`.
  - Added tests for user authentication store functionality, including user and credential storage management, error handling, and type safety.
  - Removed outdated `UserAuth.test.ts` to streamline the test suite and improve clarity.

  These changes enhance the testing coverage and reliability of the user authentication system within the corekit-bridge package.

## 1.2.0

### Minor Changes

#### ♻️ Refactors

- **corekit-bridge:** restructure storage and authentication modules ([f03c3fd](https://github.com/qlover/fe-base/commit/f03c3fd6147771689087d37904069d58d3e3704f)) ([#458](https://github.com/qlover/fe-base/pull/458))
  - Removed outdated UserToken and StorageTokenInterface implementations to streamline the storage system.
  - Introduced new CookieStorage and TokenStorage classes, enhancing storage capabilities and flexibility.
  - Added comprehensive test suites for CookieStorage, TokenStorage, and QuickerTime utilities to ensure robust functionality.
  - Updated UserAuthService and UserAuthStore to utilize the new storage implementations, improving authentication flow and state management.
  - Enhanced InjectEnv plugin to prevent overwriting existing configuration values, ensuring better environment variable handling.

  These changes aim to improve the overall architecture and maintainability of the corekit-bridge package.

## 1.1.3

### Patch Changes

#### ✨ Features

- **corekit-bridge:** enhance package configuration and build process ([b4a388c](https://github.com/qlover/fe-base/commit/b4a388c09e914d37daf99e2848c6569d45f98bad)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Added a "browser" field to `package.json` for improved compatibility in browser environments.
  - Introduced a new `project.json` file to define the build target and streamline the build process using NX.
  - Updated the Rollup configuration to dynamically set the UMD name based on the package name and marked `tailwindcss` and `vite` as external dependencies.

  These changes improve the overall configuration and build orchestration for the corekit-bridge package.

#### ♻️ Refactors

- **theme:** update ThemeService to extend StoreInterface and enhance type definitions ([7e647f6](https://github.com/qlover/fe-base/commit/7e647f6e5979aa6e37e239fcd9039fb3bd52ee2b)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Refactored ThemeService to extend StoreInterface instead of SliceStore, improving consistency across the codebase.
  - Updated ThemeServiceState to implement StoreStateInterface, enhancing type safety and maintainability.
  - Removed the obsolete StoreInterface file to streamline the project structure.
  - Adjusted import paths in various components and services to reflect the new StoreInterface location, ensuring proper integration.

  These changes aim to improve the overall architecture and type management within the theme service implementation.

## 1.1.2

### Patch Changes

#### ✨ Features

- **corekit-bridge:** refactor user authentication interfaces and enhance token management ([12770ce](https://github.com/qlover/fe-base/commit/12770cec8eee16740823dee0deead528aea1ec3a)) ([#449](https://github.com/qlover/fe-base/pull/449))
  - Updated UserAuthService to use `api` instead of `service` for improved clarity in the authentication flow.
  - Introduced `setUserAuthStore` method in UserAuthApiInterface to manage user authentication storage.
  - Enhanced UserAuthStore with methods to set and get user tokens, improving token management capabilities.
  - Made storage options in UserToken interface optional, allowing for more flexible configurations.
  - Added comprehensive unit tests to validate the new implementations and ensure robust functionality.

  These changes improve the overall structure and maintainability of the user authentication system within the corekit-bridge.

## 1.1.1

### Patch Changes

#### ✨ Features

- **corekit-bridge:** add unit tests for RequestCommonPlugin ([7703647](https://github.com/qlover/fe-base/commit/7703647730153726bbc190132dc2fb4167a46fea)) ([#447](https://github.com/qlover/fe-base/pull/447))
  - Introduced comprehensive unit tests for the RequestCommonPlugin, covering initialization, token handling, header management, request data merging, and response processing.
  - Enhanced test coverage for various scenarios, including edge cases and integration flows, ensuring robust functionality and reliability of the plugin.

  These additions improve the overall test suite for the corekit-bridge, facilitating better maintenance and confidence in the plugin's behavior.

## 1.1.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** implement CookieStorage and QuickerTime for enhanced storage management ([21051d7](https://github.com/qlover/fe-base/commit/21051d79233af26e4bf0180cd318cfbe02d28d65)) ([#442](https://github.com/qlover/fe-base/pull/442))
  - Introduced CookieStorage class to provide a synchronous API for managing cookies, facilitating token persistence.
  - Added QuickerTime class for simplified time calculations, aiding in token expiration management.
  - Refactored storage-related imports to utilize the new CookieStorage and updated interfaces for better modularity.
  - Updated package dependencies to include js-cookie and its type definitions.

  These enhancements improve the overall storage capabilities and user authentication management within the corekit-bridge.

## 1.0.4

### Patch Changes

#### ✨ Features

- **corekit-bridge:** enhance user authentication and state management ([ebff39c](https://github.com/qlover/fe-base/commit/ebff39c73a4d09fea751f456007ecf88bd97f54b)) ([#438](https://github.com/qlover/fe-base/pull/438))
  - Introduced a comprehensive user authentication system with UserAuth and UserAuthStore implementations.
  - Added interfaces for UserAuth and UserAuthService to standardize authentication operations.
  - Implemented token management and user information retrieval, improving session handling.
  - Created unit tests for UserAuth and UserAuthStore to ensure functionality and reliability.
  - Refactored request handling to remove lodash dependencies, enhancing performance and reducing bundle size.

  This update significantly improves the authentication capabilities and state management within the corekit-bridge, providing a robust foundation for user interactions.

- **corekit-bridge:** refactor user authentication interfaces and enhance state management ([1eb98ee](https://github.com/qlover/fe-base/commit/1eb98eed7f7de9740db237f36bf101855eb20bee)) ([#438](https://github.com/qlover/fe-base/pull/438))
  - Replaced UserAuthServiceInterface with UserAuthApiInterface for improved clarity and consistency in authentication operations.
  - Updated UserAuth and UserAuthStore implementations to utilize the new interfaces, enhancing modularity.
  - Introduced comprehensive state management methods in UserAuthStore for better handling of authentication states.
  - Added unit tests to validate the new UserAuthService and its interactions with the updated interfaces.
  - Enhanced error handling and user feedback mechanisms during authentication processes.

  This update strengthens the user authentication framework, providing a more robust and maintainable solution for managing user sessions and states.

## 1.0.3

### Patch Changes

#### ♻️ Refactors

- **Bootstrap:** enhance configuration and plugin integration ([4256c19](https://github.com/qlover/fe-base/commit/4256c19a044d208d73bafcab173083b727fe0fe4)) ([#409](https://github.com/qlover/fe-base/pull/409))
  - Introduced BootstrapConfig interface to streamline configuration options for IOC, environment, and global plugins.
  - Refactored Bootstrap class to utilize the new configuration structure, improving clarity and maintainability.
  - Updated plugin initialization logic in the initialize method to support dynamic plugin loading based on provided options.
  - Enhanced InjectEnv, InjectIOC, and InjectGlobal plugins to accept configuration objects, improving flexibility and usability.
  - Adjusted method signatures and return types for better type safety and consistency across the Bootstrap class and its plugins.

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
