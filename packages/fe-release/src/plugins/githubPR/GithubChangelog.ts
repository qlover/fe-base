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
 * const changelog = new GithubChangelog({
 *   shell,
 *   logger,
 *   githubRootPath: 'https://github.com/org/repo'
 * }, githubManager);
 *
 * const commits = await changelog.getFullCommit({
 *   from: 'v1.0.0',
 *   directory: 'packages/pkg-a'
 * });
 * ```
 *
 * @example Workspace transformation
 * ```typescript
 * const workspaces = await changelog.transformWorkspace(
 *   [{ name: 'pkg-a', path: 'packages/a' }],
 *   context
 * );
 * // Adds formatted changelog to each workspace
 * ```
 */
import ReleaseContext from '../../implments/ReleaseContext';
import { WorkspaceValue } from '../workspaces/Workspaces';
import GithubManager from './GithubManager';
import { CommitValue, GitChangelogOptions } from '../../interface/ChangeLog';
import {
  CHANGELOG_ALL_FIELDS,
  GitChangelog,
  GitChangelogProps
} from '../../implments/changelog/GitChangeLog';
import { GitChangelogFormatter } from '../../implments/changelog/GitChangelogFormatter';
import { Pather } from '../../utils/pather';

const DOMAIN = 'https://github.com';

export interface GithubChangelogProps extends GitChangelogProps {
  mergePRcommit?: boolean;
  githubRootPath?: string;
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
 * const changelog = new GithubChangelog({
 *   shell,
 *   logger,
 *   githubRootPath: 'https://github.com/org/repo'
 * }, githubManager);
 *
 * const commits = await changelog.getFullCommit({
 *   from: 'v1.0.0',
 *   directory: 'packages/pkg-a'
 * });
 * ```
 *
 * @example With PR merging
 * ```typescript
 * const changelog = new GithubChangelog({
 *   mergePRcommit: true,
 *   githubRootPath: 'https://github.com/org/repo'
 * }, githubManager);
 *
 * // Will include PR commits in changelog
 * const commits = await changelog.getFullCommit();
 * ```
 */
export default class GithubChangelog extends GitChangelog {
  /** Path manipulation utility */
  private pather = new Pather();

  /**
   * Creates a new GitHub changelog generator
   *
   * @param options - Changelog generation options
   * @param githubManager - GitHub API manager
   *
   * @example
   * ```typescript
   * const changelog = new GithubChangelog({
   *   shell,
   *   logger,
   *   mergePRcommit: true,
   *   githubRootPath: 'https://github.com/org/repo'
   * }, githubManager);
   * ```
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
   *
   * @example
   * ```typescript
   * const commits = await changelog.filterCommitsByDirectory(
   *   allCommits,
   *   'packages/pkg-a'
   * );
   * // Only commits that modified files in packages/pkg-a
   * ```
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
   * Gets complete commit information with PR details
   *
   * Retrieves commits and enhances them with pull request
   * information. For commits associated with PRs, includes
   * all PR commits and filters by directory.
   *
   * Process:
   * 1. Get base commits
   * 2. Extract PR numbers
   * 3. Fetch PR commits
   * 4. Filter by directory
   * 5. Flatten results
   *
   * @param options - Changelog options
   * @returns Promise resolving to enhanced commits
   *
   * @example Basic usage
   * ```typescript
   * const commits = await changelog.getFullCommit({
   *   from: 'v1.0.0',
   *   directory: 'packages/pkg-a'
   * });
   * // Returns commits with PR information
   * ```
   *
   * @example With PR merging
   * ```typescript
   * const commits = await changelog.getFullCommit({
   *   mergePRcommit: true,
   *   directory: 'packages/pkg-a'
   * });
   * // Includes all PR commits
   * ```
   */
  public async getFullCommit(
    options?: GitChangelogOptions
  ): Promise<CommitValue[]> {
    const _options = { ...this.options, ...options };

    const allCommits = await this.getCommits(_options);

    const newallCommits = await Promise.all(
      allCommits.map(async (commit) => {
        let { prNumber } = commit;

        if (!prNumber && commit.base.subject) {
          const prMatch = commit.base.subject.match(/\(#(\d+)\)/);
          if (prMatch) {
            prNumber = prMatch[1];
            commit.prNumber = prNumber;
          }
        }

        if (!prNumber) {
          return commit;
        }

        const prCommits =
          await this.githubManager.getPullRequestCommits(+prNumber);

        const commitValues = prCommits.map(({ sha, commit: { message } }) =>
          Object.assign(this.toCommitValue(sha, message), {
            prNumber
          })
        );

        return this.filterCommitsByDirectory(commitValues, _options.directory!);
      })
    );

    return newallCommits.flat();
  }

  /**
   * Transforms workspaces with GitHub changelogs
   *
   * Processes each workspace to add GitHub-specific changelog
   * information. Includes:
   * - GitHub repository URL
   * - PR-aware commit history
   * - Formatted changelog with links
   *
   * Process:
   * 1. Build GitHub root path
   * 2. Configure changelog options
   * 3. Get commits for each workspace
   * 4. Format changelog with links
   * 5. Update workspace objects
   *
   * @param workspaces - Array of workspaces to process
   * @param context - Release context
   * @returns Promise resolving to updated workspaces
   *
   * @example
   * ```typescript
   * const workspaces = await changelog.transformWorkspace(
   *   [
   *     {
   *       name: 'pkg-a',
   *       path: 'packages/a',
   *       lastTag: 'v1.0.0'
   *     }
   *   ],
   *   context
   * );
   * // Returns workspaces with GitHub-formatted changelogs
   * ```
   */
  public async transformWorkspace(
    workspaces: WorkspaceValue[],
    context: ReleaseContext
  ): Promise<WorkspaceValue[]> {
    const githubRootPath = [
      DOMAIN,
      context.getOptions('authorName'),
      context.getOptions('repoName')
    ].join('/');

    const changelogProps = {
      ...context.getOptions<GitChangelogOptions>('changelog'),
      githubRootPath,
      mergePRcommit: true,
      shell: context.shell,
      logger: context.logger
    };
    const githubChangelog = new GithubChangelog(
      changelogProps,
      this.githubManager
    );
    const formatter = new GitChangelogFormatter(changelogProps);

    return await Promise.all(
      workspaces.map(async (workspace) => {
        const changelog = await githubChangelog.getFullCommit({
          from: workspace.lastTag ?? '',
          directory: workspace.path,
          fields: CHANGELOG_ALL_FIELDS
        });

        if (typeof changelog === 'string') {
          return {
            ...workspace,
            changelog
          };
        }

        const changelogLines = formatter.format(changelog, {
          ...changelogProps,
          repoUrl: githubRootPath
        });

        return {
          ...workspace,
          changelog: changelogLines.join('\n')
        };
      })
    );
  }
}
