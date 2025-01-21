import {
  ReleaseConfig,
  ReleaseItInstanceOptions,
  ReleaseItInstanceResult,
  ReleaseItInstanceType
} from '../type';
import Plugin from '../Plugin';
import ReleaseContext from '../ReleaseContext';
import get from 'lodash/get';
import { Octokit } from '@octokit/rest';
import { FeConfig } from '@qlover/scripts-context';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';

export type CreateReleaseResult = {
  tagName: string;
  releaseBranch: string;
};

class Util {
  /**
   * Checks if the provided value is a valid string.
   *
   * A valid string is defined as a non-empty string.
   *
   * @param value - The value to check.
   * @returns True if the value is a valid string, otherwise false.
   */
  static isValidString(value: unknown): boolean {
    return !!value && isString(value);
  }

  /**
   * Parses the pull request number from the given output string.
   *
   * This method uses a regular expression to extract the pull request number from a GitHub URL.
   *
   * @param output - The output string containing the pull request URL.
   * @returns The extracted pull request number, or an empty string if not found.
   */
  static parserPRNumber(output: string): string {
    const prUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/;
    const match = output.match(prUrlPattern);
    return (match && match[1]) || '';
  }

  /**
   * Retrieves user information from the provided package and front-end configuration.
   *
   * This method extracts the repository name and author name from the package and configuration.
   *
   * @param pkg - The package information, expected to have a repository and author.
   * @param feConfig - The front-end configuration.
   * @returns An object containing the repository name and author name.
   * @throws Will throw an error if the author name or repository name is invalid.
   */
  static getUserInfo(
    pkg: Record<string, unknown>,
    feConfig: FeConfig
  ): { repoName: string; authorName: string } {
    const { repository, author } = pkg;
    const localAuthor = feConfig.author || author;

    const authorName = isPlainObject(localAuthor)
      ? get(localAuthor, 'name')
      : localAuthor;

    if (!Util.isValidString(authorName)) {
      throw new Error('please set .fe-config.release valid author');
    }

    const repoName =
      // @ts-expect-error
      feConfig.repository?.url.split('/').pop()?.replace('.git', '') ||
      // @ts-expect-error
      repository.url.split('/').pop()?.replace('.git', '');
    if (!Util.isValidString(repoName)) {
      throw new Error('please set .fe-config.release repository');
    }

    // @ts-expect-error
    return { repoName, authorName };
  }
}

export default class CreatePublishPR extends Plugin {
  readonly pluginName = 'create-publish-pr';
  private packageJson: Record<string, unknown> = {};
  private octokit?: Octokit;

  /**
   * release merge real branch name
   *
   * @default `master`
   */
  private sourceBranch: string;

  /**
   * Release environment
   *
   * @default `development`
   */

  private releaseEnv: string;

  /**
   * Auto merge release PR
   *
   * @default `false`
   */
  private autoMergeReleasePR: boolean;

  /**
   * Dry run PR number
   *
   * @default `999999`
   */
  private dryRunPRNumber: string = '999999';

  constructor(context: ReleaseContext) {
    super(context);

    this.autoMergeReleasePR = this.getConfig(
      'autoMergeReleasePR',
      false
    ) as boolean;

    this.packageJson = this.getConfig('packageJson') as Record<string, unknown>;
    this.sourceBranch =
      this.getEnv('FE_RELEASE_BRANCH') ??
      this.getEnv('FE_RELEASE_SOURCE_BRANCH') ??
      'master';

    this.releaseEnv =
      (this.getConfig('releaseEnv') as string) ??
      this.getEnv('NODE_ENV') ??
      'development';
  }

  async onBefore(): Promise<void> {}

  /**
   * @override
   */
  async onSuccess(): Promise<void> {
    const releaseResult = await this.step({
      label: 'Create Changelog and Version',
      task: () => this.createChangelogAndVersion()
    });

    const { tagName, releaseBranch } = await this.step({
      label: 'Create Release Branch',
      task: () => this.createReleaseBranch(releaseResult)
    });

    const prNumber = await this.step({
      label: 'Create Release PR',
      task: () => this.createReleasePR(tagName, releaseBranch, releaseResult)
    });

    if (this.autoMergeReleasePR) {
      // this.logger.obtrusive('Auto Merge Release PR...');
      await this.step({
        label: `Merge Release PR(${prNumber})`,
        task: () => this.autoMergePR(prNumber, releaseBranch)
      });

      await this.step({
        label: `Checked Release PR(${prNumber})`,
        task: () => this.checkedPullRequest(prNumber, releaseBranch)
      });
    } else {
      this.logger.info(
        `Please manually merge PR(#${prNumber}) and complete the publishing process afterwards`
      );
    }
  }

  /**
   * Automatically merges a pull request.
   *
   * @param prNumber - The pull request number to merge.
   * @param releaseBranch - The branch to merge into.
   */
  async autoMergePR(prNumber: string, releaseBranch: string): Promise<void> {
    if (!prNumber) {
      this.logger.error('Failed to create Pull Request.', prNumber);
      return;
    }

    const { repoName, authorName } = this.getUserInfo();
    const mergeMethod = this.getConfig('autoMergeType', 'squash') as
      | 'squash'
      | 'merge'
      | 'rebase';

    if (this.context.dryRun) {
      this.logger.info(
        `[DRY RUN] Would merge PR #${prNumber} with method '${mergeMethod}' in repo ${authorName}/${repoName}, branch ${releaseBranch}`
      );
      return;
    }

    const octokit = await this.getOctokit();
    await octokit.pulls.merge({
      owner: authorName,
      repo: repoName,
      pull_number: Number(prNumber),
      merge_method: mergeMethod
    });
  }

  /**
   * Checks the status of a pull request.
   *
   * @param prNumber - The pull request number to check.
   * @param releaseBranch - The branch to check against.
   */
  async checkedPullRequest(
    prNumber: string,
    releaseBranch: string
  ): Promise<void> {
    try {
      const { repoName, authorName } = this.getUserInfo();
      const octokit = await this.getOctokit();

      // Get PR information
      await octokit.rest.pulls.get({
        owner: authorName,
        repo: repoName,
        pull_number: Number(prNumber)
      });

      // Delete remote branch
      await octokit.rest.git.deleteRef({
        owner: authorName,
        repo: repoName,
        ref: `heads/${releaseBranch}`
      });

      this.logger.info(`Branch ${releaseBranch} has been deleted`);
    } catch (error) {
      if ((error as { status: number }).status === 404) {
        this.logger.warn(
          `PR #${prNumber} or branch ${releaseBranch} not found`
        );
        return;
      }
      this.logger.error('Failed to check PR or delete branch', error);
      throw error;
    }
  }

  /**
   * Retrieves the Octokit instance, creating it if necessary.
   *
   * @returns The Octokit instance for GitHub API interactions.
   * @throws If the GitHub token is not set.
   */
  async getOctokit(): Promise<Octokit> {
    if (this.octokit) {
      return this.octokit;
    }

    const ghToken = this.getConfig('githubToken') as string;
    if (!ghToken) {
      throw new Error('Github token is not set');
    }

    const { Octokit } = await import('@octokit/rest');

    const octokit = new Octokit({ auth: ghToken });

    this.octokit = octokit;

    return octokit;
  }

  async createReleaseBranch(
    releaseResult: ReleaseItInstanceResult
  ): Promise<CreateReleaseResult> {
    const { tagName } = await this.checkTag(releaseResult);
    const releaseBranch = this.getReleaseBranch(tagName);

    this.logger.verbose('PR SourceBranch is:', this.sourceBranch);
    this.logger.verbose('PR TargetBranch is:', releaseBranch);

    await this.shell.exec(`git fetch origin ${this.sourceBranch}`);
    await this.shell.exec(`git merge origin/${this.sourceBranch}`);
    await this.shell.exec(`git checkout -b ${releaseBranch}`);
    await this.shell.exec(`git push origin ${releaseBranch}`);

    return { tagName, releaseBranch };
  }

  getPkg(key: string): unknown {
    return get(this.packageJson, key);
  }

  /**
   * Creates a changelog and version without publishing.
   *
   * @returns The output from the release-it process.
   */
  createChangelogAndVersion(): Promise<ReleaseItInstanceResult> {
    const releaseItInstance = this.getConfig(
      'releaseItInstance'
    ) as ReleaseItInstanceType;

    if (!releaseItInstance) {
      throw new Error('releaseItInstance is not set');
    }

    return releaseItInstance(this.getReleaseItChangelogOptions());
  }

  /**
   * Gets the options for the release-it changelog process.
   *
   * @returns The options for the release-it changelog process.
   */
  getReleaseItChangelogOptions(): ReleaseItInstanceOptions {
    return {
      ci: true,
      increment: 'patch',
      npm: {
        publish: false
      },
      git: {
        requireCleanWorkingDir: false,
        tag: false,
        push: false
      },
      github: {
        release: false
      },
      verbose: true,
      'dry-run': this.context.dryRun
    };
  }

  /**
   * Checks the current tag.
   *
   * @returns The tag name.
   */
  async checkTag(
    releaseResult: ReleaseItInstanceResult
  ): Promise<{ tagName: string }> {
    const tagName = get(releaseResult, 'version') || this.getPkg('version');

    if (typeof tagName !== 'string') {
      throw new Error('Tag name is not a string');
    }

    this.logger.verbose('Created Tag is:', tagName);

    return { tagName };
  }

  /**
   * Gets the release branch based on the tag name.
   *
   * PR merge to source branch
   *
   * eg.
   * release-1.0.0 -> master
   *
   * @param tagName - The tag name for the release.
   * @returns The formatted release branch.
   */
  getReleaseBranch(tagName: string): string {
    const branchNameTpl = this.getConfig('branchName', 'release-${tagName}');

    if (typeof branchNameTpl !== 'string') {
      throw new Error('Branch name template is not a string');
    }

    this.logger.verbose('Release Branch template is:', branchNameTpl);

    return this.shell.format(branchNameTpl, {
      env: this.releaseEnv,
      branch: this.sourceBranch,
      tagName
    });
  }

  /**
   * Creates a release pull request.
   *
   * @param tagName - The tag name for the release.
   * @param releaseBranch - The branch for the release.
   * @param releaseResult - The result of the release process.
   * @returns The created pull request number.
   */
  async createReleasePR(
    tagName: string,
    releaseBranch: string,
    releaseResult: ReleaseItInstanceResult
  ): Promise<string> {
    const changelog = this.getChangelogAndFeatures(releaseResult);
    const label = await this.createReleasePRLabel();

    return this.getReleasePullRequest({
      tagName,
      releaseBranch,
      changelog,
      label
    });
  }

  /**
   * Creates a release pull request label.
   *
   * @returns The created label.
   * @throws If the label is not valid or if the creation fails.
   */
  async createReleasePRLabel(): Promise<ReleaseConfig['label']> {
    const label = this.getConfig('label') as ReleaseConfig['label'];

    if (!label || !label.name || !label.description || !label.color) {
      throw new Error('Label is not valid, skipping creation');
    }

    const { repoName, authorName } = this.getUserInfo();

    if (this.context.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR label with:`, label);
      return label;
    }

    try {
      const octokit = await this.getOctokit();

      const result = await octokit.rest.issues.createLabel({
        owner: authorName,
        repo: repoName,
        name: label.name,
        description: label.description,
        color: label.color.replace('#', '') // remove # prefix
      });

      this.logger.debug('Create PR label Success', result);

      return label;
    } catch (error) {
      if ((error as { status: number }).status === 422) {
        this.logger.warn(`Label ${label.name} already exists, skipping!`);
        return label;
      }
      this.logger.error('Create PR label Failed', error);
      throw error;
    }
  }

  /**
   * Gets the changelog and features from the release result.
   *
   * @param releaseResult - The result of the release process.
   * @returns The changelog or a warning message.
   */
  getChangelogAndFeatures(releaseResult: Record<string, unknown>): string {
    if (!releaseResult) {
      this.logger.warn(
        'No release-it output found, changelog might be incomplete'
      );
    }

    return get(releaseResult, 'changelog', 'No changelog') as string;
  }

  /**
   * Gets user information from the package.
   *
   * @returns The user information including repository name and author name.
   * @throws If the repository name or author name is not found.
   */
  getUserInfo(): { repoName: string; authorName: string } {
    const userInfo = Util.getUserInfo(this.packageJson, this.context.feConfig);

    if (!userInfo.repoName || !userInfo.authorName) {
      throw new Error('Not round repo or owner!!!');
    }

    return userInfo;
  }

  /**
   * Creates a release pull request.
   *
   * @param options - The options for creating the pull request.
   * @returns The created pull request number.
   * @throws If the creation fails or if the pull request already exists.
   */
  async getReleasePullRequest(options: {
    tagName: string;
    releaseBranch: string;
    changelog: string;
    label: ReleaseConfig['label'];
  }): Promise<string> {
    const prOptions = this.getCreateReleasePROptions(
      options.tagName,
      options.releaseBranch,
      options.changelog
    );

    const { repoName, authorName } = this.getUserInfo();

    if (this.context.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR with:`, {
        ...prOptions,
        labels: [options.label?.name]
      });
      return this.dryRunPRNumber;
    }

    const octokit = await this.getOctokit();

    try {
      // create PR
      const response = await octokit.rest.pulls.create(prOptions);
      const issue_number = response.data.number;
      if (!issue_number) {
        throw new Error('CreateReleasePR Failed, prNumber is empty');
      }

      this.logger.debug('Create PR Success', response.data);

      // add label
      if (options.label?.name) {
        const result = await octokit.rest.issues.addLabels({
          owner: authorName,
          repo: repoName,
          issue_number,
          labels: [options.label.name]
        });
        this.logger.debug('Add PR label Success', result);
      }

      return issue_number.toString();
    } catch (error) {
      if (
        (error as { status: number }).status === 422 &&
        (error as { message: string }).message.includes('already exists')
      ) {
        this.logger.warn('PR already exists');
        const match = (error as { message: string }).message.match(
          /pull request #(\d+)/
        );
        return match ? match[1] : '';
      }
      this.logger.error('Failed to create PR', error);
      throw error;
    }
  }

  /**
   * Gets the options for creating a release pull request.
   *
   * return a PR number
   *
   * @param tagName - The tag name for the release.
   * @param releaseBranch - The branch for the release.
   * @param changelog - The changelog for the release.
   * @returns The options for creating a release pull request.
   */
  getCreateReleasePROptions(
    tagName: string,
    releaseBranch: string,
    changelog: string
  ): {
    owner: string;
    repo: string;
    title: string;
    body: string;
    base: string;
    head: string;
  } {
    const { repoName, authorName } = this.getUserInfo();
    const title = this.getReleasePRTitle(tagName);
    const body = this.getReleasePRBody({ tagName, changelog });

    return {
      owner: authorName,
      repo: repoName,
      title,
      body,
      base: this.sourceBranch,
      head: releaseBranch
    };
  }

  /**
   * Gets the title for the release pull request.
   *
   * @param tagName - The tag name for the release.
   * @returns The formatted release pull request title.
   */
  getReleasePRTitle(tagName: string): string {
    const prTitleTpl = this.getConfig(
      'PRTitle',
      'Release ${env} ${pkgName} ${tagName}'
    ) as string;

    return this.shell.format(prTitleTpl, {
      env: this.releaseEnv,
      branch: this.sourceBranch,
      tagName,
      pkgName: get(this.packageJson, 'name')
    });
  }

  /**
   * Gets the body for the release pull request.
   *
   * @param options - The options containing tag name and changelog.
   * @returns The formatted release pull request body.
   */
  getReleasePRBody({
    tagName,
    changelog
  }: {
    tagName: string;
    changelog: string;
  }): string {
    const PRBodyTpl = this.getConfig('PRBody', '') as string;

    return this.shell.format(PRBodyTpl, {
      branch: this.sourceBranch,
      env: this.releaseEnv,
      tagName,
      changelog
    });
  }
}
