import type { TemplateEngine } from '@qlover/scripts-context';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';
import { worksapce2name } from '../utils/createWorkspace';
import { releaseJson } from '../defaults';
import type { TemplateContext } from '../type';

export type ReleaseBranchResult = {
  /**
   * 用于创建分支时附带的 tagName
   */
  releaseTagName: string;
  /**
   * 创建分支名
   */
  releaseBranch: string;
};

export type BranchNameTplVars = {
  /**
   * 仓库名
   */
  repoName: string;

  /**
   * 当前发布流程的唯一 ID
   */
  releaseId: string;

  /**
   * 时间戳
   */
  timestamp: string;

  /**
   * 作者名
   */
  authorName: string;

  /**
   * 发布时的环境
   */
  env: string;

  /**
   * 发布项目的数量
   */
  count: number;

  /**
   * 工作区格式化后的内容
   *
   * 一般来说是 `pkgName@version` 的格式的组合字符串
   *
   * 但是最多只显示3个工作区
   */
  spaces: string;
};

export interface ReleaseFormatterConfig {
  /**
   * 仓库名
   */
  repoName?: string;
  /**
   * 作者名
   */
  authorName?: string;

  /**
   * 发布时的环境
   */
  env?: string;

  /**
   * 当前发布流程的唯一 ID
   */
  releaseId?: string;

  /**
   * The branch name for batch release
   *
   * 支持的模板变量见 {@link BranchNameTplVars}
   *
   * @default `release/${repoName}-${releaseId}`
   */
  branchName?: string;

  /**
   * The tag name for batch release
   *
   * 支持的模板变量见 {@link BranchNameTplVars}
   *
   * @default `release-tag-${count}-patch-${releaseId}`
   */
  releaseTagName?: string;

  /**
   *
   * @default 'Release ${spaces}' */
  releaseName?: string;

  /**
   * 用于创建发布分支时的提交信息
   *
   * 如果配置为对象，则支持less和more模板, 其中 less 表示小于3个工作区时的提交信息, more 表示大于3个工作区时的提交信息
   *
   * 提交信息支持完整的 commit 规范，支持 subject，body，foot
   *
   * **对象形式目前处于实验阶段**
   *
   * @example commit 提交格式
   * ```
   * <type>(<scope>): <subject>    <-- 这就是 Header/Subject（必填）
   *                               <-- 空行
   * <body>                        <-- 详细描述（选填）
   *                               <-- 空行
   * <footer>                      <-- 关闭 Issue 或 BREAKING CHANGE（选填）
   * ```
   *
   * @example 完整的模板字符串
   *
   * ```
   * \`\`\`
   * chore(release): bump ${worksapce[0].name} to v${worksapce[0].newVersion} and others
   *   -
   * \`\`\`
   * ```
   *
   * 默认会直接将所有发布包名字和版本列出来
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
          workspace
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
