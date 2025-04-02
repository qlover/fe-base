import type { PluginTuple } from './tuple';
import type { PluginClass } from './tuple';
import type Plugin from '../Plugin';
import type ReleaseContext from '../interface/ReleaseContext';
import { join, parse } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { factory } from './factory';
import pLimit from 'p-limit';

function getPluginName(pluginName: string): string {
  if (pluginName.startsWith('.')) {
    return parse(pluginName).name;
  }

  return pluginName;
}

export async function load<T>(pluginName: string): Promise<[string, T]> {
  let plugin = null;
  try {
    const module = await import(pluginName);
    plugin = module.default;
  } catch (err) {
    try {
      const module = await import(join(process.cwd(), pluginName));
      plugin = module.default;
    } catch (err) {
      // In some cases or tests we might need to support legacy `require.resolve`
      const require = createRequire(process.cwd());
      const module = await import(
        // @ts-expect-error
        pathToFileURL(require.resolve(pluginName, { paths: [process.cwd()] }))
      );
      plugin = module.default;
    }
  }
  return [getPluginName(pluginName), plugin];
}

export async function loaderPluginsFromPluginTuples(
  context: ReleaseContext,
  initPlugins: PluginTuple<PluginClass>[],
  maxLimit = 5
): Promise<Plugin[]> {
  const configPlugins: PluginTuple<PluginClass>[] = initPlugins.concat(
    context.getConfig('plugins', [])
  );

  // Helper function to load and create a plugin
  const loadAndCreatePlugin = async (
    pluginClassOrString: PluginClass | string,
    args: unknown[]
  ): Promise<Plugin> => {
    if (typeof pluginClassOrString === 'string') {
      const [, pluginClass] = await load<PluginClass>(pluginClassOrString);
      return factory(pluginClass, context, ...args);
    }
    return factory(pluginClassOrString, context, ...args);
  };

  // Limit the number of concurrent plugin loads
  const limit = pLimit(maxLimit);

  const pluginPromises = configPlugins.map(([pluginClassOrString, ...args]) =>
    limit(() => loadAndCreatePlugin(pluginClassOrString, args))
  );

  return Promise.all(pluginPromises);
}
