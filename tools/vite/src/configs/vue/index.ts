import type { UserConfig } from 'vite';
import vue, { type Options as VueOptions } from '@vitejs/plugin-vue';
import vueJsx, { type Options as JsxOptions } from '@vitejs/plugin-vue-jsx';

export interface VueConfigOptions {
  /**
   * Опции плагина Vue
   * @default undefined
   */
  vueOptions?: VueOptions;

  /**
   * Опции плагина Vue JSX
   * @default undefined
   */
  jsxOptions?: JsxOptions;
}

/**
 * Создает конфигурацию Vite для Vue-проектов с использованием builder-паттерна
 * @param options - Опции конфигурации Vue
 * @returns Конфигурация Vite с настройками для Vue
 */
export const defineVueConfig = (options: VueConfigOptions = {}): UserConfig => {
  const { vueOptions, jsxOptions } = options;

  // Добавляем Vue-специфичные плагины
  const plugins = [vue(vueOptions)];
  if (jsxOptions) {
    plugins.push(vueJsx(jsxOptions));
  }

  // Создаем Vue-специфичную конфигурацию
  const vueConfig: UserConfig = {
    plugins,
    build: {
      rollupOptions: {
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  };

  return vueConfig;
};

export default defineVueConfig;
