import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

export class Env {
  /**
   * @param {object} param0
   * @param {string} param0.rootPath
   * @param {import('@qlover/fe-utils').Logger} param0.logger
   */
  constructor({ rootPath, logger }) {
    this.rootPath = rootPath;
    this.logger = logger;
  }

  /**
   * load env
   * @param {object} param0
   * @param {string[]} param0.preloadList
   * @param {string} param0.rootPath
   * @returns {void}
   */
  load({ preloadList, rootPath } = {}) {
    if (!preloadList.length) {
      this.logger.warn('Env load preloadList is empty!');
      return;
    }

    rootPath = rootPath || this.rootPath || resolve('./');

    for (const file of preloadList) {
      const envLocalPath = resolve(rootPath, file);
      if (existsSync(envLocalPath)) {
        dotenv.config({ path: envLocalPath });

        if (this.logger) {
          this.logger.debug(`Loaded \`${envLocalPath}\` file`);
        }

        return;
      }
    }

    if (this.logger && this.logger.warn) {
      this.logger.warn('No .env file found');
    }
  }

  /**
   * clear env variable
   * @param {string} variable
   * @returns {void}
   */
  remove(variable) {
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
  getDestroy(varname) {
    const value = process.env[varname];

    this.remove(varname);

    return value;
  }
}
