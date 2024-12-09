import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import { searchEnv } from '@qlover/fe-scripts/scripts/search-env.js';

const env = searchEnv({ logger: console });
const NODE_ENV = env.get('NODE_ENV');
const isProduction = NODE_ENV === 'production';
console.log('Enveronment is', NODE_ENV);

const serverExternal = ['crypto', 'buffer', 'zlib', 'axios'];
const commonExternal = ['axios'];

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {
    input: 'common/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: !isProduction
      },
      {
        file: 'dist/index.js',
        format: 'umd',
        name: 'FeUtils',
        sourcemap: !isProduction
      }
    ],
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      isProduction && terser()
    ],
    external: commonExternal
  },
  {
    input: 'server/index.ts',
    output: [
      {
        file: 'dist/server/index.js',
        format: 'cjs',
        sourcemap: !isProduction
      },
      {
        file: 'dist/server/index.esm.js',
        format: 'esm',
        sourcemap: !isProduction
      }
    ],
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      isProduction && terser()
    ],
    external: serverExternal
  },
  {
    input: 'common/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  },
  {
    input: 'server/index.ts',
    output: {
      file: 'dist/server/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];
