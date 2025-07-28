import type { Plugin } from 'vite';

export type ViteEnvConfigOptions = {
  /**
   * Whether to load the environment variables from the .env file
   *
   * @default true
   */
  envPops?:
    | boolean
    | Parameters<(typeof import('@qlover/env-loader').Env)['searchEnv']>[0];
  /**
   * The prefix of the environment variables
   *
   * @default ''
   */
  envPrefix?: string;
  /**
   * The environment variables to inject
   *
   * @example
   * [
   *  ['APP_NAME', 'appName'],
   *  ['APP_VERSION', 'appVersion']
   * ]
   *
   * @default []
   */
  records?: [string, string][];
};

export default (opts: ViteEnvConfigOptions = {}): Plugin => {
  const { envPops, envPrefix = '', records = [] } = opts;

  return {
    name: 'vite-env-config',
    config() {
      // Create define object for import.meta.env injection
      const define: Record<string, string> = {};

      records.forEach(([key, value]) => {
        const envKey = `${envPrefix}${key}`;
        // Define the environment variable for import.meta.env
        define[`import.meta.env.${envKey}`] = JSON.stringify(value);
      });

      return {
        define
      };
    },
    async configResolved() {
      if (envPops !== false) {
        const { Env } = await import('@qlover/env-loader');
        // load dotenv files
        Env.searchEnv(envPops !== true ? envPops : undefined);
      }
    }
  };
};
