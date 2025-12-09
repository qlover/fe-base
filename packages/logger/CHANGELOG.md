# @qlover/logger

## 0.3.0

### Minor Changes

#### 📝 Documentation

- **logger:** Update default value in Logger documentation ([a6bf121](https://github.com/qlover/fe-base/commit/a6bf121bd6363a208499bf31c9c8aaadd1ba16ee)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Changed default value from `...` to `{}` in Logger.md for clarity and accuracy in documentation.

- Update type annotations and module descriptions across multiple documentation files ([d0a5535](https://github.com/qlover/fe-base/commit/d0a5535aceffeb9b03b2fc8d578116fe55ab85b5)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Added type annotations for various modules and interfaces in the documentation, enhancing clarity and understanding of their functionalities.
  - Updated descriptions for modules such as `FeCode2Markdown`, `corekit-bridge`, and `user-auth`, ensuring accurate representation of their purposes.
  - Improved overall documentation quality by standardizing type definitions and enhancing the user experience with clearer explanations.

## 0.2.0

### Minor Changes

#### ✨ Features

- **logger:** update logger package configuration and add project setup ([0247314](https://github.com/qlover/fe-base/commit/024731473b1acb019ddb4fa8ea526e31e54de96c)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Changed the main entry point in `package.json` from `index.cjs` to `index.umd.js` for better compatibility.
  - Updated the homepage link in `package.json` to point directly to the logger package documentation.
  - Introduced a new `project.json` file to define the logger package structure and build targets using NX.
  - Modified `tsup.config.ts` to adjust output formats and enable minification, enhancing the build process for the logger package.

  These changes improve the configuration and usability of the logger package within the monorepo.

- **pnpm-lock:** update dependencies and clean up unused packages ([05660ed](https://github.com/qlover/fe-base/commit/05660edbeed5dadf00537177cb749abaed45d0ae)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Added `tailwindcss` and `vite` to the dependencies in `pnpm-lock.yaml` with their respective versions.
  - Removed unused dependencies related to React and Vite plugins, streamlining the package management.
  - Updated the build command in `packages/logger/project.json` to use `pnpm build`, enhancing the build process for the logger package.
  - Included additional inputs for the build process to ensure all necessary files are considered during the build.

  These changes improve dependency management and build configuration within the project.

## 0.1.1

### Patch Changes

#### ♻️ Refactors

- fe corekit (#383)

  ***

## 0.1.0

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

## 0.0.2

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

## 0.0.1

### Patch Changes

#### ✨ Features

- add @qlover/logger package with ConsoleAppender and TimestampFormatter (#369)
  - Introduced a new logging package, @qlover/logger, which includes a Logger class for structured logging.
  - Implemented ConsoleAppender for console output and TimestampFormatter for formatted timestamps.
  - Added comprehensive tests for Logger, ConsoleAppender, and TimestampFormatter to ensure functionality.
  - Created CHANGELOG.md and README.md for the new package.

- enhance @qlover/logger package with new build script and documentation updates (#369)
  - Added a new build script for the logger package to streamline the build process.
  - Introduced an English README file for better accessibility and understanding of the logger's features and usage.
  - Updated the logger package's configuration to include additional files in the distribution.
  - Enhanced tests to cover new appender management and formatter behavior functionalities.
