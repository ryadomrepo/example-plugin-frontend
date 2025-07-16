import { defineBaseConfig } from '@yclients-configs/vite';

export default defineBaseConfig({
  build: {
    lib: {
      entry: {
        api: './src/index.ts',
        test: './test/index.ts',
      },
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
  },
});
