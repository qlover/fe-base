import type { Shell } from '@qlover/scripts-context';
import { Logger } from '@qlover/fe-corekit';
import { SharedReleaseOptions } from '../interface/ShreadReleaseOptions';
import {
  BATCH_PR_BODY,
  DEFAULT_PR_TITLE,
  MAX_WORKSPACE,
  MULTI_WORKSPACE_SEPARATOR,
  WORKSPACE_VERSION_SEPARATOR
} from '../defaults';
import { TemplateContext } from '../type';
import { WorkspaceValue } from '../plugins/workspaces/Workspaces';

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
   * @default `batch-${releaseName}-${length}-packages`
   */
  batchBranchName?: string;

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
  batchBranchName: 'batch-${releaseName}-${length}-packages'
};

export class ReleaseParams {
  private config: ReleaseParamsConfig;
  constructor(
    private shell: Shell,
    private logger: Logger,
    config: Partial<ReleaseParamsConfig> = {}
  ) {
    this.config = {
      ...DEFAULT_RELEASE_CONFIG,
      ...config
    };
  }

  getReleaseBranchName(
    releaseName: string,
    tagName: string,
    shared: SharedReleaseOptions
  ): string {
    const branchNameTpl = shared.branchName || 'release-${tagName}';

    if (typeof branchNameTpl !== 'string') {
      throw new Error('Branch name template is not a string');
    }

    this.logger.verbose('Release Branch template is:', branchNameTpl);

    return this.shell.format(branchNameTpl, {
      pkgName: releaseName,
      releaseName: releaseName,
      tagName,
      // deprecated
      ...shared
    });
  }

  getBatchReleaseBranchName(
    releaseName: string,
    tagName: string,
    shared: SharedReleaseOptions,
    length: number
  ): string {
    const branchNameTpl = this.config.batchBranchName;

    if (typeof branchNameTpl !== 'string') {
      throw new Error('Branch name template is not a string');
    }

    this.logger.verbose('Release Batch Branch template is:', branchNameTpl);

    return this.shell.format(branchNameTpl, {
      pkgName: releaseName,
      releaseName: releaseName,
      tagName,
      // deprecated
      ...shared,
      length
    });
  }

  getReleaseName(composeWorkspaces: WorkspaceValue[]): string {
    if (composeWorkspaces.length === 1) {
      return composeWorkspaces[0].name;
    }

    const { maxWorkspace, multiWorkspaceSeparator, workspaceVersionSeparator } =
      this.config;

    return composeWorkspaces
      .slice(maxWorkspace)
      .map(
        ({ name, version }) => `${name}${workspaceVersionSeparator}${version}`
      )
      .join(multiWorkspaceSeparator);
  }

  getReleaseTagName(composeWorkspaces: WorkspaceValue[]): string {
    if (composeWorkspaces.length === 1) {
      return composeWorkspaces[0].version;
    }

    return `batch-${composeWorkspaces.length}-${new Date().toISOString().split('T')[0]}`;
  }

  getReleaseBranchParams(
    composeWorkspaces: WorkspaceValue[],
    shared: SharedReleaseOptions
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

  getPRTitle(
    releaseBranchParams: ReleaseBranchParams,
    context: TemplateContext
  ): string {
    const prTitleTpl = this.config.PRTitle || DEFAULT_PR_TITLE;

    return this.shell.format(prTitleTpl, {
      ...context,
      tagName: releaseBranchParams.tagName,
      pkgName: releaseBranchParams.releaseBranch
    });
  }

  /**
   * Gets the body for the release pull request.
   *
   * @param options - The options containing tag name and changelog.
   * @returns The formatted release pull request body.
   */
  getPRBody(
    composeWorkspaces: WorkspaceValue[],
    releaseBranchParams: ReleaseBranchParams,
    context: TemplateContext
  ): string {
    const PRBodyTpl = this.config.PRBody;

    const changelog =
      composeWorkspaces.length > 1
        ? composeWorkspaces.map((workspace) => {
            return this.shell.format(
              BATCH_PR_BODY,
              workspace as unknown as Record<string, unknown>
            );
          })
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

    return this.shell.format(PRBodyTpl, {
      ...context,
      tagName,
      changelog
    });
  }
}
