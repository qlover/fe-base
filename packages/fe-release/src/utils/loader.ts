/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PluginTuple } from './tuple';
import type { PluginClass } from './tuple';
import type {
  ScriptContext,
  ScriptPlugin,
  ScriptPluginProps
} from '@qlover/scripts-context';
import type ReleaseContext from '../implments/ReleaseContext';
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
  } catch {
    try {
      const module = await import(join(process.cwd(), pluginName));
      plugin = module.default;
    } catch {
      // In some cases or tests we might need to support legacy `require.resolve`
      const require = createRequire(process.cwd());
      const module = await import(
        pathToFileURL(require.resolve(pluginName, { paths: [process.cwd()] }))
          .href
      );
      plugin = module.default;
    }
  }
  return [getPluginName(pluginName), plugin];
}

export async function loaderPluginsFromPluginTuples<
  T extends ScriptPlugin<ScriptContext<any>, ScriptPluginProps>
>(
  context: ReleaseContext,
  pluginsTuples: PluginTuple<PluginClass>[],
  maxLimit = 5
): Promise<T[]> {
  // Helper function to load and create a plugin
  const loadAndCreatePlugin = async (
    pluginClassOrString: PluginClass | string,
    ...args: unknown[]
  ): Promise<ScriptPlugin<ScriptContext<any>, ScriptPluginProps>> => {
    if (typeof pluginClassOrString === 'string') {
      const [, pluginClass] = await load<PluginClass>(pluginClassOrString);
      return factory(pluginClass, context, ...args);
    }
    return factory(pluginClassOrString, context, ...args);
  };

  // Limit the number of concurrent plugin loads
  const limit = pLimit(maxLimit);

  const pluginPromises = pluginsTuples.map(([pluginClassOrString, ...args]) =>
    limit(() => loadAndCreatePlugin(pluginClassOrString, ...args))
  );

  return Promise.all(pluginPromises) as Promise<T[]>;
}
