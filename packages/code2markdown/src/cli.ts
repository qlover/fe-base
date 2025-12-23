#!/usr/bin/env node

/**
 * @module FeCode2Markdown
 * @description CLI tool for converting TypeScript/JavaScript code to Markdown documentation
 *
 * Core Responsibilities:
 * - Parse TypeScript/JavaScript source code and extract JSDoc comments
 * - Generate comprehensive Markdown documentation with code examples
 * - Support custom Handlebars templates for flexible output formatting
 * - Filter JSDoc tags and customize output structure
 * - Format generated documentation using ESLint or Prettier
 *
 * Design Considerations:
 * - Uses Commander.js for robust CLI argument parsing and validation
 * - Supports both CommonJS and ESM environments for maximum compatibility
 * - Automatically resolves template and output paths relative to current working directory
 * - Integrates with Code2MDTask for core functionality and error handling
 * - Provides cross-platform path handling for Windows, macOS, and Linux
 * - Implements dry-run mode for safe command preview and testing
 *
 * Command Line Interface:
 * The CLI provides a comprehensive set of options to control the documentation generation process.
 *
 * | Option | Alias | Type | Required | Default | Description |
 * |--------|-------|------|----------|---------|-------------|
 * | \`--sourcePath\` | \`-p\` | \`string\` | ❌ | \`'src'\` | Source code directory path to analyze |
 * | \`--dry-run\` | \`-d\` | \`boolean\` | ❌ | \`false\` | Show commands without executing them |
 * | \`--verbose\` | \`-V\` | \`boolean\` | ❌ | \`false\` | Show detailed output information |
 * | \`--outputJSONFilePath\` | \`-o\` | \`string\` | ❌ | \`docs.output/.output/code2md.json\` | Path for output JSON file |
 * | \`--generatePath\` | \`-g\` | \`string\` | ❌ | \`'docs.output'\` | Directory for generated documentation |
 * | \`--tplPath\` | \`-t\` | \`string\` | ❌ | \`docs.output/.output/code2md.tpl.json\` | Template configuration file path |
 * | \`--onlyJson\` | - | \`boolean\` | ❌ | \`false\` | Generate only JSON file, skip Markdown |
 * | \`--debug\` | \`-d\` | \`boolean\` | ❌ | \`false\` | Enable debug mode with extra logging |
 * | \`--removePrefix\` | - | \`boolean\` | ❌ | \`false\` | Remove entry point prefix from file paths |
 * | \`--formatOutput\` | - | \`string\` | ❌ | - | Format output with \`'eslint'\` or \`'prettier'\` |
 * | \`--filterTags\` | - | \`string[]\` | ❌ | - | Comma-separated JSDoc tags to filter out |
 * | \`--exclude\` | - | \`string[]\` | ❌ | - | Exclude files or directories (comma-separated paths/patterns) |
 *
 * @example Basic Usage
 * ```bash
 * npx code2markdown -p src
 * ```
 *
 * @example Custom Output Path
 * ```bash
 * npx code2markdown -p src -g docs/api --removePrefix
 * ```
 *
 * @example Custom Template and Formatting
 * ```bash
 * npx code2markdown -p src -t custom.tpl.json --formatOutput prettier
 * ```
 *
 * @example Filter JSDoc Tags
 * ```bash
 * npx code2markdown -p src --filterTags "internal,deprecated,private"
 * ```
 *
 * @example Exclude Files and Directories
 * ```bash
 * npx code2markdown -p src --exclude "src/test,src/utils/helpers.ts,node_modules"
 * ```
 *
 * @example Debug Mode
 * ```bash
 * npx code2markdown -p src --debug --verbose
 * ```
 *
 * @example Dry Run Preview
 * ```bash
 * npx code2markdown -p src --dry-run
 * ```
 */

import { Command } from 'commander';
import { version, description } from '../package.json';
import { Code2MDContextOptions } from './implments/Code2MDContext';
import { Code2MDTask } from './implments/Code2MDTask';
import { dirname, join, resolve } from 'path';

/**
 * Get the current file path in a cross-platform and module-system compatible way
 *
 * Implementation Details:
 * This function handles both CommonJS and ESM environments to determine the current script path.
 * In CommonJS, it uses `__filename`, while in ESM it uses `process.argv[1]` and resolves relative paths.
 *
 * Cross-platform Considerations:
 * - Handles Windows absolute paths (e.g., `C:\path\to\file.js`)
 * - Handles Unix absolute paths (e.g., `/path/to/file.js`)
 * - Resolves relative paths to absolute paths using current working directory
 *
 * @returns Absolute path to the current script file
 *
 * @example
 * ```typescript
 * const currentPath = getCurrentFilePath();
 * console.log(currentPath); // /path/to/cli.js
 * ```
 */
function getCurrentFilePath(): string {
  if (typeof __dirname !== 'undefined') {
    // CommonJS Environment - use __filename for current file path
    return __filename;
  } else {
    // ESM Environment - use process.argv[1] to get script path
    let scriptPath = process.argv[1];

    // Convert relative paths to absolute paths using current working directory
    if (!scriptPath.startsWith('/') && !scriptPath.match(/^[A-Z]:/)) {
      scriptPath = resolve(process.cwd(), scriptPath);
    }

    return scriptPath;
  }
}

/**
 * Default configuration constants for the CLI tool
 *
 * These constants define the default paths and file names used by the tool
 * when no custom values are provided by the user.
 */
const DEFAULT_GENERATE_PATH = 'docs.output';
const DEFAULT_OUTPUT_JSON_FILE_PATH = '.output/code2md.json';
const DEFAULT_TPL_PATH = '.output/code2md.tpl.json';
const DEFAULT_HBS_ROOT_DIR = 'hbs';

// Initialize Commander.js CLI program
const program = new Command();

program
  .version(version, '-v, --version', 'Show version')
  .description(description)
  .option(
    '-p, --sourcePath <path>',
    'source code path, only support a directory',
    'src'
  )
  .option('--dry-run', 'Do not touch or write anything, but show the commands')
  .option('-V, --verbose', 'Show more information')
  .option('-o, --outputJSONFilePath <path>', 'Output JSON file path')
  .option('-g, --generatePath <path>', 'Generate path', DEFAULT_GENERATE_PATH)
  .option('-t, --tplPath <path>', 'Template path')
  .option('--onlyJson', 'Only generate JSON file')
  .option('--debug', 'Debug mode')
  .option('--removePrefix', 'Remove prefix of the entry point')
  .option(
    '--formatOutput <tool>',
    'Format output directory with eslint or prettier'
  )
  .option(
    '--filterTags <tags>',
    'Filter out specific JSDoc tags (comma-separated)',
    (value) => value.split(',').map((tag) => tag.trim())
  )
  .option(
    '--exclude <paths>',
    'Exclude files or directories from processing (comma-separated paths/patterns)',
    (value) => value.split(',').map((path) => path.trim())
  );

program.parse(process.argv);

const options = program.opts();

/**
 * Main CLI execution function
 *
 * Core Responsibilities:
 * - Parse and validate CLI options
 * - Resolve file paths relative to current working directory
 * - Configure Code2MDTask with user options
 * - Execute documentation generation process
 * - Handle errors and provide meaningful error messages
 *
 * Implementation Details:
 * - Extracts dry-run and verbose flags for special handling
 * - Resolves template and output paths relative to generate path
 * - Sets up Handlebars template directory path
 * - Configures typeDocs and formats options for Code2MDTask
 * - Provides fallback values for optional parameters
 *
 * @returns Promise that resolves when documentation generation completes
 *
 * @throws {Error} When documentation generation fails
 *
 * @example
 * ```typescript
 * // CLI execution is handled automatically when script is run
 * // Example: node cli.js -p src -g docs/api
 * ```
 */
const main = async () => {
  // Extract special flags that need separate handling
  const { dryRun, verbose, ...opts } = options;

  // Get the absolute path of the current file for template resolution
  const currentFilePath = getCurrentFilePath();

  // Get the directory of the current file for Handlebars template lookup
  const currentFileDir = dirname(currentFilePath);

  // Preserve original generate path value without resolution
  const generatePath = opts.generatePath;

  // Resolve template path relative to generate path if not provided
  const tplPath = opts.tplPath || join(generatePath, DEFAULT_TPL_PATH);

  // Resolve output JSON file path relative to generate path if not provided
  const outputJSONFilePath =
    opts.outputJSONFilePath ||
    join(generatePath, DEFAULT_OUTPUT_JSON_FILE_PATH);

  // Set up Handlebars template root directory
  const hbsRootDir = join(currentFileDir, DEFAULT_HBS_ROOT_DIR);

  // TODO: Add parameter validation for better error handling
  // Configure generator options for Code2MDTask
  const generaterOptions: Code2MDContextOptions['options'] = {
    sourcePath: opts.sourcePath,
    generatePath: generatePath,
    exclude: opts.exclude,
    // @ts-expect-error - Type definition mismatch in Code2MDContextOptions
    typeDocs: {
      outputJSONFilePath: outputJSONFilePath,
      tplPath: tplPath,
      basePath: process.cwd(),
      filterTags: opts.filterTags
    },
    formats: {
      skip: false,
      hbsRootDir: hbsRootDir,
      removePrefix: opts.removePrefix || false,
      formatOutput: opts.formatOutput
    }
  };

  // Configure Code2MDTask with all options
  const code2mdOptions: Partial<Code2MDContextOptions> = {
    verbose: opts.debug ?? verbose,
    dryRun: dryRun,
    options: generaterOptions
  };

  // Create and execute documentation generation task
  const task = new Code2MDTask(code2mdOptions);

  await task.run();
};

// Execute main function with error handling
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
