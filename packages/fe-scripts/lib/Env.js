import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const defaultPreloadList = ['.env.local', '.env'];

export class Env {
  /**
   * @param {object} param0
   * @param {string} param0.rootPath
   * @param {import('pino').Logger} param0.log
   */
  constructor({ rootPath, log }) {
    this.rootPath = rootPath;
    this.log = log;
  }

  /**
   * load env
   * @param {string[]} pre env file prefix
   * @returns {void}
   */
  load({ preloadList = defaultPreloadList, rootPath } = {}) {
    rootPath = rootPath || this.rootPath || resolve('./');

    for (const file of preloadList) {
      const envLocalPath = resolve(rootPath, file);
      if (existsSync(envLocalPath)) {
        dotenv.config({ path: envLocalPath });

        if (this.log && this.log.debug) {
          this.log.debug(`Loaded \`${envLocalPath}\` file`);
        }

        return;
      }
    }

    if (this.log && this.log.warn) {
      this.log.warn('No .env file found');
    }
  }

  /**
   * clear env variable
   * @param {string} variable
   * @returns {void}
   */
  removeEnvVariable(variable) {
    if (process.env[variable]) {
      delete process.env[variable];
    }
  }

  /**
   * get env variable
   * @param {string} variable
   * @returns {string | undefined}
   */
  get(variable) {
    return process.env[variable];
  }

  set(variable, value) {
    process.env[variable] = value;
  }

  /**
   * Destroy after obtaining a variable
   * @param {string} varname
   * @returns {string | undefined}
   */
  getEnvDestroy(varname) {
    const value = process.env[varname];

    this.removeEnvVariable(varname);

    return value;
  }
}
