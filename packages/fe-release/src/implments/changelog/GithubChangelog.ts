/**
 * @module GithubChangelog
 * @description GitHub-specific changelog generation
 *
 * This module extends the base changelog functionality with
 * GitHub-specific features like PR linking, commit filtering
 * by directory, and workspace-aware changelog generation.
 *
 * Core Features:
 * - PR-aware commit gathering
 * - Directory-based filtering
 * - GitHub link generation
 * - Workspace changelog transformation
 * - Markdown formatting
 *
 * @example Basic usage
 * ```typescript
 * const changelog = GithubChangelog.fromContext(context, githubManager);
 *
 * const commits = await changelog.getFullCommit({
 *   from: 'v1.0.0',
 *   directory: 'packages/pkg-a'
 * });
 * ```
 *
 * @example Enrich workspace changelog
 * ```typescript
 * const changelog = GithubChangelog.fromContext(context, githubManager);
 * const workspace = await changelog.enrichWorkspaceChangelog({
 *   name: 'pkg-a',
 *   path: 'packages/a',
 *   lastTag: 'v1.0.0'
 * });
 * // Returns workspace with GitHub links in changelog
 * ```
 */
import type ReleaseContext from '../../implments/ReleaseContext';
import type { GithubManager } from '../GithubManager';
import {
  type CommitValue,
  type GitChangelogOptions
} from '../../interface/ChangeLog';
import {
  CHANGELOG_ALL_FIELDS,
  GitChangelog,
  type GitChangelogProps
} from '../../implments/changelog/GitChangeLog';
import { GitChangelogFormatter } from '../../implments/changelog/GitChangelogFormatter';
import { Pather } from '../../utils/pather';
import type { WorkspaceInterface } from '../../interface/WorkspaceInterface';
import { clone } from 'lodash';

const DOMAIN = 'https://github.com';

export interface GithubChangelogProps extends GitChangelogProps {
  repoUrl: string;
}

function pickFormatOptions(
  config: GitChangelogOptions = {}
): GitChangelogOptions {
  const {
    noMerges,
    types,
    formatTemplate,
    commitBody,
    dependencyReleaseTemplate,
    fields
  } = config;

  return {
    noMerges,
    types,
    formatTemplate,
    commitBody,
    dependencyReleaseTemplate,
    fields
  };
}

/**
 * Builds GitHub changelog options from release context
 */
export function buildGithubChangelogProps(
  context: ReleaseContext
): GithubChangelogProps {
  const repoUrl = [
    DOMAIN,
    context.parameters.authorName,
    context.parameters.repoName
  ].join('/');

  const changesetVersion = context.parameters.changesetVersion;

  return {
    ...pickFormatOptions(changesetVersion),
    repoUrl,
    shell: context.shell,
    logger: context.logger
  };
}

/**
 * GitHub-specific changelog generator
 *
 * Extends the base changelog generator with GitHub-specific
 * features like PR linking, directory filtering, and workspace
 * transformation.
 *
 * Features:
 * - PR commit aggregation
 * - Directory-based filtering
 * - GitHub link generation
 * - Workspace changelog transformation
 * - Markdown formatting
 *
 * @example Basic usage
 * ```typescript
 * const changelog = GithubChangelog.fromContext(context, githubManager);
 *
 * const commits = await changelog.getFullCommit({
 *   from: 'v1.0.0',
 *   directory: 'packages/pkg-a'
 * });
 * ```
 */
export class GithubChangelog extends GitChangelog {
  /** Path manipulation utility */
  private pather = new Pather();

  /**
   * Creates a GitHub changelog generator from release context
   */
  public static fromContext(
    context: ReleaseContext,
    githubManager: GithubManager
  ): GithubChangelog {
    return new GithubChangelog(
      buildGithubChangelogProps(context),
      githubManager
    );
  }

  /**
   * Creates a new GitHub changelog generator
   *
   * @param options - Changelog generation options
   * @param githubManager - GitHub API manager
   */
  constructor(
    protected options: GithubChangelogProps,
    protected githubManager: GithubManager
  ) {
    super(options);
  }

  /**
   * Filters commits by directory
   *
   * Filters commits based on whether they contain changes in
   * the specified directory. Uses GitHub API to get detailed
   * commit information.
   *
   * @param commits - Array of commits to filter
   * @param directory - Directory path to filter by
   * @returns Promise resolving to filtered commits
   * @since 2.4.0
   */
  public async filterCommitsByDirectory(
    commits: CommitValue[],
    directory: string
  ): Promise<CommitValue[]> {
    const result: CommitValue[] = [];

    for (const commit of commits) {
      const commitInfo = await this.githubManager.getCommitInfo(
        commit.base.hash!
      );

      if (!commitInfo) {
        result.push(commit);
        continue;
      }

      const files = commitInfo.files?.map((file) => file.filename) ?? [];

      for (const file of files) {
        if (this.pather.isSubPath(file, directory)) {
          result.push(commit);
          break;
        }
      }
    }

    return result;
  }

  /**
   * Resolves PR number from commit metadata, message, or GitHub API
   */
  private async resolvePrNumber(
    commit: CommitValue
  ): Promise<string | undefined> {
    let { prNumber } = commit;

    if (!prNumber && commit.base.subject) {
      const prMatch = commit.base.subject.match(/\(#(\d+)\)/);
      if (prMatch) {
        prNumber = prMatch[1];
        commit.prNumber = prNumber;
      }
    }

    if (!prNumber && commit.base.hash) {
      const associatedPRs = await this.githubManager.getPullRequestsForCommit(
        commit.base.hash,
        commit.base.subject
      );
      const mergedPR = associatedPRs.find((pr) => pr.merged_at);
      const targetPR = mergedPR ?? associatedPRs[0];

      if (targetPR) {
        prNumber = targetPR.number.toString();
        commit.prNumber = prNumber;
      }
    }

    return prNumber;
  }

  /**
   * Gets complete commit information with PR details
   *
   * Retrieves commits and enhances them with pull request
   * information. For commits associated with PRs, includes
   * all PR commits and filters by directory.
   *
   * When no PR is found, falls back to directory filtering
   * on the commit itself via GitHub API.
   *
   * @param options - Changelog options
   * @returns Promise resolving to enhanced commits
   */
  public async getFullCommit(
    options?: GitChangelogOptions
  ): Promise<CommitValue[]> {
    const _options = { ...this.options, ...options };

    const allCommits = await this.getCommits(_options);

    const newallCommits = await Promise.all(
      allCommits.map(async (commit) => {
        const prNumber = await this.resolvePrNumber(commit);

        if (prNumber) {
          const prCommits =
            await this.githubManager.getPullRequestCommits(+prNumber);

          const commitValues = prCommits.map(({ sha, commit: { message } }) =>
            Object.assign(this.toCommitValue(sha, message), {
              prNumber
            })
          );

          if (_options.directory) {
            return this.filterCommitsByDirectory(
              commitValues,
              _options.directory
            );
          }

          return commitValues;
        }

        if (_options.directory) {
          return this.filterCommitsByDirectory([commit], _options.directory);
        }

        return commit;
      })
    );

    return newallCommits.flat();
  }

  /**
   * Enriches workspace changelog with GitHub repo content (commit/PR links)
   *
   * @param workspace - Workspace to process
   * @returns Promise resolving to updated workspace
   */
  public async enrichWorkspaceChangelog(
    workspace: WorkspaceInterface
  ): Promise<WorkspaceInterface> {
    const formatter = new GitChangelogFormatter(this.options);

    const commits = await this.getFullCommit({
      from: workspace.lastTag ?? '',
      directory: workspace.path,
      fields: CHANGELOG_ALL_FIELDS
    });

    const changelogLines = formatter.format(commits, this.options);

    return Object.assign(clone(workspace), {
      changelog: changelogLines.join('\n')
    });
  }
}
