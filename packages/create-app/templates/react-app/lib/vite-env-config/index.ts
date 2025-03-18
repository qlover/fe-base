import type { Plugin } from 'vite';
import { injectPkgConfig } from './injectPkgConfig';

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
    async configResolved(config) {
      if (envPops !== false) {
        const { Env } = await import('@qlover/env-loader');
        // load dotenv files
        Env.searchEnv(envPops !== true ? envPops : undefined);
      }

      // add version and name to env
      injectPkgConfig(records, envPrefix);
    }
  };
};
