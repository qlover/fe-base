# @qlover/fe-code2markdown

## 0.1.1

### Patch Changes

#### ✨ Features

- **fe-code2markdown:** migrate build process to tsup and add project configuration ([a7c0031](https://github.com/qlover/fe-base/commit/a7c00314803bc288657d765c9ddb91beca0a4a51)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Updated the main entry point in `package.json` to use `index.js` for consistency with ESM.
  - Replaced the build script in `package.json` to utilize `tsup`, enhancing the build process.
  - Introduced a new `project.json` file to define build targets and improve integration with NX.
  - Created a new `tsup.config.ts` file for configuring the build process, supporting both ESM and CommonJS formats.
  - Removed the obsolete `rollup.config.js` file to streamline the project structure.

  These changes enhance the build orchestration and configuration for the fe-code2markdown package.

- **fe-code2markdown:** add asset copying utility and update build configuration ([c226604](https://github.com/qlover/fe-base/commit/c2266042880394be77a8c328fb066ed395295179)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Introduced a new `copyAssets` utility for flexible file and directory copying with glob pattern support.
  - Updated `tsup.config.ts` to utilize the new asset copying functionality after the build process.
  - Removed the obsolete `hbs` directory reference from `package.json` for clarity.
  - Adjusted the CLI to correctly resolve the Handlebars root directory.

  These changes enhance the asset management capabilities and streamline the build process for the fe-code2markdown package.

## 0.1.0

### Minor Changes

#### ✨ Features

- **fe-code2markdown:** enhance CLI options and reflection generation ([2b3dcd0](https://github.com/qlover/fe-base/commit/2b3dcd080614762d58df2e617773a506a663c129)) ([#401](https://github.com/qlover/fe-base/pull/401))
  - Introduced new default paths for output JSON and template files in the CLI.
  - Added a new option to remove the prefix from entry points in the CLI.
  - Updated ReflectionGenerater to utilize the new options for better path handling.
  - Enhanced Utils with a method to remove entry point prefixes from paths.
  - Improved TypeDocConverter to handle TypeAlias reflections more effectively.
