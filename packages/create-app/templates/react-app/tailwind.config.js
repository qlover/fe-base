import root10px from './fe-prod/build/tw-root10px';
import themeCreate from './fe-prod/core/theme-controller/tw-generator';
import themeConfig from './config/theme.json';

const theme = themeCreate(themeConfig.override);

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      ...root10px.themes,
      colors: theme.colors
    }
  },
  plugins: [root10px.plugin, theme.plugin]
};
