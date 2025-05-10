import { defineConfig } from 'tsup';
import { builtinModules } from 'module';
import pkg from './package.json';

const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  'commitizen/dist/cli/git-cz.js'
];

export default defineConfig([
  {
    entry: {
      'check-packages': 'src/cli/check-packages.ts',
      'clean-branch': 'src/cli/clean-branch.ts',
      clean: 'src/cli/clean.ts',
      commit: 'src/cli/commit.ts',
      'setup-husky': 'src/cli/setup-husky.ts'
    },
    format: ['cjs', 'esm'],
    dts: false,
    clean: true,
    external,
    noExternal: [],
    minify: 'terser',
    outDir: 'dist/cli',
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.mjs'
      };
    }
  },
  {
    entry: {
      index: 'src/scripts/index.ts',
      'check-packages': 'src/scripts/check-packages.ts',
      'clean-branch': 'src/scripts/clean-branch.ts',
      clean: 'src/scripts/clean.ts',
      commit: 'src/scripts/commit.ts',
      'setup-husky': 'src/scripts/setup-husky.ts'
    },
    format: ['cjs', 'esm'],
    dts: false,
    clean: true,
    external,
    treeshake: true,
    sourcemap: false,
    outDir: 'dist/scripts',
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.js'
      };
    }
  },
  {
    entry: {
      index: 'src/scripts/index.ts',
      'check-packages': 'src/scripts/check-packages.ts',
      'clean-branch': 'src/scripts/clean-branch.ts',
      clean: 'src/scripts/clean.ts',
      commit: 'src/scripts/commit.ts',
      'setup-husky': 'src/scripts/setup-husky.ts'
    },
    format: ['esm'],
    dts: true,
    clean: false,
    external,
    outDir: 'dist/scripts'
  }
]);
