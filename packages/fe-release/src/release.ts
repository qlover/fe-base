import type { ReleaseContextOptions, ReleaseReturnValue } from './type';
import { type PluginClass, type PluginTuple, tuple } from './utils/tuple';
import { AsyncExecutor } from '@qlover/fe-corekit';
import { DEFAULT_INCREMENT } from './defaults';
import { loaderPluginsFromPluginTuples } from './utils/loader';
import ReleaseContext from './interface/ReleaseContext';
import GithubReleasePR from './implments/GithubReleasePR';
import CheckEnvironment from './plugins/CheckEnvironment';
import CreateReleasePullRequest from './plugins/CreateReleasePullRequest';
import PublishNpm from './plugins/PublishNpm';
import PublishPath from './plugins/PublishPath';

const innerPlugins: PluginTuple<PluginClass>[] = [
  tuple(CheckEnvironment),
  tuple(CreateReleasePullRequest, {
    increment: DEFAULT_INCREMENT,
    pullRequestInterface: GithubReleasePR
  }),
  tuple(PublishNpm),
  tuple(PublishPath)
];

export async function release(
  context: ReleaseContextOptions
): Promise<ReleaseReturnValue> {
  const releaseContext = new ReleaseContext(context);

  const executor = new AsyncExecutor();

  const plugins = await loaderPluginsFromPluginTuples(
    releaseContext,
    innerPlugins
  );

  plugins.forEach((plugin) => {
    executor.use(plugin);
  });

  return executor.exec(releaseContext, ({ returnValue }) => {
    return Promise.resolve(returnValue as ReleaseReturnValue);
  });
}
