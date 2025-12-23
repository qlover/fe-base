## `FeCode2Markdown` (Module)

**Type:** `module FeCode2Markdown`

CLI tool for converting TypeScript/JavaScript code to Markdown documentation

Core Responsibilities:

- Parse TypeScript/JavaScript source code and extract JSDoc comments
- Generate comprehensive Markdown documentation with code examples
- Support custom Handlebars templates for flexible output formatting
- Filter JSDoc tags and customize output structure
- Format generated documentation using ESLint or Prettier

Design Considerations:

- Uses Commander.js for robust CLI argument parsing and validation
- Supports both CommonJS and ESM environments for maximum compatibility
- Automatically resolves template and output paths relative to current working directory
- Integrates with Code2MDTask for core functionality and error handling
- Provides cross-platform path handling for Windows, macOS, and Linux
- Implements dry-run mode for safe command preview and testing

Command Line Interface:
The CLI provides a comprehensive set of options to control the documentation generation process.

| Option                 | Alias | Type       | Required | Default                                | Description                                                   |
| ---------------------- | ----- | ---------- | -------- | -------------------------------------- | ------------------------------------------------------------- |
| `--sourcePath`         | `-p`  | `string`   | ❌       | `'src'`                                | Source code directory path to analyze                         |
| `--dry-run`            | `-d`  | `boolean`  | ❌       | `false`                                | Show commands without executing them                          |
| `--verbose`            | `-V`  | `boolean`  | ❌       | `false`                                | Show detailed output information                              |
| `--outputJSONFilePath` | `-o`  | `string`   | ❌       | `docs.output/.output/code2md.json`     | Path for output JSON file                                     |
| `--generatePath`       | `-g`  | `string`   | ❌       | `'docs.output'`                        | Directory for generated documentation                         |
| `--tplPath`            | `-t`  | `string`   | ❌       | `docs.output/.output/code2md.tpl.json` | Template configuration file path                              |
| `--onlyJson`           | -     | `boolean`  | ❌       | `false`                                | Generate only JSON file, skip Markdown                        |
| `--debug`              | `-d`  | `boolean`  | ❌       | `false`                                | Enable debug mode with extra logging                          |
| `--removePrefix`       | -     | `boolean`  | ❌       | `false`                                | Remove entry point prefix from file paths                     |
| `--formatOutput`       | -     | `string`   | ❌       | -                                      | Format output with `'eslint'` or `'prettier'`                 |
| `--filterTags`         | -     | `string[]` | ❌       | -                                      | Comma-separated JSDoc tags to filter out                      |
| `--exclude`            | -     | `string[]` | ❌       | -                                      | Exclude files or directories (comma-separated paths/patterns) |

**Example:** Basic Usage

```bash
npx code2markdown -p src
```

**Example:** Custom Output Path

```bash
npx code2markdown -p src -g docs/api --removePrefix
```

**Example:** Custom Template and Formatting

```bash
npx code2markdown -p src -t custom.tpl.json --formatOutput prettier
```

**Example:** Filter JSDoc Tags

```bash
npx code2markdown -p src --filterTags "internal,deprecated,private"
```

**Example:** Exclude Files and Directories

```bash
npx code2markdown -p src --exclude "src/test,src/utils/helpers.ts,node_modules"
```

**Example:** Debug Mode

```bash
npx code2markdown -p src --debug --verbose
```

**Example:** Dry Run Preview

```bash
npx code2markdown -p src --dry-run
```

---
