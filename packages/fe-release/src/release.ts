import type { ReleaseContextOptions, ReleaseReturnValue } from './type';
import { AsyncExecutor } from '@qlover/fe-corekit';
import ReleaseContext from './interface/ReleaseContext';
import Plugin from './Plugin';
import CheckEnvironment from './plugins/CheckEnvironment';
import CreateReleasePullRequest from './plugins/CreateReleasePullRequest';
import GithubReleasePR from './implments/GithubReleasePR';
import PublishNpm from './plugins/PublishNpm';
import PublishPath from './plugins/PublishPath';
import { factory, load } from './util';
import { DEFAULT_INCREMENT } from './defaults';

const defaultPlugins = {};

async function loadPlugin(
  plugin: string
): Promise<[string, new (...args: unknown[]) => Plugin]> {
  const [pluginName, PluginClass] = await load(plugin);
  return [pluginName, PluginClass as new (...args: unknown[]) => Plugin];
}

async function injectPlugins(
  context: ReleaseContext,
  initPlugins: Plugin[]
): Promise<Plugin[]> {
  const configPlugins = context.getConfig('plugins', defaultPlugins);

  for (const plugin of Object.keys(configPlugins)) {
    const [, PluginClass] = await loadPlugin(plugin);
    const props = configPlugins[plugin as keyof typeof configPlugins];
    initPlugins.push(factory(PluginClass, context, props));
  }

  return initPlugins;
}

async function getPlugins(context: ReleaseContext): Promise<Plugin[]> {
  const result: Plugin[] = [
    // check the environment, and set environment config
    new CheckEnvironment(context),

    // create a pull request or publish the package
    context.options.environment?.releasePR
      ? new CreateReleasePullRequest(context, {
          increment: DEFAULT_INCREMENT,
          releasePR: new GithubReleasePR(context)
        })
      : new PublishNpm(context),

    // use checkPublishPath to switch to the publish path
    new PublishPath(context)
  ];

  return injectPlugins(context, result);
}

export async function release(
  context: ReleaseContextOptions
): Promise<ReleaseReturnValue> {
  const releaseContext = new ReleaseContext(context);

  const executor = new AsyncExecutor();

  const plugins = await getPlugins(releaseContext);

  plugins.forEach((plugin) => {
    executor.use(plugin);
  });

  return executor.exec(releaseContext, ({ returnValue }) => {
    return Promise.resolve(returnValue as ReleaseReturnValue);
  });
}
