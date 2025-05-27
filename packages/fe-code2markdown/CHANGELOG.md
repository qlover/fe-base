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
