/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @module PluginLoader
 * @description Dynamic plugin loading and instantiation
 *
 * This module provides utilities for dynamically loading and instantiating
 * plugins from various sources (ESM imports, file paths, package names).
 * It supports concurrent loading with limits and fallback mechanisms.
 *
 * Core Features:
 * - Dynamic ESM imports
 * - Fallback to CommonJS require
 * - Concurrent loading with limits
 * - Plugin instantiation with context
 *
 * @example Basic plugin loading
 * ```typescript
 * // Load plugin by name
 * const [name, Plugin] = await load('@scope/my-plugin');
 *
 * // Load and instantiate multiple plugins
 * const plugins = await loaderPluginsFromPluginTuples(
 *   context,
 *   [
 *     tuple(MyPlugin, { option: 'value' }),
 *     tuple('@scope/my-plugin', { option: 'value' })
 *   ]
 * );
 * ```
 *
 * @example Custom concurrency
 * ```typescript
 * // Load plugins with custom concurrency limit
 * const plugins = await loaderPluginsFromPluginTuples(
 *   context,
 *   pluginTuples,
 *   3 // Max 3 concurrent loads
 * );
 * ```
 */
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

/**
 * Extracts the plugin name from a file path or package name
 *
 * For file paths, extracts the base name without extension.
 * For package names, returns the name as is.
 *
 * @param pluginName - File path or package name
 * @returns Extracted plugin name
 *
 * @example File paths
 * ```typescript
 * getPluginName('./plugins/MyPlugin.js')  // 'MyPlugin'
 * getPluginName('../src/plugins/Auth.ts')  // 'Auth'
 * ```
 *
 * @example Package names
 * ```typescript
 * getPluginName('@scope/plugin')  // '@scope/plugin'
 * getPluginName('my-plugin')      // 'my-plugin'
 * ```
 */
function getPluginName(pluginName: string): string {
  if (pluginName.startsWith('.')) {
    return parse(pluginName).name;
  }

  return pluginName;
}

/**
 * Dynamically loads a plugin module
 *
 * Attempts to load a plugin using multiple strategies:
 * 1. Direct ESM import
 * 2. Import from current working directory
 * 3. Fallback to CommonJS require.resolve
 *
 * @template T - Plugin module type
 * @param pluginName - Plugin name or path to load
 * @returns Promise resolving to [plugin name, plugin module]
 * @throws If plugin cannot be loaded by any method
 *
 * @example Package import
 * ```typescript
 * const [name, Plugin] = await load('@scope/my-plugin');
 * const instance = new Plugin(context);
 * ```
 *
 * @example Local file import
 * ```typescript
 * const [name, Plugin] = await load('./plugins/MyPlugin');
 * const instance = new Plugin(context);
 * ```
 *
 * @example Error handling
 * ```typescript
 * try {
 *   const [name, Plugin] = await load('non-existent');
 * } catch (error) {
 *   console.error('Failed to load plugin:', error);
 * }
 * ```
 */
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

/**
 * Loads and instantiates multiple plugins concurrently
 *
 * Takes an array of plugin tuples and creates plugin instances
 * with the provided context. Supports both class-based and
 * string-based plugin specifications.
 *
 * Features:
 * - Concurrent loading with configurable limit
 * - Mixed plugin types (class/string)
 * - Automatic context injection
 * - Type-safe instantiation
 *
 * @template T - Plugin instance type
 * @param context - Release context for plugin initialization
 * @param pluginsTuples - Array of plugin configuration tuples
 * @param maxLimit - Maximum concurrent plugin loads (default: 5)
 * @returns Promise resolving to array of plugin instances
 *
 * @example Basic usage
 * ```typescript
 * const plugins = await loaderPluginsFromPluginTuples(
 *   context,
 *   [
 *     tuple(MyPlugin, { option: 'value' }),
 *     tuple('@scope/plugin', { option: 'value' })
 *   ]
 * );
 * ```
 *
 * @example Custom concurrency
 * ```typescript
 * const plugins = await loaderPluginsFromPluginTuples(
 *   context,
 *   pluginTuples,
 *   3  // Load max 3 plugins at once
 * );
 * ```
 *
 * @example Type-safe loading
 * ```typescript
 * interface MyPlugin extends ScriptPlugin {
 *   customMethod(): void;
 * }
 *
 * const plugins = await loaderPluginsFromPluginTuples<MyPlugin>(
 *   context,
 *   pluginTuples
 * );
 *
 * plugins.forEach(plugin => plugin.customMethod());
 * ```
 */
export async function loaderPluginsFromPluginTuples<
  T extends ScriptPlugin<ScriptContext<any>, ScriptPluginProps>
>(
  context: ReleaseContext,
  pluginsTuples: PluginTuple<PluginClass>[],
  maxLimit = 5
): Promise<T[]> {
  /**
   * Helper function to load and instantiate a single plugin
   *
   * Handles both class-based and string-based plugin specifications.
   * For string-based plugins, loads the module first.
   *
   * @param pluginClassOrString - Plugin class or name
   * @param args - Plugin constructor arguments
   * @returns Promise resolving to plugin instance
   */
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
