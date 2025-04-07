import Plugin from '../Plugin';

/**
 * Represents a class that extends Plugin.
 */
// eslint-disable-next-line
export type PluginClass<T extends unknown[] = any[]> = new (
  ...args: T
) => Plugin;

/**
 * Represents the constructor parameters for a specific Plugin class, excluding the first parameter.
 * This assumes that the constructor parameters are known and can be inferred.
 */
export type PluginConstructorParams<T extends PluginClass> = T extends new (
  // eslint-disable-next-line
  first: any,
  ...args: infer P
) => unknown
  ? P
  : never;

export type PluginTuple<T extends PluginClass> = [
  T | string,
  ...PluginConstructorParams<T>
];

export function tuple<T extends PluginClass>(
  plugin: T | string,
  ...args: PluginConstructorParams<T>
): PluginTuple<T> {
  return [plugin, ...args] as PluginTuple<T>;
}
