/**
 * Options for shell execution
 *
 * This interface defines the options available for executing shell commands.
 * It provides flexibility in controlling the behavior of shell command execution.
 *
 * @interface
 * @example
 * const options: ShellExecOptions = {
 *   silent: true,
 *   env: { PATH: '/usr/bin' },
 *   dryRun: false
 * };
 */
export interface ShellExecOptions {
  /**
   * Whether to suppress output to the console.
   *
   * @type {boolean}
   */
  silent?: boolean;

  /**
   * Environment variables to be passed to the command.
   *
   * @type {Record<string, string>}
   */
  env?: Record<string, string>;

  /**
   * Result to return when in dry-run mode.
   *
   * @type {unknown}
   */
  dryRunResult?: unknown;

  /**
   * Whether to perform a dry run.
   * Overrides shell config.isDryRun if set.
   *
   * @type {boolean}
   */
  dryRun?: boolean;

  /**
   * Template context for command string interpolation.
   *
   * @type {Record<string, unknown>}
   */
  context?: Record<string, unknown>;

  /**
   * Encoding for command output.
   *
   * @type {string}
   */
  encoding?: BufferEncoding;

  [key: string]: unknown;
}

/**
 * Interface for shell execution
 *
 * This interface defines a method for executing shell commands.
 * It abstracts the details of shell command execution and provides a consistent interface.
 *
 * @interface
 * @example
 * const shell: ShellInterface = {
 *   exec: async (command, options) => {
 *     // Logic to execute the command
 *     return 'Command output';
 *   }
 * };
 */
export interface ShellInterface {
  /**
   * Execute a command.
   *
   * @param {string | string[]} command - The command to execute.
   * @param {ShellExecOptions} [options] - Options for the command execution.
   * @returns {Promise<string>} The output of the command.
   */
  exec(command: string | string[], options?: ShellExecOptions): Promise<string>;
}
