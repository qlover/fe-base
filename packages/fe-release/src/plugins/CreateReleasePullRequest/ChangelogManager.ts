import type ReleaseContext from '../../interface/ReleaseContext';
import get from 'lodash/get';
import {
  ReleaseItInstanceOptions,
  ReleaseItInstanceResult
} from '../release-it/ReleaseIt';
import merge from 'lodash/merge';

export default class ChangelogManager {
  constructor(private readonly context: ReleaseContext) {}

  /**
   * Gets the options for the release-it changelog process.
   *
   * @returns The options for the release-it changelog process.
   */
  getReleaseItChangelogOptions(): ReleaseItInstanceOptions {
    return merge({}, this.context.getConfig('releaseIt'), {
      ci: true,
      increment: this.context.getConfig('pullRequest.increment') as string,
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
    });
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
    return this.context.runReleaseIt(this.getReleaseItChangelogOptions());
  }
}
