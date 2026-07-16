import { generateThemeFiles } from '../dist/generater.js';

await generateThemeFiles({
  outputDir: 'dist',
  overwrite: true
});
