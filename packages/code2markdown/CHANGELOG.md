# @qlover/code2markdown

## 1.4.0

### Minor Changes

#### ✨ Features

- **code2markdown:** Add exclude option for file processing ([eb0a677](https://github.com/qlover/fe-base/commit/eb0a6777da034e7eba0553bf80127f7b3187c4ce)) ([#560](https://github.com/qlover/fe-base/pull/560))
  - Introduced a new `--exclude` option in the CLI to allow users to specify files or directories to exclude from processing, enhancing flexibility in documentation generation.
  - Updated the `Code2MDContext` interface to include the `exclude` property, allowing for better configuration of excluded paths.
  - Enhanced the `Reader` class to filter out excluded files based on the new option, improving the overall functionality of the documentation generation process.
  - Added examples in the documentation to demonstrate the usage of the `--exclude` option, ensuring users can easily understand its application.

  These changes aim to provide users with more control over the documentation generation process by allowing them to exclude specific files or directories.

#### 📝 Documentation

- Introduce new modules and enhance CLI functionality ([b27fba0](https://github.com/qlover/fe-base/commit/b27fba01d2227d7b3bde9951f5c7005b5572c657)) ([#560](https://github.com/qlover/fe-base/pull/560))
  - Added `FeReleaseCLI`, `FeReleaseDefaults`, and `FeRelease` modules to automate frontend package release processes, including version management and changelog generation.
  - Implemented command-line interface options for `fe-release`, allowing users to customize release behavior with advanced options.
  - Introduced type definitions in `FeReleaseTypes` for better TypeScript support across the framework.
  - Enhanced documentation with examples for new features, ensuring clarity and usability for developers.

  These changes aim to streamline the release process and improve developer experience when managing frontend packages.

#### ♻️ Refactors

- **eslint:** Improve TypeScript class override detection and configuration ([4c57d46](https://github.com/qlover/fe-base/commit/4c57d46428b83ea98ab3bf3bb7ad1656153c2e08)) ([#560](https://github.com/qlover/fe-base/pull/560))
  - Enhanced ESLint configuration for TypeScript to enable accurate detection of class method overrides using the `@qlover-eslint/ts-class-override` rule with full type information.
  - Updated `eslint.config.js` and template ESLint configurations for `next-app` and `react-app` to include separate blocks for type-checked rules, ensuring performance while maintaining linting accuracy.
  - Added `typescript-eslint` as a dependency to support the new configurations.
  - Introduced debug logging options in the `ClassOverride` utility to assist in override detection, improving maintainability and debugging capabilities.

  These changes aim to refine TypeScript support in ESLint and enforce best practices for method overrides in class definitions.

## 1.3.3

### Patch Changes

## 1.3.1

### Patch Changes

#### ♻️ Refactors

- Update TypeScript class accessibility and improve code clarity ([62f6203](https://github.com/qlover/fe-base/commit/62f620399d79530273fb33e45cb7469e2f241461)) ([#551](https://github.com/qlover/fe-base/pull/551))
  - Explicitly defined 'public' accessibility for class properties and methods across multiple TypeScript files to enhance clarity and maintainability.
  - Refactored tests to ensure consistent accessibility modifiers, improving overall code readability.
  - Updated ESLint configuration to enforce best practices in TypeScript coding standards.

  These changes aim to streamline code quality and maintainability in the project.

## 1.3.0

### Minor Changes

#### ✨ Features

- **typeDocs:** Enhance default value handling in TypeDocJson plugin ([ed2cd3f](https://github.com/qlover/fe-base/commit/ed2cd3f69f606bd7a827cf2205b883f69650acd8)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Updated getDefaultValue method to handle TypeDoc's ellipsis ("...") for complex default values.
  - Introduced logic to infer reasonable default values based on parameter types when ellipsis is encountered.
  - Enhanced documentation with examples for ellipsis handling and default value extraction from JSDoc tags.
  - Improved overall clarity and maintainability of the code by restructuring the default value logic.

#### 📝 Documentation

- Update type annotations and module descriptions across multiple documentation files ([d0a5535](https://github.com/qlover/fe-base/commit/d0a5535aceffeb9b03b2fc8d578116fe55ab85b5)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Added type annotations for various modules and interfaces in the documentation, enhancing clarity and understanding of their functionalities.
  - Updated descriptions for modules such as `FeCode2Markdown`, `corekit-bridge`, and `user-auth`, ensuring accurate representation of their purposes.
  - Improved overall documentation quality by standardizing type definitions and enhancing the user experience with clearer explanations.

## 1.2.0

### Minor Changes

#### ♻️ Refactors

- **code2markdown:** Refactor test setup in Reader and TypeDocJson tests to use unique temporary directories and improve cleanup logic. Updated Reader class to use forEach instead of map for directory processing. This enhances test isolation and reliability. ([002edaf](https://github.com/qlover/fe-base/commit/002edaf41144169d79ba2c4095e57c1c20589a3e)) ([#537](https://github.com/qlover/fe-base/pull/537))

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
