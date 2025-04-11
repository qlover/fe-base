import type { AsyncExecutor } from '@qlover/fe-corekit';
import type ReleaseContext from './ReleaseContext';
import type { PluginClass, PluginTuple } from '../utils/tuple';
import { loaderPluginsFromPluginTuples } from '../utils/loader';
import Workspaces from '../plugins/workspaces/Workspaces';
import Plugin from '../plugins/Plugin';

export default class ReleaseTask {
  constructor(
    private context: ReleaseContext,
    private executor: AsyncExecutor
  ) {}

  async usePlugins(
    defaultPlugins: PluginTuple<PluginClass>[]
  ): Promise<Plugin[]> {
    const externalTuples = this.context.shared.plugins || [];

    const plugins = await loaderPluginsFromPluginTuples(this.context, [
      ...defaultPlugins,
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

  async exec(defaultPlugins: PluginTuple<PluginClass>[]): Promise<unknown> {
    // load plugins
    await this.usePlugins(defaultPlugins);

    return this.run();
  }
}
