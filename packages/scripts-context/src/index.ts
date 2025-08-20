/**
 * @module ScriptsContext
 * @description Comprehensive script execution and management framework
 *
 * This module provides a robust framework for building and managing script-based
 * automation tools with features like configuration management, shell command
 * execution, plugin support, and context sharing.
 *
 * Core Components:
 * - Script Context: Environment and configuration management
 *   - Configuration loading and merging
 *   - Environment variable handling
 *   - Shell command execution
 *   - Logging integration
 *
 * - Plugin System: Extensible script execution framework
 *   - Lifecycle management (before, exec, success, error)
 *   - Step-based execution
 *   - Configuration inheritance
 *   - Type-safe plugin development
 *
 * - Shell Integration: Command execution with advanced features
 *   - Template string support
 *   - Command caching
 *   - Dry run capability
 *   - Error handling
 *
 * - Configuration Management: Flexible config loading and merging
 *   - Multiple source support
 *   - Priority-based merging
 *   - Type-safe access
 *   - Default value handling
 *
 * - Utility Components:
 *   - Color formatting for console output
 *   - Configuration search and loading
 *   - Type definitions for script interfaces
 *
 * @example Basic script context
 * ```typescript
 * import { ScriptContext } from '@qlover/scripts-context';
 *
 * const context = new ScriptContext('build-script', {
 *   verbose: true,
 *   options: {
 *     outputDir: './dist'
 *   }
 * });
 *
 * // Access environment variables
 * const nodeEnv = context.getEnv('NODE_ENV', 'development');
 *
 * // Execute shell commands
 * await context.shell.exec('npm install');
 * ```
 *
 * @example Plugin implementation
 * ```typescript
 * import { ScriptPlugin, ScriptContext } from '@qlover/scripts-context';
 *
 * interface BuildOptions {
 *   target: string;
 *   minify: boolean;
 * }
 *
 * class BuildPlugin extends ScriptPlugin<ScriptContext<BuildOptions>> {
 *   async onExec(): Promise<void> {
 *     const target = this.getConfig('target', 'development');
 *
 *     await this.step({
 *       label: 'Building project',
 *       task: async () => {
 *         await this.shell.exec(`npm run build:${target}`);
 *         return 'build completed';
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @example Configuration management
 * ```typescript
 * import { ConfigSearch } from '@qlover/scripts-context';
 *
 * const config = new ConfigSearch({
 *   name: 'my-app',
 *   defaultConfig: {
 *     port: 3000,
 *     debug: false
 *   }
 * });
 *
 * const settings = config.config;
 * ```
 *
 * @example Shell command execution
 * ```typescript
 * import { Shell } from '@qlover/scripts-context';
 *
 * const shell = new Shell({
 *   logger: myLogger,
 *   dryRun: process.env.DRY_RUN === 'true'
 * });
 *
 * // Template string support
 * await shell.exec('git clone <%= repo %>', {
 *   context: { repo: 'https://github.com/user/repo.git' }
 * });
 *
 * // Command caching
 * await shell.exec('npm install', { isCache: true });
 * ```
 *
 * @example Color formatting
 * ```typescript
 * import { ColorFormatter } from '@qlover/scripts-context';
 *
 * const formatter = new ColorFormatter();
 * logger.addAppender(new ConsoleHandler(formatter));
 *
 * logger.info('Starting build process');
 * logger.error('Build failed', new Error('Compilation error'));
 * ```
 */
export * from './feConfig';
export * from './interface/ScriptContextInterface';
export * from './interface/ScriptSharedInterface';
export * from './interface/ShellInterface';
export * from './implement/ColorFormatter';
export * from './implement/ConfigSearch';
export * from './implement/ScriptContext';
export * from './implement/ScriptPlugin';
export * from './implement/Shell';
