# YCLIENTS Plugins Utils

Пакет предоставляет систему событий и коммуникации между хост-приложением и плагинами, а также между самими плагинами.

## Основные возможности

- **Система событий** - управление локальными и DOM событиями с полной типизацией
- **Коммуникация с хостом** - стандартизированное взаимодействие с хост-приложением
- **Коммуникация между плагинами** - возможность взаимодействия между разными плагинами через систему событий
- **Типобезопасность** - полная поддержка TypeScript с дженериками
- **Изоляция плагинов** - предотвращение конфликтов имен событий между плагинами

## Быстрый старт

```typescript
import {
  createHostEventNames,
  createPluginEventNames,
  DocumentEventEmitter,
  EventEmitter,
} from '@yclients-plugins/utils';

// Создание имен событий для плагина
const HOST_EVENT_NAMES = createHostEventNames('my-plugin-area');
const PLUGIN_EVENT_NAMES = createPluginEventNames('my-plugin-area');

// Работа с событиями
const emitter = new DocumentEventEmitter();
emitter.onDocument(HOST_EVENT_NAMES.READY, (event) => {
  console.log('Хост готов:', event.detail);
});

// Коммуникация между плагинами
const OTHER_PLUGIN_EVENTS = createPluginEventNames('other-plugin-area');
emitter.onDocument(OTHER_PLUGIN_EVENTS.READY, (event) => {
  console.log('Другой плагин готов:', event.detail);
});
```

## Документация

Подробная документация по структуре и использованию утилит доступна в директории [docs](./docs/):

- **[Система событий](./docs/events-system.md)** - обзор архитектуры событий и основных компонентов
- **[EventEmitter - базовый класс событий](./docs/event-emitter.md)** - локальные события без зависимости от DOM
- **[DocumentEventEmitter - события документа](./docs/document-event-emitter.md)** - работа с DOM событиями
- **[Коммуникация плагинов](./docs/host-plugin-events.md)** - взаимодействие с хост-приложением и между плагинами

## Экспортируемые компоненты

### Функции

- `createHostEventNames(area: string)` - создание имен событий хоста
- `createPluginEventNames(area: string)` - создание имен событий плагина

### Классы

- `EventEmitter<T>` - базовый класс для локальных событий
- `DocumentEventEmitter<T>` - класс для работы с DOM событиями

### Типы

- `TPluginEvent<T>` - универсальный тип для событий плагинов
- `THostEventNames` - тип для имен событий хоста
- `TPluginEventNames` - тип для имен событий плагина
- `EventListener<T` - базовый тип для обработчиков (не зависит от DOM)
- `CustomEventListener<T>` - тип для обработчиков DOM событий

## Принципы использования

1. **Изоляция плагинов** - каждый плагин использует уникальную область (`area`)
2. **Коммуникация между плагинами** - плагины могут взаимодействовать через систему событий
3. **Типобезопасность** - все события полностью типизированы
4. **Универсальность** - единый тип `TPluginEvent<T>` для всех событий
5. **Простота** - четкое разделение ответственности между компонентами

## Примеры использования

См. [документацию по системе событий](./docs/events-system.md) для подробных примеров и лучших практик.
