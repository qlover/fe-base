import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';
import { Env } from '@qlover/env-loader';

const env = Env.searchEnv();
const NODE_ENV = env.get('NODE_ENV');
const isProduction = NODE_ENV === 'production';
const serverExternal = ['crypto', 'buffer', 'zlib', 'axios'];
const commonExternal = ['axios'];
const buildDir = 'dist';
const fileMap = {
  es: 'js',
  umd: 'umd.js',
  cjs: 'cjs'
};
/**
 * @param {{ entry: string, formats: string[], external: string[], target: string, clean: boolean }} options
 * @returns {import('rollup').RollupOptions[]}
 */
function createBuilder({ target, entry, formats, external, clean, umdName }) {
  target = target || `${buildDir}/${entry}`;

  /** @type {import('rollup').OutputOptions[]} */
  const outputs = formats.map((format) => ({
    file: `${target}/index.${fileMap[format] || format + '.js'}`,
    format,
    name: umdName,
    sourcemap: !isProduction
  }));

  return [
    {
      input: `src/${entry}/index.ts`,
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
      input: `src/${entry}/index.ts`,
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
    entry: 'common',
    target: buildDir,
    formats: ['es', 'umd'],
    umdName: 'FeCorekitCommon',
    clean: true,
    external: commonExternal
  }),
  ...createBuilder({
    entry: 'server',
    formats: ['es', 'cjs'],
    external: serverExternal
  })
];
