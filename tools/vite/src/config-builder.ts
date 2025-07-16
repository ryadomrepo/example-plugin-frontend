import { mergeConfig, type UserConfig } from 'vite';

/**
 * Объединяет несколько объектов конфигурации Vite в один.
 * Использует встроенную функцию mergeConfig для корректного объединения настроек.
 *
 * @param configs - Массив объектов конфигурации Vite для объединения
 * @returns Промис, который разрешается в объединенный объект конфигурации Vite
 *
 * @example
 * // Пример с синхронными конфигурациями:
 * const config = createConfig(
 *   // Базовые настройки проекта
 *   {
 *     root: './src',
 *     publicDir: 'public',
 *     build: { outDir: 'dist' }
 *   },
 *   // Настройки для разработки
 *   {
 *     server: {
 *       port: 3000,
 *       open: true
 *     }
 *   }
 * );
 *
 * @example
 * // Пример с асинхронными конфигурациями:
 * // Функция, которая асинхронно загружает конфигурацию
 * async function loadCustomConfig() {
 *   const response = await fetch('/api/config');
 *   return response.json();
 * }
 *
 * // Функция, которая асинхронно определяет версию приложения
 * async function getAppVersion() {
 *   const pkg = await import('../package.json');
 *   return {
 *     define: {
 *       __APP_VERSION__: JSON.stringify(pkg.version)
 *     }
 *   };
 * }
 *
 * const config = await createConfig(
 *   // Синхронная базовая конфигурация
 *   {
 *     plugins: [vue()],
 *     resolve: {
 *       alias: {
 *         '@': '/src'
 *       }
 *     }
 *   },
 *   // Асинхронная загрузка кастомной конфигурации
 *   loadCustomConfig(),
 *   // Асинхронное определение версии приложения
 *   getAppVersion()
 * );
 *
 * @description
 * Функция позволяет объединить несколько объектов конфигурации Vite в один.
 * Каждый объект конфигурации может определять свою часть настроек, а createConfig
 * корректно объединит все настройки с учетом специфики Vite.
 *
 * Функция поддерживает как синхронные объекты конфигурации, так и промисы,
 * которые разрешаются в объекты конфигурации. Это позволяет использовать
 * асинхронные операции при создании конфигурации.
 *
 * При объединении конфигураций используется встроенная функция mergeConfig,
 * которая правильно обрабатывает все типы настроек Vite, включая массивы
 * плагинов, объекты с вложенными свойствами и т.д.
 */
export function createConfig(
  ...configs: (UserConfig | Promise<UserConfig>)[]
): Promise<UserConfig> {
  return Promise.all(configs).then((resolvedConfigs) => {
    return resolvedConfigs.reduce<UserConfig>(
      (merged, current) => mergeConfig(merged, current),
      {},
    );
  });
}
