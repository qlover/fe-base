import { createBaseRollup } from '../../make/createBaseRollup.js';
import { Env } from '@qlover/env-loader';

export default createBaseRollup({
  input: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  },
  isProduction: Env.searchEnv().get('NODE_ENV') === 'production'
});
