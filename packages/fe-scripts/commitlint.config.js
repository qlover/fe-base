import { getFeConfigSearch } from './lib/FeScriptContext.js';

const feConfig = getFeConfigSearch();

export default {
  ...feConfig.config.commitlint
};
