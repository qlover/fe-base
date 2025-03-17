import AppConfig from '@config/AppConfig';
import { envPrefix } from '@config/common.json';
import { logger } from './globals';

export class InjectEnv {
  static whiteList = ['env', 'userNodeEnv'];

  static env<D>(key: string, defaultValue?: D): D {
    // transform key to env key
    const formattedKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    const envKey = `${envPrefix}${formattedKey}`;

    // if it is a json string, parse it
    if (
      import.meta.env[envKey].startsWith('{') ||
      import.meta.env[envKey].startsWith('[')
    ) {
      try {
        return JSON.parse(import.meta.env[envKey]);
      } catch (error) {
        logger.error(`Error parsing JSON for key ${envKey}:`, error);
      }
    }

    return import.meta.env[envKey] ?? defaultValue;
  }

  static inject(config: typeof AppConfig) {
    for (const key in config) {
      if (InjectEnv.whiteList.includes(key)) {
        continue;
      }

      const value = config[key as keyof typeof config];

      // @ts-expect-error
      config[key as keyof typeof config] = InjectEnv.env(key, value);
    }

    // transform readonly to writable
    Object.freeze(AppConfig);
  }
}
