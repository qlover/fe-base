/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @module PluginTuple
 * @description Type-safe plugin tuple creation and handling
 *
 * This module provides utilities for creating and handling tuples that
 * represent plugin configurations. It ensures type safety when working
 * with plugin constructors and their parameters.
 *
 * Core Features:
 * - Type-safe plugin class handling
 * - Constructor parameter inference
 * - Plugin tuple creation
 *
 * @example Basic usage
 * ```typescript
 * class MyPlugin extends ScriptPlugin {
 *   constructor(context: ScriptContext, config: { option: string }) {
 *     super(context);
 *   }
 * }
 *
 * const pluginTuple = tuple(MyPlugin, { option: 'value' });
 * // [MyPlugin, { option: 'value' }]
 * ```
 *
 * @example Plugin name string
 * ```typescript
 * const pluginTuple = tuple('MyPlugin', { option: 'value' });
 * // ['MyPlugin', { option: 'value' }]
 * ```
 */
import type {
  ScriptContext,
  ScriptPlugin,
  ScriptPluginProps
} from '@qlover/scripts-context';

/**
 * Plugin class constructor type
 *
 * Represents a constructor for a class that extends ScriptPlugin.
 * Supports generic constructor arguments.
 *
 * @template T - Array type for constructor arguments
 *
 * @example
 * ```typescript
 * class MyPlugin extends ScriptPlugin {
 *   constructor(context: ScriptContext, config: { option: string }) {
 *     super(context);
 *   }
 * }
 *
 * const PluginCtor: PluginClass = MyPlugin;
 * ```
 */
export type PluginClass<T extends unknown[] = any[]> = new (
  ...args: T
) => ScriptPlugin<ScriptContext<any>, ScriptPluginProps>;

/**
 * Plugin constructor parameters type
 *
 * Extracts the constructor parameter types for a plugin class,
 * excluding the first parameter (context). Uses TypeScript's
 * conditional types and inference to extract parameter types.
 *
 * @template T - Plugin class type
 *
 * @example
 * ```typescript
 * class MyPlugin extends ScriptPlugin {
 *   constructor(
 *     context: ScriptContext,
 *     config: { option: string },
 *     extra: number
 *   ) {
 *     super(context);
 *   }
 * }
 *
 * // Type: [{ option: string }, number]
 * type Params = PluginConstructorParams<typeof MyPlugin>;
 * ```
 */
export type PluginConstructorParams<T extends PluginClass> = T extends new (
  first: any,
  ...args: infer P
) => unknown
  ? P
  : never;

/**
 * Plugin configuration tuple type
 *
 * Represents a tuple containing a plugin class (or name) and its
 * constructor arguments. Used for plugin registration and loading.
 *
 * @template T - Plugin class type
 *
 * @example
 * ```typescript
 * class MyPlugin extends ScriptPlugin {
 *   constructor(context: ScriptContext, config: { option: string }) {
 *     super(context);
 *   }
 * }
 *
 * // Type: [typeof MyPlugin, { option: string }]
 * type Tuple = PluginTuple<typeof MyPlugin>;
 *
 * // Type: [string, { option: string }]
 * type StringTuple = PluginTuple<'MyPlugin'>;
 * ```
 */
export type PluginTuple<T extends PluginClass> = [
  T | string,
  ...PluginConstructorParams<T>
];

/**
 * Creates a type-safe plugin configuration tuple
 *
 * Helper function for creating tuples that represent plugin
 * configurations with proper type inference for constructor
 * arguments.
 *
 * @template T - Plugin class type
 * @param plugin - Plugin class or name
 * @param args - Plugin constructor arguments
 * @returns Plugin configuration tuple
 *
 * @example Class-based plugin
 * ```typescript
 * class MyPlugin extends ScriptPlugin {
 *   constructor(
 *     context: ScriptContext,
 *     config: { option: string },
 *     extra: number
 *   ) {
 *     super(context);
 *   }
 * }
 *
 * const config = tuple(MyPlugin, { option: 'value' }, 42);
 * // [MyPlugin, { option: 'value' }, 42]
 * ```
 *
 * @example String-based plugin
 * ```typescript
 * const config = tuple('MyPlugin', { option: 'value' });
 * // ['MyPlugin', { option: 'value' }]
 * ```
 */
export function tuple<T extends PluginClass>(
  plugin: T | string,
  ...args: PluginConstructorParams<T>
): PluginTuple<T> {
  return [plugin, ...args] as PluginTuple<T>;
}
