# @qlover/scripts-context

## 1.2.0

### Minor Changes

#### 📝 Documentation

- **scripts-context:** Update default values in configuration documentation ([c602cf2](https://github.com/qlover/fe-base/commit/c602cf24aa411dd73f7e6339603f2b334b691bf3)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Changed default values from `...` to `{}` in multiple documentation files for clarity.
  - Updated `feConfig`, `ColorFormatter`, `ScriptPlugin`, and `Shell` documentation to reflect accurate default configurations, enhancing user understanding.

- Update type annotations and module descriptions across multiple documentation files ([d0a5535](https://github.com/qlover/fe-base/commit/d0a5535aceffeb9b03b2fc8d578116fe55ab85b5)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Added type annotations for various modules and interfaces in the documentation, enhancing clarity and understanding of their functionalities.
  - Updated descriptions for modules such as `FeCode2Markdown`, `corekit-bridge`, and `user-auth`, ensuring accurate representation of their purposes.
  - Improved overall documentation quality by standardizing type definitions and enhancing the user experience with clearer explanations.

## 1.1.4

### Patch Changes

#### 🐞 Bug Fixes

- **scripts-context:** add missing env-loader dependency to package.json ([821e2da](https://github.com/qlover/fe-base/commit/821e2daa5a2d37eb3ffaf1c83f42b990b8a763b9)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Restored the @qlover/env-loader dependency in the devDependencies section of package.json to ensure proper environment variable loading during development.

  This change aims to maintain the functionality of the scripts context by including the necessary dependency for environment management.

## 1.1.3

### Patch Changes

#### 🐞 Bug Fixes

- **ScriptContext:** streamline environment option retrieval in getDefaultOptions method ([6fe72ec](https://github.com/qlover/fe-base/commit/6fe72ecf2d4d0414fa3c2b07549f4e6c4b6d91e2)) ([#495](https://github.com/qlover/fe-base/pull/495))
  - Updated the getDefaultOptions method to simplify the logic for retrieving the environment variable. The environment is now set directly from this.options.env or fetched using Env.searchEnv if not provided, improving code clarity and maintainability.

## 1.1.2

### Patch Changes

## 1.1.0

### Minor Changes

## 1.0.0

### Major Changes

#### ✨ Features

- **fe-code2markdown:** update dependencies and enhance project structure ([bf46bd1](https://github.com/qlover/fe-base/commit/bf46bd1da340ac6b4e9f42c98099af49f74f6fb3)) ([#454](https://github.com/qlover/fe-base/pull/454))
  - Added `@qlover/fe-corekit` as a dependency in `pnpm-lock.yaml` and `package.json` to improve functionality and integration.
  - Updated the `build:docs` script in `package.json` for better documentation generation.
  - Introduced a new `typedoc.json` file to support TypeDoc configuration for improved documentation output.
  - Refactored imports in `Code2MDContext.ts` and `reader.ts` to streamline code and enhance maintainability.
  - Removed the obsolete `ScriptContext.ts` file and integrated its functionality into the new plugin structure.

  These changes aim to enhance the overall usability and maintainability of the fe-code2markdown package.

- **scriptPlugin:** remove outdated test files and enhance ScriptContext and ScriptPlugin implementations ([27435a0](https://github.com/qlover/fe-base/commit/27435a0a2282c0724323fff1c74d653a86b68c7b)) ([#454](https://github.com/qlover/fe-base/pull/454))
  - Deleted `ScriptContext.test.ts` and `ScriptPlugin.test.ts` files to streamline the test suite.
  - Refactored `ScriptContext` to improve environment management, configuration merging, and logging capabilities.
  - Enhanced `ScriptPlugin` with better lifecycle management, configuration handling, and structured logging for execution steps.
  - Updated documentation within the code to clarify usage examples and design considerations.

  These changes improve the maintainability and clarity of the codebase, ensuring a more robust testing and execution environment.

- **scripts-context:** add documentation generation script and refactor test structure ([24cebc0](https://github.com/qlover/fe-base/commit/24cebc0392594de546c08da7ff717dbae4132105)) ([#454](https://github.com/qlover/fe-base/pull/454))
  - Introduced a new script `build:docs` in `package.json` for generating documentation from source code.
  - Refactored the mock implementation in `__mocks__/index.ts` to export all from the source, simplifying the mock structure.
  - Deleted outdated test file `ExecPromiseShell.test.ts` to streamline the test suite.
  - Added new test files for `ColorFormatter`, `ConfigSearch`, `ScriptContext`, `ScriptPlugin`, and `Shell`, enhancing test coverage and organization.

  These changes improve the documentation process and enhance the overall test suite, ensuring better maintainability and clarity in the codebase.

- **scripts-context:** migrate build process to tsup and add project configuration ([fd507fa](https://github.com/qlover/fe-base/commit/fd507fae9b78a0798aab95b744da08e818967d6c)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Updated the build script in `package.json` to use `tsup`, replacing the previous Rollup configuration.
  - Introduced a new `project.json` file to define build targets for NX integration.
  - Created a new `tsup.config.ts` file for configuring the build process, supporting both ESM and CommonJS formats.
  - Removed the obsolete `rollup.config.js` file to streamline the project structure.

  These changes enhance the build orchestration and configuration for the scripts-context package.

#### ♻️ Refactors

- **fe-code2markdown:** update context configuration and streamline imports ([0a63677](https://github.com/qlover/fe-base/commit/0a63677961b43a1474da74d8dd0a1197aef3616a)) ([#454](https://github.com/qlover/fe-base/pull/454))
  - Refactored `Code2MDContext.ts` to extend `ScriptShared`, enhancing configuration options.
  - Updated method calls in `reader.ts` and `TypeDocsJson.ts` to use `setOptions` instead of `setConfig`, improving consistency in context management.
  - Added `ScriptShared` export in `index.ts` of `scripts-context` for better modularity.

  These changes aim to improve code clarity and maintainability across the fe-code2markdown package.

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
