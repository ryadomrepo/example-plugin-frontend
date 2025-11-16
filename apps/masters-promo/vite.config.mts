import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { manifestPlugin } from './vite-plugin-manifest';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('widget-'),
        },
      },
    }),
    manifestPlugin(),
    {
      name: 'copy-contract',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, '../../contract.json'),
          resolve(__dirname, '../../dist/contract.json')
        );
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}',
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  build: {
    outDir: resolve(__dirname, '../../dist/widget-masters-promo'),
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WidgetMastersPromo',
      fileName: (format) => `widget-masters-promo.${format}.js`,
      formats: ['umd'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        // Определяем process перед кодом
        banner: 'if (typeof process === "undefined") { var process = { env: { NODE_ENV: "production" } }; }',
      },
    },
  },
});
