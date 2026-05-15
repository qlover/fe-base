// tailwind-theme-plugin.mjs
import postcss from 'postcss';

// ========== 内置主题（与原始定义一致） ==========
const builtinThemes = {
  light: {
    'color-primary': '246 248 250',
    'color-secondary': '255 255 255',
    'color-elevated': '240 242 244',
    'color-primary-text': '31 35 40',
    'color-primary-text-hover': '101 109 118',
    'color-secondary-text': '101 109 118',
    'color-tertiary-text': '140 149 159',
    'color-primary-border': '208 215 222',
    'color-brand': '124 58 237',
    'color-brand-hover': '109 40 217',
    'color-brand-active': '91 33 182',
    'border-radius': '6px'
  },
  dark: {
    'color-primary': '15 17 21',
    'color-secondary': '22 27 34',
    'color-elevated': '33 38 45',
    'color-primary-text': '230 237 243',
    'color-primary-text-hover': '139 148 158',
    'color-secondary-text': '139 148 158',
    'color-tertiary-text': '110 118 129',
    'color-primary-border': '48 54 61',
    'color-brand': '139 92 246',
    'color-brand-hover': '124 58 237',
    'color-brand-active': '109 40 217',
    'border-radius': '6px'
  },
  pink: {
    'color-primary': '26 13 20',
    'color-secondary': '37 16 27',
    'color-elevated': '48 21 34',
    'color-primary-text': '252 232 240',
    'color-primary-text-hover': '196 144 168',
    'color-secondary-text': '196 144 168',
    'color-tertiary-text': '138 88 112',
    'color-primary-border': '92 45 66',
    'color-brand': '244 114 182',
    'color-brand-hover': '236 72 153',
    'color-brand-active': '219 39 119',
    'border-radius': '8px'
  },
  amber: {
    'color-primary': '30 18 0',
    'color-secondary': '40 26 0',
    'color-elevated': '50 31 0',
    'color-primary-text': '242 232 213',
    'color-primary-text-hover': '184 166 138',
    'color-secondary-text': '184 166 138',
    'color-tertiary-text': '122 106 86',
    'color-primary-border': '74 56 0',
    'color-brand': '232 148 58',
    'color-brand-hover': '208 120 40',
    'color-brand-active': '180 100 30',
    'border-radius': '6px'
  },
  forest: {
    'color-primary': '6 21 8',
    'color-secondary': '12 31 14',
    'color-elevated': '19 39 22',
    'color-primary-text': '216 240 220',
    'color-primary-text-hover': '136 173 142',
    'color-secondary-text': '136 173 142',
    'color-tertiary-text': '90 122 94',
    'color-primary-border': '44 66 48',
    'color-brand': '74 222 128',
    'color-brand-hover': '34 197 94',
    'color-brand-active': '22 163 74',
    'border-radius': '6px'
  },
  ocean: {
    'color-primary': '6 14 26',
    'color-secondary': '13 26 46',
    'color-elevated': '18 36 62',
    'color-primary-text': '218 238 255',
    'color-primary-text-hover': '122 181 212',
    'color-secondary-text': '122 181 212',
    'color-tertiary-text': '74 126 154',
    'color-primary-border': '30 58 92',
    'color-brand': '56 189 248',
    'color-brand-hover': '14 165 233',
    'color-brand-active': '2 132 199',
    'border-radius': '6px'
  }
};

const defaultConfig = {
  prefix: 'fe',
  defaultTheme: 'light',
  themes: {}, // 用户扩展/覆盖的主题
  getSelector: (themeName, isDefault) => {
    if (isDefault) {
      return `:root, html[data-theme="${themeName}"], [data-theme="${themeName}"]`;
    }
    return `html[data-theme="${themeName}"], [data-theme="${themeName}"]`;
  },
  // 令牌映射：Tailwind 令牌名 => 值（字符串或函数）
  tokenMapping: {
    // 颜色令牌（自动包装 rgb）
    'color-primary': 'rgb(var(--${prefix}-color-primary))',
    'color-secondary': 'rgb(var(--${prefix}-color-secondary))',
    'color-elevated': 'rgb(var(--${prefix}-color-elevated))',
    'color-primary-text': 'rgb(var(--${prefix}-color-primary-text))',
    'color-primary-text-hover':
      'rgb(var(--${prefix}-color-primary-text-hover))',
    'color-secondary-text': 'rgb(var(--${prefix}-color-secondary-text))',
    'color-tertiary-text': 'rgb(var(--${prefix}-color-tertiary-text))',
    'color-primary-border': 'rgb(var(--${prefix}-color-primary-border))',
    'color-brand': 'rgb(var(--${prefix}-color-brand))',
    'color-brand-hover': 'rgb(var(--${prefix}-color-brand-hover))',
    'color-brand-active': 'rgb(var(--${prefix}-color-brand-active))',
    // 圆角令牌
    radius: 'var(--${prefix}-border-radius)',
    // 字体令牌（固定值，但也可通过 ${prefix} 引用变量，例如 var(--${prefix}-font-family)）
    'font-sans':
      'var(--font-inter), ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", sans-serif'
  }
};

const themePlugin = (userOptions = {}) => {
  const config = { ...defaultConfig, ...userOptions };
  const { prefix, defaultTheme, getSelector, themes, tokenMapping } = config;
  const allThemes = { ...builtinThemes, ...themes };

  // 解析令牌值：支持字符串（替换 ${prefix}）或函数
  const resolveTokenValue = (value, tokenName) => {
    if (typeof value === 'function') {
      return value(prefix, tokenName);
    }
    return value.replace(/\$\{prefix\}/g, prefix);
  };

  return {
    postcssPlugin: 'tailwind-theme-plugin',
    Once(root) {
      let cssOutput = '';

      // 1. 生成 @layer base 中的 CSS 变量定义
      cssOutput += '@layer base {\n';
      for (const [themeName, vars] of Object.entries(allThemes)) {
        const isDefault = themeName === defaultTheme;
        const selector = getSelector(themeName, isDefault);
        cssOutput += `${selector} {\n`;
        for (const [varName, value] of Object.entries(vars)) {
          const fullVarName = `--${prefix}-${varName}`;
          cssOutput += `  ${fullVarName}: ${value};\n`;
        }
        cssOutput += `}\n\n`;
      }
      cssOutput += `}\n`;

      // 2. 生成 @theme 部分
      cssOutput += '@theme {\n';
      for (const [tokenName, tokenValue] of Object.entries(tokenMapping)) {
        const finalValue = resolveTokenValue(tokenValue, tokenName);
        cssOutput += `  --${tokenName}: ${finalValue};\n`;
      }
      cssOutput += '}\n';

      const generated = postcss.parse(cssOutput);
      root.prepend(generated);
    }
  };
};

export default themePlugin;
