import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@benthic/idle-core/contracts', replacement: path.resolve(__dirname, '..', 'contracts.ts') },
      { find: '@benthic/idle-core/economy', replacement: path.resolve(__dirname, '..', 'economy.ts') },
      { find: '@benthic/idle-core/runtime', replacement: path.resolve(__dirname, '..', 'runtime.ts') },
      { find: '@benthic/idle-core/save', replacement: path.resolve(__dirname, '..', 'save.ts') },
      { find: '@benthic/idle-core/scheduler', replacement: path.resolve(__dirname, '..', 'scheduler.ts') },
      { find: '@benthic/idle-core/state', replacement: path.resolve(__dirname, '..', 'state.ts') },
      { find: '@benthic/idle-core', replacement: path.resolve(__dirname, '..', 'index.ts') },
    ],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
