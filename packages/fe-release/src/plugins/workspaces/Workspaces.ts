import type ReleaseTask from '../../implments/ReleaseTask';
import { join, resolve } from 'node:path';
import ReleaseContext from '../../interface/ReleaseContext';
import Plugin from '../../Plugin';
import { readFileSync } from 'node:fs';
import { MANIFEST_PATH } from '../../defaults';
import { DeepPartial } from '../../type';
import { PackageJson } from '../CheckEnvironment';

export interface WorkspacesProps {
  /**
   * Whether to skip workspaces
   *
   * @default `false`
   */
  skipWorkspaces?: boolean;
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

  private skip = false;

  constructor(context: ReleaseContext) {
    super(context, 'workspaces');
  }

  setReleaseTask(releaseTask: ReleaseTask): void {
    this.releaseTask = releaseTask;
  }

  override enabled(): boolean {
    return !this.skip && !this.getConfig('skipWorkspaces');
  }

  override async onBefore(): Promise<void> {
    const workspaces = await this.getWorkspaces();

    const [firstWorkspace, ...restWorkspaces] = workspaces;

    this.workspacesList = restWorkspaces;

    // first workspace
    this.setCurrentWorkspace(firstWorkspace);
  }

  override async onExec(): Promise<void> {
    // important
    this.skip = true;

    for (const workspace of this.workspacesList) {
      this.logger.obtrusive(
        `workspace: ${workspace.name} ${workspace.version}`
      );

      this.setCurrentWorkspace(workspace);

      await this.releaseTask?.run();
    }
  }

  setCurrentWorkspace(workspace: WorkspaceValue): void {
    this.context.setConfig({
      environment: {
        packageJson: workspace.packageJson as DeepPartial<PackageJson>,
        publishPath: workspace.path
      }
    });
  }

  private getWorkspacesPaths(): string[] {
    const packagesDirections = this.context.getConfig(
      'environment.packagesDirectories'
    );

    if (Array.isArray(packagesDirections)) {
      return packagesDirections;
    }

    // TODO: from package.json workspace or pnpm-workspace.yaml
    return [];
  }

  private async getGitWorkspaces(): Promise<string[]> {
    const sourceBranch = this.context.getConfig('environment.sourceBranch');

    const result = await this.shell.exec(
      `git diff --name-only origin/${sourceBranch}...HEAD`,
      { dryRun: false }
    );

    const changed = result.split('\n');

    if (changed.length === 0) {
      return [];
    }

    return changed;
  }

  private intersection(paths: string[], changed: string[]): string[] {
    const result: string[] = [];

    for (const path of paths) {
      for (const filepath of changed) {
        if (
          filepath.includes(path) ||
          // If the filepath is a relative path, it will be resolved to the root path
          resolve(filepath).includes(path)
        ) {
          result.push(path);
          break;
        }
      }
    }

    return result;
  }

  private readJson(path: string): Record<string, unknown> {
    const packageJsonContent = readFileSync(path, 'utf-8');
    return JSON.parse(packageJsonContent);
  }

  async getWorkspaces(): Promise<WorkspaceValue[]> {
    const paths = this.getWorkspacesPaths();
    const changed = await this.getGitWorkspaces();

    const changedPaths = this.intersection(paths, changed);

    this.logger.debug('changedPaths', changedPaths);

    const workspaces: WorkspaceValue[] = changedPaths.map((path) => {
      const packageJsonData = this.readJson(join(path, MANIFEST_PATH));

      return {
        name: packageJsonData.name as string,
        version: packageJsonData.version as string,
        path,
        root: join(this.context.rootPath, path),
        packageJson: packageJsonData
      };
    });

    return workspaces;
  }
}
