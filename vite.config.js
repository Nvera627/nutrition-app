import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // error instead of silently picking a new port
  },
  test: {
    // Use jsdom so React components can be rendered in tests
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
});
