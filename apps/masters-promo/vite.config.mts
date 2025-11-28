import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { manifestPlugin } from './vite-plugins/manifest';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    manifestPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: resolve(__dirname, '../../contract.json'),
          dest: resolve(__dirname, '../../dist'),
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env': {},
  },
  build: {
    outDir: resolve(__dirname, '../../dist/widget-masters-promo'),
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WidgetMastersPromo',
      fileName: () => 'widget-masters-promo.[hash].js',
      formats: ['umd'],
    },
    rollupOptions: {
      input: {
        'widget-masters-promo': resolve(__dirname, 'src/index.ts'),
      },
      output: {
        assetFileNames: ({ name }): string => {
          const ext = name?.split('.').pop() ?? 'asset';
          return `widget-masters-promo.[hash].${ext}`;
        },
      },
    },
  },
});
