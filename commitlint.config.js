import { FeScriptContext } from '@qlover/scripts-context';

const { feConfig } = new FeScriptContext();

/**
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  ...feConfig.commitlint
};
