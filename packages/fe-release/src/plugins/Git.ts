import { EOL } from 'node:os';
import Plugin from '../Plugin';
import { last } from 'lodash';
import gitUrlParse from 'git-url-parse';
import { GitRepoInfo } from '../type';

const options = { write: false };
const changelogFallback = 'git log --pretty=format:"* %s (%h)"';

export default class Git extends Plugin {
  readonly pluginName = 'git';

  /**
   * Parse the git url
   *
   * @param remoteUrl - The remote url
   * @returns The git context
   */
  static parseGitUrl(remoteUrl?: string): GitRepoInfo {
    const normalizedUrl = (remoteUrl || '')
      .replace(/^[A-Z]:\\\\/, 'file://') // Assume file protocol for Windows drive letters
      .replace(/^\//, 'file://') // Assume file protocol if only /path is given
      .replace(/\\+/g, '/'); // Replace forward with backslashes
    const parsedUrl = gitUrlParse(normalizedUrl);
    const { resource: host, name: project, protocol, href: remote } = parsedUrl;
    const owner =
      protocol === 'file' ? last(parsedUrl.owner.split('/')) : parsedUrl.owner; // Fix owner for file protocol
    const repository = `${owner}/${project}`;
    return { host, owner, project, protocol, remote, repository };
  }

  /**
   * On before
   *
   * @override
   */
  async onBefore(): Promise<void> {
    const gitRemoteUrl = await this.getRemoteUrl();
    await this.fetch(gitRemoteUrl);

    const gitBranchName = await this.getBranchName();
    const gitRepo = Git.parseGitUrl(gitRemoteUrl);

    this.setConfig({
      git: {
        remoteUrl: gitRemoteUrl,
        repo: gitRepo,
        branchName: gitBranchName || ''
      }
    });

    const latestTag = await this.getLatestTagName();
    const secondLatestTag = !this.config.isIncrement
      ? await this.getSecondLatestTagName(latestTag)
      : null;

    const tagTemplate =
      this.options.tagName ||
      ((latestTag || '').match(/^v/) ? 'v${version}' : '${version}');
    this.config.setContext({ latestTag, secondLatestTag, tagTemplate });
  }

  getName(): string {
    return this.getConfig('repo.project', '');
  }

  getLatestVersion(): string | null {
    const { tagTemplate, latestTag } = this.config.getContext();
    const prefix = this.shell.format(
      tagTemplate.replace(/\$\{version\}/, ''),
      this.config.getContext()
    );
    return latestTag ? latestTag.replace(prefix, '').replace(/^v/, '') : null;
  }

  isRemoteName(remoteUrlOrName: string): boolean {
    return !!remoteUrlOrName && !remoteUrlOrName.includes('/');
  }

  async getRemoteUrl(): Promise<string> {
    const remoteNameOrUrl =
      this.options.pushRepo || (await this.getRemote()) || 'origin';
    return this.isRemoteName(remoteNameOrUrl)
      ? this.exec(`git remote get-url ${remoteNameOrUrl}`, { options }).catch(
          () =>
            this.exec(`git config --get remote.${remoteNameOrUrl}.url`, {
              options
            }).catch(() => null)
        )
      : remoteNameOrUrl;
  }

  async getRemote(): Promise<string | null> {
    const branchName = await this.getBranchName();
    return branchName ? await this.getRemoteForBranch(branchName) : null;
  }

  async getBranchName(): Promise<string | null> {
    return this.exec('git rev-parse --abbrev-ref HEAD', { options }).catch(
      () => null
    );
  }

  async getRemoteForBranch(branch: string): Promise<string | null> {
    return this.exec(`git config --get branch.${branch}.remote`, {
      options
    }).catch(() => null);
  }

  async fetch(remoteUrl: string): Promise<string> {
    return this.exec('git fetch').catch((err) => {
      this.logger.debug(err);
      throw new Error(`Unable to fetch from ${remoteUrl}${EOL}${err.message}`);
    });
  }

  async getLatestTagName(): Promise<string | null> {
    const context = Object.assign({}, this.config.getContext(), {
      version: '*'
    });
    const match = this.shell.format(
      this.options.tagMatch || this.options.tagName || '${version}',
      context
    );
    const exclude = this.options.tagExclude
      ? ` --exclude=${this.shell.format(this.options.tagExclude, context)}`
      : '';
    if (this.options.getLatestTagFromAllRefs) {
      return this.exec(
        `git -c "versionsort.suffix=-" for-each-ref --count=1 --sort=-v:refname --format="%(refname:short)" refs/tags/${match}`,
        { options }
      ).then(
        (stdout) => stdout || null,
        () => null
      );
    } else {
      return this.exec(
        `git describe --tags --match=${match} --abbrev=0${exclude}`,
        { options }
      ).then(
        (stdout) => stdout || null,
        () => null
      );
    }
  }

  async getSecondLatestTagName(latestTag: string): Promise<string | null> {
    const sha = await this.exec(
      `git rev-list ${latestTag || '--skip=1'} --tags --max-count=1`,
      {
        options
      }
    );
    return this.exec(`git describe --tags --abbrev=0 "${sha}^"`, {
      options
    }).catch(() => null);
  }
}
