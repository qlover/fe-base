import type ReleaseContext from '../../implments/ReleaseContext';
import type { ReleaseItInstanceResult } from '../../implments/release-it/ReleaseIt';
import { DeepPartial, ReleaseConfig } from '../../type';
import type { WorkspaceValue } from '../workspaces/Workspaces';
import get from 'lodash/get';

export type ComposeWorkspace = WorkspaceValue & ReleaseItInstanceResult;

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
  createChangelog(): Promise<ReleaseItInstanceResult> {
    return this.context.releaseIt.createChangelog();
  }

  async createChangeLogs(
    workspaces: WorkspaceValue[]
  ): Promise<ComposeWorkspace[]> {
    const composeWorkspaces: ComposeWorkspace[] = [];
    for (const workspace of workspaces) {
      this.context.setConfig({
        workspaces: {
          workspace
        }
      } as DeepPartial<ReleaseConfig>);

      const generateResult = await this.createChangelog();

      composeWorkspaces.push({
        ...workspace,
        ...generateResult
      });
    }
    return composeWorkspaces;
  }
}
