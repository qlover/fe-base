import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import { builtinModules } from 'module';
import { readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { Env } from '@qlover/env-loader';

const readJSONFile = (path) => JSON.parse(readFileSync(path), 'utf-8');
const pkg = readJSONFile(join(process.cwd(), './package.json'));

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
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.devDependencies)
];

function createPlugin(minify) {
  return [
    resolve({
      preferBuiltins: false
    }),
    commonjs(),
    json(),
    typescript(),
    minify && terser()
  ].filter(Boolean);
}

function cleanBuildDir() {
  rmSync(buildDir, { recursive: true, force: true });
}

cleanBuildDir();

function createBuildConfig(inputName) {
  const input = `src/build/${inputName}/index.ts`;
  const output = `build/${inputName}/index`;

  const formats = ['es', 'cjs'];
  const jsConfig = {
    input,
    external: defaultExternal,
    treeshake,
    output: formats.map((format) => ({
      file: `${buildDir}/${output}.${format}.js`,
      format,
      exports: 'named'
    })),
    plugins: createPlugin(isProduction)
  };

  const dtsConfig = {
    input,
    output: {
      file: `${buildDir}/${output}.d.ts`,
      format: 'es',
      exports: 'named'
    },
    plugins: [dts()]
  };

  return [jsConfig, dtsConfig];
}

function createCoreConfig() {
  const formats = ['es', 'cjs'];
  const jsConfig = {
    input: 'src/core/index.ts',
    external: defaultExternal,
    treeshake,
    output: formats.map((format) => ({
      file: `${buildDir}/index.${format}.js`,
      format
    })),
    plugins: createPlugin(isProduction)
  };

  const dtsConfig = {
    input: 'src/core/index.ts',
    output: {
      file: `${buildDir}/index.d.ts`,
      format: 'es'
    },
    plugins: [dts()]
  };

  return [jsConfig, dtsConfig];
}
/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
  ...createBuildConfig('tw-root10px'),
  ...createBuildConfig('vite-env-config'),
  ...createBuildConfig('vite-ts-to-locales'),
  ...createCoreConfig()
];

export default config;
