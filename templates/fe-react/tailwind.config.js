import root10pxConfig from './lib/tailwindcss';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      ...root10pxConfig.root10pxThemes,
      animation: {
        'spin-slow': 'spin 20s linear infinite'
      }
    }
  },
  plugins: [root10pxConfig.root10pxPlugin]
};
