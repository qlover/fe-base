import type { OptionValues } from 'commander';
import { join, parse } from 'node:path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import set from 'lodash/set';

export function factory<T, Args extends unknown[]>(
  Constructor: (new (...args: Args) => T) | ((...args: Args) => T),
  ...args: Args
): T {
  // check Constructor is class constructor
  if (
    typeof Constructor === 'function' &&
    Constructor.prototype &&
    Constructor.prototype.constructor === Constructor
  ) {
    return new (Constructor as new (...args: Args) => T)(...args);
  }
  // if it is a normal function, call it directly
  return (Constructor as (...args: Args) => T)(...args);
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

const getPluginName = (pluginName: string): string => {
  if (pluginName.startsWith('.')) {
    return parse(pluginName).name;
  }

  return pluginName;
};

export function reduceOptions(opts: OptionValues): OptionValues {
  return Object.entries(opts).reduce((acc, [key, value]) => {
    set(acc, key, value);
    return acc;
  }, {});
}
