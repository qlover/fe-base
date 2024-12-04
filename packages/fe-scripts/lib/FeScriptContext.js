import { ConfigSearch } from './ConfigSearch.js';
import { ScriptsLogger } from './ScriptsLogger.js';
import { Shell } from './Shell.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import loadsh from 'lodash';

function getDefaultConfig() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../fe-config.json'), 'utf8')
  );
}

export function getFeConfigSearch(feConfig) {
  return new ConfigSearch({
    name: 'fe-config',
    defaultConfig: loadsh.merge(getDefaultConfig(), feConfig)
  });
}

/**
 * A factory for creating a context object that can be used to pass options to scripts.
 * @template T
 */
export class FeScriptContext {
  /**
   * @param {Partial<FeScriptContext<T>>} scriptsOptions
   */
  constructor(scriptsOptions) {
    const { logger, shell, feConfig, dryRun, verbose, options } =
      scriptsOptions || {};

    /**
     * @type {import('./ScriptsLogger.js').ScriptsLogger}
     */
    this.logger = logger || new ScriptsLogger({ debug: verbose, dryRun });
    /**
     * @type {import('./Shell.js').Shell}
     */
    this.shell = shell || new Shell({ log: this.logger, isDryRun: dryRun });

    /**
     * @type {import('../types/feConfig.d.ts').FeConfig}
     */
    this.feConfig = getFeConfigSearch(feConfig).config;

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
    this.options = options || {};
  }
}
