/**
 * @module EnvLoader
 * @description Environment variable loading and management utilities
 *
 * This module provides utilities for loading and managing environment variables
 * from `.env` files with support for multiple file loading, priority ordering,
 * and type-safe access patterns.
 *
 * ### Exported Members
 *
 * - `Env`: Main environment loader class
 * - `LoadOptions`: Options for `Env.load` (includes dotenv options except `path`)
 * - `SearchEnvOptions`: Options for `Env.searchEnv`
 *
 * @see {@link Env} for the main environment loader class
 */
import { config } from 'dotenv';
import type { DotenvConfigOptions } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'path';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Environment configuration options interface
 * @interface
 * @description
 * Significance: Defines initialization parameters for Env class
 * Core idea: Configure environment variable management
 * Main function: Type-safe environment configuration
 * Main purpose: Initialize environment handler
 * Example:
 * ```typescript
 * const options: EnvOptions = {
 *   rootPath: '/path/to/project',
 *   logger: new Logger()
 * };
 * ```
 */
interface EnvOptions {
  /** Root path for environment files */
  rootPath: string;
  /** Logger instance */
  logger?: LoggerInterface | typeof console;
}

/**
 * Environment loading options interface
 * @interface
 * @description
 * Significance: Defines options for loading environment variables
 * Core idea: Control environment file loading behavior, and forward
 * dotenv options (except `path`, which is resolved by this package)
 * Main function: Configure environment loading process
 * Main purpose: Customize environment loading
 * Example:
 * ```typescript
 * const loadOptions: LoadOptions = {
 *   preloadList: ['.env', '.env.local'],
 *   rootPath: '/custom/path',
 *   envVar: 'APP_ENV',
 *   encoding: 'utf8',
 *   override: true
 * };
 * ```
 *
 * @since `1.1.0` Inherits `Omit<DotenvConfigOptions, 'path'>` (e.g. `encoding`, `override`)
 */
export interface LoadOptions extends Omit<DotenvConfigOptions, 'path'> {
  /** List of environment files to load */
  preloadList: string[];
  /** Optional root path override */
  rootPath?: string;
  /**
   * Environment variable name used to resolve a preferred `.env.<value>` file.
   * When the variable is set (e.g. `APP_ENV=local`), `.env.local` is prepended
   * to `preloadList` (deduplicated).
   *
   * @since `1.1.0`
   */
  envVar?: string;
}

/**
 * Options for searching and loading environment files up the directory tree.
 *
 * @since `1.1.0` Supports dotenv options via `Omit<DotenvConfigOptions, 'path'>`
 */
export type SearchEnvOptions = {
  /** Start search directory, default is `process.cwd()` */
  cwd?: string;
  /** Search file name list, default is `['.env.local', '.env']` */
  preloadList?: string[];
  /**
   * Env var name; if set, prepends `.env.<value>` to preloadList
   * @since `1.1.0`
   */
  envVar?: string;
  /** Logger instance */
  logger?: LoggerInterface;
  /** Maximum search depth, default is `5` */
  maxDepth?: number;
} & Omit<DotenvConfigOptions, 'path'>;


/**
 * Environment variable management class
 * @class
 * @description
 * Significance: Manages environment variables and .env files
 * Core idea: Centralize environment variable operations
 * Main function: Load and manage environment variables
 * Main purpose: Provide consistent environment variable access
 * Example:
 * ```typescript
 * const env = new Env({
 *   rootPath: process.cwd(),
 *   logger: new Logger()
 * });
 * env.load({ preloadList: ['.env'] });
 * ```
 */
export class Env {
  /**
   * Creates an Env instance
   * @param options - Environment configuration options
   * @description
   * Significance: Initializes environment management
   * Core idea: Setup environment configuration
   * Main function: Create environment handler
   * Main purpose: Prepare for environment operations
   * Example:
   * ```typescript
   * const env = new Env({
   *   rootPath: './project',
   *   logger: new Logger()
   * });
   * ```
   */
  constructor(private options: EnvOptions) {}

  public get rootPath(): string {
    return this.options.rootPath;
  }

  public get logger(): LoggerInterface | typeof console | undefined {
    return this.options.logger;
  }

  /**
   * Resolve preload list with optional env-var driven preferred file.
   * When `envVar` is set and has a value, prepends `.env.<value>` to the list.
   *
   * @param preloadList - Base environment file list
   * @param envVar - Optional environment variable name (e.g. `APP_ENV`)
   * @returns Resolved preload list with preferred file first
   * @since `1.1.0`
   */
  public static resolvePreloadList(
    preloadList: string[],
    envVar?: string
  ): string[] {
    if (!envVar) {
      return preloadList;
    }

    const envValue = process.env[envVar];
    if (!envValue) {
      return preloadList;
    }

    const preferredFile = `.env.${envValue}`;
    return [
      preferredFile,
      ...preloadList.filter((file) => file !== preferredFile)
    ];
  }

  /**
   * from current directory to root directory, search and load .env file
   * @param options - Search and load options (supports dotenv options except `path`)
   * @returns {Env} environment variable loader instance
   */
  public static searchEnv({
    cwd = process.cwd(),
    preloadList = ['.env.local', '.env'],
    envVar,
    logger,
    maxDepth = 5,
    ...dotenvOptions
  }: SearchEnvOptions = {}): Env {
    // limit max search depth to 10
    // don't override maxDepth if it's not set
    maxDepth = Math.min(maxDepth, 8);

    const resolvedPreloadList = Env.resolvePreloadList(preloadList, envVar);

    // create Env instance
    const env = new Env({ rootPath: cwd, logger });

    // recursive search up, until find .env file or reach root directory
    let currentDir = cwd;
    let lastDir = '';
    let found = false;
    let searchCount = 0;

    while (currentDir !== lastDir) {
      // check if current directory exists environment file
      found = resolvedPreloadList.some((file) =>
        existsSync(resolve(currentDir, file))
      );

      if (found) {
        env.load({
          ...dotenvOptions,
          preloadList: resolvedPreloadList,
          rootPath: currentDir
        });
        break;
      }

      // check if reached max search depth
      searchCount++;
      if (searchCount >= maxDepth) {
        logger?.warn(
          `Search depth exceeded ${maxDepth} levels, stopping search at ${currentDir}`
        );
        break;
      }

      lastDir = currentDir;
      currentDir = dirname(currentDir);

      // check if reached root directory
      if (currentDir === lastDir) {
        logger?.warn('Reached root directory, stopping search');
        break;
      }
    }

    if (!found && logger) {
      logger.warn(
        `No environment files (${resolvedPreloadList.join(', ')}) found in directory tree from ${cwd} to ${currentDir}`
      );
    }

    return env;
  }

  /**
   * Load environment variables from files
   * @param options - Load configuration options
   * @returns void
   * @description
   * Significance: Loads environment variables from files
   * Core idea: Sequential environment file loading
   * Main function: Process and load environment files
   * Main purpose: Initialize environment variables
   * Example:
   * ```typescript
   * env.load({
   *   preloadList: ['.env.local', '.env'],
   *   rootPath: './config',
   *   envVar: 'APP_ENV',
   *   encoding: 'utf8',
   *   override: true
   * });
   * ```
   */
  public load(options: LoadOptions = { preloadList: [] }): void {
    const {
      rootPath,
      envVar,
      preloadList: rawPreloadList,
      ...dotenvOptions
    } = options;
    const preloadList = Env.resolvePreloadList(rawPreloadList, envVar);

    if (!preloadList.length) {
      this.logger?.warn?.('Env load preloadList is empty!');
      return;
    }

    const resolvedRootPath = rootPath || this.rootPath || resolve('./');

    for (const file of preloadList) {
      const envLocalPath = resolve(resolvedRootPath, file);
      if (existsSync(envLocalPath)) {
        // `path` is always resolved by this package and must win over caller input
        config({ ...dotenvOptions, path: envLocalPath });
        this.logger?.debug?.(`Loaded \`${envLocalPath}\` file`);
        return;
      }
    }

    this.logger?.warn?.('No .env file found');
  }

  /**
   * Remove environment variable
   * @param variable - Environment variable name
   * @returns void
   * @description
   * Significance: Removes specific environment variable
   * Core idea: Safe environment variable deletion
   * Main function: Delete environment variable
   * Main purpose: Clean up environment state
   * Example:
   * ```typescript
   * env.remove('API_KEY');
   * ```
   */
  public remove(variable: string): void {
    if (process.env[variable]) {
      delete process.env[variable];
    }
  }

  /**
   * Get environment variable value
   * @param variable - Environment variable name
   * @returns Environment variable value or undefined
   * @description
   * Significance: Retrieves environment variable value
   * Core idea: Safe environment variable access
   * Main function: Get environment variable
   * Main purpose: Access environment state
   * Example:
   * ```typescript
   * const apiKey = env.get('API_KEY');
   * ```
   */
  public get(variable: string): string | undefined {
    return process.env[variable];
  }

  /**
   * Set environment variable
   * @param variable - Environment variable name
   * @param value - Value to set
   * @returns void
   * @description
   * Significance: Sets environment variable value
   * Core idea: Safe environment variable modification
   * Main function: Update environment variable
   * Main purpose: Modify environment state
   * Example:
   * ```typescript
   * env.set('DEBUG', 'true');
   * ```
   */
  public set(variable: string, value: string): void {
    process.env[variable] = value;
  }

  /**
   * Get and remove environment variable
   * @param variable - Environment variable name
   * @returns Environment variable value or undefined
   * @description
   * Significance: Retrieves and removes environment variable
   * Core idea: Atomic get and delete operation
   * Main function: Access and clean up variable
   * Main purpose: One-time environment variable access
   * Example:
   * ```typescript
   * const tempKey = env.getDestroy('TEMP_API_KEY');
   * ```
   */
  public getDestroy(variable: string): string | undefined {
    const value = process.env[variable];
    this.remove(variable);
    return value;
  }
}
