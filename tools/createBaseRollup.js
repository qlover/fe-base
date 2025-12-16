import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import { builtinModules } from 'module';
import { readFileSync, rmSync } from 'fs';

function cleanBuildDir(buildDir) {
  rmSync(buildDir, { recursive: true, force: true });
}

export function createPlugin(minify, tsconfigOptions) {
  return [
    resolve({
      preferBuiltins: false
    }),
    commonjs(),
    json(),
    typescript(tsconfigOptions),
    minify && terser()
  ].filter(Boolean);
}

/**
 * @param {object} param0
 * @param {import('rollup').InputOption} param0.input
 * @param {boolean} param0.isProduction
 * @param {string} param0.packagePath
 * @param {string} param0.dtsInput
 * @param {string} param0.buildDir
 * @param {boolean} param0.excludeDependencies
 * @param {boolean} param0.excludeDevDependencies
 * @param {{format: string, ext: string}[]} param0.formats
 * @param {string} param0.dtsName
 * @param {string[]} param0.external
 * @param {import('rollup-plugin-typescript2/dist').RPT2Options} param0.tsconfigOptions
 * @param {boolean} param0.clean
 * @returns {import('rollup').RollupOptions[]}
 */
export function createBaseRollup({
  input = 'src/index.ts',
  dtsInput = typeof input === 'string' ? input : 'src/index.ts',
  isProduction = false,
  formats = [
    { format: 'cjs', ext: 'cjs' },
    { format: 'es', ext: 'js' }
  ],
  packagePath = './package.json',
  buildDir = 'dist',
  excludeDependencies = false,
  excludeDevDependencies = false,
  tsconfigOptions = {
    tsconfig: './tsconfig.json',
    tsconfigOverride: {
      include: ['src']
    }
  },
  clean = true,
  dtsName = 'index.d.ts',
  external = []
}) {
  if (clean) {
    cleanBuildDir(buildDir);
  }

  const pkg = JSON.parse(readFileSync(packagePath), 'utf-8');

  const treeshake = {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  };

  const defaultExternal = [
    ...builtinModules,
    ...builtinModules.map((mod) => `node:${mod}`),
    ...(excludeDependencies ? [] : Object.keys(pkg.dependencies || {})),
    ...(excludeDevDependencies ? [] : Object.keys(pkg.devDependencies || {})),
    ...external
  ];

  return [
    {
      input: input,
      external: defaultExternal,
      output: formats.map(({ format, ext, name, globals, ...reset }) => ({
        dir: buildDir,
        format,
        name: name,
        globals,
        entryFileNames: `[name].${ext}`,
        ...reset
      })),
      plugins: createPlugin(isProduction, tsconfigOptions),
      treeshake
    },
    {
      input: dtsInput,
      external: defaultExternal,
      output: [
        {
          file: `${buildDir}/${dtsName}`,
          format: 'es'
        }
      ],
      plugins: [dts()],
      treeshake
    }
  ];
}
