/**
 * @module Workspaces
 * @description Monorepo workspace discovery and dependency-release tracking
 *
 * First plugin in the default release pipeline. Detects which packages changed
 * relative to `sourceBranch`, resolves git tags for changelog baselines, and
 * optionally appends internal dependents as `dependencyRelease` workspaces.
 *
 * Discovery flow (`onBefore`):
 * 1. `getProjectWorkspaces()` — scan `packagesDirectories` or `find-workspaces`
 * 2. `getChangedPackages()` — filter by git diff or `changeLabels`
 * 3. `appendDependencyReleaseWorkspaces()` — append dependents via
 *    `@changesets/get-dependents-graph` when `includeDependencyReleases` is true
 * 4. `getLastTagName()` — resolve per-workspace baseline tag for changelog generation
 * 5. `context.setWorkspaces()` — publish final workspace list to {@link ReleaseContext}
 *
 * `dependencyRelease` workspaces are consumed by {@link ChangesetVersion} and
 * {@link Github} to decide whether to generate changelogs, write changeset files,
 * or restore on-disk bumps after `changeset version`.
 *
 * @example Limit release to labeled packages
 * ```bash
 * fe-release --workspaces.change-labels changes:@qlover/fe-release
 * ```
 *
 * @example Disable dependent workspace appending
 * ```json
 * {
 *   "release": {
 *     "workspaces": {
 *       "includeDependencyReleases": false
 *     }
 *   }
 * }
 * ```
 */
import { resolve, relative, isAbsolute } from 'node:path';
import type ReleaseContext from '../implments/ReleaseContext';
import type { ReleaseLabelCompare } from '../implments/ReleaseLabel';
import { ReleaseLabel } from '../implments/ReleaseLabel';
import { findWorkspaces } from 'find-workspaces';
import { getDependentsGraph } from '@changesets/get-dependents-graph';
import { getPackages } from '@manypkg/get-packages';
import { ScriptPlugin, type ScriptPluginProps } from '@qlover/scripts-context';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';
import { createWorkspaceValue, worksapce2name } from '../utils/createWorkspace';
import { releaseJson } from '../defaults';

export interface WorkspacesProps extends ScriptPluginProps {
  /**
   * Whether to skip checking the package.json file
   *
   * @default `false`
   */
  skipCheckPackage?: boolean;

  /**
   * The workspaces to publish
   * @private
   */
  workspaces?: WorkspaceInterface[];

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
  projectWorkspaces?: WorkspaceInterface[];

  /**
   * Template for generating release tag names after version bump
   *
   * Template variables support {@link WorkspaceInterface} properties.
   *
   * @default `'${name}@${version}'`
   */
  tagTemplate?: string;

  /**
   * Glob-style pattern for matching historical release tags
   *
   * @default `'${name}@*'`
   */
  tagMatch?: string;

  /**
   * Include internal dependents in the release workspace list.
   *
   * When enabled (default), packages that depend on a changed source are appended
   * with `dependencyRelease: true`. This list is used for:
   *
   * - changelog / version logging when `changesetVersion.ignoreNonUpdatedPackages`
   *   is `false`
   * - `git restore` targeting when `changesetVersion.ignoreNonUpdatedPackages`
   *   is `true`
   *
   * @default true
   */
  includeDependencyReleases?: boolean;

  /**
   * Directories containing packages for monorepo releases
   *
   * Core concept:
   * Specifies the directories that contain packages for
   * monorepo release management, enabling selective
   * package discovery and release coordination.
   *
   * Directory patterns:
   * - Supports glob patterns for flexible matching
   * - Enables selective package inclusion
   * - Supports nested directory structures
   * - Facilitates monorepo organization
   * - Enables workspace-specific configurations
   *
   * Use cases:
   * - Monorepo package discovery
   * - Selective package releases
   * - Workspace-specific configurations
   * - Multi-package coordination
   * - Dependency-aware releases
   *
   * @optional
   * @default `[]`
   * @example Basic package directories
   * ```typescript
   * const config: FeReleaseConfig = {
   *   packagesDirectories: ['packages/*']
   * };
   * ```
   *
   * @example Multiple package directories
   * ```typescript
   * const config: FeReleaseConfig = {
   *   packagesDirectories: ['packages/*', 'apps/*', 'libs/*']
   * };
   * ```
   */
  packagesDirectories?: string[];

  /**
   * Template for package change labels in monorepos
   *
   * Core concept:
   * Defines the naming pattern for labels that identify
   * which packages have changed in monorepo releases,
   * enabling targeted review and deployment.
   *
   * Label usage:
   * - Applied to PRs when specific packages change
   * - Enables package-specific review processes
   * - Supports selective deployment strategies
   * - Improves monorepo change tracking
   * - Facilitates team collaboration and review
   *
   * Template variables:
   * - `${name}`: Package name for label identification
   *
   * @optional
   * @default `'changes:${name}'`
   * @example Basic change label
   * ```typescript
   * const config: FeReleaseConfig = {
   *   changePackagesLabel: 'changes:${name}'
   * };
   * ```
   *
   * @example Custom change label
   * ```typescript
   * const config: FeReleaseConfig = {
   *   changePackagesLabel: 'package:${name}'
   * };
   * ```
   */
  changePackagesLabel?: string;
}

const defaultChangePackagesLabel = 'change:${name}';
const defaultTagTemplate = '${name}@${version}';
const defaultTagMatch = '${name}@*';

const defautlCompare: ReleaseLabelCompare = (changedFilePath, packagePath) =>
  resolve(changedFilePath).startsWith(resolve(packagePath));

/**
 * Discovers changed monorepo packages and prepares {@link WorkspaceInterface}
 * entries for downstream release plugins.
 */
export default class Workspaces extends ScriptPlugin<
  ReleaseContext,
  WorkspacesProps
> {
  /**
   * When true, skip the next plugin hook invocation for this plugin instance.
   *
   * Set after workspaces are resolved (for example when `workspaces` is
   * pre-configured) to prevent duplicate execution.
   */
  protected nextSkipFlag = false;

  protected releaseLabel: ReleaseLabel;

  constructor(context: ReleaseContext) {
    super(context, 'workspaces');

    this.releaseLabel = new ReleaseLabel({
      changePackagesLabel:
        this.config.changePackagesLabel || defaultChangePackagesLabel,
      packagesDirectories: this.config.packagesDirectories || [],
      compare: defautlCompare
    });
  }

  public override enabled(name: string, context: ReleaseContext): boolean {
    if (this.nextSkipFlag) {
      return false;
    }

    return super.enabled(name, context);
  }

  public override async onBefore(): Promise<void> {
    if (this.config.workspaces) {
      this.logger.warn(
        `Ignore find the configured workspaces(workspaces.workspaces)`
      );
    }

    const workspaces = await this.getWorkspaces();

    if (this.config.skipCheckPackage || workspaces.length === 0) {
      throw new Error('No changes to publish packages');
    }

    let releaseWorkspaces = workspaces;
    if (this.shouldIncludeDependencyReleases()) {
      releaseWorkspaces =
        await this.appendDependencyReleaseWorkspaces(workspaces);
    }

    const newWorkspaces = await Promise.all(
      releaseWorkspaces.map(async (workspace) => {
        const lastTag = await this.getLastTagName(workspace);
        return createWorkspaceValue({
          ...workspace,
          lastTag,
          rootPath: this.context.rootPath
        });
      })
    );

    this.setWorkspaces(newWorkspaces);
  }

  protected shouldIncludeDependencyReleases(): boolean {
    const includeDependencyReleases = this.config.includeDependencyReleases;

    if (typeof includeDependencyReleases === 'boolean') {
      return includeDependencyReleases;
    }

    return true;
  }

  protected async appendDependencyReleaseWorkspaces(
    sources: WorkspaceInterface[]
  ): Promise<WorkspaceInterface[]> {
    const dependencyReleaseTemplate =
      this.context.parameters.changesetVersion?.dependencyReleaseTemplate ||
      releaseJson.changesetVersion.dependencyReleaseTemplate;

    const rootPath = this.context.rootPath;
    const directSources = sources.filter((source) => !source.dependencyRelease);
    const packages = await getPackages(rootPath);
    const dependentsGraph = getDependentsGraph(packages);
    const sourceNames = new Set(sources.map((source) => source.name));
    const result: WorkspaceInterface[] = [...sources];

    this.logger.debug(
      `Append dependency workspaces graph size: ${dependentsGraph.size}`
    );

    for (const source of directSources) {
      const dependents = dependentsGraph.get(source.name);
      if (!Array.isArray(dependents) || dependents.length === 0) {
        continue;
      }

      for (const dependentName of dependents) {
        if (sourceNames.has(dependentName)) {
          continue;
        }

        const dependentPkg = packages.packages.find(
          (pkg) => pkg.packageJson.name === dependentName
        );

        if (!dependentPkg) {
          continue;
        }

        const workspacePath = isAbsolute(dependentPkg.dir)
          ? relative(rootPath, dependentPkg.dir)
          : dependentPkg.dir;
        const changelogMessage = this.context.format(
          dependencyReleaseTemplate,
          {
            name: source.name,
            oldVersion: source.version,
            // Provisional until ChangesetVersion refreshes after version bump
            newVersion: source.newVersion || source.version
          }
        );

        const newWorkspace = createWorkspaceValue({
          name: dependentPkg.packageJson.name,
          version: dependentPkg.packageJson.version || '',
          path: workspacePath,
          root: dependentPkg.dir,
          packageJson: dependentPkg.packageJson,
          changelog: changelogMessage,
          dependencyRelease: true,
          dependencyReleaseOf: source.name,
          rootPath
        });

        result.push(newWorkspace);
        sourceNames.add(dependentName);
        this.logger.info(
          `Append dependency-release workspace: ${worksapce2name(newWorkspace)} (triggered by ${worksapce2name(source)})`
        );
      }
    }

    return result;
  }

  protected generateTagName(workspace: WorkspaceInterface): string {
    try {
      const tagTemplate = this.config.tagTemplate || defaultTagTemplate;

      this.logger.debug(`Workspaces tagTemplate: ${tagTemplate}`);

      return this.context.format(tagTemplate, workspace);
    } catch (error) {
      console.error(`Error generating tag name for ${workspace.name}:`, error);
      return `${workspace.name}-v0.0.0`;
    }
  }

  public async getLastTagName(
    workspace: WorkspaceInterface
  ): Promise<string | undefined> {
    try {
      const tagMatchTemplate = this.config.tagMatch || defaultTagMatch;

      this.logger.debug(`Workspaces tagMatchTemplate: ${tagMatchTemplate}`);

      const tagMatch = this.context.format(tagMatchTemplate, workspace);

      // use git for-each-ref command to get tags and their creation time
      const tagsOutput = await this.shell.exec(
        `git for-each-ref --sort=-creatordate --format "%(refname:short)|%(creatordate:iso8601)" "refs/tags/${tagMatch}"`,
        { dryRun: false }
      );

      if (!tagsOutput) {
        return undefined;
      }

      const tags = tagsOutput.split('\n').filter(Boolean);

      if (tags.length === 0) {
        return undefined;
      }

      // get the latest tag (the first one is the latest because it is sorted by time)
      const latestTag = tags[0].split('|')[0];
      return latestTag;
    } catch (error) {
      console.error(`Error getting tag for ${workspace.name}:`, error);
      return undefined;
    }
  }

  /**
   * Skip the next workspace
   *
   * - has publishPath
   * - has workspace
   */
  protected nextSkip(): void {
    this.nextSkipFlag = true;

    this.logger.debug('skip next workspace');
  }

  protected setWorkspaces(workspaces: WorkspaceInterface[]): void {
    const infos = workspaces.map((w) => w.toString());
    this.logger.info(
      `Set current workspaces(${infos.length}):\n${infos.join('\n')}`
    );

    this.setConfig({ workspaces });
    this.nextSkip();
  }

  protected async getGitWorkspaces(): Promise<string[]> {
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

  protected async getChangedPackages(
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

  protected getProjectWorkspaces(): WorkspaceInterface[] {
    const rootPath = this.context.rootPath;
    const packagesDirectories = this.config.packagesDirectories;

    if (Array.isArray(packagesDirectories) && packagesDirectories.length > 0) {
      // Core debug: using explicit packagesDirectories from options
      this.logger.debug(
        `Using configured packagesDirectories: ${JSON.stringify(
          packagesDirectories
        )}`
      );
      return packagesDirectories.map((path) =>
        createWorkspaceValue({ path, rootPath })
      );
    }

    const projectPackages = findWorkspaces(rootPath) || [];
    // Core debug: how many workspaces found by find-workspaces
    this.logger.debug(
      `findWorkspaces returned ${projectPackages.length} entries`
    );

    return projectPackages.map((value) =>
      createWorkspaceValue({
        name: value.package.name,
        version: value.package.version || '',
        path: relative(rootPath, value.location),
        root: resolve(rootPath, value.location),
        packageJson: value.package as Record<string, unknown>
      })
    );
  }

  protected async getWorkspaces(): Promise<WorkspaceInterface[]> {
    const { changeLabels } = this.config;

    const projectWorkspaces = this.getProjectWorkspaces();
    const packages = projectWorkspaces.map(({ path }) => path);

    this.logger.info(`Found ${packages.length} packages`);
    if (packages.length > 0) {
      this.logger.debug(
        `Packages list: ${JSON.stringify(packages.slice(0, 10))}`
      );
    }

    const changedPaths = await this.getChangedPackages(packages, changeLabels);

    this.setConfig({ packages, changedPaths, projectWorkspaces });

    this.logger.info(`Found ${changedPaths.length} changed packages`);

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
