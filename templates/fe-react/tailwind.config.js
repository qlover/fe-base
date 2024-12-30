import root10pxConfig from './lib/tailwindcss/root10px';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      ...root10pxConfig.root10pxThemes,
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        text: 'var(--color-text)',
        background: 'var(--color-background)'
      }
    }
  },
  plugins: [root10pxConfig.root10pxPlugin]
};
