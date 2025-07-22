/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ScriptContext,
  ScriptPlugin,
  ScriptPluginProps
} from '@qlover/scripts-context';

export type PluginClass<T extends unknown[] = any[]> = new (
  ...args: T
) => ScriptPlugin<ScriptContext<any>, ScriptPluginProps>;

/**
 * Represents the constructor parameters for a specific Plugin class, excluding the first parameter.
 * This assumes that the constructor parameters are known and can be inferred.
 */
export type PluginConstructorParams<T extends PluginClass> = T extends new (
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
