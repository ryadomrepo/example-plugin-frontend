# Пакет конфигураций сборки Vite

Пакет предоставляет предварительно настроенные конфигурации Vite для проектов YCLIENTS.

## 📋 Содержание

- [🚀 Установка](#-установка)
- [⚡ Быстрый старт](#-быстрый-старт)
- [📦 Доступные конфигурации](#-доступные-конфигурации)
- [🔧 Базовая конфигурация](#-базовая-конфигурация)
- [🖖 Vue конфигурация](#-vue-конфигурация)
- [🎯 Пресеты](#-пресеты)
- [🛠️ Утилиты](#️-утилиты)
- [📚 Примеры использования](#-примеры-использования)
- [⚠️ Требования](#️-требования)

## 🚀 Установка

```bash
npm install --save-dev @yclients-configs/vite
```

## ⚡ Быстрый старт

### Простой проект

```typescript
// vite.config.ts
import { defineBaseConfig } from '@yclients-configs/vite';

export default defineBaseConfig();
```

### Vue проект

```typescript
// vite.config.ts
import {
  defineBaseConfig,
  defineVueConfig,
  createConfig,
} from '@yclients-configs/vite';

export default await createConfig(
  defineBaseConfig(),
  defineVueConfig({
    vueOptions: {
      // Настройки Vue плагина
    },
  }),
);
```

## 📦 Доступные конфигурации

Пакет предоставляет следующие конфигурации и утилиты:

| Экспорт                          | Описание                                        |
| -------------------------------- | ----------------------------------------------- |
| `defineBaseConfig`               | Базовая конфигурация с настройками по умолчанию |
| `defineVueConfig`                | Конфигурация для Vue.js проектов                |
| `createConfig`                   | Утилита для объединения конфигураций            |
| `@yclients-configs/vite/presets` | Пресеты для специфических случаев               |

## 🔧 Базовая конфигурация

Базовая конфигурация включает в себя стандартные настройки для проектов YCLIENTS:

- ✅ Оптимизация сборки
- ✅ Настройки сервера разработки
- ✅ Поддержка source maps
- ✅ Автоматическая очистка выходной директории

### Использование

```typescript
// vite.config.ts
import { defineBaseConfig } from '@yclients-configs/vite';

export default defineBaseConfig({
  // Опциональные настройки Vite
  root: process.cwd(), // Корневая директория проекта (по умолчанию: process.cwd())
  base: './', // Базовый публичный путь (по умолчанию: './')
  build: {
    outDir: 'dist', // Директория для сборки (по умолчанию: 'dist')
    target: 'esnext', // Целевая версия ES (по умолчанию: 'esnext')
    sourcemap: true, // Source maps (по умолчанию: true)
    minify: false, // Минификация (по умолчанию: false)
    emptyOutDir: true, // Очистка выходной директории (по умолчанию: true)
  },
  server: {
    port: 3000, // Порт сервера разработки (по умолчанию: 3000)
    strictPort: true, // Строгий порт (по умолчанию: true)
    host: true, // Хост (по умолчанию: true)
  },
  plugins: [], // Дополнительные плагины Vite
});
```

### Настройки по умолчанию

```typescript
const defaultConfig = {
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
```

## 🖖 Vue конфигурация

Vue конфигурация расширяет базовую конфигурацию, добавляя поддержку Vue.js:

- ✅ Поддержка Vue 3
- ✅ Поддержка JSX/TSX с настраиваемыми опциями
- ✅ Все настройки базовой конфигурации
- ✅ Автоматическая настройка внешних зависимостей

### Использование Vue конфигурации

```typescript
// vite.config.ts
import {
  defineBaseConfig,
  defineVueConfig,
  createConfig,
} from '@yclients-configs/vite';

export default await createConfig(
  defineBaseConfig(),
  defineVueConfig({
    // Опции для Vue плагина
    vueOptions: {
      template: {
        compilerOptions: {
          // Настройки компилятора Vue
        },
      },
    },
    // Опции для JSX плагина
    jsxOptions: {
      // Настройки @vitejs/plugin-vue-jsx
      optimize: true,
    },
  }),
);
```

### Типизация Vue конфигурации

```typescript
import type { Options as VueOptions } from '@vitejs/plugin-vue';
import type { Options as JsxOptions } from '@vitejs/plugin-vue-jsx';

interface VueConfigOptions {
  vueOptions?: VueOptions;
  jsxOptions?: JsxOptions;
}
```

## 🎯 Пресеты

### definePluginConfig

Пресет для создания конфигурации плагинов с предустановленными настройками:

- ✅ Настройка библиотеки с форматом ES
- ✅ Автоматическое добавление manifestPlugin
- ✅ Настройка имен файлов с хэшами для кэширования
- ✅ Настройка алиасов для утилит YCLIENTS

Пресет принимает только параметры типа `PluginPresetOptions` и не позволяет переопределять настройки сборки.

#### Использование пресета

```typescript
// vite.config.ts
import { definePluginConfig } from '@yclients-configs/vite/presets';

export default definePluginConfig({
  pluginName: 'my-plugin',
});
```

#### Опции пресета

```typescript
interface PluginPresetOptions {
  /**
   * Название плагина, используемое для именования выходных файлов
   * и идентификации в системе сборки
   */
  pluginName: string;
}
```

## 🛠️ Утилиты

### createConfig

Утилита для объединения нескольких конфигураций Vite в одну. Поддерживает как синхронные, так и асинхронные конфигурации. Возвращает Promise, поэтому требует использования `await`.

#### Синхронное использование

```typescript
import { createConfig, defineBaseConfig } from '@yclients-configs/vite';

export default await createConfig(
  defineBaseConfig(),
  // Дополнительные конфигурации
  {
    server: {
      port: 3000,
    },
  },
  {
    build: {
      rollupOptions: {
        external: ['lodash'],
      },
    },
  },
);
```

#### Асинхронное использование

```typescript
import { createConfig, defineBaseConfig } from '@yclients-configs/vite';

export default await createConfig(
  defineBaseConfig(),
  // Асинхронные конфигурации
  async () => {
    const env = await loadEnv();
    return {
      define: {
        __APP_ENV__: JSON.stringify(env),
      },
    };
  },
  async () => {
    const pkg = await import('../package.json');
    return {
      define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
      },
    };
  },
);
```

## 📚 Примеры использования

### Пример 1: Простой веб-приложение

```typescript
// vite.config.ts
import { defineBaseConfig } from '@yclients-configs/vite';

export default defineBaseConfig({
  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components',
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
});
```

### Пример 2: Vue компонент библиотека

```typescript
// vite.config.ts
import {
  defineBaseConfig,
  defineVueConfig,
  createConfig,
} from '@yclients-configs/vite';

export default await createConfig(
  defineBaseConfig({
    build: {
      outDir: 'build',
      sourcemap: true,
    },
  }),
  defineVueConfig({
    vueOptions: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('wc-'),
        },
      },
    },
  }),
);
```

### Пример 3: Плагин с манифестом

```typescript
// vite.config.ts
import { definePluginConfig } from '@yclients-configs/vite/presets';

export default definePluginConfig({
  pluginName: 'color-picker',
});
```

### Пример 4: Сложная конфигурация с условиями

```typescript
// vite.config.ts
import {
  createConfig,
  defineBaseConfig,
  defineVueConfig,
} from '@yclients-configs/vite';

export default await createConfig(
  defineBaseConfig(),
  defineVueConfig(),
  // Условная конфигурация для разработки
  process.env.NODE_ENV === 'development' && {
    server: {
      port: 3001,
      open: true,
    },
  },
  // Условная конфигурация для продакшена
  process.env.NODE_ENV === 'production' && {
    build: {
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
          },
        },
      },
    },
  },
);
```

## ⚠️ Требования

- **Node.js**: >= 16
- **Vite**: >= 5.0.0
- **Для Vue конфигурации**: Vue >= 3.0.0

## 🔗 Связанные пакеты

- `@vitejs/plugin-vue` - Плагин для Vue 3
- `@vitejs/plugin-vue-jsx` - Плагин для Vue JSX
- `vite` - Основной пакет Vite

## 🤝 Вклад в проект

Если вы нашли ошибку или хотите предложить улучшение, создайте issue в репозитории проекта.
