/**
 * @module FeReleaseTypes
 * @description Type definitions for the fe-release framework
 *
 * This module provides TypeScript type definitions for the fe-release framework,
 * including interfaces for release context, configuration, execution context,
 * and various utility types.
 *
 * Type Categories:
 * - Execution Context: Types for task execution and return values
 * - Configuration: Types for release and workspace configuration
 * - Plugin Types: Interfaces for GitHub PR and workspace plugins
 * - Utility Types: Helper types like DeepPartial and PackageJson
 *
 * Design Considerations:
 * - Type safety for plugin configuration
 * - Extensible context interfaces
 * - Backward compatibility support
 * - Clear deprecation markers
 * - Generic type constraints
 */
import type { ExecutorContext } from '@qlover/fe-corekit';
import type ReleaseContext from './implments/ReleaseContext';
import type { GithubPRProps } from './plugins/githubPR/GithubPR';
import type {
  ScriptContextInterface,
  ScriptSharedInterface
} from '@qlover/scripts-context';
import type {
  WorkspacesProps,
  WorkspaceValue
} from './plugins/workspaces/Workspaces';

/**
 * Extended execution context for release tasks
 *
 * Adds release-specific return value handling to the base executor context.
 * Used to track and manage release task execution results.
 *
 * @example
 * ```typescript
 * const context: ExecutorReleaseContext = {
 *   returnValue: { githubToken: 'token123' },
 *   // ... other executor context properties
 * };
 * ```
 */
export interface ExecutorReleaseContext
  extends ExecutorContext<ReleaseContext> {
  returnValue: ReleaseReturnValue;
}

/**
 * Return value type for release tasks
 *
 * Defines the structure of data returned from release task execution.
 * Includes GitHub token and allows for additional custom properties.
 *
 * @example
 * ```typescript
 * const returnValue: ReleaseReturnValue = {
 *   githubToken: 'github_pat_123',
 *   customData: { version: '1.0.0' }
 * };
 * ```
 */
export type ReleaseReturnValue = {
  githubToken?: string;
  [key: string]: unknown;
};

/**
 * Utility type for creating deep partial types
 *
 * Makes all properties in T optional recursively, useful for
 * partial configuration objects and type-safe updates.
 *
 * @example
 * ```typescript
 * interface Config {
 *   deep: {
 *     nested: {
 *       value: string;
 *     }
 *   }
 * }
 *
 * const partial: DeepPartial<Config> = {
 *   deep: {
 *     nested: {
 *       // All properties optional
 *     }
 *   }
 * };
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * Configuration interface for release process
 *
 * Extends shared script configuration with release-specific
 * settings for GitHub PR and workspace management.
 *
 * @example
 * ```typescript
 * const config: ReleaseConfig = {
 *   githubPR: {
 *     owner: 'org',
 *     repo: 'repo',
 *     base: 'main'
 *   },
 *   workspaces: {
 *     packages: ['packages/*']
 *   }
 * };
 * ```
 */
export interface ReleaseConfig extends ScriptSharedInterface {
  githubPR?: GithubPRProps;
  workspaces?: WorkspacesProps;
}

/**
 * Options interface for release context
 *
 * Extends script context interface with release-specific configuration.
 * Uses generic type parameter for custom configuration extensions.
 *
 * @example
 * ```typescript
 * interface CustomConfig extends ReleaseConfig {
 *   custom: {
 *     feature: boolean;
 *   }
 * }
 *
 * const options: ReleaseContextOptions<CustomConfig> = {
 *   custom: {
 *     feature: true
 *   }
 * };
 * ```
 */
export interface ReleaseContextOptions<T extends ReleaseConfig = ReleaseConfig>
  extends ScriptContextInterface<T> {}

/**
 * Configuration for a single execution step
 *
 * Defines a labeled, optionally enabled task with async execution.
 * Used for creating structured, trackable release steps.
 *
 * @example
 * ```typescript
 * const step: StepOption<string> = {
 *   label: 'Update version',
 *   enabled: true,
 *   task: async () => {
 *     // Version update logic
 *     return 'Version updated to 1.0.0';
 *   }
 * };
 * ```
 */
export type StepOption<T> = {
  label: string;
  enabled?: boolean;
  task: () => Promise<T>;
};

/**
 * Type alias for package.json structure
 *
 * Represents the structure of a package.json file with flexible
 * key-value pairs. Used for package metadata handling.
 *
 * @example
 * ```typescript
 * const pkg: PackageJson = {
 *   name: 'my-package',
 *   version: '1.0.0',
 *   dependencies: {
 *     // ...
 *   }
 * };
 * ```
 */
export type PackageJson = Record<string, unknown>;

/**
 * Context interface for template processing
 *
 * Combines release context options with workspace values and
 * adds template-specific properties. Includes deprecated fields
 * with migration guidance.
 *
 * @example
 * ```typescript
 * const context: TemplateContext = {
 *   publishPath: './dist',
 *   env: 'production',      // Deprecated
 *   branch: 'main',         // Deprecated
 *   // ... other properties from ReleaseContextOptions
 * };
 * ```
 */
export interface TemplateContext extends ReleaseContextOptions, WorkspaceValue {
  publishPath: string;

  /**
   * @deprecated  use `releaseEnv` from `shared`
   */
  env: string;

  /**
   * @deprecated  use `sourceBranch` from `shared`
   */
  branch: string;
}
