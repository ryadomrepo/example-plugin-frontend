import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig, type UserConfig } from 'vite';
import { manifestPlugin } from '../plugins';

/**
 * Опции для настройки пресета плагина
 */
interface PluginPresetOptions {
  /**
   * Название плагина, используемое для именования выходных файлов
   * и идентификации в системе сборки
   */
  pluginName: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(dirname(__filename), '../');

export const definePluginConfig = (
  options: PluginPresetOptions,
): UserConfig => {
  const defaultConfig: UserConfig = {
    resolve: {
      alias: {
        '@': resolve(__dirname, '../../'),
        '@yclients-plugins/utils': resolve(
          __dirname,
          '../../packages/utils/src/index.ts',
        ),
      },
    },
    build: {
      outDir: resolve(__dirname, `../../dist/${options.pluginName}`),
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        fileName: (_, entryName) => `${entryName}.[hash].js`,
        formats: ['es'],
      },
      rollupOptions: {
        input: {
          [options.pluginName]: resolve('src/index.ts'),
        },
        output: {
          // Используем именованные экспорты вместо смешанных (default + named)
          exports: 'named',
          // Добавляем хэши и версию к именам файлов для правильного кэширования
          chunkFileNames: `[name].[hash].js`, // хэши для чанков
          assetFileNames: `[name].[hash].[ext]`,
        },
      },
    },
    plugins: [manifestPlugin()],
  };

  // Используем встроенную утилиту Vite для объединения конфигураций
  return mergeConfig(defaultConfig, options);
};
