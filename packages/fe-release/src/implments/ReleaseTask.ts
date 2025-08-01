/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  ScriptContext,
  ScriptPlugin,
  ScriptPluginProps
} from '@qlover/scripts-context';
import { tuple, type PluginClass, type PluginTuple } from '../utils/tuple';
import { AsyncExecutor } from '@qlover/fe-corekit';
import ReleaseContext, { ReleaseContextOptions } from './ReleaseContext';
import GithubPR from '../plugins/githubPR/GithubPR';
import Workspaces from '../plugins/workspaces/Workspaces';
import { loaderPluginsFromPluginTuples } from '../utils/loader';
import Changelog from '../plugins/Changelog';

const innerTuples: PluginTuple<PluginClass>[] = [
  tuple(Workspaces),
  tuple(Changelog, {}),
  tuple(GithubPR, {})
];

const defaultName = 'release';

export default class ReleaseTask {
  protected context: ReleaseContext;
  constructor(
    options: Partial<ReleaseContextOptions> = {},
    private executor: AsyncExecutor = new AsyncExecutor(),
    private defaultTuples: PluginTuple<PluginClass>[] = innerTuples
  ) {
    this.context = new ReleaseContext(defaultName, options);
  }

  getContext(): ReleaseContext {
    return this.context;
  }

  async usePlugins(
    externalTuples?: PluginTuple<PluginClass>[]
  ): Promise<ScriptPlugin<ScriptContext<any>, ScriptPluginProps>[]> {
    externalTuples = externalTuples || this.context.options.plugins || [];

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
