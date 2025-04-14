import type { ReleaseContextOptions } from '../type';
import type Plugin from '../plugins/Plugin';
import { tuple, type PluginClass, type PluginTuple } from '../utils/tuple';
import { AsyncExecutor } from '@qlover/fe-corekit';
import ReleaseContext from './ReleaseContext';
import GithubReleasePR from './GithubReleasePR';
import GithubPR from '../plugins/githubPR/GithubPR';
import { DEFAULT_INCREMENT } from '../defaults';
import PublishNpm from '../plugins/PublishNpm';
import Workspaces from '../plugins/workspaces/Workspaces';
import { loaderPluginsFromPluginTuples } from '../utils/loader';

const innerTuples: PluginTuple<PluginClass>[] = [
  tuple(GithubPR, {
    increment: DEFAULT_INCREMENT,
    pullRequestInterface: GithubReleasePR
  }),
  tuple(PublishNpm),
  tuple(Workspaces)
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
      ...this.defaultTuples.filter((tuple) => {
        // filter create release pull request plugin if releasePR is false
        if (!this.context.shared.releasePR && tuple[0] === GithubPR) {
          return false;
        }

        // filter publish npm plugin if releasePackageName is not set
        else if (this.context.shared.releasePR && tuple[0] === PublishNpm) {
          return false;
        }

        return true;
      }),
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
