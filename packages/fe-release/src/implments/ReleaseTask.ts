import type { ReleaseContextOptions } from '../type';
import type Plugin from '../plugins/Plugin';
import { tuple, type PluginClass, type PluginTuple } from '../utils/tuple';
import { AsyncExecutor } from '@qlover/fe-corekit';
import ReleaseContext from './ReleaseContext';
import GithubPR from '../plugins/githubPR/GithubPR';
import Workspaces from '../plugins/workspaces/Workspaces';
import { loaderPluginsFromPluginTuples } from '../utils/loader';
import Changelog from '../plugins/Changelog';
import GithubChangelog from '../plugins/githubPR/GithubChangelog';

const innerTuples: PluginTuple<PluginClass>[] = [
  tuple(Workspaces),
  tuple(Changelog, {}),
  tuple(GithubPR, {}),
  tuple(GithubChangelog, {})
];

export default class ReleaseTask {
  protected context: ReleaseContext;
  constructor(
    options: ReleaseContextOptions = {},
    private executor: AsyncExecutor = new AsyncExecutor(),
    private defaultTuples: PluginTuple<PluginClass>[] = innerTuples
  ) {
    this.context = new ReleaseContext(options);
  }

  getContext(): ReleaseContext {
    return this.context;
  }

  async usePlugins(
    externalTuples?: PluginTuple<PluginClass>[]
  ): Promise<Plugin[]> {
    externalTuples = externalTuples || this.context.shared.plugins || [];

    const plugins = await loaderPluginsFromPluginTuples(this.context, [
      ...this.defaultTuples,
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

  async exec(externalTuples?: PluginTuple<PluginClass>[]): Promise<unknown> {
    if (this.context.env.get('FE_RELEASE') === 'false') {
      throw new Error('Skip Release');
    }

    // load plugins
    await this.usePlugins(externalTuples);

    return this.run();
  }
}
