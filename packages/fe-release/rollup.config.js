import { createBaseRollup } from '../../make/createBaseRollup.js';
import { Env } from '@qlover/env-loader';

export default createBaseRollup({
  isProduction: Env.searchEnv().get('NODE_ENV') === 'production'
});
