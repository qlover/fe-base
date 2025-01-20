import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';
import { Env } from '@qlover/env-loader';

const env = Env.searchEnv({ logger: console });
const NODE_ENV = env.get('NODE_ENV');
const isProduction = NODE_ENV === 'production';
console.log('Enveronment is', NODE_ENV);

const serverExternal = ['crypto', 'buffer', 'zlib', 'axios'];
const commonExternal = ['axios'];
const buildDir = 'dist';

/**
 * @param {{ entry: string, formats: string[], external: string[], target: string, clean: boolean }} options
 * @returns {import('rollup').RollupOptions[]}
 */
function createBuilder({ target, entry, formats, external, clean, umdName }) {
  target = target || `${buildDir}/${entry}`;

  /** @type {import('rollup').OutputOptions[]} */
  const outputs = formats.map((format) => ({
    file: `${target}/index.${format}.js`,
    format,
    name: umdName,
    sourcemap: !isProduction
  }));

  return [
    {
      input: `${entry}/index.ts`,
      output: outputs,
      plugins: [
        clean && del({ targets: `${buildDir}/*` }),
        resolve({
          preferBuiltins: false
        }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        isProduction && terser()
      ],
      external: external
    },
    {
      input: `${entry}/index.ts`,
      output: {
        file: `${target}/index.d.ts`,
        format: 'es'
      },
      plugins: [dts()]
    }
  ];
}

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  ...createBuilder({
    entry: 'interface',
    formats: ['es', 'umd'],
    umdName: 'FeUtilsInterface',
    clean: true
  }),
  ...createBuilder({
    entry: 'common',
    target: buildDir,
    formats: ['es', 'umd'],
    umdName: 'FeUtilsCommon',
    external: commonExternal
  }),
  ...createBuilder({
    entry: 'server',
    formats: ['es', 'cjs'],
    umdName: 'FeUtilsServer',
    external: serverExternal
  })
];
