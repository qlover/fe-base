/**
 * @module GitChangelogFormatter
 * @description Formats Git commits into readable changelog entries
 *
 * This module provides functionality for formatting Git commits into
 * a structured changelog format, with support for conventional commits,
 * PR links, and custom templates.
 *
 * Core Features:
 * - Conventional commit formatting
 * - PR and commit linking
 * - Type-based grouping
 * - Custom templates
 * - Markdown formatting
 *
 * @example Basic usage
 * ```typescript
 * const formatter = new GitChangelogFormatter({
 *   shell,
 *   repoUrl: 'https://github.com/org/repo',
 *   types: [
 *     { type: 'feat', section: '### Features' },
 *     { type: 'fix', section: '### Bug Fixes' }
 *   ]
 * });
 *
 * const changelog = formatter.format(commits);
 * // ### Features
 * // - **api:** new endpoint ([abc123](https://github.com/org/repo/commit/abc123)) (#123)
 * //
 * // ### Bug Fixes
 * // - **core:** fix memory leak ([def456](https://github.com/org/repo/commit/def456))
 * ```
 *
 * @example Custom template
 * ```typescript
 * const formatter = new GitChangelogFormatter({
 *   shell,
 *   formatTemplate: '* ${commitlint.message} ${prLink}',
 *   types: [{ type: 'feat', section: '## New' }]
 * });
 *
 * const changelog = formatter.format(commits);
 * // ## New
 * // * add user authentication (#124)
 * ```
 */
import { Shell, type ShellInterface } from '@qlover/scripts-context';
import {
  ChangelogFormatter,
  CommitValue,
  GitChangelogOptions
} from '../../interface/ChangeLog';
import groupBy from 'lodash/groupBy';

/**
 * Default template for formatting commit entries
 *
 * Variables available:
 * - ${scopeHeader}: Formatted scope (e.g., "**api:**")
 * - ${commitlint.message}: Commit message
 * - ${commitLink}: Formatted commit hash link
 * - ${prLink}: Formatted PR link
 */
const DEFAULT_TEMPLATE =
  '\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}';

/**
 * Configuration options for changelog formatting
 *
 * Extends GitChangelogOptions with repository URL support
 * for generating links to commits and pull requests.
 */
export interface Options extends GitChangelogOptions {
  /**
   * Repository URL for generating links
   *
   * @example 'https://github.com/org/repo'
   */
  repoUrl?: string;
}

/**
 * Core class for formatting Git commits into changelog entries
 *
 * Implements ChangelogFormatter interface to provide standardized
 * changelog generation with support for:
 * - Conventional commit formatting
 * - Type-based grouping
 * - PR and commit linking
 * - Custom templates
 * - Markdown formatting
 *
 * @example Basic usage
 * ```typescript
 * const formatter = new GitChangelogFormatter({
 *   shell,
 *   repoUrl: 'https://github.com/org/repo',
 *   types: [
 *     { type: 'feat', section: '### Features' },
 *     { type: 'fix', section: '### Bug Fixes' }
 *   ]
 * });
 *
 * const changelog = formatter.format(commits);
 * ```
 *
 * @example Custom formatting
 * ```typescript
 * const formatter = new GitChangelogFormatter({
 *   shell,
 *   formatTemplate: '* ${commitlint.message}',
 *   types: [{ type: 'feat', section: '## New' }],
 *   commitBody: true // Include commit body
 * });
 * ```
 */
export class GitChangelogFormatter implements ChangelogFormatter {
  /**
   * Creates a new GitChangelogFormatter instance
   *
   * @param options - Configuration options including shell interface
   *
   * @example
   * ```typescript
   * const formatter = new GitChangelogFormatter({
   *   shell: new Shell(),
   *   repoUrl: 'https://github.com/org/repo',
   *   types: [
   *     { type: 'feat', section: '### Features' }
   *   ],
   *   formatTemplate: '- ${commitlint.message}'
   * });
   * ```
   */
  constructor(
    protected options: Options & {
      shell: ShellInterface;
    }
  ) {}

  /**
   * Formats an array of commits into changelog entries
   *
   * Groups commits by type and formats them according to the
   * configured template and options. Supports commit body
   * inclusion and type-based sections.
   *
   * @override
   * @param commits - Array of commit values to format
   * @param options - Optional formatting options
   * @returns Array of formatted changelog lines
   *
   * @example Basic formatting
   * ```typescript
   * const changelog = formatter.format([
   *   {
   *     base: { hash: 'abc123' },
   *     commitlint: {
   *       type: 'feat',
   *       scope: 'api',
   *       message: 'new endpoint'
   *     }
   *   }
   * ]);
   * // [
   * //   '### Features',
   * //   '- **api:** new endpoint ([abc123](...))'
   * // ]
   * ```
   *
   * @example With commit body
   * ```typescript
   * const changelog = formatter.format(
   *   [{
   *     commitlint: {
   *       type: 'fix',
   *       message: 'memory leak',
   *       body: 'Fixed memory allocation\nAdded cleanup'
   *     }
   *   }],
   *   { commitBody: true }
   * );
   * // [
   * //   '### Bug Fixes',
   * //   '- memory leak',
   * //   '  Fixed memory allocation',
   * //   '  Added cleanup'
   * // ]
   * ```
   */
  public format(commits: CommitValue[], options?: Options): string[] {
    const { types = [], commitBody = false } = { ...this.options, ...options };
    const changelog: string[] = [];

    const groupedCommits = groupBy(commits, (commit) => {
      if (commit.commitlint.type) {
        return commit.commitlint.type;
      }
      return commit.commitlint.message;
    });

    types.forEach((typeConfig) => {
      const { type, section, hidden } = typeConfig;

      if (hidden) return;

      const typeCommits = groupedCommits[type] || [];

      if (typeCommits.length > 0) {
        changelog.push(section || '');

        typeCommits.forEach((commit) => {
          changelog.push(this.formatCommit(commit, options));

          if (commitBody && commit.commitlint.body) {
            const bodyLines = commit.commitlint.body
              .split('\n')
              .map((line) => `  ${line}`);
            changelog.push(...bodyLines);
          }
        });
      }
    });

    return changelog;
  }

  /**
   * Formats a single commit into a changelog entry
   *
   * Applies the configured template to a commit, including
   * scope formatting, PR links, and commit hash links.
   *
   * @param commit - Commit value to format
   * @param options - Optional formatting options
   * @returns Formatted changelog entry
   *
   * @example Basic formatting
   * ```typescript
   * const entry = formatter.formatCommit({
   *   base: { hash: 'abc123' },
   *   commitlint: {
   *     type: 'feat',
   *     scope: 'api',
   *     message: 'new endpoint'
   *   }
   * });
   * // '- **api:** new endpoint ([abc123](...))'
   * ```
   *
   * @example With PR number
   * ```typescript
   * const entry = formatter.formatCommit({
   *   base: { hash: 'def456' },
   *   commitlint: {
   *     message: 'fix bug'
   *   },
   *   prNumber: '123'
   * });
   * // '- fix bug ([def456](...)) (#123)'
   * ```
   */
  public formatCommit(commit: CommitValue, options?: Options): string {
    const {
      commitlint,
      base: { hash },
      prNumber
    } = commit;
    const { repoUrl, formatTemplate = DEFAULT_TEMPLATE } = {
      ...this.options,
      ...options
    };

    const scopeHeader = commitlint.scope
      ? this.formatScope(commitlint.scope)
      : '';
    const prLink = prNumber
      ? this.foramtLink(
          '#' + prNumber,
          repoUrl ? `${repoUrl}/pull/${prNumber}` : ''
        )
      : '';
    const hashLink = hash
      ? this.foramtLink(
          hash.slice(0, 7),
          repoUrl ? `${repoUrl}/commit/${hash}` : ''
        )
      : '';

    return Shell.format(formatTemplate, {
      ...commit,
      scopeHeader: scopeHeader,
      commitLink: hashLink,
      prLink
    });
  }

  /**
   * Formats a target string as a Markdown link
   *
   * Creates a Markdown-formatted link with optional URL.
   * If no URL is provided, formats as a plain reference.
   *
   * @param target - Text to display
   * @param url - Optional URL for the link
   * @returns Formatted Markdown link
   *
   * @example With URL
   * ```typescript
   * const link = formatter.foramtLink('abc123', 'https://github.com/org/repo/commit/abc123');
   * // '([abc123](https://github.com/org/repo/commit/abc123))'
   * ```
   *
   * @example Without URL
   * ```typescript
   * const link = formatter.foramtLink('abc123');
   * // '(abc123)'
   * ```
   */
  public foramtLink(target: string, url?: string): string {
    return url ? `([${target}](${url}))` : `(${target})`;
  }

  /**
   * Formats a commit hash as a Markdown link
   *
   * @deprecated Use foramtLink instead
   * @param target - Commit hash to display
   * @param url - Optional URL to the commit
   * @returns Formatted Markdown link
   *
   * @example
   * ```typescript
   * const link = formatter.formatCommitLink(
   *   'abc123',
   *   'https://github.com/org/repo/commit/abc123'
   * );
   * // '([abc123](https://github.com/org/repo/commit/abc123))'
   * ```
   */
  public formatCommitLink(target: string, url?: string): string {
    return url ? `([${target}](${url}))` : `(${target})`;
  }

  /**
   * Formats a commit scope in Markdown
   *
   * Wraps the scope in bold syntax and adds a colon.
   *
   * @param scope - Scope to format
   * @returns Formatted scope in Markdown
   *
   * @example
   * ```typescript
   * const scope = formatter.formatScope('api');
   * // '**api:**'
   * ```
   */
  public formatScope(scope: string): string {
    return `**${scope}:**`;
  }
}
