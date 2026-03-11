# examples/taro-seed

## 1.0.1

### Patch Changes

#### ✨ Features

- **examples/taro-seed:** add taro examples code, miniapp,h5,tt ([e7cb8c0](https://github.com/qlover/fe-base/commit/e7cb8c0dbc56f1ec0b12f451caf0954ad2b6d86e)) ([#590](https://github.com/qlover/fe-base/pull/590))

- **examples/taro-seed:** add English and Chinese README files for Taro Seed template ([d6d641b](https://github.com/qlover/fe-base/commit/d6d641bcd196912cfedd69a7c121ea94974c40ac)) ([#590](https://github.com/qlover/fe-base/pull/590))
  - Introduced `README.en.md` and `README.md` files to provide comprehensive documentation for the Taro Seed project template in both English and Chinese.
  - The documentation includes details on the tech stack, supported platforms, project structure, getting started instructions, and main concepts such as IOC and Bootstrap.
  - This addition aims to enhance accessibility and usability for developers using the Taro Seed template across different language backgrounds.

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
