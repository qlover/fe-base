import type { Plugin, Postcss, Result, Root } from 'postcss';
import { generateThemeCSS } from './core';
import type { UiThemeOptions } from './config';

export interface ThemePluginOptions extends UiThemeOptions {
  includePaths?: string[];
}

const themePlugin = (userOptions: ThemePluginOptions = {}): Plugin => {
  const { includePaths = ['/styles/index.css', '/styles/tailwind.css'] } =
    userOptions;

  return {
    postcssPlugin: 'tailwind-theme-plugin',
    Once(
      root: Root,
      { postcss, result }: { postcss: Postcss; result: Result }
    ) {
      const from = result.opts.from ?? root.source?.input?.file ?? '';
      const normalized = from.replace(/\\/g, '/');

      const shouldProcess = includePaths.some((pattern: string) =>
        normalized.endsWith(pattern)
      );
      if (normalized && !shouldProcess) {
        return;
      }

      const finalCss = generateThemeCSS(userOptions);

      root.prepend(postcss.parse(finalCss));
    }
  };
};

themePlugin.postcss = true;
export default themePlugin;
