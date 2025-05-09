import { ConfigSearch } from './ConfigSearch';
import { ExecPromiseFunction, Shell } from './Shell';
import merge from 'lodash/merge';
import { defaultFeConfig, FeConfig } from '../feConfig';
import { ColorFormatter } from './ColorFormatter';
import { execPromise } from './execPromise';
import { ConsoleAppender, Logger, type LoggerInterface } from '@qlover/logger';

/**
 * Create a new ConfigSearch instance with fe configuration
 * @param feConfig - Custom fe configuration
 * @returns ConfigSearch instance
 * @description
 * Significance: Creates configuration search utility
 * Core idea: Merge default and custom configurations
 * Main function: Initialize configuration search
 * Main purpose: Provide configuration discovery
 *
 * @example
 * ```typescript
 * const configSearch = getFeConfigSearch({ debug: true });
 * ```
 */
export function getFeConfigSearch(
  feConfig?: Record<string, unknown>
): ConfigSearch {
  return new ConfigSearch({
    name: 'fe-config',
    defaultConfig: merge({}, defaultFeConfig, feConfig)
  });
}

export type ScriptContextOptions<T> = T & {
  execPromise?: ExecPromiseFunction;
};

/**
 * Options interface for FeScriptContext
 * @interface
 * @description
 * Significance: Defines script execution context options
 * Core idea: Centralize script execution configuration
 * Main function: Type-safe context options
 * Main purpose: Configure script execution environment
 *
 * @example
 * ```typescript
 * const options: FeScriptContextOptions<T> = {
 *   logger: new ScriptsLogger(),
 *   dryRun: true
 * };
 * ```
 */
export interface FeScriptContextOptions<T> {
  /** Custom logger instance */
  logger?: LoggerInterface;
  /** Shell instance for command execution */
  shell?: Shell;
  /** Custom fe configuration */
  feConfig?: Record<string, unknown>;
  /** Whether to perform dry run */
  dryRun?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Additional script-specific options */
  options?: ScriptContextOptions<T>;
}

/**
 * Script execution context class
 * @class
 * @description
 * Significance: Manages script execution environment
 * Core idea: Provide unified context for script execution
 * Main function: Initialize and maintain script context
 * Main purpose: Standardize script execution environment
 *
 * @example
 * ```typescript
 * const context = new FeScriptContext<MyOptions>({
 *   dryRun: true,
 *   verbose: true
 * });
 * ```
 */
export class FeScriptContext<T = unknown> {
  /** Logger instance */
  public readonly logger: LoggerInterface;
  /** Shell instance */
  public readonly shell: Shell;
  /** Fe configuration */
  public readonly feConfig: FeConfig;
  /** Dry run flag */
  public readonly dryRun: boolean;
  /** Verbose logging flag */
  public readonly verbose: boolean;
  /** Script-specific options */
  public options: ScriptContextOptions<T>;

  /**
   * Creates a FeScriptContext instance
   *
   * @description
   * Significance: Initializes script execution context
   * Core idea: Setup execution environment
   * Main function: Create context with options
   * Main purpose: Prepare script execution environment
   *
   * @example
   * ```typescript
   * const context = new FeScriptContext({
   *   dryRun: true,
   *   options: { branch: 'main' }
   * });
   * ```
   */
  constructor(scriptsOptions?: FeScriptContextOptions<T>) {
    const { logger, shell, feConfig, dryRun, verbose, options } =
      scriptsOptions || {};
    const _options = options || ({} as ScriptContextOptions<T>);

    this.logger =
      logger ||
      new Logger({
        level: verbose ? 'debug' : undefined,
        name: 'scripts',
        handlers: new ConsoleAppender(new ColorFormatter())
      });

    this.shell =
      shell ||
      new Shell({
        logger: this.logger,
        dryRun: dryRun,
        execPromise: _options.execPromise || execPromise
      });
    this.feConfig = getFeConfigSearch(feConfig).config;
    this.dryRun = !!dryRun;
    this.verbose = !!verbose;
    this.options = _options;
  }
}
