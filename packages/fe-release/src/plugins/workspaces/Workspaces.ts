import type ReleaseTask from '../../implments/ReleaseTask';
import { join, resolve, relative } from 'node:path';
import type ReleaseContext from '../../implments/ReleaseContext';
import { MANIFEST_PATH } from '../../defaults';
import { ReleaseLabel } from '../../implments/ReleaseLabel';
import { findWorkspaces } from 'find-workspaces';
import { WorkspaceCreator } from './WorkspaceCreator';
import { ScriptPlugin, type ScriptPluginProps } from '@qlover/scripts-context';

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
    // Core debug: log options used to initialize release label
    this.logger.debug(
      `Workspaces initialized: changePackagesLabel=${
        this.context.options.changePackagesLabel || 'change:${name}'
      }, packagesDirectories=${JSON.stringify(
        this.context.options.packagesDirectories || []
      )}`
    );
  }

  public override enabled(name: string, context: ReleaseContext): boolean {
    if (this._skip) {
      return false;
    }

    return super.enabled(name, context);
  }

  public override async onBefore(): Promise<void> {
    const workspace = this.getConfig('workspace') as WorkspaceValue | undefined;

    if (workspace) {
      this.logger.info(`Find the configured workspace(workspaces.workspace)`);

      this.setCurrentWorkspace(workspace, []);
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

      const publisPkgPath = join(targetWorkspace.root, MANIFEST_PATH);
      this.logger.info(
        `Find the workspace with \`publishPath\`(\`-p\`): ${targetWorkspace.name}@${targetWorkspace.version}, path: ${targetWorkspace.path}`
      );
      this.logger.debug(`packagee.json path is: ${publisPkgPath}`);

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
    // Core info: record that a release task was attached
    this.logger.info('Release task attached to Workspaces');
  }

  public setCurrentWorkspace(
    workspace: WorkspaceValue,
    workspaces?: WorkspaceValue[]
  ): void {
    if (workspaces) {
      const infos = workspaces.map((w) => `${w.name}@${w.version}`);
      this.logger.info(`Set current workspaces: ${JSON.stringify(infos)}`);
    } else {
      this.logger.info(
        `Set current workspace: ${workspace.name}@${workspace.version} packages.json: ${join(workspace.root, MANIFEST_PATH)}`
      );
    }

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

    const files =
      typeof result === 'string'
        ? result
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

    // Core debug: number of changed files detected by git
    this.logger.debug(`Git changed files count: ${files.length}`);

    return files;
  }

  public async getChangedPackages(
    packagesPaths: string[],
    changeLabels?: string[]
  ): Promise<string[]> {
    if (Array.isArray(changeLabels) && changeLabels.length > 0) {
      const changed = packagesPaths.filter((path) => {
        const lable = this.releaseLabel.toChangeLabel(path);
        return changeLabels.includes(lable);
      });

      this.logger.info(
        `changed labels(changeLabels, -l): ${changed.length === 0 ? 'none' : changed.toString()}`
      );

      return changed;
    }

    const changed = await this.getGitWorkspaces();

    return this.releaseLabel.pick(changed, packagesPaths);
  }

  private getProjectWorkspaces(): WorkspaceValue[] {
    const rootPath = this.context.rootPath;
    const packagesDirectories = this.context.options.packagesDirectories;

    if (Array.isArray(packagesDirectories) && packagesDirectories.length > 0) {
      // Core debug: using explicit packagesDirectories from options
      this.logger.debug(
        `Using configured packagesDirectories: ${JSON.stringify(
          packagesDirectories
        )}`
      );
      return packagesDirectories.map((path) =>
        WorkspaceCreator.toWorkspace({ path }, rootPath)
      );
    }

    const projectPackages = findWorkspaces(rootPath) || [];
    // Core debug: how many workspaces found by find-workspaces
    this.logger.debug(
      `findWorkspaces returned ${projectPackages.length} entries`
    );
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

    this.logger.info(`Found ${packages.length} packages`);
    if (packages.length > 0) {
      this.logger.debug(
        `Packages list: ${JSON.stringify(packages.slice(0, 10))}`
      );
    }

    const changeLabels = this.getConfig('changeLabels') as string[];
    const changedPaths = await this.getChangedPackages(packages, changeLabels);

    this.setConfig({
      packages,
      changedPaths,
      projectWorkspaces: projectWorkspaces
    });

    this.logger.info(`Found ${changedPaths.length} changed packages`);
    // 避免输出大量数据：只显示前5个变更路径
    if (changedPaths.length > 0) {
      this.logger.debug(
        `Changed paths (first 5): ${JSON.stringify(changedPaths.slice(0, 5))}${changedPaths.length > 5 ? ' ...' : ''}`
      );
    } else {
      this.logger.debug('Changed paths: empty');
    }

    const filtered = projectWorkspaces.filter((workspace) =>
      changedPaths.includes(workspace.path)
    );

    const workspacePaths = filtered.map((w) => w.path);
    this.logger.info(
      `Workspaces to process: ${workspacePaths.length === 0 ? 'none' : workspacePaths.toString()}`
    );

    return filtered;
  }
}
