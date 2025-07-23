import {
  ScriptContextInterface,
  ScriptContext,
  ScriptSharedInterface
} from '@qlover/scripts-context';
import { ReaderOutput } from '../plugins/reader';
import { FormatProjectValue } from '../type';

/**
 * Configuration options for Code2MDContext
 *
 * Extends the base script context options while providing specific configuration
 * for code-to-markdown conversion operations.
 *
 * @template T - The specific configuration type extending Code2MDContextConfig
 */
export interface Code2MDContextOptions<
  T extends Code2MDContextConfig = Code2MDContextConfig
> extends Omit<ScriptContextInterface<T>, 'constructor'> {}

/**
 * Configuration interface for code-to-markdown conversion context
 *
 * Core Responsibilities:
 * - Defines source code paths and output directories
 * - Manages TypeDoc project reflection data
 * - Stores reader plugin outputs for processing
 * - Provides shared script configuration
 *
 * Design Considerations:
 * - Source path defaults to `src` for common project structures
 * - Generate path defaults to `docs.output` for clear separation
 * - Private fields store intermediate processing data
 *
 * @example Basic Configuration
 * ```typescript
 * const config: Code2MDContextConfig = {
 *   sourcePath: 'src',
 *   generatePath: 'docs.output',
 *   // ... other shared script properties
 * };
 * ```
 *
 * @example Custom Configuration
 * ```typescript
 * const config: Code2MDContextConfig = {
 *   sourcePath: 'packages/my-lib/src',
 *   generatePath: 'docs/api',
 *   // ... other properties
 * };
 * ```
 */
export interface Code2MDContextConfig extends ScriptSharedInterface {
  /**
   * Source code directory path to process for documentation generation
   *
   * This path should contain the TypeScript/JavaScript source files that need
   * to be converted to markdown documentation. The path is relative to the
   * project root directory.
   *
   * @default `src`
   *
   * @example
   * ```typescript
   * // Process files from src directory
   * sourcePath: 'src'
   *
   * // Process files from specific package
   * sourcePath: 'packages/core/src'
   * ```
   */
  sourcePath?: string;

  /**
   * Output directory path for generated markdown documentation
   *
   * This is where the converted markdown files will be saved. The directory
   * will be created if it doesn't exist. All generated documentation files
   * will be placed in this directory structure.
   *
   * @default 'docs.output'
   *
   * @example
   * ```typescript
   * // Default output location
   * generatePath: 'docs.output'
   *
   * // Custom output location
   * generatePath: 'docs/api'
   * ```
   */
  generatePath: string;

  /**
   * TypeDoc project reflection data for documentation processing
   *
   * This field stores the parsed TypeDoc reflection data that contains
   * information about classes, interfaces, functions, and other code elements.
   * It is populated during the reading phase and used during the formatting phase.
   *
   * @private Internal use only - populated by reader plugins
   *
   * @example
   * ```typescript
   * // Contains TypeDoc reflection objects
   * formatProject: [
   *   { kind: 'class', name: 'MyClass', ... },
   *   { kind: 'interface', name: 'MyInterface', ... }
   * ]
   * ```
   */
  formatProject?: FormatProjectValue[];

  /**
   * Output data from reader plugins for further processing
   *
   * This field stores the results from various reader plugins that process
   * source code files. Each reader plugin may produce different types of
   * output data that will be used by formatter plugins.
   *
   * @private Internal use only - populated by reader plugins
   *
   * @example
   * ```typescript
   * // Reader plugin outputs
   * readerOutputs: [
   *   { type: 'typescript', files: [...], reflections: [...] },
   *   { type: 'markdown', files: [...], content: [...] }
   * ]
   * ```
   */
  readerOutputs?: ReaderOutput[];
}

/**
 * Context class for code-to-markdown conversion operations
 *
 * Core Responsibilities:
 * - Manages the execution context for code-to-markdown conversion
 * - Provides access to configuration and shared resources
 * - Coordinates between reader and formatter plugins
 * - Maintains state throughout the conversion process
 *
 * Main Features:
 * - Configuration Management: Handles source paths, output directories, and processing options
 * - Plugin Coordination: Manages data flow between reader and formatter plugins
 * - State Management: Maintains intermediate processing data and results
 * - Error Handling: Provides centralized error handling and logging
 *
 * Design Considerations:
 * - Extends ScriptContext for consistent script execution patterns
 * - Uses generic configuration type for flexibility
 * - Provides type-safe access to configuration properties
 * - Supports plugin-based architecture for extensibility
 *
 * @example Basic Usage
 * ```typescript
 * const context = new Code2MDContext({
 *   sourcePath: 'src',
 *   generatePath: 'docs.output'
 * });
 *
 * await context.execute();
 * ```
 *
 * @example Advanced Usage
 * ```typescript
 * const context = new Code2MDContext({
 *   sourcePath: 'packages/core/src',
 *   generatePath: 'docs/api',
 *   // ... other configuration
 * });
 *
 * // Access configuration
 * const sourcePath = context.config.sourcePath;
 * const generatePath = context.config.generatePath;
 *
 * // Execute conversion
 * await context.execute();
 * ```
 *
 * @example Plugin Integration
 * ```typescript
 * const context = new Code2MDContext(config);
 *
 * // Reader plugins populate internal data
 * await context.runReaderPlugins();
 *
 * // Access processed data
 * const reflections = context.config.formatProject;
 * const readerOutputs = context.config.readerOutputs;
 *
 * // Formatter plugins use the data
 * await context.runFormatterPlugins();
 * ```
 */
export default class Code2MDContext extends ScriptContext<Code2MDContextConfig> {}
