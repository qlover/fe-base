import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { name, version } from './package.json';

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify(name),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version)
  },
  plugins: [react(), tailwindcss(), tsconfigPaths()]
});
