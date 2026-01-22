/**
 * @module EnvLoader
 * @description Environment variable loading and management utilities
 *
 * This module provides utilities for loading and managing environment variables
 * from `.env` files with support for multiple file loading, priority ordering,
 * and type-safe access patterns.
 *
 * Core functionality:
 * - Environment file loading: Load variables from `.env` files
 *   - Support for multiple `.env` files with priority ordering
 *   - Automatic file discovery and loading
 *   - Configurable file paths and naming patterns
 *   - Silent handling of missing files
 *
 * - Variable access: Type-safe environment variable retrieval
 *   - Get variables with default values
 *   - Type-safe getter methods
 *   - Variable existence checking
 *   - Cached variable access
 *
 * - Configuration management: Flexible configuration options
 *   - Custom file paths and names
 *   - Priority-based file loading order
 *   - Environment-specific configurations
 *   - Integration with process.env
 *
 * ### Exported Members
 *
 * - `Env`: Main environment loader class
 *
 * ### Basic Usage
 *
 * ```typescript
 * import { Env } from '@qlover/env-loader';
 *
 * // Load from default .env file
 * const env = new Env();
 *
 * // Get environment variables
 * const apiKey = env.get('API_KEY');
 * const port = env.get('PORT', '3000'); // with default value
 * ```
 *
 * ### Multiple File Loading
 *
 * ```typescript
 * import { Env } from '@qlover/env-loader';
 *
 * // Load from multiple files with priority
 * const env = new Env({
 *   files: ['.env.local', '.env.production', '.env']
 * });
 *
 * // Variables from .env.local override .env.production
 * // Variables from .env.production override .env
 * ```
 *
 * ### Environment-Specific Configuration
 *
 * ```typescript
 * import { Env } from '@qlover/env-loader';
 *
 * const nodeEnv = process.env.NODE_ENV || 'development';
 *
 * const env = new Env({
 *   files: [
 *     `.env.${nodeEnv}.local`,
 *     `.env.${nodeEnv}`,
 *     '.env.local',
 *     '.env'
 *   ]
 * });
 *
 * // Loads environment-specific files first
 * ```
 *
 * ### Type-Safe Access
 *
 * ```typescript
 * import { Env } from '@qlover/env-loader';
 *
 * const env = new Env();
 *
 * // Get with default value
 * const port = env.get('PORT', '3000');
 *
 * // Check existence
 * if (env.has('API_KEY')) {
 *   const apiKey = env.get('API_KEY');
 * }
 *
 * // Get all variables
 * const allVars = env.getAll();
 * ```
 *
 * ### Integration with Scripts
 *
 * ```typescript
 * import { Env } from '@qlover/env-loader';
 * import { ScriptContext } from '@qlover/scripts-context';
 *
 * // Load environment for script context
 * const env = new Env({
 *   files: ['.env.local', '.env']
 * });
 *
 * const context = new ScriptContext('build', {
 *   options: { env }
 * });
 *
 * // Access in script
 * const apiUrl = context.getEnv('API_URL', 'https://api.example.com');
 * ```
 *
 * ### Custom File Paths
 *
 * ```typescript
 * import { Env } from '@qlover/env-loader';
 * import path from 'path';
 *
 * const env = new Env({
 *   files: [
 *     path.resolve(__dirname, '../config/.env.local'),
 *     path.resolve(__dirname, '../config/.env')
 *   ]
 * });
 * ```
 *
 * ### Variable Prefixing
 *
 * ```typescript
 * import { Env } from '@qlover/env-loader';
 *
 * const env = new Env({
 *   prefix: 'APP_'
 * });
 *
 * // Only loads variables starting with APP_
 * const appName = env.get('APP_NAME');
 * const appVersion = env.get('APP_VERSION');
 * ```
 *
 * @see {@link Env} for the main environment loader class
 */
export * from './Env';
