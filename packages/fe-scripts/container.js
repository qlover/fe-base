import { ConfigSearch, ScriptsLogger, Shell } from './lib/index.js';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './fe-config.json'), 'utf8')
);

export const feConfig = new ConfigSearch({
  name: 'fe-config',
  defaultConfig: defaultConfig
});
feConfig.search();

export const logger = new ScriptsLogger();

export const shell = new Shell({ log: logger, isDryRun: false });
