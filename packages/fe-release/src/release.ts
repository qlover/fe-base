import type { ReleaseContextOptions } from './type';
import ReleaseContext from './implments/ReleaseContext';
import ReleaseTask from './implments/ReleaseTask';
import { AsyncExecutor } from '@qlover/fe-corekit';
import { DEFAULT_INCREMENT } from './defaults';
import GithubReleasePR from './implments/GithubReleasePR';
import CreateReleasePullRequest from './plugins/CreateReleasePullRequest';
import PublishNpm from './plugins/PublishNpm';
import Workspaces from './plugins/workspaces/Workspaces';
import { PluginTuple, PluginClass, tuple } from './utils/tuple';

const innerPlugins: PluginTuple<PluginClass>[] = [
  tuple(CreateReleasePullRequest, {
    increment: DEFAULT_INCREMENT,
    pullRequestInterface: GithubReleasePR
  }),
  tuple(PublishNpm),
  tuple(Workspaces)
];

export function release(context: ReleaseContextOptions): Promise<unknown> {
  const releaseContext = new ReleaseContext(context);

  if (releaseContext.env.get('FE_RELEASE') === 'false') {
    throw new Error('Skip Release');
  }

  const releaseTask = new ReleaseTask(releaseContext, new AsyncExecutor());

  return releaseTask.exec(innerPlugins);
}
