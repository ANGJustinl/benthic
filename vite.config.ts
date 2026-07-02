import path from 'node:path';
import { defineConfig } from 'vite';

const entryPoints = {
  index: path.resolve(__dirname, 'index.ts'),
  contracts: path.resolve(__dirname, 'contracts.ts'),
  economy: path.resolve(__dirname, 'economy.ts'),
  runtime: path.resolve(__dirname, 'runtime.ts'),
  save: path.resolve(__dirname, 'save.ts'),
  scheduler: path.resolve(__dirname, 'scheduler.ts'),
  state: path.resolve(__dirname, 'state.ts'),
};

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: entryPoints,
      name: 'IdleCore',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
});
