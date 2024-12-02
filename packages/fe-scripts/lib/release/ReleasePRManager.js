import { ReleaseUtil } from './ReleaseUtil.js';

export class ReleasePRManager {
  /**
   * @param {import('./ReleaseConfiguter.js').ReleaseConfiger} configer
   */
  constructor(configer) {
    this.configer = configer;

    /**
     * @type {import('@octokit/rest').Octokit | null}
     */
    this.octokit = null;
    this.ghToken = null;
  }

  get dryRun() {
    return this.configer.context.dryRun;
  }

  get logger() {
    return this.configer.logger;
  }

  setGithubToken(token) {
    this.ghToken = token;
  }

  async getOctokit() {
    if (this.octokit) {
      return this.octokit;
    }

    if (!this.ghToken) {
      throw new Error('Github token is not set');
    }

    const { Octokit } = await import('@octokit/rest');

    const octokit = new Octokit({ auth: this.ghToken });

    this.octokit = octokit;

    return octokit;
  }

  getPRNumber(output) {
    return ReleaseUtil.parserPRNumber(output);
  }

  /**
   * @returns {Promise<import('@qlover/fe-scripts').FeReleaseConfig['label']>}
   */
  async createReleasePRLabel() {
    const label = this.configer.feConfig.release.label;
    if (!label || !label.name || !label.description || !label.color) {
      throw new Error('Label is not valid, skipping creation');
    }
    const { repoName, authorName } = this.configer.getUserInfo();

    if (this.dryRun) {
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
      if (error.status === 422) {
        this.logger.warn(`Label ${label.name} already exists, skipping!`);
        return label;
      }
      this.logger.error('Create PR label Failed', error);
      throw error;
    }
  }

  /**
   * create Release PR
   * @param {{tagName: string, releaseBranch: string, changelog: string, label: import('@qlover/fe-scripts').FeReleaseConfig['label']}} options
   * @returns {Promise<string>}
   */
  async createReleasePR({ tagName, releaseBranch, changelog, label }) {
    const prOptions = this.configer.getCreateReleasePROptions(
      tagName,
      releaseBranch,
      changelog
    );

    const { repoName, authorName } = this.configer.getUserInfo();

    if (this.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR with:`, {
        ...prOptions,
        labels: [label.name]
      });
      return this.configer.dryRunPRNumber;
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
      if (label?.name) {
        const result = await octokit.rest.issues.addLabels({
          owner: authorName,
          repo: repoName,
          issue_number,
          labels: [label.name]
        });
        this.logger.debug('Add PR label Success', result);
      }

      return issue_number.toString();
    } catch (error) {
      if (error.status === 422 && error.message.includes('already exists')) {
        this.logger.warn('PR already exists');
        const match = error.message.match(/pull request #(\d+)/);
        return match ? match[1] : undefined;
      }
      this.logger.error('Failed to create PR', error);
      throw error;
    }
  }

  async autoMergePR(prNumber, releaseBranch) {
    if (!prNumber) {
      this.logger.error('Failed to create Pull Request.', prNumber);
      return;
    }

    const { repoName, authorName } = this.configer.getUserInfo();
    const mergeMethod = this.configer.getReleaseFeConfig(
      'autoMergeType',
      'squash'
    );

    if (this.dryRun) {
      this.logger.info(
        `[DRY RUN] Would merge PR #${prNumber} with method '${mergeMethod}' in repo ${authorName}/${repoName}, branch ${releaseBranch}`
      );
      return;
    }

    const octokit = await this.getOctokit();
    await octokit.pulls.merge({
      owner: authorName,
      repo: repoName,
      pull_number: prNumber,
      merge_method: mergeMethod
    });
  }

  async checkedPR(prNumber, releaseBranch) {
    try {
      const { repoName, authorName } = this.configer.getUserInfo();
      const octokit = await this.getOctokit();

      // 获取 PR 信息
      await octokit.rest.pulls.get({
        owner: authorName,
        repo: repoName,
        pull_number: prNumber
      });

      // 删除远程分支
      await octokit.rest.git.deleteRef({
        owner: authorName,
        repo: repoName,
        ref: `heads/${releaseBranch}`
      });

      this.logger.info(`Branch ${releaseBranch} has been deleted`);
    } catch (error) {
      if (error.status === 404) {
        this.logger.warn(
          `PR #${prNumber} or branch ${releaseBranch} not found`
        );
        return;
      }
      this.logger.error('Failed to check PR or delete branch', error);
      throw error;
    }
  }
}
