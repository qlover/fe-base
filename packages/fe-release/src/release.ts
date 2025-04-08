import type { ReleaseContextOptions, ReleaseReturnValue } from './type';
import { type PluginClass, type PluginTuple, tuple } from './utils/tuple';
import { AsyncExecutor } from '@qlover/fe-corekit';
import { loaderPluginsFromPluginTuples } from './utils/loader';
import ReleaseContext from './interface/ReleaseContext';
import CheckEnvironment from './plugins/CheckEnvironment';
import ReleaseIt from './plugins/release-it/ReleaseIt';
import { DEFAULT_INCREMENT } from './defaults';
import GithubReleasePR from './implments/GithubReleasePR';
import CreateReleasePullRequest from './plugins/CreateReleasePullRequest';
import PublishNpm from './plugins/PublishNpm';

const innerPlugins: PluginTuple<PluginClass>[] = [
  tuple(CheckEnvironment),
  tuple(ReleaseIt),
  tuple(CreateReleasePullRequest, {
    increment: DEFAULT_INCREMENT,
    pullRequestInterface: GithubReleasePR
  }),
  tuple(PublishNpm)
];

export async function release(
  context: ReleaseContextOptions
): Promise<ReleaseReturnValue> {
  const releaseContext = new ReleaseContext(context);

  const executor = new AsyncExecutor();

  const plugins = await loaderPluginsFromPluginTuples(
    releaseContext,
    innerPlugins.concat(releaseContext.options.environment?.plugins || [])
  );

  plugins.forEach((plugin) => {
    executor.use(plugin);
  });

  return executor.exec(releaseContext, ({ returnValue }) => {
    return Promise.resolve(returnValue as ReleaseReturnValue);
  });
}
