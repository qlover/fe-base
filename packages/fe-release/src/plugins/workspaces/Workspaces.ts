import type ReleaseTask from '../../implments/ReleaseTask';
import type { DeepPartial, PackageJson } from '../../type';
import { join, resolve } from 'node:path';
import ReleaseContext from '../../implments/ReleaseContext';
import Plugin from '../Plugin';
import { MANIFEST_PATH } from '../../defaults';
import { ReleaseLabel } from '../../implments/ReleaseLabel';
import { WorkspaceCreator } from './WorkspaceCreator';
export interface WorkspacesProps {
  /**
   * Whether to skip workspaces
   *
   * @default `false`
   */
  skip?: boolean;

  /**
   * Whether to skip checking the package.json file
   *
   * @default `false`
   */
  skipCheckPackage?: boolean;

  /**
   * The workspace to publish
   */
  workspace?: WorkspaceValue;

  /**
   * The workspaces to publish
   * @private
   */
  workspaces?: WorkspaceValue[];

  /**
   * The change labels
   *
   * from `changePackagesLabel`
   */
  changeLabels?: string[];

  /**
   * The changed paths
   * @private
   */
  changedPaths?: string[];

  /**
   * The packages
   * @private
   */
  packages?: string[];
}

export interface WorkspaceValue {
  name: string;
  version: string;
  /**
   * The relative path of the workspace
   */
  path: string;
  /**
   * The absolute path of the workspace
   */
  root: string;

  /**
   * The package.json of the workspace
   */
  packageJson: PackageJson;

  /**
   * The tag name of the workspace
   */
  tagName?: string;

  /**
   * The last tag name of the workspace
   */
  lastTag?: string;

  /**
   * The changelog of the workspace
   */
  changelog?: string;
}

export default class Workspaces extends Plugin<WorkspacesProps> {
  protected releaseTask: ReleaseTask | null = null;

  private workspacesList: WorkspaceValue[] = [];

  private _skip = false;

  private releaseLabel: ReleaseLabel;

  constructor(context: ReleaseContext) {
    super(context, 'workspaces');

    this.releaseLabel = new ReleaseLabel({
      changePackagesLabel:
        this.context.shared.changePackagesLabel || 'change:${name}',
      packagesDirectories: this.context.shared.packagesDirectories || []
    });
  }

  override enabled(): boolean {
    return !this._skip && !this.getConfig('skip');
  }

  override async onBefore(): Promise<void> {
    const workspace = this.getConfig('workspace');

    if (workspace) {
      this.logger.debug('Use the specified workspace', workspace);

      this.setCurrentWorkspace(workspace as WorkspaceValue, []);
      return;
    }

    const workspaces = await this.getWorkspaces();

    if (this.getConfig('skipCheckPackage') || workspaces.length === 0) {
      throw new Error('No changes to publish packages');
    }

    // If has publishPath, use the workspace
    const { publishPath } = this.context.shared;
    if (publishPath) {
      const targetWorkspace = workspaces.find(
        (workspace) => resolve(workspace.root) === resolve(publishPath)
      );

      this.nextSkip();

      if (!targetWorkspace) {
        throw new Error(`No workspace found for: ${publishPath}`);
      }

      this.logger.debug(
        `Workspace of ${publishPath} find!`,
        join(targetWorkspace.root, MANIFEST_PATH)
      );

      // only one workspace
      this.setCurrentWorkspace(targetWorkspace, [targetWorkspace]);
      return;
    }

    const [firstWorkspace, ...restWorkspaces] = workspaces;

    this.workspacesList = restWorkspaces;

    // first workspace
    this.setCurrentWorkspace(firstWorkspace, workspaces);
  }

  /**
   * Skip the next workspace
   *
   * - has publishPath
   * - has workspace
   */
  private nextSkip(): void {
    this._skip = true;

    this.logger.debug('skip next workspace');
  }

  setReleaseTask(releaseTask: ReleaseTask): void {
    this.releaseTask = releaseTask;
  }

  setCurrentWorkspace(
    workspace: WorkspaceValue,
    workspaces?: WorkspaceValue[]
  ): void {
    this.context.setShared({
      publishPath: workspace.path
    });

    this.setConfig({
      workspace: workspace,
      workspaces
    } as DeepPartial<WorkspacesProps>);
  }

  private getPackages(): string[] {
    const packagesDirections = this.context.shared.packagesDirectories;

    if (Array.isArray(packagesDirections)) {
      return packagesDirections;
    }

    // TODO: from package.json workspace or pnpm-workspace.yaml
    return [];
  }

  private async getGitWorkspaces(): Promise<string[]> {
    const sourceBranch = this.context.sourceBranch;

    const result = await this.shell.exec(
      `git diff --name-only origin/${sourceBranch}...HEAD`,
      { dryRun: false }
    );

    return typeof result === 'string' ? result.split('\n') : [];
  }

  async getChangedPackages(
    packagesPaths: string[],
    changeLabels?: string[]
  ): Promise<string[]> {
    this.logger.debug('changeLabels', changeLabels);

    if (Array.isArray(changeLabels) && changeLabels.length > 0) {
      const changed = packagesPaths.filter((path) => {
        const lable = this.releaseLabel.toChangeLabel(path);
        return changeLabels.includes(lable);
      });

      this.logger.debug('changed by labels', changed);

      return changed;
    }

    const changed = await this.getGitWorkspaces();

    this.logger.debug('changed by git', changed);

    return this.releaseLabel.pick(changed, packagesPaths);
  }

  async getWorkspaces(): Promise<WorkspaceValue[]> {
    const packages = this.getPackages();

    this.logger.debug('packages', packages);

    const changedPaths = await this.getChangedPackages(
      packages,
      this.getConfig('changeLabels')
    );

    this.setConfig({ packages, changedPaths });
    this.logger.debug('changedPaths', changedPaths);

    const workspaces: WorkspaceValue[] = changedPaths.map((path) => {
      return WorkspaceCreator.toWorkspace({ path }, this.context.rootPath);
    });

    return workspaces;
  }
}
