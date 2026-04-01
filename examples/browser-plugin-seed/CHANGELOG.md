# examples/browser-plugin-seed

## 1.0.0

### Major Changes

#### ✨ Features

- **docs:** add English README for browser-plugin-seed ([f93e3d4](https://github.com/qlover/fe-base/commit/f93e3d48fdee677bae56e01c00cd64a180b95ee4)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Introduced a new English README file for the browser-plugin-seed example, providing installation instructions, project layout, and core concepts.
  - Updated the existing Chinese README to include a link to the new English version.
  - Enhanced clarity on setup steps, including prerequisites, installation, running the development server, and building for production.

  These changes aim to improve accessibility and usability for English-speaking developers using the browser-plugin-seed template.

#### ♻️ Refactors

- **store:** enhance store management and type safety ([a3ae623](https://github.com/qlover/fe-base/commit/a3ae6232d20ac88837a80eaa72c3d6b12c87e13f)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Updated the `useStore` hook to support both `StoreInterface` and `SliceStoreLike`, improving flexibility in state management.
  - Refactored `I18nService` to utilize `SliceStoreAdapter` for better state handling and access.
  - Introduced `getUIStore` method in `UserService` for consistent store access.
  - Adjusted `HomePage` to leverage the new store management methods, enhancing clarity in user state handling.
  - Improved `AuthStore` methods to utilize the new store interface for state updates.

  These changes aim to streamline store interactions and enhance type safety across the application.

## 0.0.3

### Patch Changes

#### ✨ Features

- **browser-plugin-seed:** initialize browser plugin seed template ([e61a567](https://github.com/qlover/fe-base/commit/e61a567915d08af0e3dcb18d2d1dca447636b28e)) ([#590](https://github.com/qlover/fe-base/pull/590))
  - Added a comprehensive template for a browser extension using Plasmo and React, including essential configuration files such as `.env.example`, `.gitignore`, and `package.json`.
  - Integrated ESLint and Prettier configurations for improved code quality and consistency.
  - Established a structured project layout with directories for shared configurations, components, and localization support.
  - Included mock data and endpoints for user authentication, enhancing the development experience.
  - Provided a detailed README file to guide users through setup, usage, and project structure.

  These changes aim to provide a solid foundation for developing browser extensions, improving developer experience and maintainability.

#### ♻️ Refactors

- **dep:** update eslint configuration and package dependencies ([e9275ee](https://github.com/qlover/fe-base/commit/e9275ee01bbab01ef9d95a008f97e18eec4d6895)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated `eslint.config.js` to include the `examples` directory in the linting process, improving code quality checks across all examples.
  - Added a new script `nx:build:packages` in `package.json` to facilitate building packages while excluding the `examples` directory, streamlining the build process.
  - Updated `pnpm-lock.yaml` to reflect the latest versions of various dependencies, enhancing compatibility and performance across the project.

  These changes aim to improve the development workflow and maintain a cleaner project structure.

- **config:** update SeedConfigInterface and BootstrapClient implementation ([af8bc42](https://github.com/qlover/fe-base/commit/af8bc426c3cac801eba6f715fef1d991da1262c0)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Refactored the SeedConfigInterface to be imported from '@qlover/corekit-bridge/bootstrap', enhancing consistency across the project.
  - Removed obsolete SeedBootstrapInterface and updated BootstrapClient to implement the new BootstrapInterface, streamlining the bootstrapping process.
  - Adjusted various imports in related files to align with the new structure, improving code organization and maintainability.
  - Enhanced the logging configuration in the BootstrapClient to utilize a dynamic log level setting.

  These changes aim to improve the overall architecture and maintainability of the project by consolidating configuration interfaces and refining the bootstrapping logic.

## 0.0.2

### Patch Changes

#### ✨ Features

- **browser-plugin-seed:** initialize browser plugin seed template ([e61a567](https://github.com/qlover/fe-base/commit/e61a567915d08af0e3dcb18d2d1dca447636b28e)) ([#590](https://github.com/qlover/fe-base/pull/590))
  - Added a comprehensive template for a browser extension using Plasmo and React, including essential configuration files such as `.env.example`, `.gitignore`, and `package.json`.
  - Integrated ESLint and Prettier configurations for improved code quality and consistency.
  - Established a structured project layout with directories for shared configurations, components, and localization support.
  - Included mock data and endpoints for user authentication, enhancing the development experience.
  - Provided a detailed README file to guide users through setup, usage, and project structure.

  These changes aim to provide a solid foundation for developing browser extensions, improving developer experience and maintainability.

#### ♻️ Refactors

- **dep:** update eslint configuration and package dependencies ([e9275ee](https://github.com/qlover/fe-base/commit/e9275ee01bbab01ef9d95a008f97e18eec4d6895)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated `eslint.config.js` to include the `examples` directory in the linting process, improving code quality checks across all examples.
  - Added a new script `nx:build:packages` in `package.json` to facilitate building packages while excluding the `examples` directory, streamlining the build process.
  - Updated `pnpm-lock.yaml` to reflect the latest versions of various dependencies, enhancing compatibility and performance across the project.

  These changes aim to improve the development workflow and maintain a cleaner project structure.

- **config:** update SeedConfigInterface and BootstrapClient implementation ([af8bc42](https://github.com/qlover/fe-base/commit/af8bc426c3cac801eba6f715fef1d991da1262c0)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Refactored the SeedConfigInterface to be imported from '@qlover/corekit-bridge/bootstrap', enhancing consistency across the project.
  - Removed obsolete SeedBootstrapInterface and updated BootstrapClient to implement the new BootstrapInterface, streamlining the bootstrapping process.
  - Adjusted various imports in related files to align with the new structure, improving code organization and maintainability.
  - Enhanced the logging configuration in the BootstrapClient to utilize a dynamic log level setting.

  These changes aim to improve the overall architecture and maintainability of the project by consolidating configuration interfaces and refining the bootstrapping logic.
