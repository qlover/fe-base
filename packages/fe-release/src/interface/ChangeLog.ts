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
   * log
   * @default '%H%n%s%n%b%n----------------------'
   */
  format?: string;

  /**
   *
   */
  logCommand?: string;

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
   * @default '- ${message}${prRef}\n'
   */
  formatTemplate?: string;
  /**
   * custom formatter
   */
  formatter?: ChangelogFormatter;
}

export interface CommitTuple {
  raw: string;
  type?: string;
  scope?: string;
  message: string;
  body?: string;
}

export interface CommitValue {
  hash: string;
  raw: {
    title: string;
    body: string;
    bodyLines?: string[];
  };
  title: {
    type?: string;
    scope?: string;
    message: string;
  };
  commits: CommitValue[];
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
