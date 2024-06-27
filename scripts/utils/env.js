import { config } from 'dotenv';
import { resolve } from 'path';
import { Logger } from '../lib/logger.js';
import { createRequire } from 'module';
import { existsSync } from 'fs';

const log = new Logger();
const preloadList = ['.env.local', '.env'];

// Function to clear environment variable
function clearEnvVariable(variable) {
  if (process.env[variable]) {
    delete process.env[variable];
  }
}

function loadEnv(rootPath = __dirname) {
  for (const file of preloadList) {
    const envLocalPath = resolve(rootPath, file);
    if (existsSync(envLocalPath)) {
      config({ path: envLocalPath });
      log.log(`Loading ${file} file`);
      return;
    }
  }

  log.warn('No .env file found');
}

/**
 * Destroy after obtaining a variable
 * @param {string} varname
 * @returns
 */
function getEnvDestroy(varname) {
  const value = process.env[varname];

  clearEnvVariable(varname);

  return value;
}

function importCJS(id) {
  const require = createRequire(import.meta.url);
  return require(id);
}

export { clearEnvVariable, loadEnv, getEnvDestroy, importCJS };
