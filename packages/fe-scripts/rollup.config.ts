import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';
import { searchEnv } from './src/scripts/search-env';
import { ModuleFormat, OutputOptions, RollupOptions } from 'rollup';
import { builtinModules } from 'module';

const env = searchEnv({});
const NODE_ENV = env.get('NODE_ENV');
// const isProduction = NODE_ENV === 'production';
console.log('Enveronment is', NODE_ENV);
const isProduction = false;
// const serverExternal = ['crypto', 'buffer', 'zlib', 'axios'];
// const commonExternal = ['axios'];
const buildDir = 'dist';

type CreateBuilderOptions = {
  entry: string;
  formats: string[];
  external?: string[];
  target?: string;
  clean?: boolean;
};

/**
 * @param {CreateBuilderOptions} options
 * @returns {import('rollup').RollupOptions[]}
 */
function createBuilder({
  target,
  entry,
  formats,
  external,
  clean
}: CreateBuilderOptions): RollupOptions[] {
  target = target || `${buildDir}/${entry}`;

  /** @type {import('rollup').OutputOptions[]} */
  const outputs: OutputOptions[] = formats.map((format) => ({
    file: `${target}/index.${format}.js`,
    format: format as ModuleFormat,
    name: format === 'umd' ? 'FeScripts' : undefined,
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
        json(),
        typescript(),
        isProduction && terser()
      ],
      external: [
        ...builtinModules,
        ...builtinModules.map((mod) => `node:${mod}`), // 带有 node: 前缀的模块
        ...(external || [])
      ]
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
    entry: './test',
    formats: ['cjs', 'esm', 'umd'],
    clean: true
  })
];
