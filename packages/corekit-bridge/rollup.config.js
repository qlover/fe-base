import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import { builtinModules } from 'module';
import { readFileSync, rmSync } from 'fs';
import { Env } from '@qlover/env-loader';

const pkg = JSON.parse(readFileSync('./package.json'), 'utf-8');
const env = Env.searchEnv({ logger: console });
const isProduction = env.get('NODE_ENV') === 'production';
const buildDir = 'dist';

const defaultExternal = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {})
];

function cleanBuildDir() {
  rmSync(buildDir, { recursive: true, force: true });
  console.log(`${buildDir} cleaned`);
}

cleanBuildDir();

/**
 * @param {{ entry: string, formats: string[], external: string[], target: string, clean: boolean }} options
 * @returns {import('rollup').RollupOptions[]}
 */
function createBuilder({ target, entry, formats, external, umdName }) {
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
    entry: 'core',
    formats: ['es', 'umd'],
    umdName: 'FeProdCore',
    external: defaultExternal,
    clean: true
  }),
  ...createBuilder({
    entry: 'build',
    formats: ['es', 'cjs'],
    umdName: 'FeProdBuild',
    external: defaultExternal
  })
];
