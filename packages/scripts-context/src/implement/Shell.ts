import type { LoggerInterface } from '@qlover/logger';
import type {
  ShellExecOptions,
  ShellInterface
} from '../interface/ShellInterface';
import lodashTemplate from 'lodash/template';

export type ExecPromiseFunction = (
  command: string | string[],
  options: ShellExecOptions
) => Promise<string>;

/**
 * Configuration interface for Shell class
 * @interface
 */
export interface ShellConfig extends ShellExecOptions {
  /** Logger instance */
  logger: LoggerInterface;

  /**
   * Promise for the execer
   */
  execPromise?: ExecPromiseFunction;
}

/**
 * Shell class for command execution
 * @class
 * @description Provides methods for executing shell commands with caching and templating support
 */
export class Shell implements ShellInterface {
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
  get logger(): LoggerInterface {
    return this.config.logger;
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
   * @deprecated Use `exec` instead
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
    const execPromise = this.config.execPromise;
    if (!execPromise) {
      throw new Error('execPromise is not defined');
    }

    const { dryRunResult, silent, dryRun, isCache } = options;
    const isDryRun = dryRun !== undefined ? dryRun : this.config.dryRun;
    const _isCache = isCache !== undefined ? !!isCache : !!this.config.isCache;
    const cacheKey = typeof command === 'string' ? command : command.join(' ');
    const isCached = _isCache && this.cache.has(cacheKey);

    if (!silent) {
      this.logger.debug(command);
    }

    if (isDryRun) {
      return Promise.resolve(dryRunResult as string);
    }

    if (isCached) {
      return this.cache.get(cacheKey)!;
    }

    const result = execPromise(command, options);

    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }
}
