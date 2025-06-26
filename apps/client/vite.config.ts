import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@neurostore/shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  }
});
