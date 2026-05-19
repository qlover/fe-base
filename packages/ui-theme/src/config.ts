import { deepMerge } from './utils';

export type RGBChannels = string; // e.g. "246 248 250"
export type ColorValue = string;

export interface ThemeTokens {
  [key: string]: ColorValue | RGBChannels;
}

/**
 * Token mapping for the theme.
 *
 * @example
 * {
 *   'color-primary': 'rgb(var(--${prefix}-color-primary))',
 *   'color-secondary': 'rgb(var(--${prefix}-color-secondary))',
 *   'color-elevated': 'rgb(var(--${prefix}-color-elevated))',
 *   'color-primary-text': 'rgb(var(--${prefix}-color-primary-text))',
 *   'color-primary-text-hover': 'rgb(var(--${prefix}-color-primary-text-hover))',
 *   'color-secondary-text': 'rgb(var(--${prefix}-color-secondary-text))',
 *   'color-tertiary-text': 'rgb(var(--${prefix}-color-tertiary-text))',
 * }
 *
 * 最后结果可能=>
 * {
 *   '--color-primary': 'rgb(var(--fe-color-primary))',
 *   '--color-secondary': 'rgb(var(--fe-color-secondary))',
 *   '--color-elevated': 'rgb(var(--fe-color-elevated))',
 *   '--color-primary-text': 'rgb(var(--fe-color-primary-text))',
 *   '--color-primary-text-hover': 'rgb(var(--fe-color-primary-text-hover))',
 *   '--color-secondary-text': 'rgb(var(--fe-color-secondary-text))',
 *   '--color-tertiary-text': 'rgb(var(--fe-color-tertiary-text))',
 * }
 */
export type TokenMapping = Record<string, string>;

export interface UiThemeOptions {
  prefix?: string;
  defaultTheme?: string;
  themes?: Record<string, ThemeTokens>;
  tokenMapping?: TokenMapping;
  cssSelector?: (themeName: string, root: boolean) => string;
  outputPath?: string;
  overwrite?: boolean;
}

/** Brand background opacity per theme (matches xOranj default.css) */
const themePrimaryBgOpacity: Record<string, string> = {
  light: '0.08',
  dark: '0.12',
  pink: '0.12',
  amber: '0.12',
  forest: '0.1',
  ocean: '0.1'
};

export const builtinThemes: Record<string, ThemeTokens> = {
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
    'color-success': '#1a7f37',
    'color-warning': '#faad14',
    'color-error': '#cf222e',
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
    'color-success': '#3fb950',
    'color-warning': '#faad14',
    'color-error': '#f85149',
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
    'color-success': '#34d399',
    'color-warning': '#faad14',
    'color-error': '#fb7185',
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
    'color-success': '#5aad6e',
    'color-warning': '#faad14',
    'color-error': '#c85a4a',
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
    'color-success': '#86efac',
    'color-warning': '#faad14',
    'color-error': '#f87171',
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
    'color-success': '#34d399',
    'color-warning': '#faad14',
    'color-error': '#f87171',
    'border-radius': '6px'
  }
};

export const getDerivedTokens = (
  prefix: string,
  themeName?: string
): ThemeTokens => {
  const opacity = themeName
    ? (themePrimaryBgOpacity[themeName] ?? '0.1')
    : '0.1';

  return {
    'color-bg-container': `rgb(var(--${prefix}-color-secondary))`,
    'color-text': `rgb(var(--${prefix}-color-primary-text) / 0.85)`,
    'color-text-heading': `rgb(var(--${prefix}-color-primary-text))`,
    'color-text-disabled': `rgb(var(--${prefix}-color-primary-text) / 0.25)`,
    'color-primary-hover': `rgb(var(--${prefix}-color-brand-hover))`,
    'color-primary-active': `rgb(var(--${prefix}-color-brand-active))`,
    'color-primary-bg': `rgb(var(--${prefix}-color-brand) / ${opacity})`,
    'line-height': '1.5715'
  };
};

export const defaultTokenMapping: TokenMapping = {
  'color-primary': 'rgb(var(--${prefix}-color-primary))',
  'color-primary-active': 'rgb(var(--${prefix}-color-primary-active))',
  'color-primary-hover': 'rgb(var(--${prefix}-color-primary-hover))',
  'color-primary-bg': 'rgb(var(--${prefix}-color-primary-bg))',
  'color-secondary': 'rgb(var(--${prefix}-color-secondary))',
  'color-elevated': 'rgb(var(--${prefix}-color-elevated))',
  'color-primary-text': 'rgb(var(--${prefix}-color-primary-text))',
  'color-primary-text-hover': 'rgb(var(--${prefix}-color-primary-text-hover))',
  'color-secondary-text': 'rgb(var(--${prefix}-color-secondary-text))',
  'color-tertiary-text': 'rgb(var(--${prefix}-color-tertiary-text))',
  'color-primary-border': 'rgb(var(--${prefix}-color-primary-border))',
  'color-brand': 'rgb(var(--${prefix}-color-brand))',
  'color-brand-hover': 'rgb(var(--${prefix}-color-brand-hover))',
  'color-brand-active': 'rgb(var(--${prefix}-color-brand-active))',
  /** Text/icons on brand-colored surfaces (buttons, badges) */
  'color-on-brand': '#ffffff',
  'color-progress-track': 'rgb(var(--${prefix}-color-primary-border) / 0.5)',
  'color-bg-container': 'rgb(var(--${prefix}-color-bg-container))',
  'font-sans':
    'var(--font-inter), ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", sans-serif',
  'animate-dashboard-skeleton-shimmer':
    'dashboard-skeleton-shimmer 1.6s ease-in-out infinite'
};

export function getDefaultSelector(themeName: string, root: boolean) {
  if (root) {
    return `:root, html[data-theme="${themeName}"], [data-theme="${themeName}"]`;
  }
  return `html[data-theme="${themeName}"], [data-theme="${themeName}"]`;
}

export const defaultConfig: UiThemeOptions = {
  prefix: 'fe',
  themes: {},
  tokenMapping: defaultTokenMapping,
  cssSelector: getDefaultSelector
};

export function getConfig(options?: UiThemeOptions): Required<UiThemeOptions> {
  const allThemes = deepMerge(builtinThemes, options?.themes || {});
  const allMappings = deepMerge(
    defaultTokenMapping,
    options?.tokenMapping || {}
  );

  const config = Object.assign(
    {} as Required<UiThemeOptions>,
    defaultConfig,
    options,
    {
      themes: allThemes,
      tokenMapping: allMappings
    }
  );

  if (!config.defaultTheme && config.themes) {
    config.defaultTheme = Object.keys(config.themes)[0];
  }

  return config;
}
