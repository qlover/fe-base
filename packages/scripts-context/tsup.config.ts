import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: false,
    minify: true,
    clean: true,
    silent: true,
    outDir: 'dist',
    external: [...Object.keys(pkg.dependencies), '@qlover/env-loader'],
    noExternal: Object.keys(pkg.devDependencies).filter(
      (dep) => dep !== '@qlover/env-loader'
    )
  },
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: {
      compilerOptions: {
        composite: false
      }
    },
    outDir: 'dist',
    external: [...Object.keys(pkg.dependencies), '@qlover/env-loader'],
    noExternal: Object.keys(pkg.devDependencies).filter(
      (dep) => dep !== '@qlover/env-loader'
    )
  }
]);
