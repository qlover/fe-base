/**
 * @module Changelog
 * @description Changelog generation and version management plugin
 *
 * This module provides a plugin for generating changelogs and managing
 * version updates in a monorepo environment. It supports both single
 * package and workspace-based repositories.
 *
 * Core Features:
 * - Changelog generation from Git history
 * - Version increment management
 * - Changeset file generation
 * - Tag management
 * - Multi-workspace support
 *
 * @example Basic usage
 * ```typescript
 * const plugin = new Changelog(context, {
 *   increment: 'minor',
 *   tagTemplate: '${name}@${version}'
 * });
 *
 * await plugin.exec();
 * ```
 *
 * @example Workspace configuration
 * ```typescript
 * const plugin = new Changelog(context, {
 *   ignoreNonUpdatedPackages: true,
 *   skipChangeset: false,
 *   changesetRoot: '.changeset'
 * });
 *
 * await plugin.exec();
 * ```
 */
import ReleaseContext from '../implments/ReleaseContext';
import { WorkspacesProps, WorkspaceValue } from './workspaces/Workspaces';
import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import { WorkspaceCreator } from './workspaces/WorkspaceCreator';
import { ExecutorReleaseContext } from '../type';
import { GitChangelogOptions } from '../interface/ChangeLog';
import {
  CHANGELOG_ALL_FIELDS,
  GitChangelog,
  GitChangelogProps
} from '../implments/changelog/GitChangeLog';
import { GitChangelogFormatter } from '../implments/changelog/GitChangelogFormatter';
import {
  ScriptPlugin,
  ScriptPluginProps,
  Shell
} from '@qlover/scripts-context';

export interface ChangelogProps extends GitChangelogOptions, ScriptPluginProps {
  /**
   * The increment of the changelog
   * @default 'patch'
   */
  increment?: string;

  /**
   * Whether to skip the changelog
   *
   * If has changeset file, can be set to true
   * @default false
   */
  skip?: boolean;

  /**
   * Whether to skip the changesets
   * @default false
   */
  skipChangeset?: boolean;

  /**
   * The template of the tag
   * @default '${name}@${version}'
   */
  tagTemplate?: string;

  /**
   * The prefix of the tag
   * @default '${name}'
   */
  tagPrefix?: string;

  /**
   * The match of the tag
   * @default '${name}@*'
   */
  tagMatch?: string;

  /**
   * The commit message of the changelog
   * @default 'chore: update changelog'
   */
  commitMessage?: string;

  /**
   * The root directory of the changeset
   * @default '.changeset'
   */
  changesetRoot?: string;

  /**
   * Whether to ignore non updated packages
   * @default false
   */
  ignoreNonUpdatedPackages?: boolean;
}

const contentTmplate = "---\n'${name}': '${increment}'\n---\n\n${changelog}";

/**
 * @class Changelog
 * @description
 * @extends Plugin
 */
export default class Changelog extends ScriptPlugin<
  ReleaseContext,
  ChangelogProps
> {
  /**
   * Creates a new Changelog plugin instance
   *
   * Initializes the plugin with default configuration values and
   * merges them with provided options.
   *
   * Default values:
   * - increment: 'patch'
   * - changesetRoot: '.changeset'
   * - tagTemplate: '${name}@${version}'
   * - tagPrefix: '${name}'
   * - tagMatch: '${name}@*'
   *
   * @param context - Release context
   * @param props - Plugin configuration
   *
   * @example
   * ```typescript
   * const plugin = new Changelog(context, {
   *   increment: 'minor',
   *   changesetRoot: 'custom/changeset',
   *   tagTemplate: 'v${version}'
   * });
   * ```
   */
  constructor(context: ReleaseContext, props: ChangelogProps) {
    super(context, 'changelog', {
      increment: 'patch',
      changesetRoot: '.changeset',
      tagTemplate: '${name}@${version}',
      tagPrefix: '${name}',
      tagMatch: '${name}@*',
      ...props
    });
  }

  /**
   * Gets the absolute path to the changeset root directory
   *
   * Combines the project root path with the configured changeset
   * directory path.
   *
   * @returns Absolute path to changeset directory
   *
   * @example
   * ```typescript
   * const root = plugin.changesetRoot;
   * // '/path/to/project/.changeset'
   * ```
   */
  public get changesetRoot(): string {
    return join(this.context.rootPath, this.getConfig('changesetRoot'));
  }

  /**
   * Gets the path to the changeset configuration file
   *
   * Returns the absolute path to the config.json file in the
   * changeset directory.
   *
   * @returns Path to changeset config file
   *
   * @example
   * ```typescript
   * const configPath = plugin.changesetConfigPath;
   * // '/path/to/project/.changeset/config.json'
   * ```
   */
  public get changesetConfigPath(): string {
    return join(this.changesetRoot, 'config.json');
  }

  /**
   * Determines if the plugin should be enabled
   *
   * Plugin is enabled unless explicitly skipped via configuration.
   * This allows for conditional changelog generation.
   *
   * @returns True if plugin should be enabled
   *
   * @example
   * ```typescript
   * const plugin = new Changelog(context, { skip: true });
   * plugin.enabled(); // false
   *
   * const plugin2 = new Changelog(context, {});
   * plugin2.enabled(); // true
   * ```
   */
  public override enabled(): boolean {
    return !this.getConfig('skip');
  }

  /**
   * Plugin initialization hook
   *
   * Verifies that the changeset directory exists before proceeding
   * with changelog generation.
   *
   * @throws Error if changeset directory does not exist
   *
   * @example
   * ```typescript
   * const plugin = new Changelog(context, {
   *   changesetRoot: '.changeset'
   * });
   *
   * await plugin.onBefore();
   * // Throws if .changeset directory doesn't exist
   * ```
   */
  public override async onBefore(): Promise<void> {
    if (!existsSync(this.changesetRoot)) {
      throw new Error(
        `Changeset directory ${this.changesetRoot} does not exist`
      );
    }

    this.logger.debug(`${this.changesetRoot} exists`);
  }

  /**
   * Updates workspace information with latest versions
   *
   * Reads the latest version information from each workspace's
   * package.json and updates the workspace objects with new
   * versions and tag names.
   *
   * @param workspaces - Array of workspace configurations
   * @returns Updated workspace configurations
   *
   * @example
   * ```typescript
   * const workspaces = [
   *   { name: 'pkg-a', path: 'packages/a', version: '1.0.0' }
   * ];
   *
   * const updated = plugin.mergeWorkspaces(workspaces);
   * // [
   * //   {
   * //     name: 'pkg-a',
   * //     path: 'packages/a',
   * //     version: '1.1.0',  // Updated version
   * //     tagName: 'pkg-a@1.1.0'
   * //   }
   * // ]
   * ```
   */
  public mergeWorkspaces(workspaces: WorkspaceValue[]): WorkspaceValue[] {
    return workspaces.map((workspace) => {
      const newPackgeJson = WorkspaceCreator.toWorkspace(
        {
          path: workspace.path
        },
        this.context.rootPath
      );

      const newWorkspace = {
        ...workspace,
        version: newPackgeJson.version
      };

      newWorkspace.tagName = this.generateTagName(newWorkspace);

      return newWorkspace;
    });
  }

  /**
   * Main plugin execution hook
   *
   * Generates changelogs for all workspaces in parallel and updates
   * the context with the results.
   *
   * Process:
   * 1. Generate changelogs for each workspace
   * 2. Update context with new workspace information
   *
   * @param _context - Execution context
   *
   * @example
   * ```typescript
   * const plugin = new Changelog(context, {});
   * await plugin.onExec(execContext);
   * // Generates changelogs for all workspaces
   * ```
   */
  public override async onExec(
    _context: ExecutorReleaseContext
  ): Promise<void> {
    const workspaces = await this.step({
      label: 'Generate Changelogs',
      task: () =>
        Promise.all(
          this.context.workspaces!.map((workspace) =>
            this.generateChangelog(workspace)
          )
        )
    });

    this.context.setWorkspaces(workspaces);
  }

  /**
   * Success hook after plugin execution
   *
   * Handles post-changelog generation tasks:
   * 1. Creates changeset files (if not skipped)
   * 2. Updates package versions
   * 3. Restores unchanged packages (if configured)
   * 4. Updates workspace information
   *
   * @example
   * ```typescript
   * const plugin = new Changelog(context, {
   *   skipChangeset: false,
   *   ignoreNonUpdatedPackages: true
   * });
   *
   * await plugin.onSuccess();
   * // - Creates changeset files
   * // - Updates versions
   * // - Restores unchanged packages
   * ```
   */
  public override async onSuccess(): Promise<void> {
    const workspaces = this.context.workspaces!;
    // create changeset files
    if (!this.getConfig('skipChangeset')) {
      await this.step({
        label: 'Changeset Version',
        task: () =>
          Promise.all(
            workspaces.map((changelog) => this.generateChangesetFile(changelog))
          )
      });

      await this.context.runChangesetsCli('version', [
        '--no-changelog',
        '--update-dependencies'
      ]);

      if (this.getConfig('ignoreNonUpdatedPackages')) {
        await this.restoreIgnorePackages();
      }
    } else {
      this.logger.debug('Skip generate changeset files');
    }

    const newWorkspaces = this.mergeWorkspaces(workspaces);

    this.logger.debug('new workspaces', newWorkspaces);

    this.context.setWorkspaces(newWorkspaces);
  }

  /**
   * Restores unchanged packages to their original state
   *
   * When ignoreNonUpdatedPackages is enabled, this method:
   * 1. Identifies packages without changes
   * 2. Uses git restore to revert them to original state
   *
   * @example
   * ```typescript
   * // With changed and unchanged packages
   * context.options.workspaces = {
   *   packages: ['pkg-a', 'pkg-b', 'pkg-c'],
   *   changedPaths: ['pkg-a', 'pkg-b']
   * };
   *
   * await plugin.restoreIgnorePackages();
   * // Restores 'pkg-c' to original state
   * ```
   */
  public async restoreIgnorePackages(): Promise<void> {
    const { changedPaths = [], packages = [] } = this.context.getOptions(
      'workspaces'
    ) as WorkspacesProps;

    const noChangedPackages = packages
      .filter((pkgPath) => !changedPaths.includes(pkgPath))
      .map(
        (pkgPath) =>
          WorkspaceCreator.toWorkspace({ path: pkgPath }, this.context.rootPath)
            .path
      );

    this.logger.debug('noChangedPackages', noChangedPackages);

    if (noChangedPackages.length > 0) {
      await this.shell.exec(['git', 'restore', ...noChangedPackages]);
    }
  }

  /**
   * Gets the tag prefix for a workspace
   *
   * Formats the configured tag prefix template with workspace
   * information. Used for generating Git tag names.
   *
   * @param workspace - Workspace configuration
   * @returns Formatted tag prefix
   *
   * @example
   * ```typescript
   * const workspace = {
   *   name: 'pkg-a',
   *   version: '1.0.0'
   * };
   *
   * const prefix = plugin.getTagPrefix(workspace);
   * // With default template: 'pkg-a'
   * // With custom template: 'v1.0.0'
   * ```
   */
  public getTagPrefix(workspace: WorkspaceValue): string {
    return Shell.format(
      this.getConfig('tagPrefix') as string,
      workspace as unknown as Record<string, string>
    );
  }

  /**
   * Generates a changelog for a workspace
   *
   * Creates a changelog by:
   * 1. Getting the appropriate tag name
   * 2. Retrieving commits since last tag
   * 3. Formatting commits into changelog entries
   *
   * @param workspace - Workspace configuration
   * @returns Updated workspace with changelog
   *
   * @example
   * ```typescript
   * const workspace = {
   *   name: 'pkg-a',
   *   path: 'packages/a',
   *   version: '1.0.0'
   * };
   *
   * const updated = await plugin.generateChangelog(workspace);
   * // {
   * //   ...workspace,
   * //   lastTag: 'pkg-a@1.0.0',
   * //   changelog: '- feat: new feature\n- fix: bug fix'
   * // }
   * ```
   */
  public async generateChangelog(
    workspace: WorkspaceValue
  ): Promise<WorkspaceValue> {
    // FIXME: where to get the tagName?
    let tagName = await this.getTagName(workspace);

    if (workspace.lastTag) {
      this.logger.warn(`${workspace.name} has lastTag: ${workspace.lastTag}`);
      tagName = workspace.lastTag;
    }

    this.logger.debug('tagName is:', tagName);

    const baseConfig = this.getConfig() as ChangelogProps;
    const props: GitChangelogProps = {
      ...baseConfig,
      from: tagName,
      directory: workspace.path,
      shell: this.context.shell,
      fields: CHANGELOG_ALL_FIELDS,
      logger: this.logger
    };

    const gitChangelog = new GitChangelog(props);

    const commits = await gitChangelog.getCommits(props);

    const changelog = new GitChangelogFormatter(props).format(commits);

    return {
      ...workspace,
      lastTag: tagName,
      changelog: changelog.join('\n')
    };
  }

  /**
   * Generates a tag name for a workspace
   *
   * Uses the configured tag template to generate a tag name
   * for the workspace. Handles errors by providing a fallback.
   *
   * @param workspace - Workspace configuration
   * @returns Generated tag name
   *
   * @example
   * ```typescript
   * // With default template
   * const tag = plugin.generateTagName({
   *   name: 'pkg-a',
   *   version: '1.0.0'
   * });
   * // 'pkg-a@1.0.0'
   *
   * // With error (fallback)
   * const tag = plugin.generateTagName({
   *   name: 'pkg-a'
   * });
   * // 'pkg-a-v0.0.0'
   * ```
   * @private
   */
  private generateTagName(workspace: WorkspaceValue): string {
    try {
      const tagTemplate = this.getConfig('tagTemplate') as string;

      return Shell.format(
        tagTemplate,
        workspace as unknown as Record<string, string>
      );
    } catch (error) {
      console.error(`Error generating tag name for ${workspace.name}:`, error);
      return `${workspace.name}-v0.0.0`;
    }
  }

  /**
   * Gets the appropriate tag name for a workspace
   *
   * Attempts to find the latest tag for the workspace, falling back
   * to generating a new tag if none exists. Uses git commands to
   * find and sort tags by creation date.
   *
   * Process:
   * 1. Generate current tag pattern
   * 2. Search for existing tags matching pattern
   * 3. Return latest tag or generate new one
   *
   * @param workspace - Workspace configuration
   * @returns Promise resolving to tag name
   *
   * @example
   * ```typescript
   * // With existing tags
   * const tag = await plugin.getTagName({
   *   name: 'pkg-a',
   *   version: '1.0.0'
   * });
   * // Returns latest matching tag: 'pkg-a@0.9.0'
   *
   * // Without existing tags
   * const tag = await plugin.getTagName({
   *   name: 'pkg-b',
   *   version: '1.0.0'
   * });
   * // Returns new tag: 'pkg-b@1.0.0'
   * ```
   */
  public async getTagName(workspace: WorkspaceValue): Promise<string> {
    try {
      const currentTagPattern = this.generateTagName(workspace);
      const tagMatch = Shell.format(
        this.getConfig('tagMatch') as string,
        workspace as unknown as Record<string, string>
      );

      // use git for-each-ref command to get tags and their creation time
      const tagsOutput = await this.shell.exec(
        `git for-each-ref --sort=-creatordate --format "%(refname:short)|%(creatordate:iso8601)" "refs/tags/${tagMatch}"`,
        { dryRun: false }
      );

      if (!tagsOutput) {
        return currentTagPattern;
      }

      const tags = tagsOutput.split('\n').filter(Boolean);

      if (tags.length === 0) {
        // if no tags found, return the initial tag based on the current package.json
        return currentTagPattern;
      }

      // get the latest tag (the first one is the latest because it is sorted by time)
      const latestTag = tags[0].split('|')[0];
      return latestTag;
    } catch (error) {
      console.error(`Error getting tag for ${workspace.name}:`, error);
      const fallbackTag = this.generateTagName(workspace);
      return fallbackTag;
    }
  }

  /**
   * Determines the version increment type
   *
   * Checks for increment labels in the following order:
   * 1. 'increment:major' label
   * 2. 'increment:minor' label
   * 3. Configured increment value
   * 4. Default to 'patch'
   *
   * @returns Version increment type
   *
   * @example
   * ```typescript
   * // With labels
   * context.options.workspaces.changeLabels = ['increment:major'];
   * plugin.getIncrement(); // 'major'
   *
   * // With configuration
   * const plugin = new Changelog(context, { increment: 'minor' });
   * plugin.getIncrement(); // 'minor'
   *
   * // Default
   * plugin.getIncrement(); // 'patch'
   * ```
   */
  public getIncrement(): string {
    const lables = this.context.getOptions('workspaces.changeLabels');

    if (Array.isArray(lables) && lables.length > 0) {
      if (lables.includes('increment:major')) {
        return 'major';
      }

      if (lables.includes('increment:minor')) {
        return 'minor';
      }
    }

    const increment = this.getConfig('increment', 'patch');
    // TODO: support a version number

    return increment;
  }

  /**
   * Generates a changeset file for a workspace
   *
   * Creates a changeset file containing version increment
   * information and changelog content. Handles dry run mode
   * and existing files.
   *
   * File format:
   * ```yaml
   * ---
   * 'package-name': 'increment-type'
   * ---
   *
   * changelog content
   * ```
   *
   * @param workspace - Workspace configuration
   *
   * @example
   * ```typescript
   * const workspace = {
   *   name: 'pkg-a',
   *   version: '1.0.0',
   *   changelog: '- feat: new feature'
   * };
   *
   * await plugin.generateChangesetFile(workspace);
   * // Creates .changeset/pkg-a-1.0.0.md
   * ```
   *
   * @example Dry run
   * ```typescript
   * context.dryRun = true;
   * await plugin.generateChangesetFile(workspace);
   * // Logs file content without creating file
   * ```
   */
  public async generateChangesetFile(workspace: WorkspaceValue): Promise<void> {
    const { name, version } = workspace;
    // eslint-disable-next-line no-useless-escape
    const changesetName = `${name}-${version}`.replace(/[\/\\]/g, '_');
    const changesetPath = join(this.changesetRoot, `${changesetName}.md`);
    const increment = this.getIncrement();

    this.logger.debug('increment is:', [increment]);

    const fileContent = Shell.format(contentTmplate, {
      ...workspace,
      increment
    });

    if (this.context.dryRun) {
      this.logger.info(
        `Changeset [${changesetPath}] will be created, content is:`
      );
      this.logger.log(fileContent);
      return;
    }

    if (existsSync(changesetPath)) {
      this.logger.info(`Changeset ${changesetName} already exists`);
      return;
    }

    writeFileSync(changesetPath, fileContent, 'utf-8');
  }
}
