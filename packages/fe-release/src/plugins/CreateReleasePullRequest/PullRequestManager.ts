import type { Shell } from '@qlover/scripts-context';
import type { PullRequestInterface } from '../../interface/PullRequestInterface';
import type ReleaseContext from '../../interface/ReleaseContext';
import type ReleaseBase from './ReleaseBase';
import type { Logger } from '@qlover/fe-corekit';
import type { EnvironmentProps } from '../CheckEnvironment';
import {
  DEFAULT_AUTO_MERGE_RELEASE_PR,
  DEFAULT_AUTO_MERGE_TYPE,
  DEFAULT_PR_TITLE
} from '../../defaults';

type CreatePROptionsArgs = {
  /**
   * The tag name for the release.
   */
  tagName: string;

  /**
   * The release branch for the release.
   */
  releaseBranch: string;

  /**
   * The changelog for the release.
   */
  changelog: string;

  /**
   * The source branch for the release.
   */
  sourceBranch: string;

  /**
   * The release environment for the release.
   */
  releaseEnv: string;

  /**
   * Get the labels to add to the created PR.
   *
   * These labels must have already been created.
   *
   * @default `[]`
   */
  labels?: string[];
};

export default class PullRequestManager {
  constructor(
    private context: ReleaseContext,
    private releaseBase: ReleaseBase,
    private releasePR: PullRequestInterface
  ) {}

  get logger(): Logger {
    return this.context.logger as unknown as Logger;
  }

  get shell(): Shell {
    return this.context.shell;
  }

  /**
   * Auto merge type
   *
   * @default `squash`
   */
  get autoMergeType(): EnvironmentProps['autoMergeType'] {
    return this.context.getConfig(
      'environment.autoMergeType',
      DEFAULT_AUTO_MERGE_TYPE
    );
  }

  /**
   * Dry run PR number
   *
   * @default `999999`
   */
  get dryRunPRNumber(): string {
    return this.context.getConfig('pullRequest.dryRunPRNumber', '999999');
  }

  /**
   * Auto merge release PR
   *
   * @default `false`
   */
  get autoMergeReleasePR(): boolean {
    return this.context.getConfig(
      'environment.autoMergeReleasePR',
      DEFAULT_AUTO_MERGE_RELEASE_PR
    );
  }

  /**
   * Automatically merges a pull request.
   *
   * @param prNumber - The pull request number to merge.
   * @param releaseBranch - The branch to merge into.
   */
  async mergePR(prNumber: string, releaseBranch: string): Promise<void> {
    if (!prNumber) {
      this.logger.error('Failed to create Pull Request.', prNumber);
      return;
    }

    const mergeMethod = this.autoMergeType;

    if (this.context.dryRun) {
      const { repoName, authorName } = this.releaseBase.repoInfo!;
      this.logger.info(
        `[DRY RUN] Would merge PR #${prNumber} with method '${mergeMethod}' in repo ${authorName}/${repoName}, branch ${releaseBranch}`
      );
      return;
    }

    await this.releasePR.mergePullRequest({
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
  async checkedPR(prNumber: string, releaseBranch: string): Promise<void> {
    try {
      // Get PR information
      await this.releasePR.getPullRequest({
        pull_number: Number(prNumber)
      });

      // Delete remote branch
      await this.releasePR.deleteBranch({
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
   * Creates a release pull request label.
   *
   * @returns The created label.
   * @throws If the label is not valid or if the creation fails.
   */
  async createReleasePRLabel(): Promise<EnvironmentProps['label']> {
    const label: EnvironmentProps['label'] =
      this.context.getConfig('environment.label');

    if (!label || !label.name || !label.description || !label.color) {
      throw new Error('Label is not valid, skipping creation');
    }

    if (this.context.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR label with:`, label);
      return label;
    }

    try {
      const result = await this.releasePR.createPullRequestLabel({
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
   * Creates a release pull request.
   *
   * @param options - The options for creating the pull request.
   * @returns The created pull request number.
   * @throws If the creation fails or if the pull request already exists.
   */
  async createReleasePR(options: CreatePROptionsArgs): Promise<string> {
    const prOptions = this.getCreateReleasePROptions(options);

    if (this.context.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR with:`, {
        ...prOptions,
        labels: options.labels
      });
      return this.dryRunPRNumber;
    }

    try {
      // create PR
      const data = await this.releasePR.createPullRequest(prOptions);
      const issue_number = data.number;
      if (!issue_number) {
        throw new Error('CreateReleasePR Failed, prNumber is empty');
      }

      this.logger.debug('Create PR Success', data);

      // add label
      if (options.labels && options.labels.length) {
        const result = await this.releasePR.addPullRequestLabels({
          issue_number,
          labels: options.labels
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
  getCreateReleasePROptions(args: CreatePROptionsArgs): {
    title: string;
    body: string;
    base: string;
    head: string;
  } {
    const title = this.getReleasePRTitle(args);
    const body = this.getReleasePRBody(args);

    return {
      title,
      body,
      base: args.sourceBranch,
      head: args.releaseBranch
    };
  }

  /**
   * Gets the title for the release pull request.
   *
   * @param tagName - The tag name for the release.
   * @returns The formatted release pull request title.
   */
  getReleasePRTitle(
    args: Pick<CreatePROptionsArgs, 'tagName' | 'releaseEnv' | 'sourceBranch'>
  ): string {
    const prTitleTpl = this.context.getConfig(
      'environment.PRTitle',
      DEFAULT_PR_TITLE
    );

    return this.shell.format(prTitleTpl, {
      env: args.releaseEnv,
      branch: args.sourceBranch,
      tagName: args.tagName,
      pkgName: this.context.releasePackageName
    });
  }

  /**
   * Gets the body for the release pull request.
   *
   * @param options - The options containing tag name and changelog.
   * @returns The formatted release pull request body.
   */
  getReleasePRBody(
    args: Pick<
      CreatePROptionsArgs,
      'sourceBranch' | 'releaseEnv' | 'tagName' | 'changelog'
    >
  ): string {
    const PRBodyTpl = this.context.getConfig('environment.PRBody', '');

    return this.shell.format(PRBodyTpl, {
      branch: args.sourceBranch,
      env: args.releaseEnv,
      tagName: args.tagName,
      changelog: args.changelog
    });
  }
}
