/**
 * @module ChangesetVersion
 * @description Changelog generation and changeset version/publish plugin
 *
 * Second plugin in the default release pipeline (after {@link Workspaces},
 * before {@link Github}). Bridges git-based changelog formatting with the
 * Changesets CLI for monorepo version bumps.
 *
 * Pipeline phases:
 * - **onBefore**: validate `.changeset` directory exists
 * - **onExec**: generate per-workspace git changelogs (skips `dependencyRelease`
 *   when `ignoreNonUpdatedPackages` is enabled)
 * - **onSuccess**: run version and/or publish flow based on `mode`
 *
 * Version flow (`mode: 'version'` or first half of `'both'`):
 * 1. Write `.changeset/*.md` files for directly changed packages only
 * 2. Run `changeset version` (optionally with `changelog: false` when `onlyVersion`)
 * 3. Optionally `git restore` dependency-release paths when `ignoreNonUpdatedPackages`
 * 4. Sync workspace `newVersion` / `tagName` from disk via `mergeWorkspaces`
 *
 * @example Version-only release
 * ```typescript
 * // fe-config.json
 * {
 *   "release": {
 *     "changesetVersion": {
 *       "mode": "version",
 *       "increment": "patch"
 *     }
 *   }
 * }
 * ```
 *
 * @example Ignore internal dependent bumps
 * ```bash
 * fe-release --changesetVersion.ignore-non-updated-packages
 * ```
 *
 * @see {@link ChangesetVersionProps.ignoreNonUpdatedPackages} for dependency-release behavior
 */
import type ReleaseContext from '../implments/ReleaseContext';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { type GitChangelogOptions } from '../interface/ChangeLog';
import {
  CHANGELOG_ALL_FIELDS,
  GitChangelog,
  type GitChangelogProps
} from '../implments/changelog/GitChangeLog';
import { GitChangelogFormatter } from '../implments/changelog/GitChangelogFormatter';
import { ScriptPlugin, type ScriptPluginProps } from '@qlover/scripts-context';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';
import {
  createWorkspaceValue,
  readWorkspacePackageFromDisk,
  shouldProcessWorkspace,
  workspaceVersionSummary,
  worksapce2name
} from '../utils/createWorkspace';
import { releaseJson } from '../defaults';

export type ChangesetVersionMode = 'version' | 'publish' | 'both';

export interface ChangesetVersionProps
  extends GitChangelogOptions, ScriptPluginProps {
  /**
   * Work mode
   *
   * - `version`: generate git changelog, write changeset files, run `changeset version`
   * - `publish`: run `changeset publish`
   * - `both`: run `version` flow first, then `publish`
   *
   * @default 'version'
   */
  mode?: ChangesetVersionMode;

  /**
   * Version increment type for generated changeset files
   * @default 'patch'
   */
  increment?: string;

  /**
   * Whether to skip this plugin
   * @default false
   */
  skip?: boolean;

  /**
   * Whether to skip generating changeset files (version mode only)
   * @default false
   */
  skipChangeset?: boolean;

  /**
   * Root directory of the changeset config
   * @default '.changeset'
   */
  changesetRoot?: string;

  /**
   * When true, only bump package.json versions via changesets;
   * do not write changelog content into CHANGELOG.md
   * @default false
   */
  onlyVersion?: boolean;

  /**
   * Control how internal dependency bump side-effects are handled during release.
   *
   * ## Background
   *
   * When a source package changes, `changeset version` may also bump its internal
   * dependents (for example, `fe-scripts` depends on `scripts-context`).
   * Dependents are tracked as `dependencyRelease` workspaces
   * (see `workspaces.includeDependencyReleases`).
   *
   * ## `false` (default) — keep dependent bumps
   *
   * 1. **Workspaces**: append dependents and set `dependencyRelease: true`
   * 2. **Changelog**: generate git changelog for changed packages; dependents use
   *    `dependencyReleaseTemplate` changelog
   * 3. **Changeset files**: only created for directly changed packages
   * 4. **`changeset version`**: bumps changed packages and dependents on disk
   * 5. **Result**: `Updated workspaces` includes `(DEP)` entries; dependents may
   *    be published together
   *
   * ## `true` — ignore dependent bumps (restore after version)
   *
   * 1. **Workspaces**: append dependents for restore targeting (`lastTag` is still resolved)
   * 2. **Changelog / changeset**: skip processing for `dependencyRelease` workspaces
   * 3. **`changeset version`**: runs as usual (changesets may still touch dependents)
   * 4. **Restore**: `git restore` all `dependencyRelease` workspace paths
   * 5. **Result**: only directly changed packages remain bumped; logs show their
   *    version changes only
   *
   * @see {@link shouldProcessWorkspace} for the per-workspace processing gate
   *
   * CLI: `--changesetVersion.ignore-non-updated-packages`
   * Alias: `--changelog.ignore-non-updated-packages`
   *
   * @default false
   */
  ignoreNonUpdatedPackages?: boolean;
}

const CHANGESET_FILE_TEMPLATE =
  "---\n'${name}': '${increment}'\n---\n\n${changelog}";

/**
 * Manages changelog generation, changeset file creation, and Changesets CLI execution.
 *
 * Coordinates with {@link Workspaces} for workspace discovery and
 * `dependencyRelease` tagging. Downstream {@link Github} consumes enriched
 * changelogs and bumped versions produced here.
 */
export default class ChangesetVersion extends ScriptPlugin<
  ReleaseContext,
  ChangesetVersionProps
> {
  constructor(context: ReleaseContext, props: ChangesetVersionProps = {}) {
    super(context, 'changesetVersion', props);
  }

  public get changesetRoot(): string {
    return join(
      this.context.rootPath,
      this.config.changesetRoot ||
        this.context.parameters.changesetVersion?.changesetRoot ||
        releaseJson.changesetVersion.changesetRoot
    );
  }

  public get changesetConfigPath(): string {
    return join(this.changesetRoot, 'config.json');
  }

  protected get mode(): ChangesetVersionMode {
    return (
      this.config.mode ||
      this.context.parameters.changesetVersion?.mode ||
      (releaseJson.changesetVersion.mode as ChangesetVersionMode)
    );
  }

  protected get ignoreNonUpdatedPackages(): boolean {
    return !!this.config.ignoreNonUpdatedPackages;
  }

  protected shouldProcessWorkspace(workspace: WorkspaceInterface): boolean {
    return shouldProcessWorkspace(workspace, this.ignoreNonUpdatedPackages);
  }

  protected getProcessableWorkspaces(
    workspaces: WorkspaceInterface[]
  ): WorkspaceInterface[] {
    return workspaces.filter((workspace) =>
      this.shouldProcessWorkspace(workspace)
    );
  }

  public override async onBefore(): Promise<void> {
    if (!existsSync(this.changesetRoot)) {
      throw new Error(
        `Changeset directory ${this.changesetRoot} does not exist`
      );
    }

    this.logger.debug(`${this.changesetRoot} exists`);
    this.logger.info(`Changeset version mode: ${this.mode}`);
  }

  public override async onExec(_context: ReleaseContext): Promise<void> {
    const workspaces = this.context.requireWorkspaces();

    const processableWorkspaces = this.getProcessableWorkspaces(workspaces);

    this.logger.info(
      `Generating changelogs for ${processableWorkspaces.length} workspaces`
    );

    if (!this.ignoreNonUpdatedPackages) {
      this.logger.info(
        `Setting the ${this.changesetRoot} getDependencyReleaseLine method can quickly retrieve internal dependency logs`
      );
    }

    const newWorkspaces = await this.step({
      label: 'Generate Changelogs',
      task: () =>
        Promise.all(
          workspaces.map((workspace) =>
            this.shouldProcessWorkspace(workspace)
              ? this.generateChangelog(workspace)
              : Promise.resolve(workspace)
          )
        )
    });

    this.context.setWorkspaces(newWorkspaces);
  }

  public override async onSuccess(): Promise<void> {
    if (this.mode === 'publish') {
      await this.runChangesetPublish();
      return;
    }

    if (this.mode === 'both') {
      await this.runVersionFlow();
      await this.runChangesetPublish();
      return;
    }

    await this.runVersionFlow();
  }

  protected logDryRun(message: string): void {
    this.logger.info(`[dry-run] ${message}`);
  }

  protected async runVersionFlow(): Promise<void> {
    const workspaces = this.context.workspaces;

    if (!workspaces || workspaces.length === 0) {
      this.logger.warn('No workspaces found, skipping changeset generation');
      return;
    }

    if (!this.config.skipChangeset) {
      const changesetWorkspaces = workspaces.filter(
        (workspace) => !workspace.dependencyRelease
      );

      await this.step({
        label: 'Generate Changeset Files',
        task: () =>
          Promise.all(
            changesetWorkspaces.map((workspace) =>
              this.generateChangesetFile(workspace)
            )
          )
      });

      if (this.context.dryRun) {
        this.logDryRun(
          `Would run: changeset version (bump package versions and update CHANGELOG.md from ${this.changesetRoot}/*.md)`
        );
        return;
      }

      await this.runChangesetVersion(this.config.onlyVersion === true);

      if (this.ignoreNonUpdatedPackages) {
        await this.restoreIgnorePackages();
      }
    } else {
      this.logger.info('Skip generate changeset files');
    }

    this.syncWorkspaces(this.context.workspaces ?? workspaces);
  }

  protected async runChangesetPublish(): Promise<void> {
    if (this.context.dryRun) {
      this.logDryRun('Would run: changeset publish, publish packages and tags');
      return;
    }

    await this.step({
      label: 'Changeset Publish',
      task: () => this.context.runChangesetsCli('publish')
    });

    const workspaces = this.context.workspaces;
    if (workspaces && workspaces.length > 0) {
      this.syncWorkspaces(workspaces);
    }
  }

  protected syncWorkspaces(workspaces: WorkspaceInterface[]): void {
    const newWorkspaces = this.mergeWorkspaces(workspaces);
    const bumpedWorkspaces = newWorkspaces.filter(
      (workspace) =>
        this.shouldProcessWorkspace(workspace) &&
        workspace.newVersion &&
        workspace.newVersion !== workspace.version
    );

    if (bumpedWorkspaces.length === 0) {
      this.logger.info('Updated workspaces (0): none');
    } else {
      const lines = bumpedWorkspaces.map(
        (workspace) => `  ${workspaceVersionSummary(workspace)}`
      );

      this.logger.info(
        `Updated workspaces (${bumpedWorkspaces.length}):\n${lines.join('\n')}`
      );
    }

    this.context.setWorkspaces(newWorkspaces);
  }

  public mergeWorkspaces(
    workspaces: WorkspaceInterface[]
  ): WorkspaceInterface[] {
    return workspaces.map((workspace) => {
      const diskPackage = readWorkspacePackageFromDisk({
        path: workspace.path,
        root: workspace.root,
        rootPath: this.context.rootPath
      });

      const newWorkspace = createWorkspaceValue({
        name: workspace.name,
        path: workspace.path,
        root: workspace.root,
        version: workspace.version,
        newVersion: diskPackage.version,
        packageJson: diskPackage.packageJson,
        rootPath: this.context.rootPath,
        changelog: workspace.changelog,
        dependencyRelease: workspace.dependencyRelease,
        lastTag: workspace.lastTag
      });

      if (
        newWorkspace.newVersion &&
        newWorkspace.newVersion !== newWorkspace.version
      ) {
        newWorkspace.tagName = this.generateTagName({
          ...newWorkspace,
          version: newWorkspace.newVersion
        });
      }

      return newWorkspace;
    });
  }

  protected async runChangesetVersion(onlyVersion?: boolean): Promise<void> {
    const configPath = this.changesetConfigPath;
    const originalConfig = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(originalConfig) as { changelog?: unknown };

    try {
      if (onlyVersion) {
        config.changelog = false;
        this.logger.info('Set changeset.changelog to false');
        writeFileSync(
          configPath,
          `${JSON.stringify(config, null, 2)}\n`,
          'utf-8'
        );
      }

      this.logger.info('Run changeset version');

      await this.context.runChangesetsCli('version');
    } finally {
      if (onlyVersion) {
        writeFileSync(configPath, originalConfig, 'utf-8');
      }
    }
  }

  public async restoreIgnorePackages(): Promise<void> {
    // Revert on-disk changes for dependency-release workspaces after
    // `changeset version`. Only runs when `ignoreNonUpdatedPackages` is true.
    const workspaces = this.context.workspaces ?? [];
    const dependencyReleasePackages = workspaces
      .filter((workspace) => workspace.dependencyRelease)
      .map((workspace) => workspace.path);

    if (dependencyReleasePackages.length === 0) {
      this.logger.debug('No dependency-release packages to restore');
      return;
    }

    this.logger.info(
      `Restore dependency-release packages (${dependencyReleasePackages.length}): ${dependencyReleasePackages.join(', ')}`
    );

    if (this.context.dryRun) {
      this.logDryRun(
        `Would git restore dependency-release packages: ${dependencyReleasePackages.join(', ')}`
      );
      return;
    }

    await this.shell.exec(['git', 'restore', ...dependencyReleasePackages]);
  }

  public async generateChangelog(
    workspace: WorkspaceInterface
  ): Promise<WorkspaceInterface> {
    if (!this.shouldProcessWorkspace(workspace)) {
      this.logger.debug(
        `Skip changelog for dependency-release workspace ${workspace.name}`
      );
      return workspace;
    }

    if (!workspace.lastTag) {
      this.logger.warn(
        `${workspace.name} missing lastTag, skip git changelog generation`
      );
      return workspace;
    }

    const tagName = workspace.lastTag;
    this.logger.debug(workspace.toString() + ' changelog tagName:' + tagName);

    let changelog: string | undefined;
    if (!workspace.dependencyRelease) {
      changelog = (
        await this.getChangelogWithGit(tagName, workspace.path)
      ).join('\n');
    }

    return createWorkspaceValue({
      ...workspace,
      rootPath: this.context.rootPath,
      packageJson: workspace.packageJson,
      lastTag: tagName,
      changelog: changelog ?? workspace.changelog
    });
  }

  protected async getChangelogWithGit(
    tagName: string,
    dir: string
  ): Promise<string[]> {
    const baseConfig = this.getConfig<ChangesetVersionProps>();
    const props: GitChangelogProps = {
      ...baseConfig,
      from: tagName,
      directory: dir,
      shell: this.context.shell,
      fields: CHANGELOG_ALL_FIELDS,
      logger: this.logger
    };

    const gitChangelog = new GitChangelog(props);
    const commits = await gitChangelog.getCommits(props);

    return new GitChangelogFormatter(props).format(commits);
  }

  protected generateTagName(workspace: WorkspaceInterface): string {
    try {
      const tagTemplate =
        this.context.parameters.workspaces?.tagTemplate ||
        releaseJson.workspaces.tagTemplate;

      return this.context.format(tagTemplate, workspace);
    } catch (error) {
      console.error(`Error generating tag name for ${workspace.name}:`, error);
      return `${workspace.name}-v0.0.0`;
    }
  }

  public getIncrement(): string {
    const labels = this.context.parameters.workspaces?.changeLabels;

    if (Array.isArray(labels) && labels.length > 0) {
      if (labels.includes('increment:major')) {
        return 'major';
      }

      if (labels.includes('increment:minor')) {
        return 'minor';
      }
    }

    return (
      this.config.increment ||
      this.context.parameters.changesetVersion?.increment ||
      releaseJson.changesetVersion.increment
    );
  }

  public async generateChangesetFile(
    workspace: WorkspaceInterface
  ): Promise<void> {
    if (workspace.dependencyRelease) {
      this.logger.debug(
        `Skip changeset file for dependency-release workspace ${workspace.name}`
      );
      return;
    }

    const changesetName = worksapce2name(workspace).replace(/[\/\\]/g, '_');
    const changesetPath = join(this.changesetRoot, `${changesetName}.md`);
    const increment = this.getIncrement();

    this.logger.debug(
      `${worksapce2name(workspace)} increment is: ${increment}`
    );

    const fileContent = this.context.format(CHANGESET_FILE_TEMPLATE, {
      ...workspace,
      increment
    });

    if (this.context.dryRun) {
      this.logDryRun(
        `Would create changeset [${changesetPath}], content is:\n${fileContent}`
      );
      return;
    }

    if (existsSync(changesetPath)) {
      this.logger.info(`Changeset ${changesetName} already exists`);
      return;
    }

    writeFileSync(changesetPath, fileContent, 'utf-8');
  }
}
