import type { CommitField } from 'gitlog';

export type BaseCommit = {
  [key in CommitField]: string | undefined;
};

export interface GitChangelogOptions {
  /**
   * start tag
   */
  from?: string;
  /**
   * end tag
   */
  to?: string;
  /**
   * log directory
   */
  directory?: string;

  /**
   * gitlog default fields
   * @default ["abbrevHash", "hash", "subject", "authorName", "authorDate"]
   */
  fileds?: CommitField[];

  /**
   * not include merge commit
   * @default true
   */
  noMerges?: boolean;

  /**
   * custom commit type
   */
  types?: { type: string; section?: string; hidden?: boolean }[];

  /**
   * custom commit format
   *
   * - support `CommitValue` properties
   * - add scopeHeader, commitLink, prLink
   *
   * @default '\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}'
   */
  formatTemplate?: string;

  /**
   * whether to include commit body
   * @since 2.3.0
   * @default false
   */
  commitBody?: boolean;
}

export interface CommitTuple {
  raw: string;
  type?: string;
  scope?: string;
  message: string;
  body?: string;
}

export interface Commitlint {
  type?: string;
  scope?: string;
  message: string;
  /**
   * commit body, remove repeat title
   * @since 2.3.0
   */
  body?: string;
}

export interface CommitValue {
  /**
   * git log base info
   */
  base: BaseCommit;

  /**
   * parsed commitlint info
   */
  commitlint: Commitlint;

  /**
   * parsed commitlint info
   */
  commits: CommitValue[];

  /**
   * pr number
   */
  prNumber?: string;
}

export interface ChangelogFormatter {
  format<Opt extends GitChangelogOptions>(
    commits: unknown[],
    options?: Opt
  ): string[];
}

export interface ChangeLogInterface {
  getCommits(options?: GitChangelogOptions): Promise<CommitValue[]>;
}
