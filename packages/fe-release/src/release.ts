import type { ReleaseContextOptions } from './type';
import ReleaseContext from './interface/ReleaseContext';
import ReleaseTask from './implments/ReleaseTask';
import { AsyncExecutor } from '@qlover/fe-corekit';
import { DEFAULT_INCREMENT } from './defaults';
import GithubReleasePR from './implments/GithubReleasePR';
import CheckEnvironment from './plugins/CheckEnvironment';
import CreateReleasePullRequest from './plugins/CreateReleasePullRequest';
import PublishNpm from './plugins/PublishNpm';
import ReleaseIt from './plugins/release-it/ReleaseIt';
import Workspaces from './plugins/workspaces/Workspaces';
import { PluginTuple, PluginClass, tuple } from './utils/tuple';

const innerPlugins: PluginTuple<PluginClass>[] = [
  tuple(CheckEnvironment),
  tuple(ReleaseIt),
  tuple(CreateReleasePullRequest, {
    increment: DEFAULT_INCREMENT,
    pullRequestInterface: GithubReleasePR
  }),
  tuple(PublishNpm),
  tuple(Workspaces)
];

export function release(context: ReleaseContextOptions): Promise<unknown> {
  const releaseContext = new ReleaseContext(context);

  const releaseTask = new ReleaseTask(releaseContext, new AsyncExecutor());

  return releaseTask.exec(innerPlugins);
}
