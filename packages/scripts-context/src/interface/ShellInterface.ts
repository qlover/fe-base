/**
 * Options for shell command execution with comprehensive customization
 *
 * Core concept:
 * Defines the configuration options available for executing shell
 * commands, providing flexibility in controlling execution behavior,
 * output handling, and environment configuration.
 *
 * Main features:
 * - Execution control: Fine-grained control over command execution
 *   - Silent mode for quiet execution
 *   - Dry run mode for safe testing
 *   - Custom environment variable injection
 *   - Working directory specification
 *
 * - Output handling: Flexible output and result management
 *   - Encoding specification for output processing
 *   - Dry run result customization
 *   - Template context for dynamic command generation
 *   - Caching support for performance optimization
 *
 * - Environment integration: Comprehensive environment management
 *   - Environment variable injection
 *   - Template context for variable substitution
 *   - Cross-platform compatibility
 *   - Security considerations for sensitive data
 *
 * Design considerations:
 * - All options are optional for maximum flexibility
 * - Supports both string and array command formats
 * - Maintains backward compatibility with existing implementations
 * - Provides sensible defaults for all optional properties
 * - Supports extensibility through index signature
 *
 * Usage patterns:
 * - Basic command execution with minimal options
 * - Advanced execution with custom environment and encoding
 * - Template-based command generation with context
 * - Dry run testing and validation
 * - Performance optimization through caching
 *
 * @example Basic usage
 * ```typescript
 * const options: ShellExecOptions = {
 *   silent: true,
 *   env: { PATH: '/usr/bin' },
 *   dryRun: false
 * };
 * ```
 *
 * @example With template context
 * ```typescript
 * const options: ShellExecOptions = {
 *   context: { repo: 'https://github.com/user/repo.git' },
 *   cwd: '/project/root'
 * };
 * ```
 *
 * @example Dry run mode
 * ```typescript
 * const options: ShellExecOptions = {
 *   dryRun: true,
 *   dryRunResult: 'Would execute: npm install'
 * };
 * ```
 */
export interface ShellExecOptions {
  /**
   * Whether to suppress output to the console
   *
   * Core concept:
   * Controls whether command execution details are logged
   * to the console, useful for quiet execution in automated
   * scripts or when detailed logging is not needed.
   *
   * Silent mode behavior:
   * - Suppresses command execution logging
   * - Maintains error logging for debugging
   * - Reduces log noise in automated environments
   * - Useful for background or batch operations
   * - Preserves error handling and reporting
   *
   * Use cases:
   * - Automated script execution
   * - Background command processing
   * - Batch operations with minimal output
   * - Integration with external logging systems
   * - Performance-critical operations
   *
   * @optional
   * @example Basic silent execution
   * ```typescript
   * const options: ShellExecOptions = { silent: true };
   * // Command executes without console output
   * ```
   *
   * @example Conditional silent mode
   * ```typescript
   * const options: ShellExecOptions = {
   *   silent: process.env.NODE_ENV === 'production'
   * };
   * ```
   */
  silent?: boolean;

  /**
   * Environment variables to be passed to the command
   *
   * Core concept:
   * Specifies custom environment variables that will be
   * available to the executed command, allowing for
   * environment-specific configuration and behavior.
   *
   * Environment injection:
   * - Variables are merged with existing environment
   * - Overrides existing variables with same names
   * - Supports both string and object value types
   * - Maintains security for sensitive data
   * - Provides cross-platform compatibility
   *
   * Common use cases:
   * - PATH modifications for command resolution
   * - API keys and authentication tokens
   * - Configuration overrides for specific commands
   * - Development vs production environment switching
   * - Custom script environment setup
   *
   * Security considerations:
   * - Sensitive data should be handled carefully
   * - Avoid logging environment variables with secrets
   * - Use appropriate file permissions for environment files
   * - Consider using secure environment variable management
   *
   * @optional
   * @example Basic environment injection
   * ```typescript
   * const options: ShellExecOptions = {
   *   env: { PATH: '/usr/bin:/usr/local/bin' }
   * };
   * ```
   *
   * @example With API keys
   * ```typescript
   * const options: ShellExecOptions = {
   *   env: {
   *     API_KEY: process.env.API_KEY,
   *     NODE_ENV: 'production'
   *   }
   * };
   * ```
   */
  env?: Record<string, string>;

  /**
   * Result to return when in dry-run mode
   *
   * Core concept:
   * Specifies the value to return when dry-run mode is
   * enabled, allowing for predictable testing and
   * validation without actual command execution.
   *
   * Dry run behavior:
   * - Command is not actually executed
   * - Returns the specified result value
   * - Maintains logging for debugging
   * - Useful for command validation and testing
   * - Supports both string and object result types
   *
   * Testing scenarios:
   * - Command generation validation
   * - Template formatting verification
   * - Configuration testing without side effects
   * - Script logic debugging
   * - Safe exploration of command behavior
   *
   * Result types:
   * - String: Simple text output simulation
   * - Object: Complex result structure simulation
   * - Array: Multiple output line simulation
   * - Function: Dynamic result generation
   *
   * @optional
   * @example Basic dry run result
   * ```typescript
   * const options: ShellExecOptions = {
   *   dryRun: true,
   *   dryRunResult: 'Command would execute successfully'
   * };
   * ```
   *
   * @example Complex dry run result
   * ```typescript
   * const options: ShellExecOptions = {
   *   dryRun: true,
   *   dryRunResult: {
   *     status: 'success',
   *     output: 'Files would be copied',
   *     files: ['file1.txt', 'file2.txt']
   *   }
   * };
   * ```
   */
  dryRunResult?: unknown;

  /**
   * Whether to perform a dry run without actual execution
   *
   * Core concept:
   * Controls whether the command should be executed or
   * simulated, providing a safe way to test command
   * generation and validation without side effects.
   *
   * Dry run mode:
   * - Commands are logged but not executed
   * - Returns predefined result for testing
   * - Useful for command validation and debugging
   * - Maintains logging for debugging purposes
   * - Supports both global and per-command dry run
   *
   * Override behavior:
   * - Overrides shell config.isDryRun if set
   * - Per-command setting takes precedence
   * - Global setting provides default behavior
   * - Allows fine-grained control over execution
   * - Maintains consistency across command types
   *
   * Use cases:
   * - Testing command generation and formatting
   * - Validating configuration and options
   * - Debugging script logic without side effects
   * - Safe exploration of script behavior
   * - CI/CD pipeline validation
   *
   * @optional
   * @example Basic dry run
   * ```typescript
   * const options: ShellExecOptions = { dryRun: true };
   * // Command is logged but not executed
   * ```
   *
   * @example Conditional dry run
   * ```typescript
   * const options: ShellExecOptions = {
   *   dryRun: process.env.DRY_RUN === 'true'
   * };
   * ```
   */
  dryRun?: boolean;

  /**
   * Template context for command string interpolation
   *
   * Core concept:
   * Provides variables and data for template string
   * interpolation, enabling dynamic command generation
   * based on runtime context and configuration.
   *
   * Template features:
   * - Uses lodash template for powerful interpolation
   * - Supports complex template expressions and logic
   * - Handles undefined and null context values gracefully
   * - Enables dynamic command construction
   * - Supports nested object access and function calls
   *
   * Context usage:
   * - Variable substitution in command strings
   * - Conditional command generation
   * - Dynamic path and parameter construction
   * - Environment-specific command customization
   * - Runtime configuration injection
   *
   * Template syntax:
   * - `<%= variable %>` for escaped output
   * - `<%- variable %>` for unescaped output
   * - `<% code %>` for JavaScript code execution
   * - Supports nested object access and function calls
   *
   * @optional
   * @example Basic template context
   * ```typescript
   * const options: ShellExecOptions = {
   *   context: { repo: 'https://github.com/user/repo.git' }
   * };
   * // Used with: 'git clone <%= repo %>'
   * ```
   *
   * @example Complex template context
   * ```typescript
   * const options: ShellExecOptions = {
   *   context: {
   *     branch: 'main',
   *     repo: { url: 'https://github.com/user/repo.git' },
   *     flags: ['--depth=1', '--single-branch']
   *   }
   * };
   * ```
   */
  context?: Record<string, unknown>;

  /**
   * Encoding for command output processing
   *
   * Core concept:
   * Specifies the character encoding used for command
   * output processing, ensuring proper handling of
   * international characters and special symbols.
   *
   * Encoding behavior:
   * - Affects how command output is interpreted
   * - Ensures proper character encoding for output
   * - Supports various encoding formats
   * - Handles international character sets
   * - Maintains consistency across platforms
   *
   * Common encodings:
   * - 'utf8': Unicode UTF-8 encoding (default)
   * - 'ascii': ASCII encoding for basic text
   * - 'base64': Base64 encoding for binary data
   * - 'hex': Hexadecimal encoding for binary data
   * - 'latin1': Latin-1 encoding for legacy systems
   *
   * Use cases:
   * - International character handling
   * - Binary data processing
   * - Legacy system integration
   * - Cross-platform compatibility
   * - Special character processing
   *
   * @optional
   * @example UTF-8 encoding
   * ```typescript
   * const options: ShellExecOptions = { encoding: 'utf8' };
   * ```
   *
   * @example Base64 encoding
   * ```typescript
   * const options: ShellExecOptions = { encoding: 'base64' };
   * ```
   */
  encoding?: BufferEncoding;

  /**
   * Whether to cache the command result for performance optimization
   *
   * Core concept:
   * Controls whether the command result should be cached
   * to avoid repeated execution of identical commands,
   * providing performance optimization for repeated operations.
   *
   * Caching behavior:
   * - Caches command results for repeated access
   * - Uses command string as cache key
   * - Respects per-command and global cache settings
   * - Provides performance optimization for repeated commands
   * - Handles cache misses gracefully
   *
   * Performance benefits:
   * - Reduces file system I/O operations
   * - Avoids repeated command execution
   * - Particularly beneficial in build tools and CLI applications
   * - Improves script execution performance
   * - Reduces resource consumption
   *
   * Cache management:
   * - Cache is shared across command executions
   * - Supports concurrent command execution
   * - Automatic memory management
   * - Cache invalidation through command options
   * - Simple cache implementation for reliability
   *
   * @optional
   * @default `false`
   * @example Basic caching
   * ```typescript
   * const options: ShellExecOptions = { isCache: true };
   * // Command result will be cached for future use
   * ```
   *
   * @example Conditional caching
   * ```typescript
   * const options: ShellExecOptions = {
   *   isCache: command.includes('npm install')
   * };
   * // Only cache npm install commands
   * ```
   */
  isCache?: boolean;

  /**
   * Additional custom options for extensibility
   *
   * Core concept:
   * Provides extensibility for custom options and
   * implementation-specific configurations that
   * may not be covered by the standard interface.
   *
   * Extensibility features:
   * - Supports any additional string-keyed properties
   * - Maintains type safety for known properties
   * - Allows implementation-specific customization
   * - Provides backward compatibility for future extensions
   * - Supports custom execution strategies
   *
   * Use cases:
   * - Custom execution function parameters
   * - Implementation-specific configurations
   * - Third-party integration options
   * - Future interface extensions
   * - Custom validation and processing
   *
   * @optional
   * @example Custom options
   * ```typescript
   * const options: ShellExecOptions = {
   *   customOption: 'value',
   *   timeout: 5000,
   *   retries: 3
   * };
   * ```
   */
  [key: string]: unknown;
}

/**
 * Interface for shell command execution with comprehensive capabilities
 *
 * Core concept:
 * Defines a standardized interface for executing shell commands
 * with support for various command formats, execution options,
 * and result handling across different execution environments.
 *
 * Main features:
 * - Command execution: Flexible command execution with options
 *   - Supports both string and array command formats
 *   - Comprehensive execution options for customization
 *   - Promise-based asynchronous execution
 *   - Consistent error handling and reporting
 *
 * - Execution abstraction: Platform-independent command execution
 *   - Abstracts shell execution details
 *   - Provides consistent interface across platforms
 *   - Supports custom execution strategies
 *   - Maintains backward compatibility
 *
 * - Result handling: Standardized result processing
 *   - Returns command output as string
 *   - Handles both success and error conditions
 *   - Provides consistent error reporting
 *   - Supports output encoding and processing
 *
 * Design considerations:
 * - Simple interface for maximum compatibility
 * - Promise-based for modern async/await usage
 * - Extensible through execution options
 * - Platform-independent implementation
 * - Consistent error handling across implementations
 *
 * Implementation requirements:
 * - Must handle both string and array command formats
 * - Should support all ShellExecOptions properties
 * - Must return Promise<string> for command output
 * - Should provide meaningful error messages
 * - Must handle command execution failures gracefully
 *
 * @example Basic implementation
 * ```typescript
 * const shell: ShellInterface = {
 *   exec: async (command, options) => {
 *     // Logic to execute the command
 *     return 'Command output';
 *   }
 * };
 * ```
 *
 * @example With error handling
 * ```typescript
 * const shell: ShellInterface = {
 *   exec: async (command, options) => {
 *     try {
 *       // Command execution logic
 *       return await executeCommand(command, options);
 *     } catch (error) {
 *       throw new Error(`Command execution failed: ${error.message}`);
 *     }
 *   }
 * };
 * ```
 *
 * @example Usage with options
 * ```typescript
 * const output = await shell.exec('npm install', {
 *   cwd: '/project/root',
 *   silent: true,
 *   env: { NODE_ENV: 'production' }
 * });
 * ```
 */
export interface ShellInterface {
  /**
   * Execute a shell command with optional configuration
   *
   * Core concept:
   * Provides the main method for executing shell commands
   * with comprehensive options for customization, error
   * handling, and result processing.
   *
   * Command execution:
   * - Supports both string and array command formats
   * - Handles command parsing and validation
   * - Provides comprehensive execution options
   * - Returns Promise for asynchronous execution
   * - Maintains consistent error handling
   *
   * Execution options:
   * - Environment variable injection
   * - Working directory specification
   * - Output encoding configuration
   * - Silent mode for quiet execution
   * - Dry run mode for safe testing
   * - Template context for dynamic commands
   * - Caching for performance optimization
   *
   * Result handling:
   * - Returns command output as string
   * - Handles both success and error conditions
   * - Provides consistent error reporting
   * - Supports output encoding and processing
   * - Maintains command execution context
   *
   * Error handling:
   * - Throws errors for command execution failures
   * - Provides meaningful error messages
   * - Maintains error context and stack traces
   * - Handles various failure scenarios
   * - Supports error recovery and retry logic
   *
   * @param command - Command to execute (string or array of command parts)
   * @param options - Optional execution options for customization
   * @returns Promise resolving to command output string
   * @throws Error when command execution fails
   *
   * @example Basic command execution
   * ```typescript
   * const output = await shell.exec('npm install');
   * console.log('Installation output:', output);
   * ```
   *
   * @example Array command format
   * ```typescript
   * const output = await shell.exec(['git', 'commit', '-m', 'Update docs']);
   * ```
   *
   * @example With execution options
   * ```typescript
   * const output = await shell.exec('npm run build', {
   *   cwd: '/project/root',
   *   silent: true,
   *   env: { NODE_ENV: 'production' }
   * });
   * ```
   *
   * @example Template-based command
   * ```typescript
   * const output = await shell.exec('git clone <%= repo %>', {
   *   context: { repo: 'https://github.com/user/repo.git' }
   * });
   * ```
   */
  exec(command: string | string[], options?: ShellExecOptions): Promise<string>;
}
