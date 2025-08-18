# @qlover/eslint-plugin

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
