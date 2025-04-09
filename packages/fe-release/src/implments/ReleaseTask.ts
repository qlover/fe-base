import type { AsyncExecutor } from '@qlover/fe-corekit';
import type ReleaseContext from '../interface/ReleaseContext';
import { loaderPluginsFromPluginTuples } from '../utils/loader';
import { tuple } from '../utils/tuple';
import { PluginClass, PluginTuple } from '../utils/tuple';
import Workspaces from '../plugins/workspaces/Workspaces';
import CheckEnvironment from '../plugins/CheckEnvironment';
import Plugin from '../Plugin';
import ReleaseIt from '../plugins/release-it/ReleaseIt';
import CreateReleasePullRequest from '../plugins/CreateReleasePullRequest';
import { DEFAULT_INCREMENT } from '../defaults';
import GithubReleasePR from './GithubReleasePR';
import PublishNpm from '../plugins/PublishNpm';

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

export default class ReleaseTask {
  constructor(
    private context: ReleaseContext,
    private executor: AsyncExecutor
  ) {}

  async usePlugins(): Promise<Plugin[]> {
    const externalTuples = this.context.options.environment?.plugins || [];

    const plugins = await loaderPluginsFromPluginTuples(this.context, [
      ...innerPlugins,
      ...externalTuples
    ]);

    plugins.forEach((plugin) => {
      // set executor to workspaces plugin
      if (plugin instanceof Workspaces) {
        plugin.setReleaseTask(this);
      }

      this.executor.use(plugin);
    });

    return plugins;
  }

  async run(): Promise<unknown> {
    return this.executor.exec(this.context, (context) =>
      Promise.resolve(context)
    );
  }

  async exec(): Promise<unknown> {
    // load plugins
    await this.usePlugins();

    return this.run();
  }
}
