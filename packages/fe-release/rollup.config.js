import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import { builtinModules } from 'module';
import { readFileSync, rmSync } from 'fs';
import { Env } from '@qlover/env-loader';

const pkg = JSON.parse(readFileSync('./package.json'), 'utf-8');
const env = Env.searchEnv();
const isProduction = env.get('NODE_ENV') === 'production';
const buildDir = 'dist';

const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  tryCatchDeoptimization: false
};
const defaultExternal = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {})
];

function createPlugin(minify) {
  return [
    resolve({
      preferBuiltins: false
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      tsconfigOverride: {
        include: ['src']
      }
    }),
    minify && terser()
  ].filter(Boolean);
}

function cleanBuildDir() {
  rmSync(buildDir, { recursive: true, force: true });
}

cleanBuildDir();

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
  {
    input: {
      index: 'src/index.ts',
      cli: 'src/cli.ts'
    },
    external: defaultExternal,
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        entryFileNames: '[name].cjs'
      },
      {
        dir: 'dist',
        format: 'es',
        entryFileNames: '[name].js'
      }
    ],
    plugins: createPlugin(isProduction),
    treeshake
  },
  {
    input: './src/index.ts',
    external: defaultExternal,
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es'
      }
    ],
    plugins: [dts()],
    treeshake
  }
];

export default config;
