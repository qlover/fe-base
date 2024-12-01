import { ConfigSearch } from './lib/ConfigSearch.js';
import { ScriptsLogger } from './lib/ScriptsLogger.js';
import { Shell } from './lib/Shell.js';
import { searchEnv } from './scripts/search-env.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

function getDefaultConfig() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './fe-config.json'), 'utf8')
  );
}

function getFeConfigSearch(feConfig) {
  return new ConfigSearch({
    name: 'fe-config',
    defaultConfig: feConfig || getDefaultConfig()
  });
}

/**
 * @template T
 */
export class FeScriptContext {
  /**
   * @param {T} scriptsOptions
   */
  constructor(scriptsOptions) {
    const { logger, shell, feConfig, dryRun, verbose, options } =
      scriptsOptions;

    /**
     * @type {import('./lib/ScriptsLogger.js').ScriptsLogger}
     */
    this.logger = logger || new ScriptsLogger({ debug: verbose, dryRun });
    /**
     * @type {import('./lib/Shell.js').Shell}
     */
    this.shell = shell || new Shell({ log: this.logger, isDryRun: dryRun });

    const feConfigSearch = getFeConfigSearch(feConfig);
    /**
     * @type {import('./index.js').FeConfig}
     */
    this.feConfig = feConfigSearch.config;

    /**
     * @type {import('./lib/Env.js').Env}
     */
    this.env = searchEnv({ logger: this.logger });

    /**
     * @type {boolean}
     */
    this.dryRun = !!dryRun;
    /**
     * @type {boolean}
     */
    this.verbose = !!verbose;

    /**
     * @type {T}
     */
    this.options = options;
  }
}
