import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import { builtinModules } from 'module';
import { rmSync } from 'fs';
import { Env } from './src/Env';
import { Plugin, RollupOptions } from 'rollup';

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

function createPlugin(minify: boolean): Plugin<unknown>[] {
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
  ].filter(Boolean) as Plugin<unknown>[];
}

function cleanBuildDir(): void {
  rmSync(buildDir, { recursive: true, force: true });
}

cleanBuildDir();

const config: RollupOptions[] = [
  {
    input: 'src/index.ts',
    external: defaultExternal,
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: !isProduction
      },
      {
        file: 'dist/es/index.js',
        format: 'es',
        sourcemap: !isProduction
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
        format: 'cjs',
        sourcemap: !isProduction
      },
      {
        file: 'dist/es/index.d.ts',
        format: 'es',
        sourcemap: !isProduction
      }
    ],
    plugins: [dts()],
    treeshake
  }
];

export default config;
