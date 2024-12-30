import plugin from 'tailwindcss/plugin';
import template from 'lodash/template';

function toCssVarName(prefix, key) {
  return prefix ? `--${prefix}-${key}` : `--${key}`;
}

function getThemeKey({ theme, selectorTemplate, target, defaultTheme }) {
  if (theme === defaultTheme) {
    return ':root';
  }
  
  if (selectorTemplate) {
    return template(selectorTemplate)({ theme, target });
  }
  return `${target}.${theme}`;
}

function create({ colors, selectorTemplate, prefix = 'color', target = '', defaultTheme }) {
  const themes = Object.keys(colors);
  const baseStyles = {};

  themes.forEach((theme) => {
    const themeColors = colors[theme];
    const themeKey = getThemeKey({ theme, selectorTemplate, target, defaultTheme });

    baseStyles[themeKey] = {};

    Object.keys(themeColors).forEach((colorKey) => {
      baseStyles[themeKey][toCssVarName(prefix, colorKey)] =
        themeColors[colorKey];
    });
  });

  // Use a Set to collect all unique color keys
  const allColorKeys = new Set();
  themes.forEach((theme) => {
    const themeColors = colors[theme];
    Object.keys(themeColors).forEach((colorKey) => {
      allColorKeys.add(colorKey);
    });
  });

  // Create themeColors object with unique keys
  const themeColors = {};
  allColorKeys.forEach((colorKey) => {
    themeColors[colorKey] = `var(${toCssVarName(prefix, colorKey)})`;
  });

  return {
    baseStyles,
    colors: themeColors,
    plugin: plugin(({ addBase }) => {
      addBase(baseStyles);
    })
  };
}

export default create;
