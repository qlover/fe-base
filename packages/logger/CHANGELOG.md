# @qlover/logger

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