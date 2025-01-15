import plugin from 'tailwindcss/plugin';
import template from 'lodash/template';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

class KeyTemplate {
  constructor(options) {
    /**
     * @type {import('./type').ThemeConfig}
     */
    this.options = options;
  }

  /**
   * Get the colors value
   *
   * @example
   * ```
   * colors: {
   *  primary: {
   *    "500": getColorsValue()
   *  },
   *  secondary: getColorsValue()
   * }
   * ```
   *
   * @param {string} colorKey - The color key
   * @param {string} value - The color value
   * @returns {string} - The colors value
   */
  getColorsValue({ key, parentKey = '', value }) {
    const { colorsValueTemplate, ...rest } = this.options;

    let colorKey = key;
    if (parentKey) {
      colorKey = this.composeKey(key, parentKey);
    }

    // if colorsValueTemplate is provided, use it to generate the colors value
    if (colorsValueTemplate) {
      const styleKey = this.getStyleKey(colorKey);
      return template(colorsValueTemplate)({
        ...rest,
        styleKey,
        key,
        parentKey,
        value
      });
    }

    return value;
  }

  /**
   * Get the style theme key
   *
   * ```
   * <style>
   * [getStyleThemeKey()] {
   *  primary: #000;
   * }
   * </style>
   * ```
   *
   * @param {string} theme - The theme name
   * @returns {string} - The style theme key
   */
  getStyleThemeKey(theme) {
    const { styleThemeKeyTemplate, target, ...rest } = this.options;

    // if styleThemeKeyTemplate is provided, use it to generate the style theme key
    if (styleThemeKeyTemplate) {
      return template(styleThemeKeyTemplate)({ ...rest, theme, target });
    }

    return `${target}.${theme}`;
  }

  /**
   * Get the style key template
   *
   * @example
   *
   * ```
   * <style>
   * [getStyleThemeKey()] {
   *  [getStyleKeyTemplate()]: #000;
   * }
   * </style>
   * ```
   *
   * @param {string} key - The key name
   * @param {string | undefined} parentKey - The parent key name
   * @returns {string} - The style key template
   */
  getStyleKey(key, parentKey) {
    const { styleKeyTemplate, ...rest } = this.options;

    // if parentKey is provided, compose the key
    let colorKey = key;
    if (parentKey) {
      colorKey = this.composeKey(key, parentKey);
    }

    // if styleKeyTemplate is provided, use it to generate the style key
    if (styleKeyTemplate) {
      return template(styleKeyTemplate)({ ...rest, colorKey, parentKey });
    }

    return key;
  }

  composeKey(key, parentKey) {
    return parentKey ? `${parentKey}-${key}` : key;
  }
}

class Generator {
  constructor(options) {
    this.options = options;
    this.keyTemplate = new KeyTemplate(options);
  }

  generateBaseStyles() {
    const { colors } = this.options;

    const baseStyles = {};

    Object.entries(colors).forEach(([theme, themeColors]) => {
      const styleThemeKey = this.keyTemplate.getStyleThemeKey(theme);

      baseStyles[styleThemeKey] = {};

      Object.entries(themeColors).forEach(([colorKey, value]) => {
        if (isPlainObject(value)) {
          Object.entries(value).forEach(([key, colorValue]) => {
            baseStyles[styleThemeKey][
              this.keyTemplate.getStyleKey(key, colorKey)
            ] = colorValue;
          });
        }
        // if value is string, it means it's a color value
        else if (isString(value)) {
          baseStyles[styleThemeKey][this.keyTemplate.getStyleKey(colorKey)] =
            value;
        }
      });
    });

    return this.setDefaultStyleThemeKey(baseStyles);
  }

  setDefaultStyleThemeKey(baseStyles) {
    const { defaultTheme, colors } = this.options;

    // set default style theme key
    let _defaultTheme = defaultTheme;
    if (
      // if default theme is not provided, set it to the first theme
      !defaultTheme ||
      // if default theme is system, set it to the first theme
      defaultTheme === 'system' ||
      // if default theme is not in colors, set it to the first theme
      !Object.keys(colors).includes(defaultTheme)
    ) {
      _defaultTheme = Object.keys(colors)?.[0];
    }

    const defaultStyleThemeKey =
      this.keyTemplate.getStyleThemeKey(_defaultTheme);

    const result = {};
    Object.entries(baseStyles).forEach(([key, value]) => {
      if (key === defaultStyleThemeKey) {
        result[':root'] = value;
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  generateThemeColors() {
    const { colors } = this.options;

    const themeResultColors = {};

    Object.entries(colors).forEach(([, themeColors]) => {
      Object.entries(themeColors).forEach(([colorKey, value]) => {
        themeResultColors[colorKey] = {};

        if (isPlainObject(value)) {
          Object.entries(value).forEach(([key, colorValue]) => {
            const numberKey = Number(key);
            themeResultColors[colorKey][numberKey] =
              this.keyTemplate.getColorsValue({
                key,
                parentKey: colorKey,
                value: colorValue
              });
          });
        }
        // if value is string, it means it's a color value
        else if (isString(value)) {
          themeResultColors[colorKey] = this.keyTemplate.getColorsValue({
            key: colorKey,
            value
          });
        }
      });
    });

    return themeResultColors;
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
