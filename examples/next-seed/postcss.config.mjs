import themePlugin from './tools/themePlugin.mjs';

const config = {
  plugins: ['@tailwindcss/postcss', themePlugin()]
};

export default config;
