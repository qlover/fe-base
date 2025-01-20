import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import { builtinModules } from 'module';
import { rmSync } from 'fs';
import { Env } from './dist/es/index.js';

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
  ...builtinModules.map((mod) => `node:${mod}`)
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
  console.log(`${buildDir} cleaned`);
}

cleanBuildDir();

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
  {
    input: 'src/index.ts',
    external: defaultExternal,
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs'
      },
      {
        file: 'dist/es/index.js',
        format: 'es'
      }
    ],
    plugins: createPlugin(isProduction),
    treeshake
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.d.ts',
        format: 'cjs'
      },
      {
        file: 'dist/es/index.d.ts',
        format: 'es'
      }
    ],
    plugins: [dts()],
    treeshake
  }
];

export default config;
