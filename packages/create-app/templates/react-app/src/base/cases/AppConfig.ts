import type { EnvConfigInterface } from '@qlover/corekit-bridge';

/**
 * Application Configuration Management
 *
 * Significance: Centralized configuration management for the application
 * Core idea: Single source of truth for all environment and application settings
 * Main function: Provide typed access to application configuration values
 * Main purpose: Maintain consistent configuration across the application
 *
 * Configuration values are automatically injected from the project's .env files:
 * - .env: Default environment variables
 * - .env.development: Development environment variables
 * - .env.production: Production environment variables
 * - .env.local: Local overrides (git ignored)
 *
 * Environment variables should be prefixed with VITE_ to be exposed to the client side.
 * Example .env file:
 * ```
 * VITE_APP_NAME=MyApp
 * VITE_API_BASE_URL=http://api.example.com
 * VITE_USER_TOKEN_KEY=user_token
 * ```
 *
 * @example
 * const config = new AppConfig();
 * console.log(config.appName); // Value from VITE_APP_NAME
 * console.log(config.aiApiBaseUrl); // Value from VITE_AI_API_BASE_URL
 */
export class AppConfig implements EnvConfigInterface {
  /**
   * Application name identifier
   * @description Injected from VITE_APP_NAME environment variable
   */
  readonly appName = '';

  /**
   * Current version of the application
   * @description Injected from VITE_APP_VERSION environment variable
   */
  readonly appVersion = '';

  /**
   * Current environment mode for Vite
   * @description Represents the running environment (development, production, etc.)
   * Automatically set based on the current .env file being used
   *
   * from vite.config `mode`
   */
  readonly env: string = import.meta.env.MODE;

  /**
   * Storage key for user authentication token
   * @description Injected from VITE_USER_TOKEN_STORAGE_KEY environment variable
   */
  readonly userTokenStorageKey = '__fe_user_token__';

  /**
   * Available OpenAI model configurations
   * @description List of supported OpenAI models for the application
   */
  readonly openAiModels = [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-2',
    'gpt-4',
    'gpt-4-32k'
  ];

  /** Base URL for OpenAI API endpoints */
  readonly openAiBaseUrl = '';

  /** Authentication token for OpenAI API */
  readonly openAiToken = '';

  /** Prefix for OpenAI authentication token */
  readonly openAiTokenPrefix = '';

  /** Flag indicating if OpenAI token is required */
  readonly openAiRequireToken = true;

  /** Default login username */
  readonly loginUser = '';

  /** Default login password */
  readonly loginPassword = '';

  /** Base URL for frontend API endpoints */
  readonly feApiBaseUrl = '';

  /** Base URL for user-related API endpoints */
  readonly userApiBaseUrl = '';

  /** Base URL for AI service API endpoints */
  readonly aiApiBaseUrl = 'https://api.openai.com/v1';

  /** Authentication token for AI service API */
  readonly aiApiToken = '';

  /** Prefix for AI service authentication token */
  readonly aiApiTokenPrefix = 'Bearer';

  /** Flag indicating if AI service token is required */
  readonly aiApiRequireToken = true;
}
