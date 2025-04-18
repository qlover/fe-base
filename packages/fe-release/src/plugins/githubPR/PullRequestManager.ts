import type { Shell } from '@qlover/scripts-context';
import type { PullRequestInterface } from '../../interface/PullRequestInterface';
import type ReleaseContext from '../../implments/ReleaseContext';
import type { Logger } from '@qlover/fe-corekit';
import type { SharedReleaseOptions } from '../../interface/ShreadReleaseOptions';
import {
  DEFAULT_AUTO_MERGE_RELEASE_PR,
  DEFAULT_AUTO_MERGE_TYPE
} from '../../defaults';

type CreatePROptionsArgs = {
  /**
   * Get the labels to add to the created PR.
   *
   * These labels must have already been created.
   *
   * @default `[]`
   */
  labels?: string[];

  title: string;
  body: string;

  base: string;
  head: string;
};

export default class PullRequestManager {
  constructor(
    private context: ReleaseContext,
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
  get autoMergeType(): SharedReleaseOptions['autoMergeType'] {
    return this.context.shared.autoMergeType || DEFAULT_AUTO_MERGE_TYPE;
  }

  /**
   * Dry run PR number
   *
   * @default `999999`
   */
  get dryRunPRNumber(): string {
    return this.context.getConfig('githubPR.dryRunPRNumber', '999999');
  }

  /**
   * Auto merge release PR
   *
   * @default `false`
   */
  get autoMergeReleasePR(): boolean {
    return (
      this.context.shared.autoMergeReleasePR || DEFAULT_AUTO_MERGE_RELEASE_PR
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
      const { repoName, authorName } = this.context.shared!;
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
  async createReleasePRLabel(): Promise<SharedReleaseOptions['label']> {
    const label = this.context.shared.label;

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
    const dryRunCreatePR = this.context.getConfig('githubPR.dryRunCreatePR');

    if (dryRunCreatePR || this.context.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR with:`, {
        ...options,
        labels: options.labels
      });
      return this.dryRunPRNumber;
    }

    try {
      // create PR
      const data = await this.releasePR.createPullRequest(options);
      const issue_number = data.number;
      if (!issue_number) {
        throw new Error('CreateReleasePR Failed, prNumber is empty');
      }

      this.logger.debug('Create PR Success', [data?.url]);

      // add label
      if (options.labels && options.labels.length) {
        const result = await this.releasePR.addPullRequestLabels({
          issue_number,
          labels: options.labels
        });
        this.logger.debug('Add PR label Success', [
          (result as unknown as { url: string })?.url
        ]);
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
}
