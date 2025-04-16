import type ReleaseTask from '../../implments/ReleaseTask';
import type { DeepPartial, PackageJson } from '../../type';
import { join, resolve } from 'node:path';
import ReleaseContext from '../../implments/ReleaseContext';
import Plugin from '../Plugin';
import { readFileSync } from 'node:fs';
import { MANIFEST_PATH } from '../../defaults';
import { ReleaseLabel } from '../../implments/ReleaseLabel';

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
    this.logger.debug('Merge publish:', !!this.context.shared.mergePublish);

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
    const publishPath = this.context.shared.publishPath;
    if (publishPath) {
      const publishPathWorkspace = workspaces.find(
        (workspace) => resolve(workspace.root) === resolve(publishPath)
      );

      this.nextSkip();

      if (!publishPathWorkspace) {
        throw new Error(`No workspace found for: ${publishPath}`);
      }

      this.logger.debug(
        'publishPathWorkspace find!',
        join(publishPathWorkspace.root, MANIFEST_PATH)
      );

      this.setCurrentWorkspace(publishPathWorkspace, workspaces);
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

  override async onExec(): Promise<void> {
    // important
    this.nextSkip();

    if (this.context.shared.mergePublish) {
      this.logger.info('Merge publish, skip Workspaces');
      return;
    }

    for (const workspace of this.workspacesList) {
      this.logger.obtrusive(
        `workspace: ${workspace.name} ${workspace.version}`
      );

      this.setCurrentWorkspace(workspace);

      await this.releaseTask?.run();
    }
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

  private getWorkspacesPaths(): string[] {
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

  private readJson(path: string): Record<string, unknown> {
    const packageJsonContent = readFileSync(path, 'utf-8');
    return JSON.parse(packageJsonContent);
  }

  async getChagedPackages() {
    const paths = this.getWorkspacesPaths();

    const changed = await this.getGitWorkspaces();

    const changedPaths = this.releaseLabel.pick(changed, paths);

    // if has changeLabels, use the changeLabels
    const changeLabels = this.getConfig('changeLabels');
    this.logger.debug('changeLabels', changeLabels);

    if (Array.isArray(changeLabels)) {
      return changedPaths.filter((path) => {
        const lable = this.releaseLabel.toChangeLabel(path);
        return changeLabels.includes(lable);
      });
    }

    return changedPaths;
  }

  async getWorkspaces(): Promise<WorkspaceValue[]> {
    const changedPaths = await this.getChagedPackages();

    this.logger.debug('changedPaths', changedPaths);

    const workspaces: WorkspaceValue[] = changedPaths.map((path) => {
      return this.toWorkspace({ path });
    });

    return workspaces;
  }

  toWorkspace(workspace: Partial<WorkspaceValue>): WorkspaceValue {
    let { root, packageJson } = workspace;
    const path = workspace.path as string;

    if (!path) {
      throw new Error('path is not required!');
    }

    root = root || join(this.context.rootPath, path);
    packageJson = packageJson || this.readJson(join(root, MANIFEST_PATH));

    return {
      name: packageJson.name as string,
      version: packageJson.version as string,
      path,
      root,
      packageJson
    };
  }
}
