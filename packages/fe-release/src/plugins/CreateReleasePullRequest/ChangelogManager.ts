import ReleaseContext from '../../interface/ReleaseContext';
import {
  ReleaseItInstanceType,
  ReleaseItInstanceResult,
  ReleaseItInstanceOptions
} from '../../type';
import get from 'lodash/get';

export default class ChangelogManager {
  constructor(private readonly context: ReleaseContext) {
    const sourceBranch =
      this.context.getEnv().get('FE_RELEASE_BRANCH') ??
      this.context.getEnv().get('FE_RELEASE_SOURCE_BRANCH') ??
      'master';

    this.context.setConfig({ sourceBranch });
  }

  getReleaseIt(): ReleaseItInstanceType | undefined {
    const instance = this.context.getConfig('releaseIt');

    return instance as ReleaseItInstanceType;
  }

  /**
   * Gets the options for the release-it changelog process.
   *
   * @returns The options for the release-it changelog process.
   */
  getReleaseItChangelogOptions(): ReleaseItInstanceOptions {
    return {
      ci: true,
      increment: 'patch',
      npm: {
        publish: false
      },
      git: {
        requireCleanWorkingDir: false,
        tag: false,
        push: false
      },
      github: {
        release: false
      },
      verbose: true,
      'dry-run': this.context.dryRun
    };
  }

  /**
   * Gets the changelog and features from the release result.
   *
   * @param releaseResult - The result of the release process.
   * @returns The changelog or a warning message.
   */
  getChangelogAndFeatures(releaseResult: Record<string, unknown>): string {
    if (!releaseResult) {
      this.context.logger.warn(
        'No release-it output found, changelog might be incomplete'
      );
    }

    return get(releaseResult, 'changelog', 'No changelog') as string;
  }

  /**
   * Creates a changelog and version without publishing.
   *
   * @returns The output from the release-it process.
   */
  createChangelogAndVersion(): Promise<ReleaseItInstanceResult> {
    const releaseItInstance = this.getReleaseIt();

    if (!releaseItInstance) {
      throw new Error('releaseIt instance is not set');
    }

    return releaseItInstance(this.getReleaseItChangelogOptions());
  }
}
