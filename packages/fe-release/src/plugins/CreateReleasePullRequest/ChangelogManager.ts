import type ReleaseContext from '../../implments/ReleaseContext';
import type { ReleaseItInstanceResult } from '../../implments/release-it/ReleaseIt';
import get from 'lodash/get';

export default class ChangelogManager {
  constructor(private readonly context: ReleaseContext) {}

  /**
   * Gets the changelog and features from the release result.
   *
   * @param releaseResult - The result of the release process.
   * @returns The changelog or a warning message.
   */
  getChangelogAndFeatures(releaseResult: ReleaseItInstanceResult): string {
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
    return this.context.releaseIt.createChangelog();
  }
}
