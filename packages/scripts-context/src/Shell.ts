import shell from 'shelljs';
import { Logger } from '@qlover/fe-utils';
import isEmpty from 'lodash/isEmpty';
import lodashTemplate from 'lodash/template';

/**
 * Configuration interface for Shell class
 * @interface
 */
export interface ShellConfig {
  /** Whether to run in dry-run mode */
  isDryRun?: boolean;
  /** Logger instance */
  log: Logger;
}

/**
 * Options for shell execution
 * @interface
 */
export interface ShellExecOptions {
  /**
   * Whether to suppress output to the console
   */
  silent?: boolean;

  /**
   * Environment variables to be passed to the command
   */
  env?: Record<string, string>;

  /**
   * Result to return when in dry-run mode
   */
  dryRunResult?: unknown;

  /**
   * Whether to perform a dry run
   * Overrides shell config.isDryRun if set
   */
  dryRun?: boolean;

  /**
   * Whether to use external command execution
   */
  external?: boolean;

  /**
   * Template context for command string interpolation
   */
  context?: Record<string, unknown>;
}

/**
 * Metadata for command execution
 * @interface
 */
interface ExecMeta {
  /** Whether the command is executed externally */
  isExternal: boolean;
  /** Whether the command result is cached */
  isCached?: boolean;
}

/**
 * Shell class for command execution
 * @class
 * @description Provides methods for executing shell commands with caching and templating support
 */
export class Shell {
  /**
   * Creates a new Shell instance
   * @param config - Shell configuration
   * @param cache - Command cache map
   */
  constructor(
    public config: ShellConfig,
    private cache: Map<string, Promise<string>> = new Map()
  ) {}

  /**
   * Gets the logger instance
   */
  get logger(): Logger {
    return this.config.log;
  }

  /**
   * Formats a template string with context
   * @param template - Template string
   * @param context - Context object for template interpolation
   * @returns Formatted string
   */
  static format(
    template: string = '',
    context: Record<string, unknown> = {}
  ): string {
    return lodashTemplate(template)(context);
  }

  /**
   * Formats a template string with context and error handling
   * @param template - Template string
   * @param context - Context object for template interpolation
   * @returns Formatted string
   * @throws Error if template formatting fails
   */
  format(template: string = '', context: Record<string, unknown> = {}): string {
    try {
      return Shell.format(template, context);
    } catch (error) {
      this.logger.error(
        `Unable to render template with context:\n${template}\n${JSON.stringify(context)}`
      );
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * Executes a command with options
   * @param command - Command string or array
   * @param options - Execution options
   * @returns Promise resolving to command output
   */
  exec(
    command: string | string[],
    options: ShellExecOptions = {}
  ): Promise<string> {
    if (isEmpty(command)) {
      return Promise.resolve('');
    }
    const { context, ...execOptions } = options;
    return typeof command === 'string'
      ? this.execFormattedCommand(
          this.format(command, context || {}),
          execOptions
        )
      : this.execFormattedCommand(command, execOptions);
  }

  /**
   * Executes a command silently
   * @param command - Command string or array
   * @param options - Execution options
   * @returns Promise resolving to command output
   */
  run(
    command: string | string[],
    options: ShellExecOptions = {}
  ): Promise<string> {
    return this.exec(command, { silent: true, ...options });
  }

  /**
   * Executes a formatted command with caching
   * @param command - Formatted command string or array
   * @param options - Execution options
   * @returns Promise resolving to command output
   */
  async execFormattedCommand(
    command: string | string[],
    options: ShellExecOptions = {}
  ): Promise<string> {
    const { dryRunResult, silent, external, dryRun } = options;
    const isDryRun = dryRun !== undefined ? dryRun : this.config.isDryRun;
    const isExternal = external === true;
    const cacheKey = typeof command === 'string' ? command : command.join(' ');
    const isCached = !isExternal && this.cache.has(cacheKey);

    if (!silent) {
      this.logger.exec(command, { isExternal, isCached });
    }

    if (isDryRun) {
      return Promise.resolve(dryRunResult as string);
    }

    if (isCached) {
      return this.cache.get(cacheKey)!;
    }

    const result =
      typeof command === 'string'
        ? this.execStringCommand(command, options)
        : this.execWithArguments(command, options, { isExternal });

    if (!isExternal && !this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Executes a string command using shelljs
   * @param command - Command string
   * @param options - Execution options
   * @returns Promise resolving to command output
   */
  execStringCommand(
    command: string,
    options: ShellExecOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      shell.exec(
        command,
        { async: true, ...options },
        (code: number, stdout: string, stderr: string) => {
          stdout = stdout.toString().trimEnd();
          if (code === 0) {
            resolve(stdout);
          } else {
            if (options.silent) {
              this.logger.error(command);
            }
            reject(new Error(stderr || stdout));
          }
        }
      );
    });
  }

  /**
   * Executes a command with arguments using execa
   * @param command - Command array
   * @param options - Execution options
   * @param meta - Execution metadata
   * @returns Promise resolving to command output
   */
  async execWithArguments(
    command: string[],
    options: ShellExecOptions,
    meta: ExecMeta
  ): Promise<string> {
    const [program, ...programArgs] = command;

    return new Promise((resolve, reject) => {
      shell.exec(
        `${program} ${programArgs.join(' ')}`,
        { async: true, ...options },
        (code: number, stdout: string, stderr: string) => {
          if (code === 0) {
            const output = stdout.trim();
            this.logger.verbose(output, { isExternal: meta.isExternal });
            resolve(output);
          } else {
            if (options.silent) {
              this.logger.error(`${program} ${programArgs.join(' ')}`);
            }
            reject(new Error(stderr || stdout));
          }
        }
      );
    });
  }
}
