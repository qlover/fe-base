import { ConfigSearch } from './ConfigSearch';
import { ScriptsLogger } from './ScriptsLogger';
import { Shell } from './Shell';
import merge from 'lodash/merge';
import { defaultFeConfig, FeConfig } from './feConfig';

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
  logger?: ScriptsLogger;
  /** Shell instance for command execution */
  shell?: Shell;
  /** Custom fe configuration */
  feConfig?: Record<string, unknown>;
  /** Whether to perform dry run */
  dryRun?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Additional script-specific options */
  options?: T;
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
  public readonly logger: ScriptsLogger;
  /** Shell instance */
  public readonly shell: Shell;
  /** Fe configuration */
  public readonly feConfig: FeConfig;
  /** Dry run flag */
  public readonly dryRun: boolean;
  /** Verbose logging flag */
  public readonly verbose: boolean;
  /** Script-specific options */
  public options: T;

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

    this.logger = logger || new ScriptsLogger({ debug: verbose, dryRun });
    this.shell = shell || new Shell({ log: this.logger, isDryRun: dryRun });
    this.feConfig = getFeConfigSearch(feConfig).config;
    this.dryRun = !!dryRun;
    this.verbose = !!verbose;
    this.options = options || ({} as T);
  }
}
