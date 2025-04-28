import type { Shell } from '@qlover/scripts-context';
import type ReleaseContext from '../../implments/ReleaseContext';
import type { Logger } from '@qlover/fe-corekit';
import type { SharedReleaseOptions } from '../../interface/ShreadReleaseOptions';
import { Octokit } from '@octokit/rest';
import {
  DEFAULT_AUTO_MERGE_RELEASE_PR,
  DEFAULT_AUTO_MERGE_TYPE
} from '../../defaults';
import { GithubPRProps } from './GithubPR';
import { WorkspaceValue } from '../workspaces/Workspaces';

export interface PullRequestManagerOptions {
  token: string;
  owner: string;
  repo: string;
}

export type CreateReleaseOptions =
  import('@octokit/rest').RestEndpointMethodTypes['repos']['createRelease']['parameters'];

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

export default class GithubManager {
  private _octokit: Octokit | null = null;
  constructor(private context: ReleaseContext) {}

  getGitHubUserInfo(): Omit<PullRequestManagerOptions, 'token'> {
    const { authorName, repoName } = this.context.shared;

    if (!authorName || !repoName) {
      throw new Error('Author name or repo name is not set');
    }

    return {
      owner: authorName,
      repo: repoName
    };
  }

  getToken(): string {
    const { tokenRef = 'GITHUB_TOKEN' } =
      this.context.getConfig<GithubPRProps>('githubPR');

    const token = this.context.env.get(tokenRef);

    if (!token) {
      throw new Error(
        `Token is not set. Please set ${tokenRef} environment variable.`
      );
    }

    return token;
  }

  get octokit(): Octokit {
    if (this._octokit) {
      return this._octokit;
    }

    const { timeout } = this.context.getConfig<GithubPRProps>('githubPR');

    const options = {
      auth: this.getToken(),
      request: {
        timeout
      }
    };

    this._octokit = new Octokit(options);

    return this._octokit;
  }

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

    await this.octokit.rest.pulls.merge({
      ...this.getGitHubUserInfo(),
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
      await this.octokit.rest.pulls.get({
        ...this.getGitHubUserInfo(),
        pull_number: Number(prNumber)
      });

      // Delete remote branch
      await this.octokit.rest.git.deleteRef({
        ...this.getGitHubUserInfo(),
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
      const result = await this.octokit.rest.issues.createLabel({
        ...this.getGitHubUserInfo(),
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
      const response = await this.octokit.rest.pulls.create({
        ...this.getGitHubUserInfo(),
        ...options
      });
      const issue_number = response.data.number;
      if (!issue_number) {
        throw new Error('CreateReleasePR Failed, prNumber is empty');
      }

      this.logger.debug('Create PR Success', [response?.url]);

      // add label
      if (options.labels && options.labels.length) {
        const response = await this.octokit.rest.issues.addLabels({
          ...this.getGitHubUserInfo(),
          issue_number,
          labels: options.labels
        });

        this.logger.debug('Add PR label Success', [response.url]);
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

  private truncateBody(body: string): string {
    if (body && body.length >= 124000) return body.substring(0, 124000) + '...';
    return body;
  }

  private getOctokitReleaseOptions(
    options: Partial<CreateReleaseOptions>
  ): CreateReleaseOptions {
    const {
      releaseName,
      draft = false,
      preRelease = false,
      autoGenerate = false,
      makeLatest = true,
      releaseNotes,
      discussionCategoryName = undefined
    } = this.context.getConfig<GithubPRProps>('githubPR');

    const name = releaseName;
    const body = autoGenerate ? '' : this.truncateBody(String(releaseNotes));

    return {
      name,
      make_latest: makeLatest.toString() as 'true' | 'false' | 'legacy',
      body,
      draft,
      prerelease: preRelease,
      generate_release_notes: autoGenerate,
      discussion_category_name: discussionCategoryName,
      tag_name: '',
      ...options,
      ...this.getGitHubUserInfo()
    };
  }

  async createRelease(workspace: WorkspaceValue): Promise<void> {
    const meragedOptions = this.getOctokitReleaseOptions({
      tag_name: workspace.tagName,
      body: workspace.changelog
    });

    meragedOptions.name = this.shell.format(
      meragedOptions.name,
      workspace as unknown as Record<string, string>
    );

    this.logger.exec(
      `[DRY RUN] octokit repos.createRelease "${meragedOptions.name}" (${meragedOptions.tag_name})`,
      {
        isDryRun: this.context.dryRun
      }
    );

    if (!meragedOptions.tag_name) {
      throw new Error('TagName is undefined');
    }

    if (this.context.dryRun) {
      return;
    }

    try {
      const response = await this.octokit.repos.createRelease(meragedOptions);

      this.logger.verbose(
        `[DONE] octokit repos.createRelease "${meragedOptions.name}" (${meragedOptions.tag_name}) (${response.headers.location})`
      );
    } catch (error) {
      this.logger.error(
        `[FAILED] octokit repos.createRelease "${meragedOptions.name}" (${meragedOptions.tag_name})`,
        error
      );
    }
  }
}
