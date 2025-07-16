import { mergeConfig, type UserConfig } from 'vite';

/**
 * Создает базовую конфигурацию Vite
 * @param options - Опции базовой конфигурации
 * @returns Конфигурация Vite
 *
 * @example
 * // Базовое использование с дефолтными настройками
 * export default defineBaseConfig();
 *
 * @example
 * // Использование с кастомными настройками
 * export default defineBaseConfig({
 *   root: './src',
 *   base: '/app/',
 *   build: {
 *     outDir: 'build',
 *     target: ['es2020', 'chrome89']
 *   }
 * });
 */
export const defineBaseConfig = (options: UserConfig = {}): UserConfig => {
  const defaultConfig: UserConfig = {
    root: process.cwd(),
    base: './',
    build: {
      outDir: 'dist',
      target: 'esnext',
      emptyOutDir: true,
      sourcemap: true,
      minify: false,
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true,
    },
  };

  // Используем встроенную утилиту Vite для объединения конфигураций
  return mergeConfig(defaultConfig, options);
};

export default defineBaseConfig;
