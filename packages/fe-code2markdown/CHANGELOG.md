# @qlover/fe-code2markdown

## 0.1.0

### Minor Changes

#### ✨ Features

- **fe-code2markdown:** enhance CLI options and reflection generation ([2b3dcd0](https://github.com/qlover/fe-base/commit/2b3dcd080614762d58df2e617773a506a663c129)) ([#401](https://github.com/qlover/fe-base/pull/401))

  - Introduced new default paths for output JSON and template files in the CLI.
  - Added a new option to remove the prefix from entry points in the CLI.
  - Updated ReflectionGenerater to utilize the new options for better path handling.
  - Enhanced Utils with a method to remove entry point prefixes from paths.
  - Improved TypeDocConverter to handle TypeAlias reflections more effectively.

- add fe-corekit to src/ ([6c5eff4](https://github.com/qlover/fe-base/commit/6c5eff4cf226e9de0081a7ea184ff492f611f60e)) ([#383](https://github.com/qlover/fe-base/pull/383))


    * feat(fe-corekit): update tsconfig and mock exports, add tests for executor and request modules

    ---------

    Co-authored-by: github-actions[bot] <github-actions[bot]@users.noreply.github.com>

- **corekit-node:** add corekit-node package with encryption utilities ([56cab76](https://github.com/qlover/fe-base/commit/56cab76285b096ad63ae1e02dc6e648a13fd76d4)) ([#383](https://github.com/qlover/fe-base/pull/383))

  - refactor(fe-corekit): restructure codebase to unify common interfaces and remove deprecated files

  * Updated package.json to reflect new entry points and module exports.
  * Refactored Rollup configuration to streamline build process.
  * Reorganized executor and request modules, moving interfaces from 'interface' to 'common'.
  * Added new tests for Executor and RequestError classes.
  * Removed obsolete logger implementation and adjusted imports across the codebase.

  - chore: remove corekit-interface
  - feat(corekit-node): add corekit-node package with encryption utilities

  * Introduced corekit-node package, including StringEntrypt and StringZlibEncrypt classes for string encryption and decryption.
  * Added tests for encryption functionalities to ensure reliability.
  * Updated fe-config.json and pnpm-lock.yaml to include corekit-node in the project structure.
  * Created CHANGELOG.md, README.md, and package.json for corekit-node with necessary configurations and metadata.

- **release:** Update ReleaseParams to include batchTagName and modify batchBranchName format ([074f2c5](https://github.com/qlover/fe-base/commit/074f2c57f08eec31f2b6062fb11a39a87ab2dfa4)) ([#362](https://github.com/qlover/fe-base/pull/362))

  - Added `batchTagName` for batch release tagging with a new default format.
  - Updated `batchBranchName` format to improve clarity and consistency.
  - Enhanced the logic for generating release tags in the ReleaseParams class.

- **mock:** Introduce viteMockPackage plugin and add mock implementations for env-loader and fe-corekit ([57ee5b3](https://github.com/qlover/fe-base/commit/57ee5b3819a9cf38c0aa6209da6c69733352c3af)) ([#362](https://github.com/qlover/fe-base/pull/362))

  - Added a new viteMockPackage plugin to facilitate mocking of specified packages in Vite tests.
  - Implemented mock classes for Env in @qlover/env-loader and Logger in @qlover/fe-corekit.
  - Updated vite.config.ts to include alias mappings for the mocked packages.
  - Refactored tests to utilize the new mock implementations, enhancing test isolation and reliability.

- **changelog:** implement GitChangelog for improved changelog generation ([2c8aa70](https://github.com/qlover/fe-base/commit/2c8aa7012012c518359ff5a41c66234ef1e5b2c2)) ([#351](https://github.com/qlover/fe-base/pull/351))

  - Introduced a new GitChangelog class to facilitate the generation of changelogs based on Git commit history.
  - Added interfaces for PRCommit, CommitInfo, and FlatCommit to structure commit data.
  - Updated Changelog plugin to utilize GitChangelog for fetching and formatting PR commits, replacing the previous conventional-changelog implementation.
  - Enhanced default options for changelog types and formatting.

- change use typescript ([6b3f67f](https://github.com/qlover/fe-base/commit/6b3f67f7d7adbf28656610fb92bcabe2cb118181)) ([#180](https://github.com/qlover/fe-base/pull/180))

- inteface ([3ba242d](https://github.com/qlover/fe-base/commit/3ba242d8fd31d187b4f3e5db90d81c8fcb92afff)) ([#172](https://github.com/qlover/fe-base/pull/172))

- generater use feScriptContext ([da8ed8e](https://github.com/qlover/fe-base/commit/da8ed8eac9cbc0c7c5e02dca0c199cf93cfea592)) ([#156](https://github.com/qlover/fe-base/pull/156))

- Serializer JSON and Base64 ([9fcfa1a](https://github.com/qlover/fe-base/commit/9fcfa1adc336a75851b5d057540262af7514b2a3)) ([#144](https://github.com/qlover/fe-base/pull/144))

- children map ([4d1d9a3](https://github.com/qlover/fe-base/commit/4d1d9a33118011fc784f52c6b3ab8319ef17e28a)) ([#138](https://github.com/qlover/fe-base/pull/138))

- docs code comment ([9c83c91](https://github.com/qlover/fe-base/commit/9c83c9119a4a7dab713ef9563531279977b67683)) ([#136](https://github.com/qlover/fe-base/pull/136))

- generate base json ([4d8e691](https://github.com/qlover/fe-base/commit/4d8e69175be2d9712c7c0ace834c0d6fe7767ff0)) ([#136](https://github.com/qlover/fe-base/pull/136))

- hbs template ([443c9f9](https://github.com/qlover/fe-base/commit/443c9f9d3a9ec135842154cc48202d29ae2a3c10)) ([#136](https://github.com/qlover/fe-base/pull/136))

- DeclarationReflectionParser ([a107415](https://github.com/qlover/fe-base/commit/a107415eded780dff08515868e924a74c6b14af2)) ([#136](https://github.com/qlover/fe-base/pull/136))

- write md doc ([fb2fd64](https://github.com/qlover/fe-base/commit/fb2fd645d220959492364491fb2849b75f5121f3)) ([#136](https://github.com/qlover/fe-base/pull/136))

- code2md commander ([d84abcb](https://github.com/qlover/fe-base/commit/d84abcbd2069089f632d7682afd6fcbb0964a6e1)) ([#136](https://github.com/qlover/fe-base/pull/136))

- fe-utils build:docs ([7651c1b](https://github.com/qlover/fe-base/commit/7651c1bf7ebf8938c39bc92e6ef0e2886dd0552d)) ([#136](https://github.com/qlover/fe-base/pull/136))

- change hbs template ([4ffece4](https://github.com/qlover/fe-base/commit/4ffece4d8b036eaa696cfac17be9ac327524e61f)) ([#136](https://github.com/qlover/fe-base/pull/136))

#### 🐞 Bug Fixes

- **release:** add option to push changed labels to release PRs in workflow ([2250baa](https://github.com/qlover/fe-base/commit/2250baaefb699ec046b7dedc3ff415d1dd07ae75)) ([#353](https://github.com/qlover/fe-base/pull/353))

- release publish npm ([90efa77](https://github.com/qlover/fe-base/commit/90efa77c6e9750fa82c2598c7bd85c1be29672af)) ([#327](https://github.com/qlover/fe-base/pull/327))

- **commit.ts:** find module root path ([df644c8](https://github.com/qlover/fe-base/commit/df644c84a41ec416d242cd16647c855c69a6f565)) ([#297](https://github.com/qlover/fe-base/pull/297))

- eslint config ([4a25294](https://github.com/qlover/fe-base/commit/4a25294884d4470fd2edd5967495189631439171)) ([#171](https://github.com/qlover/fe-base/pull/171))

- env globals ([b78213d](https://github.com/qlover/fe-base/commit/b78213d726a59d75fdff336a6a7499aa1dd26181)) ([#171](https://github.com/qlover/fe-base/pull/171))

- table show description ([e6731e9](https://github.com/qlover/fe-base/commit/e6731e9a2cc34b254edfd55a67a0e49549045176)) ([#146](https://github.com/qlover/fe-base/pull/146))

- block tags new line ([bdd451d](https://github.com/qlover/fe-base/commit/bdd451d83e4667a656f260190c1798361bf668ab)) ([#143](https://github.com/qlover/fe-base/pull/143))

- data error ([8a4f04d](https://github.com/qlover/fe-base/commit/8a4f04d4c0b661f2837704f87341fcea166e0cbe)) ([#136](https://github.com/qlover/fe-base/pull/136))

#### 📝 Documentation

- update fe-utils docs ([4cd4709](https://github.com/qlover/fe-base/commit/4cd4709fdf011a948978d474e28d29d721aae37a)) ([#172](https://github.com/qlover/fe-base/pull/172))

- update fe-utils ([db46462](https://github.com/qlover/fe-base/commit/db4646204863f7d194426a9df48cb31d6be716ce)) ([#162](https://github.com/qlover/fe-base/pull/162))

- update fe-utils docs ([dcb68a8](https://github.com/qlover/fe-base/commit/dcb68a83290786d4fa422aed5dac1b28c084c77c)) ([#146](https://github.com/qlover/fe-base/pull/146))

- new fe-utils docs ([2636773](https://github.com/qlover/fe-base/commit/263677347edcffb44651d6663fdda53d39e109d9)) ([#144](https://github.com/qlover/fe-base/pull/144))

- map dir docs ([d5c9e90](https://github.com/qlover/fe-base/commit/d5c9e90a273861a7cc27a02edc3077adcba3981b)) ([#138](https://github.com/qlover/fe-base/pull/138))

- use code2md generate fe-utils docs ([f825962](https://github.com/qlover/fe-base/commit/f825962efbb954b0d5231c6d7fa66bbc715de4d6)) ([#136](https://github.com/qlover/fe-base/pull/136))

#### ♻️ Refactors

- **fe-corekit:** update documentation structure and enhance build scripts ([b886224](https://github.com/qlover/fe-base/commit/b886224881bf3a2fc7ae46699d19842b196661c7)) ([#401](https://github.com/qlover/fe-base/pull/401))

  - Removed outdated documentation files and added new markdown files for various components.
  - Updated package.json scripts for documentation generation to reflect new paths and formats.
  - Enhanced the build process for documentation to include new type aliases and interfaces.
  - Introduced new examples and improved clarity in existing documentation for better developer experience.

- **fe-code2markdown:** replace @qlover/fe-corekit with @qlover/logger ([d4f8a32](https://github.com/qlover/fe-base/commit/d4f8a3230a831df503736f2ad8299bbe62b32101)) ([#383](https://github.com/qlover/fe-base/pull/383))

  - Updated dependencies in package.json and pnpm-lock.yaml to use @qlover/logger.
  - Adjusted logger implementation in code2md.js, ProjectReader.ts, ReflectionGenerater.ts, and TypeDocConverter.ts to utilize LoggerInterface for improved type safety and functionality.

- **changelog:** Simplify getDependencyReleaseLine function to return an empty string ([dbd1667](https://github.com/qlover/fe-base/commit/dbd1667e8bc85cc23145ceb82ed00e0f9fb298fe)) ([#362](https://github.com/qlover/fe-base/pull/362))

  - Removed unnecessary parameters and streamlined the function for better clarity and performance.

- **changelog:** Update GitChangelogOptions interface and improve comments ([2336846](https://github.com/qlover/fe-base/commit/2336846fe5a4ba845b0fa3585b99d087e5322940)) ([#362](https://github.com/qlover/fe-base/pull/362))

  - Translated comments from Chinese to English for better clarity.
  - Enhanced the GitChangelogOptions interface by adding a new `formatter` property and updating existing descriptions for consistency.
  - Cleaned up comments in the GitChangelog class for improved readability.

- **mock:** Enhance viteMockPackage to support dynamic alias mapping ([58f7b13](https://github.com/qlover/fe-base/commit/58f7b135cf071cd50df2bed66fc8f6257b0bd37a)) ([#362](https://github.com/qlover/fe-base/pull/362))

  - Introduced `parsePackagesMap` function to dynamically generate alias mappings for specified packages in vite.config.ts.
  - Updated vite.config.ts to utilize the new function, improving maintainability and flexibility of package mocking.
  - Removed hardcoded alias mappings for a more scalable approach to package management.

- **GithubPR:** remove TypeScript error suppression for logger ([f866aaf](https://github.com/qlover/fe-base/commit/f866aafe1f9165877531b24552e13ab5b40e7da0)) ([#348](https://github.com/qlover/fe-base/pull/348))

  - Removed the TypeScript error suppression comment related to the logger in the GithubPR class to improve code clarity and maintainability.

#### 🚧 Build

- **package.json:** use typescript ~5.4.0 ([430cfb5](https://github.com/qlover/fe-base/commit/430cfb5c6ef792bdca3d62c99add81e88f50007f)) ([#157](https://github.com/qlover/fe-base/pull/157))

- change hbs template new line ([42a5b3e](https://github.com/qlover/fe-base/commit/42a5b3e2657840f65257ff16e21f446c878c17ae)) ([#144](https://github.com/qlover/fe-base/pull/144))

- init fe-utils docs ([fd04c65](https://github.com/qlover/fe-base/commit/fd04c65623723848cb492a62c24c49f923729bcb)) ([#136](https://github.com/qlover/fe-base/pull/136))

- add new docs ([7f8d751](https://github.com/qlover/fe-base/commit/7f8d751b7c6cca219a07976258100dbe074e13b2)) ([#136](https://github.com/qlover/fe-base/pull/136))

- logger dir ([bd6736a](https://github.com/qlover/fe-base/commit/bd6736abe4679d42140a09914886aedabeb63253)) ([#136](https://github.com/qlover/fe-base/pull/136))

- code dir ([41d3328](https://github.com/qlover/fe-base/commit/41d3328f771eafd9459f1377d2bc60213e0bb6fe)) ([#136](https://github.com/qlover/fe-base/pull/136))

- add fe-code2md command ([ee73716](https://github.com/qlover/fe-base/commit/ee73716ac29381476f86e2511187d2171dbfbd1a)) ([#136](https://github.com/qlover/fe-base/pull/136))

## 0.0.4

## 0.0.3

## 0.0.2
