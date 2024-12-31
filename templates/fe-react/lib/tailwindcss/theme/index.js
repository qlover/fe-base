import plugin from 'tailwindcss/plugin';
import template from 'lodash/template';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

function toCssVarName(prefix, key) {
  return prefix ? `--${prefix}-${key}` : `--${key}`;
}

class Generator {
  constructor(options) {
    this.options = options;
  }

  generateBaseStyles() {
    const { colors, useCssVar } = this.options;

    const baseStyles = {};

    // if not use css var, return empty object
    // because we don't need to generate base styles
    if (!useCssVar) {
      return {};
    }

    Object.entries(colors).forEach(([theme, themeColors]) => {
      const themeStylesKey = this.getBaseStylesKey(theme);

      baseStyles[themeStylesKey] = {};

      Object.entries(themeColors).forEach(([colorKey, value]) => {
        if (isPlainObject(value)) {
          Object.entries(value).forEach(([key, colorValue]) => {
            baseStyles[themeStylesKey][
              this.getBaseStyleValueKey(key, colorKey)
            ] = colorValue;
          });
        }
        // if value is string, it means it's a color value
        else if (isString(value)) {
          baseStyles[themeStylesKey][this.getBaseStyleValueKey(colorKey)] =
            value;
        }
      });
    });

    return baseStyles;
  }

  generateThemeColors() {
    const { colors } = this.options;

    const themeResultColors = {};

    Object.entries(colors).forEach(([theme, themeColors]) => {
      Object.entries(themeColors).forEach(([colorKey, value]) => {
        themeResultColors[colorKey] = {};

        if (isPlainObject(value)) {
          Object.entries(value).forEach(([key, colorValue]) => {
            const numberKey = Number(key);
            themeResultColors[colorKey][numberKey] = this.toCssValue(
              this.composeKey(key, colorKey),
              colorValue
            );
          });
        }
        // if value is string, it means it's a color value
        else if (isString(value)) {
          themeResultColors[colorKey] = this.toCssValue(colorKey, value);
        }
      });
    });

    return themeResultColors;
  }

  toCssValue(colorKey, value) {
    const { useCssVar } = this.options;

    if (useCssVar) {
      return `var(${this.getBaseStyleValueKey(colorKey)})`;
    }

    return value;
  }

  hasDefaultTheme(theme) {
    const { defaultTheme, colors } = this.options;

    if (!defaultTheme || defaultTheme === 'system') {
      return theme === Object.keys(colors)?.[0];
    }

    return theme === defaultTheme;
  }

  getBaseStylesKey(theme) {
    const { selectorTemplate, target, defaultTheme } = this.options;

    if (this.hasDefaultTheme(theme)) {
      return ':root';
    }

    if (selectorTemplate) {
      return template(selectorTemplate)({ theme, target });
    }

    return `${target}.${theme}`;
  }

  getBaseStyleValueKey(key, parentKey) {
    const { useCssVar, prefix } = this.options;

    let resultKey = key;
    if (parentKey) {
      resultKey = this.composeKey(key, parentKey);
    }

    if (useCssVar) {
      return toCssVarName(prefix, resultKey);
    }

    return prefix ? this.composeKey(resultKey, prefix) : resultKey;
  }

  composeKey(key, parentKey) {
    return parentKey ? `${parentKey}-${key}` : key;
  }

  getCSSSelector(name) {
    const { selectorTemplate, target } = this.options;
    return template(selectorTemplate)({ name, target });
  }
}

function create(options) {
  const generator = new Generator(options);

  const baseStyles = generator.generateBaseStyles();
  const themeColors = generator.generateThemeColors();

  const result = {
    baseStyles,
    colors: themeColors
  };

  if (Object.keys(baseStyles).length > 0) {
    result.plugin = plugin(({ addBase }) => {
      addBase(baseStyles);
    });
  }

  return result;
}

export default create;
