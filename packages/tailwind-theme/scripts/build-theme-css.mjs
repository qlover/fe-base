import { generateThemeFiles } from '../dist/index.js';

await generateThemeFiles({
  outputDir: 'dist',
  overwrite: true
});
