/**
 * @module ReleaseFormatter
 * @description Template-based formatting for release branches, commits, and PRs
 *
 * Centralizes string formatting for the GitHub release flow. Uses
 * {@link TemplateEngine} from `@qlover/scripts-context` with ES6-style
 * `${ path }` placeholders and variables from {@link BranchNameTplVars}.
 *
 * Responsibilities:
 * - **Branch/tag names**: `getReleaseBranch()` from `branchName` / `releaseTagName` templates
 * - **Commit message**: `getCommitMessage()` with optional `less` / `more` templates when
 *   workspace count exceeds 3
 * - **PR content**: `getPRTitle()` and `getPRBody()` with single- vs multi-workspace changelog
 *   formatting via `batchPRBody`
 *
 * Defaults are sourced from `releaseJson.github` in {@link defaults}.
 * {@link Github} constructs an instance and calls `setConfig()` in `onBefore`
 * with runtime context (`repoName`, `releaseId`, `env`, etc.).
 *
 * @example Branch name template variables
 * ```typescript
 * // Template: release/${repoName}-${releaseId}
 * // Variables: repoName, releaseId, timestamp, authorName, env, count, spaces
 * formatter.getReleaseBranch(workspaces);
 * ```
 *
 * @example Multi-workspace PR body
 * ```typescript
 * formatter.getPRBody(workspaces, releaseBranchResult, templateContext);
 * ```
 */
import type { TemplateEngine } from '@qlover/scripts-context';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';
import { worksapce2name } from '../utils/createWorkspace';
import { releaseJson } from '../defaults';
import type { TemplateContext } from '../type';

export type ReleaseBranchResult = {
  /**
   * Tag name associated with the release branch
   */
  releaseTagName: string;
  /**
   * Release branch name to create and push
   */
  releaseBranch: string;
};

export type BranchNameTplVars = {
  /**
   * Repository name
   */
  repoName: string;

  /**
   * Unique ID for the current release run
   */
  releaseId: string;

  /**
   * Timestamp string used in templates
   */
  timestamp: string;

  /**
   * Author name
   */
  authorName: string;

  /**
   * Release environment (for example `production`)
   */
  env: string;

  /**
   * Number of workspaces in this release
   */
  count: number;

  /**
   * Formatted workspace summary for templates
   *
   * Typically a comma-separated list of `pkgName@version` entries.
   * Capped at the first 3 workspaces for display brevity.
   */
  spaces: string;
};

export interface ReleaseFormatterConfig {
  /**
   * Repository name
   */
  repoName?: string;
  /**
   * Author name
   */
  authorName?: string;

  /**
   * Release environment
   */
  env?: string;

  /**
   * Unique ID for the current release run
   */
  releaseId?: string;

  /**
   * The branch name for batch release
   *
   * Template variables: see {@link BranchNameTplVars}
   *
   * @default `release/${repoName}-${releaseId}`
   */
  branchName?: string;

  /**
   * The tag name for batch release
   *
   * Template variables: see {@link BranchNameTplVars}
   *
   * @default `release-tag-${count}-patch-${releaseId}`
   */
  releaseTagName?: string;

  /**
   *
   * @default 'Release ${spaces}' */
  releaseName?: string;

  /**
   * Commit message template used when creating the release branch
   *
   * When configured as an object, supports `less` and `more` templates:
   * - `less`: used when workspace count is 3 or fewer
   * - `more`: used when workspace count exceeds 3
   *
   * Supports conventional commit structure: subject, body, and footer.
   *
   * **Object form is experimental.**
   *
   * @example Conventional commit layout
   * ```
   * <type>(<scope>): <subject>    <-- Header/Subject (required)
   *                               <-- blank line
   * <body>                        <-- detailed description (optional)
   *                               <-- blank line
   * <footer>                      <-- issue refs or BREAKING CHANGE (optional)
   * ```
   *
   * @example Full template string
   *
   * ```
   * \`\`\`
   * chore(release): bump ${worksapce[0].name} to v${worksapce[0].newVersion} and others
   *   -
   * \`\`\`
   * ```
   *
   * By default, lists all package names and versions in the commit message.
   *
   * @default `'chore(release): ${spaces}'`
   */
  commitMessage?:
    | string
    | {
        less: string;
        more: string;
      };

  /**
   * Pull request title template
   *
   * @default {@link DEFAULT_PR_TITLE}
   */
  PRTitle?: string;

  /**
   * Pull request body template
   *
   * @default from release.json
   */
  PRBody?: string;

  /**
   * Template for each workspace section in a multi-workspace PR body
   *
   * @default from release.json
   */
  batchPRBody?: string;
}

/**
 * Formats release branch names, commit messages, and PR title/body from templates.
 *
 * Inject a shared {@link TemplateEngine} instance (typically from
 * {@link ReleaseContext.getTemplateEngine}) so formatting stays consistent
 * across plugins.
 */
export class ReleaseFormatter {
  constructor(
    protected templateEngine: TemplateEngine,
    protected config: ReleaseFormatterConfig
  ) {}

  public setConfig(config: Partial<ReleaseFormatterConfig>): void {
    Object.assign(this.config, config);
  }

  protected get defaultBranchNameTpl(): string {
    return this.config.branchName || releaseJson.github.branchName;
  }

  protected get defaultReleaseTagNameTpl(): string {
    return this.config.releaseTagName || releaseJson.github.releaseTagName;
  }

  protected getCommitMessageTpl(count?: number): string {
    let commitMessageTpl = this.config.commitMessage;

    if (typeof commitMessageTpl === 'object') {
      commitMessageTpl =
        typeof count === 'number' && count > 3
          ? commitMessageTpl.more
          : commitMessageTpl.less;
    }

    return commitMessageTpl || releaseJson.github.commitMessage;
  }

  protected buildBranchNameVars(
    workspaces: WorkspaceInterface[]
  ): BranchNameTplVars {
    const workspaceNames = workspaces.slice(0, 3).map((w) =>
      worksapce2name({
        name: w.name,
        version: w.newVersion || w.version
      })
    );

    return {
      count: workspaces.length,
      releaseId: this.config.releaseId || '',
      timestamp: Date.now().toString(),
      repoName: this.config.repoName || '',
      authorName: this.config.authorName || '',
      env: this.config.env || '',
      spaces: workspaceNames.join(',')
    };
  }

  public getReleaseBranch(
    workspaces: WorkspaceInterface[]
  ): ReleaseBranchResult {
    const branchNameVars = this.buildBranchNameVars(workspaces);
    const branchName = this.templateEngine.render(
      this.defaultBranchNameTpl,
      branchNameVars
    );
    const releaseTagName = this.templateEngine.render(
      this.defaultReleaseTagNameTpl,
      branchNameVars
    );

    return {
      releaseBranch: branchName,
      releaseTagName: releaseTagName
    };
  }

  public getCommitMessage(workspaces: WorkspaceInterface[]): string {
    const commitMessageTpl = this.getCommitMessageTpl(workspaces.length);
    const branchNameVars = this.buildBranchNameVars(workspaces);

    return this.templateEngine.render(commitMessageTpl, branchNameVars);
  }

  protected buildPRTemplateVars(
    workspaces: WorkspaceInterface[],
    releaseBranchResult: ReleaseBranchResult,
    context: TemplateContext
  ): Record<string, unknown> {
    const branchNameVars =
      workspaces.length > 0
        ? this.buildBranchNameVars(workspaces)
        : {
            count: 0,
            releaseId: this.config.releaseId || '',
            timestamp: Date.now().toString(),
            repoName: this.config.repoName || '',
            authorName: this.config.authorName || '',
            env: this.config.env || '',
            spaces: ''
          };

    const pkgName =
      branchNameVars.repoName ||
      workspaces[0]?.name ||
      releaseBranchResult.releaseBranch;

    return {
      ...context,
      ...branchNameVars,
      tagName: releaseBranchResult.releaseTagName,
      releaseTagName: releaseBranchResult.releaseTagName,
      releaseBranch: releaseBranchResult.releaseBranch,
      pkgName,
      branch: releaseBranchResult.releaseBranch
    };
  }

  protected formatPRChangelog(workspaces: WorkspaceInterface[]): string {
    if (workspaces.length === 0) {
      return '';
    }

    if (workspaces.length === 1) {
      return workspaces[0].changelog || '';
    }

    return workspaces
      .map((workspace) =>
        this.templateEngine.render(
          this.config.batchPRBody || releaseJson.github.batchPRBody,
          {
            ...workspace,
            // Prefer bumped version in PR changelog section headers
            version: workspace.newVersion || workspace.version,
            newVersion: workspace.newVersion || workspace.version
          }
        )
      )
      .join('\n');
  }

  protected formatPRTagName(
    workspaces: WorkspaceInterface[],
    releaseBranchResult: ReleaseBranchResult
  ): string {
    if (workspaces.length <= 1) {
      return releaseBranchResult.releaseTagName;
    }

    return workspaces
      .map(
        (workspace) =>
          `${workspace.name}@${workspace.newVersion || workspace.version}`
      )
      .join(' ');
  }

  public getPRTitle(
    releaseBranchResult: ReleaseBranchResult,
    context: TemplateContext,
    workspaces: WorkspaceInterface[] = []
  ): string {
    const prTitleTpl = this.config.PRTitle || releaseJson.github.PRTitle;

    return this.templateEngine.render(
      prTitleTpl,
      this.buildPRTemplateVars(workspaces, releaseBranchResult, context)
    );
  }

  public getPRBody(
    workspaces: WorkspaceInterface[],
    releaseBranchResult: ReleaseBranchResult,
    context: TemplateContext
  ): string {
    const prBodyTpl = this.config.PRBody || releaseJson.github.PRBody;

    return this.templateEngine.render(prBodyTpl, {
      ...this.buildPRTemplateVars(workspaces, releaseBranchResult, context),
      tagName: this.formatPRTagName(workspaces, releaseBranchResult),
      changelog: this.formatPRChangelog(workspaces)
    });
  }
}
