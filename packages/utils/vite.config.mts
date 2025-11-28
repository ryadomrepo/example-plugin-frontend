import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
  },
});
