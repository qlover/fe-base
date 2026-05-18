import type {
  UiThemeOptions
} from './config';
import {
  getDerivedTokens,
  defaultTokenMapping,
  getConfig
} from './config';
import { resolveTokenValue } from './utils';

/**
 * 生成 @layer base 中的主题变量 CSS
 * @param options 配置选项 (prefix, themes, cssSelector, defaultTheme)
 * @returns CSS 字符串（不包含外层 @layer 包裹，但包含每个选择器的变量块）
 */
export function generateLayerBaseCSS(options: UiThemeOptions = {}): string {
  const config = getConfig(options);
  const { prefix, themes, cssSelector, defaultTheme } = config;
  let css = '';

  for (const [themeName, vars] of Object.entries(themes)) {
    const isDefault = themeName === defaultTheme;
    const selector = cssSelector(themeName, isDefault);
    const themeDerived = getDerivedTokens(prefix, themeName);

    // Merge channel tokens and derived tokens (derived wins on conflict)
    const merged = {
      ...vars,
      ...themeDerived
    };

    css += `${selector} {\n`;
    for (const [varName, value] of Object.entries(merged)) {
      css += `  --${prefix}-${varName}: ${value};\n`;
    }
    css += '}\n\n';
  }

  return css;
}

/**
 * 生成 @theme 块（供 Tailwind 工具类使用）
 * @param options 配置选项 (prefix, tokenMapping)
 * @returns CSS 字符串
 */
export function generateThemeBlockCSS(options: UiThemeOptions = {}): string {
  const config = getConfig(options);
  const { prefix, tokenMapping = defaultTokenMapping } = config;
  let css = '@theme {\n';

  for (const [tokenName, tokenValue] of Object.entries(tokenMapping)) {
    const finalValue = resolveTokenValue(tokenValue, prefix);
    css += `  --${tokenName}: ${finalValue};\n`;
  }
  css += '}\n';

  return css;
}

/**
 * 生成完整的主题 CSS（包含 @layer base 和 @theme）
 * @param options 配置选项
 * @returns 完整 CSS 字符串
 */
export function generateThemeCSS(options: UiThemeOptions = {}): string {
  let css = '';

  const layerBaseContent = generateLayerBaseCSS(options);
  if (layerBaseContent) {
    css += '@layer base {\n' + layerBaseContent + '}\n\n';
  }

  css += generateThemeBlockCSS(options);

  return css;
}
