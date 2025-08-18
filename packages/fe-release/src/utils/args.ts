/**
 * @module CommanderArgs
 * @description Command-line argument processing utilities
 *
 * This module provides utilities for processing and transforming
 * command-line arguments from Commander.js into structured objects.
 * It supports dot notation for nested properties and common prefix
 * grouping.
 *
 * Core Features:
 * - Dot notation support
 * - Common prefix grouping
 * - Deep object creation
 * - Type-safe processing
 *
 * @example Basic usage
 * ```typescript
 * const args = {
 *   verbose: true,
 *   'config.port': 3000,
 *   'config.host': 'localhost'
 * };
 *
 * const processed = reduceOptions(args);
 * // {
 * //   verbose: true,
 * //   config: {
 * //     port: 3000,
 * //     host: 'localhost'
 * //   }
 * // }
 * ```
 *
 * @example With common prefix
 * ```typescript
 * const args = {
 *   verbose: true,
 *   port: 3000
 * };
 *
 * const processed = reduceOptions(args, 'options');
 * // {
 * //   options: {
 * //     verbose: true,
 * //     port: 3000
 * //   }
 * // }
 * ```
 */
import type { OptionValues } from 'commander';
import set from 'lodash/set';

/**
 * Processes Commander.js options into a structured object
 *
 * Takes raw options from Commander.js and transforms them into a
 * structured object, handling dot notation for nested properties
 * and optional common prefix grouping.
 *
 * Features:
 * - Dot notation parsing (e.g., 'config.port' → { config: { port: value } })
 * - Common prefix grouping (e.g., { port: 3000 } → { common: { port: 3000 } })
 * - Deep object creation with lodash/set
 * - Preserves value types
 *
 * @param opts - Raw options from Commander.js
 * @param commonKey - Optional prefix for non-nested properties
 * @returns Processed options object
 *
 * @example Basic dot notation
 * ```typescript
 * const args = {
 *   'server.port': 3000,
 *   'server.host': 'localhost',
 *   verbose: true
 * };
 *
 * const result = reduceOptions(args);
 * // {
 * //   server: {
 * //     port: 3000,
 * //     host: 'localhost'
 * //   },
 * //   verbose: true
 * // }
 * ```
 *
 * @example With common prefix
 * ```typescript
 * const args = {
 *   'config.debug': true,
 *   port: 3000,
 *   host: 'localhost'
 * };
 *
 * const result = reduceOptions(args, 'server');
 * // {
 * //   config: {
 * //     debug: true
 * //   },
 * //   server: {
 * //     port: 3000,
 * //     host: 'localhost'
 * //   }
 * // }
 * ```
 */
export function reduceOptions(
  opts: OptionValues,
  commonKey?: string
): OptionValues {
  return Object.entries(opts).reduce((acc, [key, value]) => {
    if (key.includes('.')) {
      set(acc, key, value);
    } else {
      set(acc, commonKey ? `${commonKey}.${key}` : key, value);
    }

    return acc;
  }, {});
}
