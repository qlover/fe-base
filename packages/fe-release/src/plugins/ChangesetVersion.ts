/**
 * @module ChangesetVersion
 * @description Changelog generation and changeset version/publish plugin
 *
 * Second plugin in the default release pipeline (after {@link Workspaces},
 * before {@link Github}). Bridges git-based changelog formatting with the
 * Changesets CLI for monorepo version bumps.
 *
 * Pipeline phases:
 * - **onBefore**: validate `.changeset` directory; validate `NPM_TOKEN` when mode includes publish
 * - **onExec**: generate per-workspace git changelogs (skips `dependencyRelease`
 *   when `ignoreNonUpdatedPackages` is enabled)
 * - **onSuccess**: run version and/or publish flow based on `mode`
 *
 * Publish flow (`mode: 'publish'` or second half of `'both'`):
 * 1. Run `changeset publish` (npm publish + local `git tag` for public packages)
 * 2. Sync workspaces from disk so `tagName` is set from the release version
 * 3. Create local tags for `private` packages (changesets skips tagging them)
 * 4. Push `workspace.tagName` refs that exist locally to `origin`
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
  isPrivateWorkspace,
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
   * 5. **Result**: only directly changed packages remain bumped; they are the only
   *    workspaces left for GitHub PR title/body/`release-tag-${count}-*` naming
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

    if (this.mode === 'publish' || this.mode === 'both') {
      await this.validateNpmToken();
    }
  }

  /**
   * Ensure NPM_TOKEN is available and configured before changeset publish.
   *
   * Only required for `publish` / `both` modes. Version-only runs (release PR)
   * do not need an npm auth token.
   */
  protected async validateNpmToken(): Promise<void> {
    const npmToken = this.context.getEnv('NPM_TOKEN');
    if (!npmToken) {
      throw new Error('NPM_TOKEN is not set');
    }

    if (this.context.dryRun) {
      this.logDryRun(
        'Would set npm auth token: npm config set //registry.npmjs.org/:_authToken=***'
      );
      return;
    }

    await this.shell.exec(
      `npm config set //registry.npmjs.org/:_authToken=${npmToken}`
    );
  }

  public override async onExec(_context: ReleaseContext): Promise<void> {
    // Publish-only runs do not need generated changelogs; `changeset publish`
    // decides what to release from package versions / tags on disk.
    if (this.mode === 'publish') {
      this.logger.info('Skip changelog generation in publish mode');
      return;
    }

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

  protected printWorksapces(): void {
    const workspaces = this.context.workspaces;
    this.logger.info(
      `ChangesetVersion Workspaces (${workspaces?.length}):\n${workspaces?.map((workspace) => workspace.toString()).join('\n')}`
    );
  }

  public override async onSuccess(): Promise<void> {
    if (this.mode === 'publish') {
      await this.runChangesetPublish();
      this.printWorksapces();
      return;
    }

    if (this.mode === 'both') {
      await this.runVersionFlow();
      await this.runChangesetPublish();
      this.printWorksapces();
      return;
    }

    await this.runVersionFlow();
    this.printWorksapces();
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
    const workspaces = this.context.workspaces ?? [];

    if (this.context.dryRun) {
      this.logDryRun('Would run: changeset publish, publish packages and tags');
      // Publish does not bump package.json; tagName comes from the current version.
      const preview = this.mergeWorkspaces(workspaces);
      this.context.setWorkspaces(preview);
      const previewTags = this.collectPushableReleaseTags(preview);
      const privateTags = preview
        .filter(
          (workspace) =>
            this.shouldProcessWorkspace(workspace) &&
            !workspace.dependencyRelease &&
            isPrivateWorkspace(workspace) &&
            !!workspace.tagName
        )
        .map((workspace) => workspace.tagName as string);

      if (privateTags.length > 0) {
        this.logDryRun(
          `Would create local tag(s) for private package(s):\n${[
            ...new Set(privateTags)
          ]
            .map((tag) => `  ${tag}`)
            .join('\n')}`
        );
      }

      this.logDryRun(
        previewTags.length === 0
          ? 'Would push release tag(s) from workspace.tagName: none'
          : `Would push release tag(s) from workspace.tagName:\n${previewTags
              .map((tag) => `  ${tag}`)
              .join('\n')}`
      );
      return;
    }

    await this.step({
      label: 'Changeset Publish',
      task: () => this.context.runChangesetsCli('publish')
    });

    // Sync disk versions first so mergeWorkspaces fills workspace.tagName.
    if (workspaces.length > 0) {
      this.syncWorkspaces(workspaces);
    }

    const syncedWorkspaces = this.context.workspaces ?? workspaces;

    await this.step({
      label: 'Create Private Package Tags',
      task: () => this.ensurePrivateReleaseTags(syncedWorkspaces)
    });

    await this.step({
      label: 'Push Release Tags',
      task: () => this.pushWorkspaceReleaseTags(syncedWorkspaces)
    });
  }

  /**
   * Collect tag names that should be pushed after `changeset publish`.
   *
   * Includes public packages (tagged by changesets) and private packages
   * (tagged by {@link ensurePrivateReleaseTags}). Skips dependency-release
   * workspaces.
   */
  protected collectPushableReleaseTags(
    workspaces: WorkspaceInterface[]
  ): string[] {
    const tags = workspaces
      .filter(
        (workspace) =>
          this.shouldProcessWorkspace(workspace) &&
          !workspace.dependencyRelease &&
          !!workspace.tagName
      )
      .map((workspace) => workspace.tagName as string);

    return [...new Set(tags)];
  }

  /**
   * List local git tag names (short refs under `refs/tags/`).
   */
  protected async listLocalTags(): Promise<Set<string>> {
    // Quote --format: Shell.exec runs through /bin/sh, so unquoted %(…) breaks.
    const output = await this.shell.exec(
      'git for-each-ref --format="%(refname:short)" refs/tags/',
      { dryRun: false, silent: true }
    );

    const tags = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return new Set(tags);
  }

  /**
   * Create local git tags for private packages after `changeset publish`.
   *
   * Changesets skips npm publish and tagging for `private: true` packages.
   * Release still needs those tags as changelog baselines, so create them here.
   */
  protected async ensurePrivateReleaseTags(
    workspaces: WorkspaceInterface[]
  ): Promise<void> {
    const privateWorkspaces = workspaces.filter(
      (workspace) =>
        this.shouldProcessWorkspace(workspace) &&
        !workspace.dependencyRelease &&
        isPrivateWorkspace(workspace) &&
        !!workspace.tagName
    );

    if (privateWorkspaces.length === 0) {
      return;
    }

    const localTags = await this.listLocalTags();

    for (const workspace of privateWorkspaces) {
      const tagName = workspace.tagName as string;
      if (localTags.has(tagName)) {
        this.logger.debug(`Private package tag already exists: ${tagName}`);
        continue;
      }

      this.logger.info(
        `Create local release tag for private package: ${tagName}`
      );
      await this.shell.exec(['git', 'tag', tagName]);
      localTags.add(tagName);
    }
  }

  /**
   * Push release tags from synced workspaces' `tagName` fields.
   *
   * After {@link syncWorkspaces} and {@link ensurePrivateReleaseTags}, push
   * tags that exist as local refs. Missing public-package tags are skipped
   * (changeset may have skipped publish); they are not invented here.
   */
  protected async pushWorkspaceReleaseTags(
    workspaces: WorkspaceInterface[]
  ): Promise<void> {
    const uniqueTags = this.collectPushableReleaseTags(workspaces);

    if (uniqueTags.length === 0) {
      this.logger.warn(
        'No workspace.tagName found after publish sync; skip tag push'
      );
      return;
    }

    const localTags = await this.listLocalTags();
    const existingTags = uniqueTags.filter((tag) => localTags.has(tag));
    const missingTags = uniqueTags.filter((tag) => !localTags.has(tag));

    if (missingTags.length > 0) {
      this.logger.warn(
        `Skip push for missing local tag(s):\n${missingTags
          .map((tag) => `  ${tag}`)
          .join('\n')}`
      );
    }

    if (existingTags.length === 0) {
      this.logger.warn(
        'No local release tags found to push after publish; skip tag push'
      );
      return;
    }

    this.logger.info(
      `Pushing ${existingTags.length} release tag(s) to origin:\n${existingTags.map((tag) => `  ${tag}`).join('\n')}`
    );

    // Quote refs: Shell.exec runs through /bin/sh after joining argv.
    await this.shell.exec([
      'git',
      'push',
      'origin',
      ...existingTags.map((tag) => `"refs/tags/${tag}"`)
    ]);
  }

  protected syncWorkspaces(workspaces: WorkspaceInterface[]): void {
    let newWorkspaces = this.mergeWorkspaces(workspaces);

    if (this.ignoreNonUpdatedPackages) {
      // Dependents were only tracked for git restore; drop them so PR title,
      // body, and release-tag-${count} reflect directly changed packages only.
      newWorkspaces = newWorkspaces.filter(
        (workspace) => !workspace.dependencyRelease
      );
    } else {
      newWorkspaces = this.refreshDependencyReleaseChangelogs(newWorkspaces);
    }

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

  /**
   * Rebuild `dependencyRelease` changelogs after source packages have `newVersion`.
   *
   * Workspaces appends dependents before `changeset version`, so the template can
   * only use a provisional version. Once mergeWorkspaces reads bumped versions
   * from disk, rewrite each dependent changelog with the real source bump.
   */
  protected refreshDependencyReleaseChangelogs(
    workspaces: WorkspaceInterface[]
  ): WorkspaceInterface[] {
    const byName = new Map(
      workspaces.map((workspace) => [workspace.name, workspace])
    );
    const template =
      this.config.dependencyReleaseTemplate ||
      this.context.parameters.changesetVersion?.dependencyReleaseTemplate ||
      releaseJson.changesetVersion.dependencyReleaseTemplate;

    return workspaces.map((workspace) => {
      if (!workspace.dependencyRelease || !workspace.dependencyReleaseOf) {
        return workspace;
      }

      const source = byName.get(workspace.dependencyReleaseOf);
      if (!source) {
        return workspace;
      }

      const changelog = this.context.format(template, {
        name: source.name,
        oldVersion: source.version,
        newVersion: source.newVersion || source.version
      });

      if (changelog === workspace.changelog) {
        return workspace;
      }

      return createWorkspaceValue({
        name: workspace.name,
        path: workspace.path,
        root: workspace.root,
        version: workspace.version,
        newVersion: workspace.newVersion,
        packageJson: workspace.packageJson,
        rootPath: this.context.rootPath,
        changelog,
        dependencyRelease: workspace.dependencyRelease,
        dependencyReleaseOf: workspace.dependencyReleaseOf,
        lastTag: workspace.lastTag,
        tagName: workspace.tagName
      });
    });
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
        dependencyReleaseOf: workspace.dependencyReleaseOf,
        lastTag: workspace.lastTag
      });

      // Always derive tagName from the on-disk release version.
      // Version mode: disk was bumped (newVersion may differ from version).
      // Publish mode: disk is already the release version (newVersion === version).
      const releaseVersion = newWorkspace.newVersion || newWorkspace.version;
      if (releaseVersion) {
        newWorkspace.tagName = this.generateTagName({
          ...newWorkspace,
          version: releaseVersion
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
    const labels = this.getIncrementLabels();

    if (labels.includes('increment:major')) {
      return 'major';
    }

    if (labels.includes('increment:minor')) {
      return 'minor';
    }

    if (labels.includes('increment:patch')) {
      return 'patch';
    }

    return (
      this.config.increment ||
      this.context.parameters.changesetVersion?.increment ||
      releaseJson.changesetVersion.increment
    );
  }

  /**
   * Labels that can override semver increment.
   *
   * Prefer explicit `workspaces.changeLabels`, then fall back to the PR labels
   * from `GITHUB_EVENT_PATH` when running in GitHub Actions after a PR merge.
   */
  protected getIncrementLabels(): string[] {
    const fromConfig = this.context.parameters.workspaces?.changeLabels;
    if (Array.isArray(fromConfig) && fromConfig.length > 0) {
      return fromConfig.filter(
        (label): label is string => typeof label === 'string'
      );
    }

    return this.readGithubEventLabelNames();
  }

  protected readGithubEventLabelNames(): string[] {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath || !existsSync(eventPath)) {
      return [];
    }

    try {
      const event = JSON.parse(readFileSync(eventPath, 'utf8')) as {
        pull_request?: { labels?: Array<{ name?: string }> };
      };
      const labels = event.pull_request?.labels;
      if (!Array.isArray(labels)) {
        return [];
      }

      return labels
        .map((label) => label?.name)
        .filter(
          (name): name is string => typeof name === 'string' && name.length > 0
        );
    } catch (error) {
      this.logger.debug('Failed to read labels from GITHUB_EVENT_PATH', error);
      return [];
    }
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
