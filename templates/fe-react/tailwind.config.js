import root10px from './lib/tailwindcss/root10px';
import themeCreate from './lib/tailwindcss/theme';
import themeConfig from './config/theme.json';

const theme = themeCreate(themeConfig.overrides);


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
