/**
 * @module ChangeLog
 * @description Core interfaces for changelog generation
 *
 * This module provides the core interfaces and types for generating
 * changelogs from Git commit history. It includes types for commit
 * parsing, formatting, and changelog generation.
 *
 * Core Components:
 * - Commit data structures
 * - Changelog formatting
 * - Git log options
 * - Changelog generation
 *
 * @example Basic usage
 * ```typescript
 * class MyChangeLog implements ChangeLogInterface {
 *   async getCommits(options?: GitChangelogOptions): Promise<CommitValue[]> {
 *     // Implementation
 *   }
 * }
 *
 * class MyFormatter implements ChangelogFormatter {
 *   format(commits: CommitValue[]): string[] {
 *     // Implementation
 *   }
 * }
 * ```
 */
import type { CommitField } from 'gitlog';

/**
 * Base commit type mapping Git commit fields
 *
 * Maps all available Git commit fields to optional string values.
 * Uses the CommitField type from gitlog package to ensure type safety.
 *
 * Available fields include:
 * - hash: Full commit hash
 * - abbrevHash: Abbreviated commit hash
 * - subject: Commit message subject
 * - authorName: Author's name
 * - authorDate: Author date
 * - And many more from gitlog.CommitField
 *
 * @example
 * ```typescript
 * const commit: BaseCommit = {
 *   hash: 'abc123def456',
 *   abbrevHash: 'abc123',
 *   subject: 'feat: new feature',
 *   authorName: 'John Doe',
 *   authorDate: '2023-01-01'
 * };
 * ```
 */
export type BaseCommit = {
  [key in CommitField]: string | undefined;
};

/**
 * Configuration options for changelog generation
 *
 * Provides comprehensive options for controlling how changelogs
 * are generated from Git history, including commit range selection,
 * formatting, and filtering.
 *
 * @example Basic usage
 * ```typescript
 * const options: GitChangelogOptions = {
 *   from: 'v1.0.0',
 *   to: 'v2.0.0',
 *   directory: 'packages/my-pkg',
 *   noMerges: true
 * };
 * ```
 *
 * @example Custom formatting
 * ```typescript
 * const options: GitChangelogOptions = {
 *   types: [
 *     { type: 'feat', section: '### Features' },
 *     { type: 'fix', section: '### Bug Fixes' }
 *   ],
 *   formatTemplate: '* ${commitlint.message} ${prLink}',
 *   commitBody: true
 * };
 * ```
 */
export interface GitChangelogOptions {
  /**
   * Starting tag or commit reference
   *
   * Defines the start point for collecting commits.
   * Can be a tag name, commit hash, or branch name.
   *
   * @example
   * ```typescript
   * from: 'v1.0.0'  // Start from v1.0.0 tag
   * from: 'abc123'  // Start from specific commit
   * ```
   */
  from?: string;

  /**
   * Ending tag or commit reference
   *
   * Defines the end point for collecting commits.
   * Can be a tag name, commit hash, or branch name.
   *
   * @example
   * ```typescript
   * to: 'v2.0.0'    // End at v2.0.0 tag
   * to: 'main'      // End at main branch
   * ```
   */
  to?: string;

  /**
   * Directory to collect commits from
   *
   * Limits commit collection to changes in specified directory.
   * Useful for monorepo package-specific changelogs.
   *
   * @example
   * ```typescript
   * directory: 'packages/my-pkg'  // Only changes in this directory
   * ```
   */
  directory?: string;

  /**
   * Git commit fields to include
   *
   * Specifies which Git commit fields to retrieve.
   * @default ["abbrevHash", "hash", "subject", "authorName", "authorDate"]
   *
   * @example
   * ```typescript
   * fields: ['hash', 'subject', 'authorName']
   * ```
   */
  fields?: CommitField[];

  /**
   * Whether to exclude merge commits
   *
   * When true, merge commits are filtered out from the changelog.
   * @default true
   *
   * @example
   * ```typescript
   * noMerges: true  // Exclude merge commits
   * noMerges: false // Include merge commits
   * ```
   */
  noMerges?: boolean;

  /**
   * Commit type configurations
   *
   * Defines how different commit types should be handled and
   * formatted in the changelog.
   *
   * @example
   * ```typescript
   * types: [
   *   { type: 'feat', section: '### Features' },
   *   { type: 'fix', section: '### Bug Fixes' },
   *   { type: 'chore', hidden: true }  // Skip chore commits
   * ]
   * ```
   */
  types?: { type: string; section?: string; hidden?: boolean }[];

  /**
   * Template for formatting commit entries
   *
   * Supports variables from CommitValue properties and adds:
   * - ${scopeHeader}: Formatted scope
   * - ${commitLink}: Commit hash link
   * - ${prLink}: PR number link
   *
   * @default '\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}'
   *
   * @example
   * ```typescript
   * formatTemplate: '* ${commitlint.message} (${commitLink})'
   * ```
   */
  formatTemplate?: string;

  /**
   * Whether to include commit message body
   *
   * When true, includes the full commit message body
   * in the changelog entry.
   *
   * @since 2.3.0
   * @default false
   *
   * @example
   * ```typescript
   * commitBody: true  // Include full commit message
   * ```
   */
  commitBody?: boolean;
}

/**
 * Raw commit message parsing result
 *
 * Represents a parsed conventional commit message with its
 * component parts.
 *
 * @example
 * ```typescript
 * const tuple: CommitTuple = {
 *   raw: 'feat(api): add new endpoint\n\nDetails here',
 *   type: 'feat',
 *   scope: 'api',
 *   message: 'add new endpoint',
 *   body: 'Details here'
 * };
 * ```
 */
export interface CommitTuple {
  /** Original commit message */
  raw: string;
  /** Commit type (e.g., 'feat', 'fix') */
  type?: string;
  /** Commit scope (e.g., 'api', 'core') */
  scope?: string;
  /** Main commit message */
  message: string;
  /** Optional commit body */
  body?: string;
}

/**
 * Parsed conventional commit data
 *
 * Represents a commit message parsed according to the
 * conventional commit specification.
 *
 * Format: type(scope): message
 *
 * @example
 * ```typescript
 * const commit: Commitlint = {
 *   type: 'feat',
 *   scope: 'api',
 *   message: 'add new endpoint',
 *   body: 'Adds support for new API endpoint\n\nBREAKING CHANGE: API format changed'
 * };
 * ```
 */
export interface Commitlint {
  /** Commit type (e.g., 'feat', 'fix') */
  type?: string;
  /** Commit scope (e.g., 'api', 'core') */
  scope?: string;
  /** Main commit message */
  message: string;
  /**
   * Commit message body with title removed
   * @since 2.3.0
   */
  body?: string;
}

/**
 * Complete commit information
 *
 * Combines Git commit data, parsed conventional commit info,
 * and PR metadata into a single value object.
 *
 * @example
 * ```typescript
 * const commit: CommitValue = {
 *   base: {
 *     hash: 'abc123',
 *     subject: 'feat(api): new endpoint (#123)'
 *   },
 *   commitlint: {
 *     type: 'feat',
 *     scope: 'api',
 *     message: 'new endpoint'
 *   },
 *   commits: [],
 *   prNumber: '123'
 * };
 * ```
 */
export interface CommitValue {
  /** Raw Git commit information */
  base: BaseCommit;

  /** Parsed conventional commit data */
  commitlint: Commitlint;

  /** Sub-commits (for merge commits) */
  commits: CommitValue[];

  /** Associated pull request number */
  prNumber?: string;
}

/**
 * Interface for changelog formatting
 *
 * Defines the contract for classes that format commit data
 * into changelog entries.
 *
 * @example
 * ```typescript
 * class MarkdownFormatter implements ChangelogFormatter {
 *   format(commits: CommitValue[]): string[] {
 *     return commits.map(commit => 
 *       `- ${commit.commitlint.message} (#${commit.prNumber})`
 *     );
 *   }
 * }
 * ```
 */
export interface ChangelogFormatter {
  /**
   * Formats commits into changelog entries
   *
   * @param commits - Array of commits to format
   * @param options - Optional formatting options
   * @returns Array of formatted changelog lines
   */
  format<Opt extends GitChangelogOptions>(
    commits: unknown[],
    options?: Opt
  ): string[];
}

/**
 * Interface for changelog generation
 *
 * Defines the contract for classes that generate changelogs
 * from Git history.
 *
 * @example
 * ```typescript
 * class GitChangelog implements ChangeLogInterface {
 *   async getCommits(options?: GitChangelogOptions): Promise<CommitValue[]> {
 *     // Get commits from Git and parse them
 *     const commits = await gitlog(options);
 *     return commits.map(commit => ({
 *       base: commit,
 *       commitlint: parseCommit(commit.subject),
 *       commits: []
 *     }));
 *   }
 * }
 * ```
 */
export interface ChangeLogInterface {
  /**
   * Retrieves and parses Git commits
   *
   * @param options - Optional Git log options
   * @returns Promise resolving to array of parsed commits
   */
  getCommits(options?: GitChangelogOptions): Promise<CommitValue[]>;
}
