import { createBaseRollup } from '../../make/createBaseRollup.js';
import { Env } from '@qlover/env-loader';

export default createBaseRollup({
  input: 'src/core/index.ts',
  formats: [
    {
      format: 'umd',
      ext: 'umd.js',
      name: 'feCorekitBridge'
    }
  ],
  clean: false,
  excludeDependencies: true,
  isProduction: Env.searchEnv().get('NODE_ENV') === 'production'
});
