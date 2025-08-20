/**
 * @module GitChangelog
 * @description Git-based changelog generation and commit parsing
 *
 * This module provides functionality for generating changelogs from Git
 * history, parsing commit messages according to conventional commit format,
 * and managing commit metadata.
 *
 * Core Features:
 * - Git log retrieval
 * - Conventional commit parsing
 * - Changelog generation
 * - Tag resolution
 * - PR number extraction
 *
 * @example Basic usage
 * ```typescript
 * const changelog = new GitChangelog({
 *   shell,
 *   logger,
 *   directory: 'packages/my-pkg'
 * });
 *
 * // Get commits between tags
 * const commits = await changelog.getCommits({
 *   from: 'v1.0.0',
 *   to: 'v2.0.0'
 * });
 * ```
 *
 * @example Commit parsing
 * ```typescript
 * const changelog = new GitChangelog({ shell, logger });
 *
 * // Parse conventional commit
 * const commit = changelog.parseCommitlint(
 *   'feat(api): add new endpoint',
 *   'Detailed description\n\nBREAKING CHANGE: API format changed'
 * );
 * // {
 * //   type: 'feat',
 * //   scope: 'api',
 * //   message: 'add new endpoint',
 * //   body: '  Detailed description\n\n  BREAKING CHANGE: API format changed'
 * // }
 * ```
 */
import type { ShellInterface } from '@qlover/scripts-context';
import type {
  BaseCommit,
  ChangeLogInterface,
  Commitlint,
  CommitValue,
  GitChangelogOptions
} from '../../interface/ChangeLog';
import gitlog, { CommitField, GitlogOptions } from 'gitlog';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Complete list of available Git commit fields
 *
 * These fields can be used when retrieving commit information
 * to specify which data should be included in the output.
 *
 * @example
 * ```typescript
 * const commits = await changelog.getGitLog({
 *   fields: CHANGELOG_ALL_FIELDS
 * });
 * ```
 */
export const CHANGELOG_ALL_FIELDS: CommitField[] = [
  'hash',
  'abbrevHash',
  'treeHash',
  'abbrevTreeHash',
  'parentHashes',
  'abbrevParentHashes',
  'authorName',
  'authorEmail',
  'authorDate',
  'authorDateRel',
  'committerName',
  'committerEmail',
  'committerDate',
  'committerDateRel',
  'subject',
  'body',
  'rawBody',
  'tag'
];

export interface GitChangelogProps extends GitChangelogOptions {
  shell: ShellInterface;
  logger: LoggerInterface;
}

/**
 * Core class for Git-based changelog generation
 *
 * Provides functionality for retrieving and parsing Git commit history,
 * generating changelogs, and managing commit metadata. Implements the
 * ChangeLogInterface for standardized changelog generation.
 *
 * Features:
 * - Git log retrieval with flexible options
 * - Conventional commit parsing
 * - Tag resolution and validation
 * - PR number extraction
 * - Commit body formatting
 *
 * @example Basic usage
 * ```typescript
 * const changelog = new GitChangelog({
 *   shell,
 *   logger,
 *   directory: 'packages/my-pkg'
 * });
 *
 * // Get commits with parsed metadata
 * const commits = await changelog.getCommits({
 *   from: 'v1.0.0',
 *   to: 'v2.0.0',
 *   noMerges: true
 * });
 * ```
 *
 * @example Custom commit parsing
 * ```typescript
 * const changelog = new GitChangelog({ shell, logger });
 *
 * // Create commit value from hash and message
 * const commit = changelog.toCommitValue(
 *   'abc1234',
 *   'feat(api): new endpoint (#123)'
 * );
 * // {
 * //   base: { hash: 'abc1234', ... },
 * //   commitlint: { type: 'feat', scope: 'api', ... },
 * //   prNumber: '123'
 * // }
 * ```
 */
export class GitChangelog implements ChangeLogInterface {
  /**
   * Creates a new GitChangelog instance
   *
   * @param options - Configuration options including shell and logger
   *
   * @example
   * ```typescript
   * const changelog = new GitChangelog({
   *   shell: new Shell(),
   *   logger: new Logger(),
   *   directory: 'packages/my-pkg',
   *   noMerges: true
   * });
   * ```
   */
  constructor(protected options: GitChangelogProps) {}

  /**
   * Retrieves Git commit history with specified options
   *
   * Fetches commit information between specified tags or commits,
   * with support for filtering and field selection.
   *
   * @param options - Configuration options for Git log retrieval
   * @returns Array of commit objects with requested fields
   *
   * @example Basic usage
   * ```typescript
   * const commits = await changelog.getGitLog({
   *   from: 'v1.0.0',
   *   to: 'v2.0.0',
   *   directory: 'packages/my-pkg',
   *   noMerges: true
   * });
   * ```
   *
   * @example Custom fields
   * ```typescript
   * const commits = await changelog.getGitLog({
   *   fields: ['hash', 'subject', 'authorName'],
   *   directory: 'src'
   * });
   * ```
   */
  async getGitLog(options: GitChangelogOptions = {}): Promise<BaseCommit[]> {
    const { directory, noMerges = true, fields } = options;

    const from = await this.resolveTag(options.from, 'root');
    const to = await this.resolveTag(options.to, 'HEAD');

    const range = from === to ? to : `${from}..${to}`;

    const gitLogOptions: GitlogOptions<CommitField> = {
      repo: '.',
      number: 1000,
      fields: fields,
      branch: range,
      file: directory,
      nameStatus: false,
      includeMergeCommitFiles: !noMerges
    };

    const commits = await gitlog(gitLogOptions);

    this.options.logger?.debug('GitChangelog', gitLogOptions);
    this.options.logger?.debug('GitChangelog commits', commits);

    return commits;
  }

  /**
   * Retrieves and parses Git commits with metadata
   *
   * Gets commit history and enhances it with parsed conventional
   * commit information and PR metadata.
   *
   * @param options - Configuration options for Git log retrieval
   * @returns Array of enhanced commit objects with parsed metadata
   *
   * @example Basic usage
   * ```typescript
   * const commits = await changelog.getCommits({
   *   from: 'v1.0.0',
   *   to: 'v2.0.0'
   * });
   * // [
   * //   {
   * //     base: { hash: '...', subject: '...' },
   * //     commitlint: { type: 'feat', scope: 'api', ... },
   * //     commits: []
   * //   }
   * // ]
   * ```
   *
   * @example Filtered commits
   * ```typescript
   * const commits = await changelog.getCommits({
   *   directory: 'packages/my-pkg',
   *   noMerges: true
   * });
   * ```
   */
  async getCommits(options?: GitChangelogOptions): Promise<CommitValue[]> {
    const gitCommits = await this.getGitLog(options);

    return gitCommits.map((commit) => {
      const { subject, rawBody } = commit;
      return {
        base: commit,
        commitlint: this.parseCommitlint(subject || '', rawBody),
        // commits: body ? this.parseCommitBody(body) : [],
        commits: []
      } as CommitValue;
    });
  }

  /**
   * Creates a base commit object from message and optional data
   *
   * Utility method to create a standardized commit object with
   * basic metadata. Used internally for commit value creation.
   *
   * @param message - Commit message
   * @param target - Optional additional commit data
   * @returns Base commit object
   * @protected
   *
   * @example
   * ```typescript
   * const commit = changelog.createBaseCommit(
   *   'feat: new feature',
   *   {
   *     hash: 'abc123',
   *     authorName: 'John Doe'
   *   }
   * );
   * ```
   */
  protected createBaseCommit(
    message: string,
    target?: Partial<BaseCommit>
  ): BaseCommit {
    return {
      subject: message,
      rawBody: message,
      body: message,
      ...target
    } as BaseCommit;
  }

  /**
   * Indents each line of a text block
   *
   * Adds specified number of spaces to the start of each line
   * in a multi-line string. Used for formatting commit body text.
   *
   * @since 2.3.2
   * @param body - Text to indent
   * @param size - Number of spaces to add (default: 2)
   * @returns Indented text
   *
   * @example
   * ```typescript
   * const text = changelog.tabify(
   *   'Line 1\nLine 2\nLine 3',
   *   4
   * );
   * // '    Line 1\n    Line 2\n    Line 3'
   * ```
   */
  tabify(body: string, size = 2): string {
    return body
      .split('\n')
      .map((line) => ' '.repeat(size) + line.trim())
      .join('\n');
  }

  /**
   * Parses a commit message into conventional commit format
   *
   * Extracts type, scope, message, and body from a commit message
   * following the conventional commit specification.
   *
   * Format: type(scope): message
   *
   * @param subject - Commit subject line
   * @param rawBody - Full commit message body
   * @returns Parsed conventional commit data
   *
   * @example Basic commit
   * ```typescript
   * const commit = changelog.parseCommitlint(
   *   'feat(api): add new endpoint'
   * );
   * // {
   * //   type: 'feat',
   * //   scope: 'api',
   * //   message: 'add new endpoint'
   * // }
   * ```
   *
   * @example With body
   * ```typescript
   * const commit = changelog.parseCommitlint(
   *   'fix(core): memory leak',
   *   'Fixed memory leak in core module\n\nBREAKING CHANGE: API changed'
   * );
   * // {
   * //   type: 'fix',
   * //   scope: 'core',
   * //   message: 'memory leak',
   * //   body: '  Fixed memory leak in core module\n\n  BREAKING CHANGE: API changed'
   * // }
   * ```
   */
  parseCommitlint(subject: string, rawBody: string = ''): Commitlint {
    const [title] = subject.trim().split('\n');
    const bodyLines = rawBody.startsWith(title)
      ? rawBody.replace(title, '')
      : rawBody;

    const titleMatch = title
      .replace(/\s*\(#\d+\)\s*$/, '')
      .match(/^(?:([a-z]+)(?:\((.*?)\))?: )?(.+)$/i);

    if (titleMatch) {
      return {
        type: titleMatch[1]?.toLowerCase(),
        scope: titleMatch[2]?.trim(),
        message: titleMatch[3].trim(),
        body: bodyLines ? this.tabify(bodyLines) : undefined
      };
    }

    return {
      // message: title.replace(/\s*\(#\d+\)\s*$/, '').trim()
      message: title,
      body: bodyLines ? this.tabify(bodyLines) : undefined
    };
  }

  /**
   * Creates a complete commit value object from hash and message
   *
   * Combines commit hash, parsed conventional commit data, and
   * PR information into a single commit value object.
   *
   * @param hash - Commit hash
   * @param message - Full commit message
   * @returns Complete commit value object
   *
   * @example Basic commit
   * ```typescript
   * const commit = changelog.toCommitValue(
   *   'abc123',
   *   'feat(api): new endpoint'
   * );
   * // {
   * //   base: {
   * //     hash: 'abc123',
   * //     abbrevHash: 'abc123',
   * //     subject: 'feat(api): new endpoint'
   * //   },
   * //   commitlint: {
   * //     type: 'feat',
   * //     scope: 'api',
   * //     message: 'new endpoint'
   * //   },
   * //   commits: []
   * // }
   * ```
   *
   * @example PR commit
   * ```typescript
   * const commit = changelog.toCommitValue(
   *   'def456',
   *   'fix(core): memory leak (#123)'
   * );
   * // {
   * //   base: { hash: 'def456', ... },
   * //   commitlint: { type: 'fix', ... },
   * //   commits: [],
   * //   prNumber: '123'
   * // }
   * ```
   */
  toCommitValue(hash: string, message: string): CommitValue {
    const [title] = message.trim().split('\n');

    const prMatch = title.match(/\(#(\d+)\)/);

    const commitlint = this.parseCommitlint(title, message);

    const baseCommit: BaseCommit = this.createBaseCommit(title, {
      hash,
      abbrevHash: hash.substring(0, 7),
      rawBody: message
    });

    return {
      base: baseCommit,
      commitlint,
      commits: [],
      // commits: body ? this.parseCommitBody(body) : [],
      prNumber: prMatch?.[1]
    };
  }

  /**
   * Resolves a Git tag or reference to a valid commit reference
   *
   * Attempts to resolve a tag name to a valid Git reference.
   * Falls back to root commit or HEAD if tag doesn't exist.
   *
   * @param tag - Tag name to resolve
   * @param fallback - Fallback value ('root' or 'HEAD')
   * @returns Resolved Git reference
   * @protected
   *
   * @example Basic tag resolution
   * ```typescript
   * const ref = await changelog.resolveTag('v1.0.0');
   * // 'v1.0.0' if tag exists
   * // 'HEAD' if tag doesn't exist
   * ```
   *
   * @example Root commit fallback
   * ```typescript
   * const ref = await changelog.resolveTag(
   *   'non-existent-tag',
   *   'root'
   * );
   * // First commit hash if tag doesn't exist
   * ```
   */
  protected async resolveTag(tag?: string, fallback?: string): Promise<string> {
    if (tag) {
      // Properly escape tag names with special characters
      try {
        // Check if tag exists (using quotes to handle special characters)
        const exists = await this.options.shell
          .exec(`git tag --list "${tag}"`, { dryRun: false })
          .then((out) => !!out.trim());

        if (exists) return tag;
      } catch {
        // If there's an error checking the tag, fall through to fallback
      }
    }

    if (fallback === 'root') {
      return this.options.shell
        .exec(`git rev-list --max-parents=0 HEAD`, { dryRun: false })
        .then((out) => out.trim());
    }

    return 'HEAD';
  }
}
