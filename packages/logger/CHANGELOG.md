# @qlover/logger

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
