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
 * | \`--colocate\` | - | \`boolean\` | ❌ | \`false\` | Write markdown beside the source file |
 * | \`--onlyPrimaryExport\` | - | \`boolean\` | ❌ | \`false\` | Only write PascalCase \`.tsx\` with a same-name export |
 * | \`--plugin\` | - | \`string\` | ❌ | - | Extra plugin module path (repeatable); export \`createCode2MDPlugin(context)\` |
 * | \`--no-llm-translate\` | - | \`boolean\` | ❌ | \`false\` | Disable LlmTranslate even if \`fe-config code2md.llmTranslate\` is set |
 * | \`--llm-translate-force\` | - | \`boolean\` | ❌ | \`false\` | Re-translate even when target localized md already exists |
 * | \`--llm-translate-config\` | - | \`string\` | ❌ | - | JSON file merged into \`code2md.llmTranslate\` (same shape as fe-config) |
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
import { readFileSync } from 'node:fs';
import { version, description } from '../package.json';
import type Code2MDContext from './implments/Code2MDContext';
import type { Code2MDContextOptions } from './implments/Code2MDContext';
import { Code2MDTask } from './implments/Code2MDTask';
import type { LlmTranslateConfigInputType } from './plugins/LlmTranslateConfigUtil';
import { dirname, join, resolve } from 'path';
import { pathToFileURL } from 'url';
import type { LifecyclePluginInterface } from '@qlover/fe-corekit';

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
  )
  .option(
    '--colocate',
    'Write markdown beside the source file (Button.tsx → Button.md)'
  )
  .option(
    '--onlyPrimaryExport',
    'Only write PascalCase .tsx files that export a same-name component'
  )
  .option(
    '--mdSuffix <suffix>',
    'Markdown file suffix (default .md; e.g. .doc.md for gitignore)'
  )
  .option(
    '--plugin <path>',
    'Load an extra ScriptPlugin after Formats (repeatable). Module must export createCode2MDPlugin(context)',
    (value: string, previous: string[]) => {
      previous.push(value);
      return previous;
    },
    [] as string[]
  )
  .option(
    '--no-llm-translate',
    'Disable LlmTranslate even if fe-config code2md.llmTranslate is set'
  )
  .option(
    '--llm-translate-force',
    'Re-translate even when target *.en.doc.md already exists'
  )
  .option(
    '--llm-translate-config <path>',
    'JSON file merged into code2md.llmTranslate (same shape as fe-config)'
  );

program.parse(process.argv);

/**
 * Load a user plugin module. Prefer `createCode2MDPlugin(context)`.
 */
export async function loadCode2MDPlugin(
  pluginPath: string,
  context: Code2MDContext
): Promise<LifecyclePluginInterface<Code2MDContext>> {
  const absolutePath = resolve(process.cwd(), pluginPath);
  const mod = (await import(pathToFileURL(absolutePath).href)) as {
    createCode2MDPlugin?: (
      ctx: Code2MDContext
    ) =>
      | LifecyclePluginInterface<Code2MDContext>
      | Promise<LifecyclePluginInterface<Code2MDContext>>;
    default?: unknown;
  };

  if (typeof mod.createCode2MDPlugin === 'function') {
    return await mod.createCode2MDPlugin(context);
  }

  const exported = mod.default;
  if (typeof exported === 'function') {
    const maybeClass = exported as {
      prototype?: { constructor?: unknown };
      (ctx: Code2MDContext): LifecyclePluginInterface<Code2MDContext>;
    };
    if (
      maybeClass.prototype &&
      maybeClass.prototype.constructor === exported
    ) {
      return new (exported as new (
        ctx: Code2MDContext
      ) => LifecyclePluginInterface<Code2MDContext>)(context);
    }
    return await (
      exported as (
        ctx: Code2MDContext
      ) =>
        | LifecyclePluginInterface<Code2MDContext>
        | Promise<LifecyclePluginInterface<Code2MDContext>>
    )(context);
  }

  throw new Error(
    `Invalid code2md plugin "${pluginPath}": export createCode2MDPlugin(context) or default class/factory`
  );
}

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
      formatOutput: opts.formatOutput,
      colocate: opts.colocate || false,
      onlyPrimaryExport: opts.onlyPrimaryExport || false,
      mdSuffix: opts.mdSuffix
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
  const context = task.getContext();

  if (
    typeof opts.llmTranslateConfig === 'string' &&
    opts.llmTranslateConfig.trim()
  ) {
    const absoluteConfigPath = resolve(process.cwd(), opts.llmTranslateConfig);
    const fileJson = JSON.parse(
      readFileSync(absoluteConfigPath, 'utf8')
    ) as LlmTranslateConfigInputType;
    context.setParameters({ llmTranslate: fileJson });
  }

  // Commander: `--no-llm-translate` may set `llmTranslate: false` or `noLlmTranslate: true`
  const disableLlmTranslate =
    opts.noLlmTranslate === true || opts.llmTranslate === false;
  if (disableLlmTranslate) {
    context.setParameters({ llmTranslate: { skip: true } });
  }

  if (opts.llmTranslateForce === true) {
    context.setParameters({ llmTranslate: { force: true } });
  }

  const pluginPaths = (opts.plugin as string[] | undefined) ?? [];
  for (const pluginPath of pluginPaths) {
    const plugin = await loadCode2MDPlugin(pluginPath, context);
    task.use(plugin);
  }

  await task.run();
};

// Execute main function with error handling
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
