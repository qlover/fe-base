import { AsyncExecutor } from '@qlover/fe-corekit';
import Code2MDContext, { Code2MDContextOptions } from './Code2MDContext';
import TypeDocJson from '../plugins/typeDocs';
import { Reader } from '../plugins/reader';
import { Formats } from '../plugins/formats';

/**
 * Task name constant for code-to-markdown conversion
 *
 * This constant defines the unique identifier for the code-to-markdown
 * conversion task, used for task identification and logging purposes.
 */
export const CODE2MD_NAME = 'code2md' as const;

/**
 * Main task class for code-to-markdown conversion operations
 *
 * Core Responsibilities:
 * - Orchestrates the complete code-to-markdown conversion workflow
 * - Manages plugin execution order and dependencies
 * - Provides a unified interface for conversion operations
 * - Handles task lifecycle and error management
 *
 * Main Features:
 * - Plugin Management: Automatically registers and configures required plugins
 *   - Reader plugin: Processes source code files and extracts information
 *   - TypeDocJson plugin: Generates TypeDoc reflection data
 *   - Formats plugin: Converts processed data to markdown format
 *
 * - Execution Control: Uses AsyncExecutor for reliable plugin execution
 *   - Ensures proper plugin execution order
 *   - Handles plugin dependencies and error propagation
 *   - Provides execution context and state management
 *
 * - Task Interface: Provides simple and consistent task execution methods
 *   - `run()`: Primary execution method
 *   - `exec()`: Alias for `run()` for consistency with executor patterns
 *
 * Design Considerations:
 * - Uses dependency injection for executor to support testing and customization
 * - Automatically configures all required plugins during construction
 * - Maintains single responsibility principle by delegating to specialized plugins
 * - Provides both `run()` and `exec()` methods for different usage patterns
 *
 * Plugin Execution Flow:
 * 1. Reader plugin processes source files and extracts code information
 * 2. TypeDocJson plugin generates structured reflection data
 * 3. Formats plugin converts reflection data to markdown documentation
 *
 * @example Basic Usage
 * ```typescript
 * const task = new Code2MDTask({
 *   sourcePath: 'src',
 *   generatePath: 'docs.output'
 * });
 *
 * await task.run();
 * ```
 *
 * @example With Custom Executor
 * ```typescript
 * const customExecutor = new AsyncExecutor();
 * const task = new Code2MDTask(config, customExecutor);
 *
 * await task.exec();
 * ```
 *
 * @example Error Handling
 * ```typescript
 * try {
 *   const task = new Code2MDTask(config);
 *   await task.run();
 * } catch (error) {
 *   console.error('Code-to-markdown conversion failed:', error);
 * }
 * ```
 */
export class Code2MDTask {
  /**
   * The execution context for code-to-markdown conversion
   *
   * This context contains all configuration, state, and intermediate data
   * needed throughout the conversion process. It is shared between all
   * plugins and provides a centralized data store.
   *
   * @protected Accessible to subclasses for extension
   */
  protected context: Code2MDContext;

  /**
   * Creates a new Code2MDTask instance with the specified configuration
   *
   * During construction, the task automatically:
   * 1. Creates a Code2MDContext with the provided options
   * 2. Registers all required plugins (Reader, TypeDocJson, Formats)
   * 3. Configures the executor with the plugin chain
   *
   * @param options - Configuration options for the conversion task
   * @param executor - AsyncExecutor instance for plugin orchestration
   *   @default new AsyncExecutor()
   *
   * @example Basic Construction
   * ```typescript
   * const task = new Code2MDTask({
   *   options: {
   *     sourcePath: 'packages/core/src',
   *     generatePath: 'docs/api'
   *   }
   * });
   * ```
   *
   * @example With Custom Executor
   * ```typescript
   * const executor = new AsyncExecutor();
   * const task = new Code2MDTask(config, executor);
   * ```
   */
  constructor(
    options: Partial<Code2MDContextOptions>,
    private executor: AsyncExecutor = new AsyncExecutor()
  ) {
    // Create context with task name and configuration
    this.context = new Code2MDContext(CODE2MD_NAME, options);

    // Register all required plugins in execution order
    [
      new Reader(this.context), // Step 1: Read and process source files
      new TypeDocJson(this.context), // Step 2: Generate TypeDoc reflection data
      new Formats(this.context) // Step 3: Convert to markdown format
    ].forEach((plugin) => {
      this.executor.use(plugin);
    });
  }

  /**
   * Executes the complete code-to-markdown conversion workflow
   *
   * This method orchestrates the entire conversion process by:
   * 1. Executing all registered plugins in sequence
   * 2. Passing the context through each plugin
   * 3. Returning the final context with conversion results
   *
   * Execution Flow:
   * - Reader plugin processes source files and populates context with file data
   * - TypeDocJson plugin generates reflection data and stores it in context
   * - Formats plugin converts reflection data to markdown files
   *
   * @returns Promise that resolves to the final context containing conversion results
   *
   * @throws {Error} When any plugin fails during execution
   * @throws {Error} When source files are invalid or missing
   * @throws {Error} When TypeDoc generation fails
   * @throws {Error} When markdown conversion fails
   *
   * @example Basic Execution
   * ```typescript
   * const task = new Code2MDTask(config);
   * const result = await task.run();
   * console.log('Conversion completed successfully');
   * ```
   *
   * @example With Error Handling
   * ```typescript
   * try {
   *   const result = await task.run();
   *   console.log('Generated documentation at:', result.config.generatePath);
   * } catch (error) {
   *   console.error('Conversion failed:', error.message);
   * }
   * ```
   *
   * @example Accessing Results
   * ```typescript
   * const result = await task.run();
   *
   * // Access generated reflection data
   * const reflections = result.config.formatProject;
   *
   * // Access reader outputs
   * const readerOutputs = result.config.readerOutputs;
   *
   * console.log(`Processed ${reflections?.length || 0} code elements`);
   * ```
   */
  public async run(): Promise<unknown> {
    return this.executor.exec(this.context, (context) =>
      Promise.resolve(context)
    );
  }

  /**
   * Alias for `run()` method providing consistency with executor patterns
   *
   * This method provides an alternative interface that matches common
   * executor patterns where `exec()` is the standard execution method.
   * It delegates to `run()` to maintain consistent behavior.
   *
   * @returns Promise that resolves to the final context containing conversion results
   *
   * @throws {Error} When any plugin fails during execution
   *
   * @example Usage
   * ```typescript
   * const task = new Code2MDTask(config);
   * const result = await task.exec();
   * ```
   */
  public async exec(): Promise<unknown> {
    return this.run();
  }
}
