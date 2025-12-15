/**
 * @module ReleaseParams
 * @description Release parameter management and formatting
 *
 * This module provides utilities for managing and formatting release-related
 * parameters such as branch names, tag names, PR titles, and PR bodies.
 * It handles both single-package and multi-package (batch) releases.
 *
 * Core Features:
 * - Branch name generation
 * - Tag name formatting
 * - PR title and body formatting
 * - Multi-workspace release support
 * - Template string processing
 *
 * @example Single package release
 * ```typescript
 * const params = new ReleaseParams(logger);
 *
 * const branchParams = params.getReleaseBranchParams(
 *   [{ name: 'pkg-a', version: '1.0.0' }],
 *   { branchName: 'release-${tagName}' }
 * );
 * // { tagName: '1.0.0', releaseBranch: 'release-1.0.0' }
 * ```
 *
 * @example Multi-package release
 * ```typescript
 * const params = new ReleaseParams(logger);
 *
 * const branchParams = params.getReleaseBranchParams(
 *   [
 *     { name: 'pkg-a', version: '1.0.0' },
 *     { name: 'pkg-b', version: '2.0.0' }
 *   ],
 *   {}
 * );
 * // {
 * //   tagName: 'batch-2-packages-1234567890',
 * //   releaseBranch: 'batch-pkg-a@1.0.0_pkg-b@2.0.0-2-packages-1234567890'
 * // }
 * ```
 */
import { Shell } from '@qlover/scripts-context';
import type { LoggerInterface } from '@qlover/logger';
import {
  BATCH_PR_BODY,
  DEFAULT_PR_TITLE,
  MAX_WORKSPACE,
  MULTI_WORKSPACE_SEPARATOR,
  WORKSPACE_VERSION_SEPARATOR
} from '../defaults';
import { TemplateContext } from '../type';
import { WorkspaceValue } from '../plugins/workspaces/Workspaces';
import { ReleaseContextConfig } from './ReleaseContext';

export type ReleaseBranchParams = {
  tagName: string;
  releaseBranch: string;
};

export type ReleaseParamsConfig = {
  /**
   * Max number of workspaces to include in the release name
   *
   * @default 3
   */
  maxWorkspace?: number;
  /**
   * Multi-workspace separator
   *
   * @default '_'
   */
  multiWorkspaceSeparator?: string;
  /**
   * Workspace version separator
   *
   * @default '@'
   */
  workspaceVersionSeparator?: string;

  /**
   * The branch name for batch release
   *
   * @default `batch-${releaseName}-${length}-packages-${timestamp}`
   */
  batchBranchName?: string;

  /**
   * The tag name for batch release
   *
   * @default `batch-${length}-packages-${timestamp}`
   */
  batchTagName?: string;

  /**
   * The PR title for batch release
   *
   * default from feConfig.release.PRTitle
   *
   * @default `Release ${env} ${pkgName} ${tagName}`
   */
  PRTitle?: string;

  /**
   * The PR body for batch release
   *
   * default from feConfig.release.PRBody
   */
  PRBody?: string;
};

const DEFAULT_RELEASE_CONFIG: ReleaseParamsConfig = {
  maxWorkspace: MAX_WORKSPACE,
  multiWorkspaceSeparator: MULTI_WORKSPACE_SEPARATOR,
  workspaceVersionSeparator: WORKSPACE_VERSION_SEPARATOR,
  batchBranchName: 'batch-${releaseName}-${length}-packages-${timestamp}',
  batchTagName: 'batch-${length}-packages-${timestamp}'
};

/**
 * Core class for managing release parameters and formatting
 *
 * Handles the generation and formatting of release-related parameters
 * such as branch names, tag names, PR titles, and PR bodies. Supports
 * both single-package and multi-package (batch) releases.
 *
 * Features:
 * - Template-based name generation
 * - Multi-workspace support
 * - Configurable separators and limits
 * - PR content formatting
 *
 * @example Basic usage
 * ```typescript
 * const params = new ReleaseParams(logger, {
 *   maxWorkspace: 5,
 *   multiWorkspaceSeparator: '-',
 *   PRTitle: 'Release ${pkgName} ${tagName}'
 * });
 *
 * const branchParams = params.getReleaseBranchParams(
 *   [{ name: 'pkg-a', version: '1.0.0' }],
 *   { branchName: 'release/${tagName}' }
 * );
 * ```
 *
 * @example Custom PR formatting
 * ```typescript
 * const params = new ReleaseParams(logger, {
 *   PRTitle: 'Release: ${pkgName} v${tagName}',
 *   PRBody: '## Changes\n${changelog}'
 * });
 *
 * const title = params.getPRTitle(branchParams, context);
 * const body = params.getPRBody(workspaces, branchParams, context);
 * ```
 */
export class ReleaseParams {
  /**
   * Current configuration
   * @private
   */
  private config: ReleaseParamsConfig;

  /**
   * Creates a new ReleaseParams instance
   *
   * Initializes with logger for debug output and optional configuration
   * overrides. Uses default configuration values for any unspecified options.
   *
   * @param logger - Logger instance for debug output
   * @param config - Optional configuration overrides
   *
   * @example
   * ```typescript
   * // Basic initialization
   * const params = new ReleaseParams(logger);
   *
   * // With custom configuration
   * const params = new ReleaseParams(logger, {
   *   maxWorkspace: 5,
   *   multiWorkspaceSeparator: '-',
   *   workspaceVersionSeparator: '#'
   * });
   * ```
   */
  constructor(
    private logger: LoggerInterface,
    config: Partial<ReleaseParamsConfig> = {}
  ) {
    this.config = {
      ...DEFAULT_RELEASE_CONFIG,
      ...config
    };
  }

  /**
   * Generates a release branch name for a single package
   *
   * Uses the branch name template from shared configuration or
   * falls back to the default template 'release-${tagName}'.
   * Supports variable interpolation in the template.
   *
   * Template Variables:
   * - ${pkgName}: Package name
   * - ${releaseName}: Release name (same as pkgName)
   * - ${tagName}: Release tag
   * - All shared config properties
   *
   * @param releaseName - Name of the package being released
   * @param tagName - Version tag for the release
   * @param shared - Shared configuration with branch template
   * @returns Formatted branch name
   * @throws Error if branch name template is not a string
   *
   * @example
   * ```typescript
   * // With default template
   * const branch = params.getReleaseBranchName(
   *   'my-pkg',
   *   'v1.0.0',
   *   {}
   * );
   * // 'release-v1.0.0'
   *
   * // With custom template
   * const branch = params.getReleaseBranchName(
   *   'my-pkg',
   *   'v1.0.0',
   *   { branchName: '${pkgName}-release-${tagName}' }
   * );
   * // 'my-pkg-release-v1.0.0'
   * ```
   */
  public getReleaseBranchName(
    releaseName: string,
    tagName: string,
    shared: ReleaseContextConfig
  ): string {
    const branchNameTpl = shared.branchName || 'release-${tagName}';

    if (typeof branchNameTpl !== 'string') {
      throw new Error('Branch name template is not a string');
    }

    this.logger.debug('Release Branch template is:', branchNameTpl);

    return Shell.format(branchNameTpl, {
      pkgName: releaseName,
      releaseName: releaseName,
      tagName,
      // deprecated
      ...shared
    });
  }

  /**
   * Generates a release branch name for multiple packages
   *
   * Uses the batch branch name template from configuration.
   * Supports variable interpolation with additional batch-specific
   * variables.
   *
   * Template Variables:
   * - ${pkgName}: Package name
   * - ${releaseName}: Combined release name
   * - ${tagName}: Combined tag name
   * - ${length}: Number of packages
   * - ${timestamp}: Current timestamp
   * - All shared config properties
   *
   * @param releaseName - Combined name of packages
   * @param tagName - Combined version tag
   * @param shared - Shared configuration
   * @param length - Number of packages in batch
   * @returns Formatted batch branch name
   * @throws Error if branch name template is not a string
   *
   * @example
   * ```typescript
   * // With default template
   * const branch = params.getBatchReleaseBranchName(
   *   'pkg-a@1.0.0_pkg-b@2.0.0',
   *   'batch-2-packages-1234567890',
   *   {},
   *   2
   * );
   * // 'batch-pkg-a@1.0.0_pkg-b@2.0.0-2-packages-1234567890'
   *
   * // With custom template
   * const branch = params.getBatchReleaseBranchName(
   *   'pkg-a@1.0.0_pkg-b@2.0.0',
   *   'v1.0.0',
   *   {},
   *   2,
   * );
   * // Custom formatted branch name
   * ```
   */
  public getBatchReleaseBranchName(
    releaseName: string,
    tagName: string,
    shared: ReleaseContextConfig,
    length: number
  ): string {
    const branchNameTpl = this.config.batchBranchName;

    if (typeof branchNameTpl !== 'string') {
      throw new Error('Branch name template is not a string');
    }

    this.logger.debug('Release Batch Branch template is:', branchNameTpl);

    return Shell.format(branchNameTpl, {
      pkgName: releaseName,
      releaseName: releaseName,
      tagName,
      // deprecated
      ...shared,
      length,
      timestamp: Date.now()
    });
  }

  /**
   * Generates a release name from workspace configurations
   *
   * For single packages, returns the package name.
   * For multiple packages, combines names and versions up to
   * the configured maximum number of workspaces.
   *
   * Format:
   * - Single: packageName
   * - Multiple: pkg1@1.0.0_pkg2@2.0.0_pkg3@3.0.0
   *
   * @param composeWorkspaces - Array of workspace configurations
   * @returns Formatted release name
   *
   * @example
   * ```typescript
   * // Single package
   * const name = params.getReleaseName([
   *   { name: 'pkg-a', version: '1.0.0' }
   * ]);
   * // 'pkg-a'
   *
   * // Multiple packages
   * const name = params.getReleaseName([
   *   { name: 'pkg-a', version: '1.0.0' },
   *   { name: 'pkg-b', version: '2.0.0' }
   * ]);
   * // 'pkg-a@1.0.0_pkg-b@2.0.0'
   *
   * // With max limit
   * const name = params.getReleaseName([
   *   { name: 'pkg-a', version: '1.0.0' },
   *   { name: 'pkg-b', version: '2.0.0' },
   *   { name: 'pkg-c', version: '3.0.0' },
   *   { name: 'pkg-d', version: '4.0.0' }
   * ]);
   * // Only first 3: 'pkg-a@1.0.0_pkg-b@2.0.0_pkg-c@3.0.0'
   * ```
   */
  public getReleaseName(composeWorkspaces: WorkspaceValue[]): string {
    if (composeWorkspaces.length === 1) {
      return composeWorkspaces[0].name;
    }

    const { maxWorkspace, multiWorkspaceSeparator, workspaceVersionSeparator } =
      this.config;

    return composeWorkspaces
      .slice(0, maxWorkspace)
      .map(
        ({ name, version }) => `${name}${workspaceVersionSeparator}${version}`
      )
      .join(multiWorkspaceSeparator);
  }

  /**
   * Generates a tag name for the release
   *
   * For single packages, uses the package version.
   * For multiple packages, generates a batch tag name using
   * the configured template.
   *
   * Format:
   * - Single: version
   * - Multiple: batch-${length}-packages-${timestamp}
   *
   * @param composeWorkspaces - Array of workspace configurations
   * @returns Formatted tag name
   *
   * @example
   * ```typescript
   * // Single package
   * const tag = params.getReleaseTagName([
   *   { name: 'pkg-a', version: '1.0.0' }
   * ]);
   * // '1.0.0'
   *
   * // Multiple packages
   * const tag = params.getReleaseTagName([
   *   { name: 'pkg-a', version: '1.0.0' },
   *   { name: 'pkg-b', version: '2.0.0' }
   * ]);
   * // 'batch-2-packages-1234567890'
   * ```
   */
  public getReleaseTagName(composeWorkspaces: WorkspaceValue[]): string {
    if (composeWorkspaces.length === 1) {
      return composeWorkspaces[0].version;
    }

    const { batchTagName } = this.config;

    return Shell.format(batchTagName, {
      length: composeWorkspaces.length,
      timestamp: Date.now()
    });
  }

  /**
   * Generates branch and tag parameters for the release
   *
   * Combines the generation of branch name and tag name into
   * a single operation. Handles both single and multi-package
   * releases appropriately.
   *
   * @param composeWorkspaces - Array of workspace configurations
   * @param shared - Shared configuration
   * @returns Object containing tag name and branch name
   *
   * @example Single package
   * ```typescript
   * const params = releaseParams.getReleaseBranchParams(
   *   [{ name: 'pkg-a', version: '1.0.0' }],
   *   { branchName: 'release-${tagName}' }
   * );
   * // {
   * //   tagName: '1.0.0',
   * //   releaseBranch: 'release-1.0.0'
   * // }
   * ```
   *
   * @example Multiple packages
   * ```typescript
   * const params = releaseParams.getReleaseBranchParams(
   *   [
   *     { name: 'pkg-a', version: '1.0.0' },
   *     { name: 'pkg-b', version: '2.0.0' }
   *   ],
   *   {}
   * );
   * // {
   * //   tagName: 'batch-2-packages-1234567890',
   * //   releaseBranch: 'batch-pkg-a@1.0.0_pkg-b@2.0.0-2-packages-1234567890'
   * // }
   * ```
   */
  public getReleaseBranchParams(
    composeWorkspaces: WorkspaceValue[],
    shared: ReleaseContextConfig
  ): ReleaseBranchParams {
    const releaseTagName = this.getReleaseTagName(composeWorkspaces);
    const releaseName = this.getReleaseName(composeWorkspaces);

    const releaseBranchName =
      composeWorkspaces.length > 1
        ? this.getBatchReleaseBranchName(
            releaseName,
            releaseTagName,
            shared,
            composeWorkspaces.length
          )
        : this.getReleaseBranchName(releaseName, releaseTagName, shared);

    return {
      tagName: releaseTagName,
      releaseBranch: releaseBranchName
    };
  }

  /**
   * Generates a title for the release pull request
   *
   * Uses the configured PR title template or falls back to the default.
   * Supports variable interpolation with release parameters and context.
   *
   * Template Variables:
   * - ${tagName}: Release tag name
   * - ${pkgName}: Package/branch name
   * - All template context properties
   *
   * @param releaseBranchParams - Release branch parameters
   * @param context - Template context for variable interpolation
   * @returns Formatted PR title
   *
   * @example
   * ```typescript
   * // With default template
   * const title = params.getPRTitle(
   *   {
   *     tagName: '1.0.0',
   *     releaseBranch: 'release-1.0.0'
   *   },
   *   {
   *     env: 'production',
   *     pkgName: 'my-package'
   *   }
   * );
   * // 'Release production my-package 1.0.0'
   *
   * // With custom template
   * const title = params.getPRTitle(
   *   {
   *     tagName: '1.0.0',
   *     releaseBranch: 'release-1.0.0'
   *   },
   *   {
   *     env: 'staging',
   *     pkgName: 'my-package'
   *   }
   * );
   * // Custom formatted title
   * ```
   */
  public getPRTitle(
    releaseBranchParams: ReleaseBranchParams,
    context: TemplateContext
  ): string {
    const prTitleTpl = this.config.PRTitle || DEFAULT_PR_TITLE;

    return Shell.format(prTitleTpl, {
      ...context,
      tagName: releaseBranchParams.tagName,
      pkgName: releaseBranchParams.releaseBranch
    });
  }

  /**
   * Generates the body content for the release pull request
   *
   * Handles both single and multi-package releases, combining
   * changelogs appropriately. For batch releases, formats each
   * package's changelog according to the batch template.
   *
   * Template Variables:
   * - ${tagName}: Release tag or combined workspace versions
   * - ${changelog}: Single changelog or combined batch changelogs
   * - All template context properties
   *
   * @param composeWorkspaces - Array of workspace configurations
   * @param releaseBranchParams - Release branch parameters
   * @param context - Template context for variable interpolation
   * @returns Formatted PR body content
   *
   * @example Single package
   * ```typescript
   * const body = params.getPRBody(
   *   [{
   *     name: 'pkg-a',
   *     version: '1.0.0',
   *     changelog: '- Feature: New functionality\n- Fix: Bug fix'
   *   }],
   *   {
   *     tagName: '1.0.0',
   *     releaseBranch: 'release-1.0.0'
   *   },
   *   context
   * );
   * // Custom formatted body with single changelog
   * ```
   *
   * @example Multiple packages
   * ```typescript
   * const body = params.getPRBody(
   *   [
   *     {
   *       name: 'pkg-a',
   *       version: '1.0.0',
   *       changelog: '- Feature: Package A changes'
   *     },
   *     {
   *       name: 'pkg-b',
   *       version: '2.0.0',
   *       changelog: '- Feature: Package B changes'
   *     }
   *   ],
   *   {
   *     tagName: 'batch-2-packages-1234567890',
   *     releaseBranch: 'batch-release'
   *   },
   *   context
   * );
   * // Formatted body with combined changelogs:
   * // ## pkg-a 1.0.0
   * // - Feature: Package A changes
   * //
   * // ## pkg-b 2.0.0
   * // - Feature: Package B changes
   * ```
   */
  public getPRBody(
    composeWorkspaces: WorkspaceValue[],
    releaseBranchParams: ReleaseBranchParams,
    context: TemplateContext
  ): string {
    const PRBodyTpl = this.config.PRBody;

    const changelog =
      composeWorkspaces.length > 1
        ? composeWorkspaces
            .map((workspace) => {
              return Shell.format(
                BATCH_PR_BODY,
                workspace as unknown as Record<string, unknown>
              );
              // format array use toString, [1,2] => 1,2
            })
            .join('\n')
        : composeWorkspaces[0].changelog;

    const { workspaceVersionSeparator } = this.config;

    const tagName =
      composeWorkspaces.length === 1
        ? releaseBranchParams.tagName
        : composeWorkspaces
            .map(
              (workspace) =>
                `${workspace.name}${workspaceVersionSeparator}${workspace.version}`
            )
            .join(' ');

    return Shell.format(PRBodyTpl, {
      ...context,
      tagName,
      changelog
    });
  }
}
