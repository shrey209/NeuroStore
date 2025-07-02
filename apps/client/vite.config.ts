import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),  tailwindcss()],
  resolve: {
    alias: {
      '@neurostore/shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  }
});
