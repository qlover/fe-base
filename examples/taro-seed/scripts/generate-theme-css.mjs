import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateThemeFile } from '@qlover/tailwind-theme/generater';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Miniprogram: theme class on root View (see Page.tsx themeValueTemplate). */
const taroWeappCssSelector = (themeName) => `.fe-theme.theme-${themeName}`;

await generateThemeFile({
  variant: 'layer-base',
  outputPath: join(__dirname, '../src/styles/themes/taro-weapp-theme.css'),
  cssSelector: taroWeappCssSelector,
  defaultTheme: 'light',
  overwrite: true
});
