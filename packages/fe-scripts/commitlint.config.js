import { FeScriptContext } from '@qlover/scripts-context';

const context = new FeScriptContext();
const feConfig = context.feConfig;

export default {
  ...feConfig.commitlint
};
