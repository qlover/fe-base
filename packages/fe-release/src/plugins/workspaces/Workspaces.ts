import type ReleaseTask from '../../implments/ReleaseTask';
import { join, resolve, relative } from 'node:path';
import ReleaseContext from '../../implments/ReleaseContext';
import { MANIFEST_PATH } from '../../defaults';
import { ReleaseLabel } from '../../implments/ReleaseLabel';
import { findWorkspaces } from 'find-workspaces';
import { WorkspaceCreator } from './WorkspaceCreator';
import { ScriptPlugin, ScriptPluginProps } from '@qlover/scripts-context';

export type PackageJson = Record<string, unknown>;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface WorkspacesProps extends ScriptPluginProps {
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

  /**
   * All project packages mapping
   * @private
   */
  projectWorkspaces?: WorkspaceValue[];
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
   * @private
   */
  tagName?: string;

  /**
   * The last tag name of the workspace
   * @private
   */
  lastTag?: string;

  /**
   * The changelog of the workspace
   * @private
   */
  changelog?: string;
}

export default class Workspaces extends ScriptPlugin<
  ReleaseContext,
  WorkspacesProps
> {
  protected releaseTask: ReleaseTask | null = null;

  protected workspacesList: WorkspaceValue[] = [];

  private _skip = false;

  private releaseLabel: ReleaseLabel;

  constructor(context: ReleaseContext) {
    super(context, 'workspaces');

    this.releaseLabel = new ReleaseLabel({
      changePackagesLabel:
        this.context.options.changePackagesLabel || 'change:${name}',
      packagesDirectories: this.context.options.packagesDirectories || [],
      compare: (changedFilePath, packagePath) =>
        resolve(changedFilePath).startsWith(resolve(packagePath))
    });
  }

  public override enabled(): boolean {
    return !this._skip && !this.getConfig('skip');
  }

  public override async onBefore(): Promise<void> {
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
    const publishPath = this.context.getOptions('publishPath') as string;
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

  public setReleaseTask(releaseTask: ReleaseTask): void {
    this.releaseTask = releaseTask;
  }

  public setCurrentWorkspace(
    workspace: WorkspaceValue,
    workspaces?: WorkspaceValue[]
  ): void {
    this.context.setOptions({
      publishPath: workspace.path
    });

    this.setConfig({
      workspace: workspace,
      workspaces
    } as Partial<WorkspacesProps>);
  }

  private async getGitWorkspaces(): Promise<string[]> {
    const sourceBranch = this.context.sourceBranch;

    const result = await this.shell.exec(
      `git diff --name-only origin/${sourceBranch}...HEAD`,
      { dryRun: false }
    );

    return typeof result === 'string' ? result.split('\n') : [];
  }

  public async getChangedPackages(
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

  private getProjectWorkspaces(): WorkspaceValue[] {
    const rootPath = this.context.rootPath;
    const packagesDirectories = this.context.options.packagesDirectories;

    if (Array.isArray(packagesDirectories) && packagesDirectories.length > 0) {
      return packagesDirectories.map((path) =>
        WorkspaceCreator.toWorkspace({ path }, rootPath)
      );
    }

    const projectPackages = findWorkspaces(rootPath) || [];
    return projectPackages.map((value) => ({
      name: value.package.name,
      version: value.package.version!,
      path: relative(rootPath, value.location),
      root: resolve(rootPath, value.location),
      packageJson: value.package as Record<string, unknown>
    }));
  }

  public async getWorkspaces(): Promise<WorkspaceValue[]> {
    const projectWorkspaces: WorkspaceValue[] = this.getProjectWorkspaces();

    const packages = projectWorkspaces.map(({ path }) => path);
    this.logger.debug('packages', packages);

    const changeLabels = this.getConfig('changeLabels') as string[];
    const changedPaths = await this.getChangedPackages(packages, changeLabels);

    this.setConfig({
      packages,
      changedPaths,
      projectWorkspaces: projectWorkspaces
    });

    this.logger.debug('changedPaths', changedPaths);

    return projectWorkspaces.filter((workspace) =>
      changedPaths.includes(workspace.path)
    );
  }
}
