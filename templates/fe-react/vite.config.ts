import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3100)
  }
});
