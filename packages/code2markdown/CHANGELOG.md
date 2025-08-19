# @qlover/code2markdown

## 1.1.2

### Patch Changes

## 1.1.0

### Minor Changes

#### ✨ Features

- **code2markdown:** Enhance TypeDocJson filtering logic to exclude .d.ts files and index.ts files without comments. This improves the accuracy of project child node processing by ensuring only relevant files are included. ([ce4b639](https://github.com/qlover/fe-base/commit/ce4b6397632de0a9ea8d55ec7b65531cffab78c6)) ([#483](https://github.com/qlover/fe-base/pull/483))

## 1.0.1

### Patch Changes

#### ✨ Features

- **code2markdown:** enhance package.json and add comprehensive test suites ([75e8a56](https://github.com/qlover/fe-base/commit/75e8a56bdb18d3d390517b5445aa676c829d529b)) ([#481](https://github.com/qlover/fe-base/pull/481))
  - Updated package.json to include CommonJS module support by adding "require" entries for both the main package and CLI.
  - Introduced new test files for hbsHelper, HBSTemplate, Reader, and TypeDocJson plugins, covering various functionalities and edge cases.
  - Implemented detailed test cases to ensure robust validation of helper functions, template compilation, file reading, and TypeDoc reflection conversion.

  These changes aim to improve the overall functionality, maintainability, and test coverage of the code2markdown package.

- **code2markdown:** enhance documentation and update index files ([93868f1](https://github.com/qlover/fe-base/commit/93868f1e499c128ac8da4ab2ce209c45338062c7)) ([#481](https://github.com/qlover/fe-base/pull/481))
  - Expanded the code comments guide to include detailed instructions for `index.ts` files, emphasizing the importance of the `@module` tag and providing a structured format for module documentation.
  - Added comprehensive CLI documentation for the `code2markdown` tool, outlining its core responsibilities, command options, and usage examples.
  - Introduced new documentation files for various components, including `HBSTemplate`, `Code2MDContext`, and `Formats`, to improve clarity and usability for developers.
  - Updated the main module index to reflect new features and provide clearer usage examples.

  These changes aim to enhance the overall documentation quality and usability of the code2markdown package, ensuring developers have the necessary resources for effective implementation.

## 1.0.0

### Major Changes

#### ✨ Features

- **code2markdown:** add Code Comments Guide and enhance documentation structure ([982dd1c](https://github.com/qlover/fe-base/commit/982dd1c1b7cd30996f7fcbc38ccc4edba5e06188)) ([#454](https://github.com/qlover/fe-base/pull/454))
  - Introduced a new Code Comments Guide in both English and Chinese, detailing best practices for writing effective comments.
  - Updated README files to include links to the new guide, improving accessibility to documentation resources.
  - Enhanced the index files in the documentation to reflect the addition of the Code Comments Guide.
  - Created a CHANGELOG.md for the code2markdown package to track changes and updates.

  These changes aim to standardize code commenting practices and improve the overall documentation framework across the project.

## 0.1.1

### Patch Changes

#### ✨ Features

- **code2markdown:** migrate build process to tsup and add project configuration ([a7c0031](https://github.com/qlover/fe-base/commit/a7c00314803bc288657d765c9ddb91beca0a4a51)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Updated the main entry point in `package.json` to use `index.js` for consistency with ESM.
  - Replaced the build script in `package.json` to utilize `tsup`, enhancing the build process.
  - Introduced a new `project.json` file to define build targets and improve integration with NX.
  - Created a new `tsup.config.ts` file for configuring the build process, supporting both ESM and CommonJS formats.
  - Removed the obsolete `rollup.config.js` file to streamline the project structure.

  These changes enhance the build orchestration and configuration for the code2markdown package.

- **code2markdown:** add asset copying utility and update build configuration ([c226604](https://github.com/qlover/fe-base/commit/c2266042880394be77a8c328fb066ed395295179)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Introduced a new `copyAssets` utility for flexible file and directory copying with glob pattern support.
  - Updated `tsup.config.ts` to utilize the new asset copying functionality after the build process.
  - Removed the obsolete `hbs` directory reference from `package.json` for clarity.
  - Adjusted the CLI to correctly resolve the Handlebars root directory.

  These changes enhance the asset management capabilities and streamline the build process for the code2markdown package.

## 0.1.0

### Minor Changes

#### ✨ Features

- **code2markdown:** enhance CLI options and reflection generation ([2b3dcd0](https://github.com/qlover/fe-base/commit/2b3dcd080614762d58df2e617773a506a663c129)) ([#401](https://github.com/qlover/fe-base/pull/401))
  - Introduced new default paths for output JSON and template files in the CLI.
  - Added a new option to remove the prefix from entry points in the CLI.
  - Updated ReflectionGenerater to utilize the new options for better path handling.
  - Enhanced Utils with a method to remove entry point prefixes from paths.
  - Improved TypeDocConverter to handle TypeAlias reflections more effectively.
