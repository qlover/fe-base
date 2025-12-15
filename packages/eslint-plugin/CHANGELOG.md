# @qlover/eslint-plugin

## 1.0.6

### Patch Changes

#### ✨ Features

- **ts-class-override:** Enhance ESLint plugin with new rules and configuration updates ([fc13101](https://github.com/qlover/fe-base/commit/fc1310184367e44fba8d823bc55fce986fb627f8)) ([#551](https://github.com/qlover/fe-base/pull/551))
  - Added new ESLint rules: `require-root-testid` to enforce `data-testid` attributes on root elements of TSX components, `ts-class-member-accessibility` to require explicit accessibility modifiers on class members, and `ts-class-method-return` to ensure explicit return types for class methods.
  - Updated ESLint configuration in `eslint.config.js` to include new language options for TypeScript projects.
  - Enhanced `package.json` with new scripts for building documentation and added TypeScript as a peer dependency.
  - Introduced comprehensive test cases for the new rules to ensure proper functionality and adherence to coding standards.
  - Updated documentation for the ESLint plugin to reflect new rules and usage guidelines.

  These changes aim to improve code quality, enforce best practices, and enhance the overall developer experience in TypeScript and React projects.

- **ts-class-override:** Add support for 'override' accessibility modifier in ESLint rules ([a5eb470](https://github.com/qlover/fe-base/commit/a5eb4708f06a8c8bb20142294d0e4657b32d8071)) ([#551](https://github.com/qlover/fe-base/pull/551))
  - Introduced the '@qlover-eslint/ts-class-override' rule to enforce the use of the 'override' keyword for class methods and properties in TypeScript.
  - Updated the ESLint configuration to include the new rule.
  - Enhanced test cases for the 'ts-class-member-accessibility' rule to cover various scenarios involving the 'override' modifier.
  - Modified the rule implementation to recognize and handle the 'override' keyword appropriately in class definitions.

  These changes aim to improve code quality by ensuring explicit accessibility modifiers are used, enhancing clarity and maintainability in TypeScript projects.

#### ♻️ Refactors

- Update TypeScript class accessibility and improve code clarity ([62f6203](https://github.com/qlover/fe-base/commit/62f620399d79530273fb33e45cb7469e2f241461)) ([#551](https://github.com/qlover/fe-base/pull/551))
  - Explicitly defined 'public' accessibility for class properties and methods across multiple TypeScript files to enhance clarity and maintainability.
  - Refactored tests to ensure consistent accessibility modifiers, improving overall code readability.
  - Updated ESLint configuration to enforce best practices in TypeScript coding standards.

  These changes aim to streamline code quality and maintainability in the project.

## 1.0.5

### Patch Changes

#### ✨ Features

- **eslint-plugin:** add require-root-testid rule to enforce data-testid attributes on root TSX elements ([367b2e2](https://github.com/qlover/fe-base/commit/367b2e28f22aed61233feed21860da7fd1b8ee36)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Introduced a new ESLint rule that requires root elements of TSX components to have a data-testid attribute, enhancing testability.
  - Updated ESLint configuration to include the new rule, ensuring consistent enforcement across the codebase.
  - Added documentation for the new rule, including examples of correct and incorrect usage.

  These changes aim to improve the testing capabilities of the application by ensuring that components are easily identifiable in tests.

#### 🐞 Bug Fixes

- **tests:** update import statement for tsClassMethodReturn rule ([a5e1983](https://github.com/qlover/fe-base/commit/a5e198395f4cb618b6d0c4b0c9e07c963712ae9f)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Changed the import statement for the tsClassMethodReturn rule to use named exports for improved clarity and consistency in the test file.

  This change aims to enhance the maintainability of the test suite by aligning with the updated export structure of the ESLint rules.

#### ♻️ Refactors

- **eslint-plugin:** improve rule exports and update ESLint configurations ([c142834](https://github.com/qlover/fe-base/commit/c142834bbabbeec3e5e3f92c6646bc0dc960379a)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Refactored the export statements for ESLint rules to use named exports for better clarity and consistency.
  - Enhanced the ESLint configuration to improve the handling of unused variables and enforce stricter linting rules.
  - Updated the `require-root-testid` rule to ensure proper formatting and documentation.

  These changes aim to enhance the maintainability and readability of the ESLint plugin while ensuring consistent rule enforcement across the codebase.

## 1.0.4

### Patch Changes

#### ✨ Features

- **eslint-plugin:** enhance TypeScript rule for class method return types ([0dc38b5](https://github.com/qlover/fe-base/commit/0dc38b5faf3cb8ab4ed41fb6e3f8310df12a0a23)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Introduced a new ESLint rule `ts-class-method-return` to enforce return type annotations for class methods in TypeScript, improving type safety.
  - Added comprehensive test cases for the new rule, covering both valid and invalid scenarios to ensure robust validation.
  - Updated TypeScript configuration to support new module resolution settings and included test directories.
  - Updated package dependencies in `package.json` to include the new rule tester.

#### 📝 Documentation

- **eslint-plugin:** update README and rule documentation for ts-class-method-return ([7b30ff2](https://github.com/qlover/fe-base/commit/7b30ff2ca519774a8a31c61d645d4eb17fa06aba)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Updated the README to reflect the new rule name `@qlover-eslint/ts-class-method-return` and its options, enhancing clarity on usage.
  - Expanded the documentation for the `ts-class-method-return` rule to include detailed descriptions of options and examples, improving developer understanding of return type annotations in class methods.

#### ♻️ Refactors

- **eslint:** replace @qlover/eslint-plugin-fe-dev with @qlover/eslint-plugin ([86b063f](https://github.com/qlover/fe-base/commit/86b063fa32d3015f1c70817951199cbd9f11d506)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Updated ESLint configuration to use the new @qlover/eslint-plugin, consolidating rules and plugins.
  - Removed the old @qlover/eslint-plugin-fe-dev package and its references.
  - Introduced a new rule for enforcing return type annotations in class methods, enhancing type safety in TypeScript projects.
  - Updated package.json and pnpm-lock.yaml to reflect the new plugin structure and dependencies.
  - Added comprehensive documentation for the new ESLint plugin and its rules.

- **eslint-plugin:** clean up imports and formatting in ts-class-method-return rule ([bce5137](https://github.com/qlover/fe-base/commit/bce513791adce5685fb92c86addf6cfb8111a8d7)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Simplified the import statement for the `ts-class-method-return` rule in `index.ts` for better readability.
  - Reformatted the `create` function in `ts-class-method-return.ts` to enhance code clarity by aligning parameters vertically.

## 1.0.2

### Patch Changes

#### ✨ Features

- **eslint-plugin:** enhance TypeScript rule for class method return types ([0dc38b5](https://github.com/qlover/fe-base/commit/0dc38b5faf3cb8ab4ed41fb6e3f8310df12a0a23)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Introduced a new ESLint rule `ts-class-method-return` to enforce return type annotations for class methods in TypeScript, improving type safety.
  - Added comprehensive test cases for the new rule, covering both valid and invalid scenarios to ensure robust validation.
  - Updated TypeScript configuration to support new module resolution settings and included test directories.
  - Updated package dependencies in `package.json` to include the new rule tester.

#### 📝 Documentation

- **eslint-plugin:** update README and rule documentation for ts-class-method-return ([7b30ff2](https://github.com/qlover/fe-base/commit/7b30ff2ca519774a8a31c61d645d4eb17fa06aba)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Updated the README to reflect the new rule name `@qlover-eslint/ts-class-method-return` and its options, enhancing clarity on usage.
  - Expanded the documentation for the `ts-class-method-return` rule to include detailed descriptions of options and examples, improving developer understanding of return type annotations in class methods.

#### ♻️ Refactors

- **eslint:** replace @qlover/eslint-plugin-fe-dev with @qlover/eslint-plugin ([86b063f](https://github.com/qlover/fe-base/commit/86b063fa32d3015f1c70817951199cbd9f11d506)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Updated ESLint configuration to use the new @qlover/eslint-plugin, consolidating rules and plugins.
  - Removed the old @qlover/eslint-plugin-fe-dev package and its references.
  - Introduced a new rule for enforcing return type annotations in class methods, enhancing type safety in TypeScript projects.
  - Updated package.json and pnpm-lock.yaml to reflect the new plugin structure and dependencies.
  - Added comprehensive documentation for the new ESLint plugin and its rules.

- **eslint-plugin:** clean up imports and formatting in ts-class-method-return rule ([bce5137](https://github.com/qlover/fe-base/commit/bce513791adce5685fb92c86addf6cfb8111a8d7)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Simplified the import statement for the `ts-class-method-return` rule in `index.ts` for better readability.
  - Reformatted the `create` function in `ts-class-method-return.ts` to enhance code clarity by aligning parameters vertically.

## 1.0.1

### Patch Changes

#### ✨ Features

- **eslint-plugin:** enhance TypeScript rule for class method return types ([0dc38b5](https://github.com/qlover/fe-base/commit/0dc38b5faf3cb8ab4ed41fb6e3f8310df12a0a23)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Introduced a new ESLint rule `ts-class-method-return` to enforce return type annotations for class methods in TypeScript, improving type safety.
  - Added comprehensive test cases for the new rule, covering both valid and invalid scenarios to ensure robust validation.
  - Updated TypeScript configuration to support new module resolution settings and included test directories.
  - Updated package dependencies in `package.json` to include the new rule tester.

#### 📝 Documentation

- **eslint-plugin:** update README and rule documentation for ts-class-method-return ([7b30ff2](https://github.com/qlover/fe-base/commit/7b30ff2ca519774a8a31c61d645d4eb17fa06aba)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Updated the README to reflect the new rule name `@qlover-eslint/ts-class-method-return` and its options, enhancing clarity on usage.
  - Expanded the documentation for the `ts-class-method-return` rule to include detailed descriptions of options and examples, improving developer understanding of return type annotations in class methods.

#### ♻️ Refactors

- **eslint:** replace @qlover/eslint-plugin-fe-dev with @qlover/eslint-plugin ([86b063f](https://github.com/qlover/fe-base/commit/86b063fa32d3015f1c70817951199cbd9f11d506)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Updated ESLint configuration to use the new @qlover/eslint-plugin, consolidating rules and plugins.
  - Removed the old @qlover/eslint-plugin-fe-dev package and its references.
  - Introduced a new rule for enforcing return type annotations in class methods, enhancing type safety in TypeScript projects.
  - Updated package.json and pnpm-lock.yaml to reflect the new plugin structure and dependencies.
  - Added comprehensive documentation for the new ESLint plugin and its rules.

- **eslint-plugin:** clean up imports and formatting in ts-class-method-return rule ([bce5137](https://github.com/qlover/fe-base/commit/bce513791adce5685fb92c86addf6cfb8111a8d7)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Simplified the import statement for the `ts-class-method-return` rule in `index.ts` for better readability.
  - Reformatted the `create` function in `ts-class-method-return.ts` to enhance code clarity by aligning parameters vertically.
