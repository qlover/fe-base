import ReleaseContext from '../implments/ReleaseContext';
import Plugin from './Plugin';
import { WorkspaceValue } from './workspaces/Workspaces';
import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import { WorkspaceCreator } from './workspaces/WorkspaceCreator';
import {
  GitChangelog,
  GitChangelogOptions
} from '../implments/gitChangeLog/gitChangeLog';
export interface ChangelogProps extends GitChangelogOptions {
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
   * The options of the git changelog
   */
  gitChangelogOptions?: GitChangelogOptions;
}

const contentTmplate = "---\n'${name}': '${increment}'\n---\n\n${changelog}";

/**
 * @class Changelog
 * @description
 * @extends Plugin
 */
export default class Changelog extends Plugin<ChangelogProps> {
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

  get changesetRoot(): string {
    return join(this.context.rootPath, this.getConfig('changesetRoot'));
  }

  override enabled(): boolean {
    return !this.getConfig('skip');
  }

  override async onBefore(): Promise<void> {
    if (!existsSync(this.changesetRoot)) {
      throw new Error(
        `Changeset directory ${this.changesetRoot} does not exist`
      );
    }

    this.logger.debug(`${this.changesetRoot} exists`);
  }

  mergeWorkspaces(workspaces: WorkspaceValue[]): WorkspaceValue[] {
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

  override async onExec(): Promise<void> {
    const workspaces = await this.step({
      label: 'Generate Changelogs',
      task: () =>
        Promise.all(
          this.context.workspaces!.map((workspace) =>
            this.generateChangelog(workspace)
          )
        )
    });

    // create changeset files
    if (!this.getConfig('skipChangeset')) {
      await this.step({
        label: 'Changeset Version',
        task: () =>
          Promise.all(
            workspaces.map((changelog) => this.generateChangesetFile(changelog))
          )
      });

      await this.context.runChangesetsCli('version', ['--no-changelog']);
    } else {
      this.logger.debug('Skip generate changeset files');
    }

    const newWorkspaces = this.mergeWorkspaces(workspaces);

    this.logger.debug('new workspaces', newWorkspaces);

    this.context.setWorkspaces(newWorkspaces);
  }

  getTagPrefix(workspace: WorkspaceValue): string {
    return this.shell.format(
      this.getConfig('tagPrefix') as string,
      workspace as unknown as Record<string, string>
    );
  }

  async createChangelog({
    lastTag,
    workspace
  }: {
    lastTag: string;
    workspace: WorkspaceValue;
  }): Promise<string> {
    const gitChangelog = new GitChangelog(this.context.shell, {
      ...this.getConfig('gitChangelogOptions'),
      from: lastTag,
      directory: workspace.path
    });

    return gitChangelog.getPRCommits().then((prCommits) => {
      const flatCommits = gitChangelog.flatCommits(prCommits);
      return gitChangelog.formatFlatCommits(flatCommits).join('\n');
    });
  }

  async generateChangelog(workspace: WorkspaceValue): Promise<WorkspaceValue> {
    // FIXME: where to get the tagName?
    const tagName = await this.getTagName(workspace);

    this.logger.verbose('tagName is:', tagName);

    const changelog = await this.createChangelog({
      workspace,
      lastTag: tagName
    });

    return {
      ...workspace,
      lastTag: tagName,
      changelog
    };
  }

  private generateTagName(workspace: WorkspaceValue): string {
    try {
      const tagTemplate = this.getConfig('tagTemplate') as string;

      return this.shell.format(
        tagTemplate,
        workspace as unknown as Record<string, string>
      );
    } catch (error) {
      console.error(`Error generating tag name for ${workspace.name}:`, error);
      return `${workspace.name}-v0.0.0`;
    }
  }

  async getTagName(workspace: WorkspaceValue): Promise<string> {
    try {
      const currentTagPattern = this.generateTagName(workspace);
      const tagMatch = this.shell.format(
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

  getIncrement(): string {
    const lables = this.context.getConfig('workspaces.changeLabels');

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

  async generateChangesetFile(workspace: WorkspaceValue): Promise<void> {
    const { name, version } = workspace;
    const changesetName = `${name}-${version}`.replace(/[\/\\]/g, '_');
    const changesetPath = join(this.changesetRoot, `${changesetName}.md`);
    const increment = this.getIncrement();

    this.logger.verbose('increment is:', [increment]);

    const fileContent = this.shell.format(contentTmplate, {
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
