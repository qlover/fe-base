import ReleaseContext from '../implments/ReleaseContext';
import Plugin from './Plugin';
import conventionalChangelog from 'conventional-changelog';
import { WorkspaceValue } from './workspaces/Workspaces';
import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';

export interface ChangelogProps {
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

  tagTemplate?: string;
  tagPrefix?: string;
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
}

const defaultOptions = {
  preset: {
    name: 'angular',
    types: [
      { type: 'feat', section: '✨ Features', hidden: false },
      { type: 'fix', section: '🐞 Bug Fixes', hidden: false },
      { type: 'chore', section: '🔧 Chores', hidden: false },
      { type: 'docs', section: '📝 Documentation', hidden: false },
      { type: 'refactor', section: '♻️ Refactors', hidden: false },
      { type: 'perf', section: '🚀 Performance', hidden: false },
      { type: 'test', section: '🚨 Tests', hidden: false },
      { type: 'style', section: '🎨 Styles', hidden: false },
      { type: 'ci', section: '🔄 CI', hidden: false },
      { type: 'build', section: '🚧 Build', hidden: false },
      { type: 'revert', section: '⏪ Reverts', hidden: false },
      { type: 'release', section: '🔖 Releases', hidden: false }
    ]
  }
};

const contentTmplate = "---\n'${name}': '${increment}'\n---\n${changelog}";

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
      tagTemplate: '${packageJson.name}-v${version}',
      tagPrefix: '${packageJson.name}',
      tagMatch: '${packageJson.name}-v*',
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

  override async onExec(): Promise<void> {
    const workspaces = this.context.workspaces!;

    const changelogs = await Promise.all(
      workspaces.map((workspace) => this.generate(workspace))
    );

    this.logger.debug('changelogs', changelogs);

    this.context.setWorkspaces(changelogs);

    // create changeset files
    await Promise.all(
      changelogs.map((changelog) => this.generateChangesetFile(changelog))
    );

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
    const options: Parameters<typeof conventionalChangelog>[0] = {
      releaseCount: 1,
      tagPrefix: this.getTagPrefix(workspace),
      warn: this.logger.warn.bind(this.logger),
      preset: defaultOptions.preset.name
    };
    const context: Parameters<typeof conventionalChangelog>[1] = {
      version: workspace.version
    };
    const gitRawCommitsOpts: Parameters<typeof conventionalChangelog>[2] = {
      debug: this.logger.debug.bind(this.logger),
      from: lastTag
    };
    const parserOpts: Parameters<typeof conventionalChangelog>[3] = {};
    const writerOpts: Parameters<typeof conventionalChangelog>[4] = {};

    return new Promise((resolve, reject) => {
      let log = '';

      conventionalChangelog(
        options,
        context,
        gitRawCommitsOpts,
        parserOpts,
        writerOpts
      )
        .on('data', (chunk) => {
          log += chunk.toString();
        })
        .on('end', () => {
          resolve(this.tranformChangelog(log, defaultOptions.preset.types));
        })
        .on('error', reject);
    });
  }

  private tranformChangelog(
    changelog: string,
    _types: { type: string; section?: string; hidden?: boolean }[]
  ): string {
    // TODO:
    return changelog;
  }

  async generate(workspace: WorkspaceValue): Promise<WorkspaceValue> {
    const tagName = await this.getTagName(workspace);

    this.logger.verbose('tagName is:', tagName);

    const changelog = await this.createChangelog({
      workspace,
      lastTag: tagName
    });

    return {
      ...workspace,
      tagName,
      changelog
    };
  }

  private async generateTagName(workspace: WorkspaceValue): Promise<string> {
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
      const currentTagPattern = await this.generateTagName(workspace);
      const tagMatch = this.shell.format(
        this.getConfig('tagMatch') as string,
        workspace as unknown as Record<string, string>
      );

      // use git for-each-ref command to get tags and their creation time
      const tagsOutput = await this.shell.exec(
        `git for-each-ref --sort=-creatordate --format "%(refname:short)|%(creatordate:iso8601)" "refs/tags/${tagMatch}"`,
        { dryRun: false }
      );

      this.logger.debug('tagsOutput', tagsOutput);

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
      const fallbackTag = await this.generateTagName(workspace);
      return fallbackTag;
    }
  }

  async generateChangesetFile(workspace: WorkspaceValue): Promise<void> {
    const { name, version } = workspace;
    const changesetName = `${name}-${version}`.replace(/[\/\\]/g, '_');
    const changesetPath = join(this.changesetRoot, `${changesetName}.md`);

    const fileContent = this.shell.format(contentTmplate, {
      ...workspace,
      increment: this.getConfig('increment')
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
