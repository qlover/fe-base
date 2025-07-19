import { Env } from '@qlover/env-loader';

/**
 * Common/shared configuration options for script execution context
 *
 * This interface defines the basic properties that are shared across different script contexts and plugins.
 * It provides environment access, project root path, and source branch information for consistent configuration management.
 *
 * Design Considerations:
 * - All properties are optional to allow flexible extension in derived interfaces.
 * - Environment and branch information are used for build, deploy, and CI/CD scripts.
 *
 * @example
 * ```typescript
 * const shared: ScriptShared = {
 *   env: Env.searchEnv(),
 *   sourceBranch: 'develop',
 *   rootPath: '/project/root'
 * };
 * ```
 */
export interface ScriptShared {
  /**
   * Environment variable accessor instance
   *
   * Provides access to loaded environment variables for the script context.
   * Used for reading configuration, secrets, and runtime flags.
   *
   * @example
   * ```typescript
   * const apiKey = shared.env?.get('API_KEY');
   * ```
   */
  env?: Env;

  /**
   * The source branch of the project
   *
   * Determines which branch is considered the source for build or deployment.
   *
   * Default resolution order:
   * 1. `FE_RELEASE_SOURCE_BRANCH` environment variable
   * 2. `FE_RELEASE_BRANCH` environment variable
   * 3. 'master' (fallback)
   *
   * @example
   * ```typescript
   * const branch = shared.sourceBranch || 'master';
   * ```
   */
  sourceBranch?: string;

  /**
   * The root path of the project
   *
   * Used as the base directory for all relative file operations.
   *
   * @default process.cwd()
   *
   * @example
   * ```typescript
   * const root = shared.rootPath || process.cwd();
   * ```
   */
  rootPath?: string;
}
