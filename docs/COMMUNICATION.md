# Коммуникация между хост-приложением и плагином

## Основные понятия

### Что такое хост-приложение?

**Хост-приложение** - это основное веб-приложение, которое предоставляет платформу для работы плагинов. В контексте YCLIENTS это может быть:

- **ERP-система** - административная панель для управления бизнесом
- **Виджет-система** - публичная часть сайта, доступная клиентам
- **Другие веб-приложения** - любые системы, поддерживающие архитектуру плагинов

Хост-приложение отвечает за:

- Загрузку и инициализацию плагинов
- Предоставление API и данных для плагинов
- Управление жизненным циклом плагинов
- Обеспечение безопасности и изоляции

### Что такое плагины?

**Плагины** - это независимые модули, которые расширяют функциональность хост-приложения. В нашем случае это:

Пример: Плагин color-picker добавляет возможность настроить уникальную цветовую схему для журнала записи в ЕРП и цветов в виджете онлайн-записи. Он состоит из трех компонент:

- **color-picker-erp-settings** - приложение плагина для страницы настроек цветовой схемы ERP и виджета
- **color-picker-erp-timetable** - приложение плагина загружающееся на странице журнала записи и применяющее настройки цветов в нем
- **color-picker-widget** - приложение плагина загружающееся в виджете и применяющий настройки цветов в нем

Плагины:

- Встраиваются в хост-приложение как обычные JavaScript скрипты
- Имеют собственный жизненный цикл
- Могут взаимодействовать с хостом через стандартизированный API
- Могут быть загружены/выгружены динамически

### Архитектура взаимодействия

```text
┌─────────────────────┐    События    ┌─────────────────┐
│                     │◄─────────────►│                 │
│   Хост-приложение   │               │     Плагин      │
│                     │               │                 │
│  • Загружает        │               │  • Выполняет    │
│  • Инициализирует   │               │  • Отправляет   │
│  • Управляет        │               │  • Обрабатывает │
└─────────────────────┘               └─────────────────┘
```

## Обзор

Система коммуникации между хост-приложением и плагинами построена на основе стандартизированной архитектуры событий с использованием `DocumentEventEmitter`. Это обеспечивает надежную двустороннюю связь между компонентами системы.

## Архитектура коммуникации

### Основные компоненты

1. **DocumentEventEmitter** - основной класс для работы с событиями документа
2. **EventEmitter** - базовый класс для управления событиями
3. **Стандартизированные типы событий** - типизированные интерфейсы для обмена данными
4. **Контекст плагина** - система идентификации и контекста плагинов

### Принципы работы

Система использует паттерн "Наблюдатель" (Observer) для реализации асинхронной коммуникации между хостом и плагинами. Все события отправляются на уровне `document`, что обеспечивает глобальную доступность и изоляцию между разными плагинами.

## Схема работы

```text
Хост-приложение                    Плагин
     |                                |
     | 1. Инициализация хоста         |
     |                                |
     | 2. host:${PLUGIN_AREA}:ready     |
     |------------------------------->|
     |                                | 3. Инициализация плагина
     |                                |
     |                                | 4. Создание приложения
     |                                |
     |                                | 5. plugin:${PLUGIN_AREA}:ready
     |<-------------------------------|
     |                                |
     | 6. Готовность к взаимодействию |
```

Эта архитектура обеспечивает надежную, типизированную и масштабируемую систему коммуникации между хост-приложением и плагинами.

## Система событий

### Формат именования событий

События используют стандартизированный формат именования для избежания конфликтов:

- **События от хоста к плагину**: `host:${PLUGIN_AREA}:${eventName}`
- **События от плагина к хосту**: `plugin:${PLUGIN_AREA}:${eventName}`

Где:

- `PLUGIN_AREA` - одна из зон встраивания плагина из массива `areas` в `contract.json`
- `eventName` - название конкретного события

> **Важно:** Если в `areas` указано несколько зон, события должны быть сгенерированы для каждой зоны отдельно. Например, если `areas: ["root", "plugin-settings"]`, то события будут `host:root:ready` и `host:plugin-settings:ready`.

### Основные контракты системы

Система коммуникации основана на универсальном контракте, который определяет структуру всех событий:

#### TPluginEvent

Универсальный контракт для всех событий в системе плагинов:

```typescript
type TPluginEvent<T> = {
  area: string; // Идентификатор зоны, в которой произошло событие
  containerId: string; // ID контейнера для монтирования плагина
  payload: T; // Полезная нагрузка события
};
```

**Важно**: Частная реализация - это кастомный тип, который передается в дженерик базового контракта. Например:

- `TPluginEvent<THostReadyPayload>` - событие от хоста с полезной нагрузкой типа `THostReadyPayload`
- `TPluginEvent<TPluginReadyPayload>` - событие от плагина с полезной нагрузкой типа `TPluginReadyPayload`

### Текущие события

#### События от хоста к плагину

| Событие                     | Описание                                          | Контракт          | Частная реализация  |
| --------------------------- | ------------------------------------------------- | ----------------- | ------------------- |
| `host:${PLUGIN_AREA}:ready` | Сигнализирует о готовности хоста к взаимодействию | `TPluginEvent<T>` | `THostReadyPayload` |

#### События от плагина к хосту

| Событие                       | Описание                                 | Контракт          | Частная реализация    |
| ----------------------------- | ---------------------------------------- | ----------------- | --------------------- |
| `plugin:${PLUGIN_AREA}:ready` | Подтверждает готовность плагина к работе | `TPluginEvent<T>` | `TPluginReadyPayload` |

### Типы данных

```typescript
// === УНИВЕРСАЛЬНЫЙ КОНТРАКТ ===

// Универсальный тип для всех событий в системе плагинов
type TPluginEvent<T> = {
  area: string; // Идентификатор зоны, в которой произошло событие
  containerId: string; // ID контейнера для монтирования плагина
  payload: T; // Полезная нагрузка события
};

// === ЧАСТНЫЕ РЕАЛИЗАЦИИ ===
// (кастомные типы для передачи в дженерики базового контракта)

// Данные от хоста при готовности
type THostReadyPayload = {
  iframeUrl: string; // URL для инициализации iframe плагина
};

// Данные о готовности плагина (payload события plugin:...:ready)
type TPluginReadyPayload = {
  id: string; // Идентификатор плагина
};

// === ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ ===

// Полный тип события от хоста к плагину
type THostReadyEvent = TPluginEvent<THostReadyPayload>;

// Полный тип события от плагина к хосту
type TPluginReadyEvent = TPluginEvent<TPluginReadyPayload>;
```

## Жизненный цикл коммуникации

### 1. Инициализация хоста

```typescript
// Хост инициализирует систему событий
document.addEventListener(PLUGIN_EVENT_NAMES.READY, (data) => {
  console.log('[Host] Получено событие готовности плагина:', data);
});

// Отправка события готовности хоста
document.dispatchEvent(
  new CustomEvent(HOST_EVENT_NAMES.READY, {
    detail: {
      area: 'my-plugin-area',
      containerId: 'plugin-container-id',
      payload: {
        iframeUrl: 'https://example.com/iframe-url',
      },
    },
  }),
);
```

### 2. Инициализация плагина

```typescript
// Создание эмиттеров событий
const hostEventEmitter = new DocumentEventEmitter<THostReadyEvent>();
const pluginEventEmitter = new DocumentEventEmitter<TPluginReadyEvent>();

// Подписка на событие готовности хоста
hostEventEmitter.onDocument(HOST_EVENT_NAMES.READY, (event) => {
  const { area, containerId, payload } = event.detail;

  // Инициализация Vue приложения
  const app = createApp(App, { iframeUrl: payload.iframeUrl });

  // Настройка обработчика ошибок
  app.config.errorHandler = (err) => {
    console.error('[Plugin] Ошибка в Vue приложении:', err);
  };

  app.mount('#' + containerId);

  // Отправка события готовности плагина
  pluginEventEmitter.emit(PLUGIN_EVENT_NAMES.READY, {
    area: 'my-plugin-area',
    containerId: containerId,
    payload: { id: 'color-picker-plugin' },
  });
});
```

### 3. Обработка событий

Система автоматически обрабатывает события на уровне `document` и передает их соответствующим обработчикам через `DocumentEventEmitter`.

## Утилиты для работы с событиями

### DocumentEventEmitter

> **Примечание**: Детальное описание класса `DocumentEventEmitter` и его методов доступно в [отдельном документе](https://wiki.yandex.ru/rnd/product/platform/common-services/extensions-marketplace/7f08bde9f2a2/rukovodstvo-po-sozdaniju-frontend-plagina/09aedd3cde6c/documenteventemitter/).

Основной класс для работы с событиями документа:

```typescript
class DocumentEventEmitter<T = unknown> implements IDocumentEventEmitter<T> {
  // Отправка события на уровне document
  emit(eventName: string, detail?: T): void;

  // Подписка на событие документа
  onDocument<T>(eventName: string, listener: CustomEventListener<T>): void;

  // Отписка от события документа
  offDocument<T>(eventName: string, listener: CustomEventListener<T>): void;
}
```

### EventEmitter

> **Примечание**: Детальное описание класса `EventEmitter` и его методов доступно в [отдельном документе](https://wiki.yandex.ru/rnd/product/platform/common-services/extensions-marketplace/7f08bde9f2a2/rukovodstvo-po-sozdaniju-frontend-plagina/09aedd3cde6c/eventemitter/).

Базовый класс для управления событиями:

```typescript
class EventEmitter<T = unknown> {
  // Подписка на событие
  on(eventName: string, listener: CustomEventListener<T>): void;

  // Отправка события
  emit(eventName: string, detail?: T): void;

  // Отписка от события
  off(eventName: string, listener: CustomEventListener<T>): void;
}
```

### getPluginContext

Функция для получения контекста плагина с мемоизацией:

```typescript
// Получение контекста плагина
const context = { id: 'color-picker-plugin' };
// Возвращает: { id: "color-picker-plugin" }

// Функция использует мемоизацию для оптимизации производительности
// При первом вызове создает и сохраняет экземпляр контекста
// При последующих вызовах возвращает сохраненный экземпляр
```

## Примеры использования

### Создание типов событий

Для каждого нового события необходимо создать соответствующие типы:

```typescript
// types/events.ts
import type { TPluginEvent } from '@yclients-plugins/utils';

// Полезная нагрузка для события от хоста
export type THostUpdatePayload = {
  data: object;
  timestamp: number;
};

// Событие от хоста к плагину
export type THostUpdateEvent = TPluginEvent<THostUpdatePayload>;

// Полезная нагрузка для события от плагина
export type TPluginResponsePayload = {
  success: boolean;
  message: string;
};

// Событие от плагина к хосту
export type TPluginResponseEvent = TPluginEvent<TPluginResponsePayload>;
```

### Создание нового события

```typescript
// В events.ts
export const HOST_EVENT_NAMES = {
  READY: `host:${PLUGIN_AREA}:ready`,
  UPDATE: `host:${PLUGIN_AREA}:update`, // Новое событие
} as const;

export const PLUGIN_EVENT_NAMES = {
  READY: `plugin:${PLUGIN_AREA}:ready`,
  RESPONSE: `plugin:${PLUGIN_AREA}:response`, // Новое событие
} as const;
```

### Обработка нового события

```typescript
// В плагине
const handleHostUpdateEvent = (event: CustomEvent<THostUpdateEvent>) => {
  const { area, containerId, payload } = event.detail;
  // Обработка обновления

  // Отправка ответа хосту
  pluginEventEmitter.emit(PLUGIN_EVENT_NAMES.RESPONSE, {
    area: 'my-plugin-area',
    containerId: containerId,
    payload: {
      success: true,
      message: 'Update processed successfully',
    },
  });
};

hostEventEmitter.onDocument(HOST_EVENT_NAMES.UPDATE, handleHostUpdateEvent);
```

### **Связанные статьи**

- [DocumentEventEmitter](https://support.yclients.com/854)

- [EventEmitter](https://support.yclients.com/853)
