import { readFileSync } from 'fs';
import { createBaseRollup } from '../../make/createBaseRollup.js';
import { toPureCamelCase } from '../../make/toPureCamelCase.js';
import { join } from 'path';

const packageName = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
).name;

export default createBaseRollup({
  input: 'src/core/index.ts',
  formats: [
    {
      format: 'umd',
      ext: 'umd.js',
      name: toPureCamelCase(packageName)
    }
  ],
  clean: false,
  excludeDependencies: true,
  external: ['tailwindcss', 'vite'],
  isProduction: true
});
