import type { ReleaseItInstanceResult } from '../../implments/release-it/ReleaseIt';
import type GitBase from '../GitBase';
import type ReleaseContext from '../../implments/ReleaseContext';
import get from 'lodash/get';

export type CreateReleaseResult = {
  tagName: string;
  releaseBranch: string;
};

export default class BranchManager {
  constructor(
    private context: ReleaseContext,
    private gitBase: GitBase
  ) {}

  /**
   * Checks the current tag.
   *
   * @returns The tag name.
   */
  async checkTag(
    releaseResult: ReleaseItInstanceResult
  ): Promise<{ tagName: string }> {
    const tagName =
      get(releaseResult, 'version') || this.context.getPkg('version');

    if (typeof tagName !== 'string') {
      throw new Error('Tag name is not a string');
    }

    this.context.logger.verbose('Created Tag is:', tagName);

    return { tagName };
  }

  /**
   * Gets the release branch based on the tag name.
   *
   * PR merge to source branch name
   *
   * eg.
   * release-1.0.0 -> master
   *
   * @param tagName - The tag name for the release.
   * @returns The formatted release branch.
   */
  getReleaseBranchName(tagName: string): string {
    const branchNameTpl =
      this.context.shared.branchName || 'release-${tagName}';

    if (typeof branchNameTpl !== 'string') {
      throw new Error('Branch name template is not a string');
    }

    this.context.logger.verbose('Release Branch template is:', branchNameTpl);

    return this.context.shell.format(branchNameTpl, {
      pkgName: this.context.releasePackageName,
      env: this.context.shared.releaseEnv,
      branch: this.context.shared.sourceBranch,
      tagName
    });
  }

  /**
   * Create a branch that merges to a tag with new changlog and version.
   *
   * Can be used to merge to the main branch or create a PR to the main branch.
   *
   * eg. release-production-1.0.0
   *
   * @param releaseResult - The release result.
   * @returns The release branch.
   */
  async createReleaseBranch(
    releaseResult: ReleaseItInstanceResult
  ): Promise<CreateReleaseResult> {
    const { tagName } = await this.checkTag(releaseResult);
    const releaseBranch = this.getReleaseBranchName(tagName);
    const { sourceBranch, currentBranch } = this.context.shared;

    this.context.logger.verbose('PR CurrentBranch is:', currentBranch);
    this.context.logger.verbose('PR SourceBranch is:', sourceBranch);
    this.context.logger.verbose('PR ReleaseBranch is:', releaseBranch);

    try {
      await this.context.shell.exec(
        `git fetch origin ${sourceBranch} ${currentBranch}`
      );
      await this.context.shell.exec(
        `git checkout -b ${releaseBranch} ${currentBranch}`
      );
      await this.context.shell.exec(`git push origin ${releaseBranch}`);
    } catch (error) {
      // maybe not allow token Workflow permissions
      // FIXME: move to LifeCycle onBefore
      if (
        (error as { message: string }).message.includes(
          'remote: Permission to '
        )
      ) {
        this.context.logger.warn(
          `Token maybe not allow Workflow permissions, can you try to open "Workflow permissions" -> "Read and write permissions" for this token?`
        );
      }

      throw error;
    }

    return { tagName, releaseBranch };
  }
}
