import { Options, defineConfig } from 'tsup';
import { config } from 'dotenv';

config({ path: ['.env.local', '.env'] });

const env = process.env.NODE_ENV;
console.log('[env is]', env);
const isProd = env === 'production';

const commonConfig: Options = {
  minify: isProd,
  sourcemap: !isProd,
  shims: true,
  clean: true,
  dts: true
};

export default defineConfig([
  {
    format: ['esm', 'cjs'],
    entry: ['./packages/main/index.ts'],
    outDir: 'dist/main',
    platform: 'browser',
    globalName: 'PackagesMain',
    external: [],
    outExtension({ format }) {
      if (format === 'iife') return { js: '.js' };
      return { js: `.${format}.js` };
    },
    ...commonConfig
  },
  {
    format: ['esm', 'cjs'],
    entry: ['./packages/node/index.ts'],
    outDir: 'dist/node',
    platform: 'node',
    globalName: 'PackagesNode',
    external: [],
    outExtension({ format }) {
      if (format === 'iife') return { js: '.js' };
      return { js: `.${format}.js` };
    },
    ...commonConfig
  }
]);
