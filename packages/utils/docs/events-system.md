# Система событий

Система событий предоставляет набор утилит для управления событиями в плагинах YCLIENTS. Она состоит из двух основных компонентов: `EventEmitter` и `DocumentEventEmitter`.

## Архитектура

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                    Система событий                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐                           ┌─────────────────────────────────────────────────────┐  │
│  │           EventEmitter              │                           │              DocumentEventEmitter                   │  │
│  │                                     │                           │                                                     │  │
│  │ - Локальные события                 │                           │ - События document                                  │  │
│  │ - Типизация с дженериками           │                           │ - Типизация с дженериками                           │  │
│  │ - Map<string, Set<EventListener>>   │                           │ - Интерфейс IDocumentEventEmitter                   │  │
│  │ - Интерфейс IEventEmitter           │                           │ - DOM API CustomEvent                               │  │
│  │ - Синглтон eventEmitter             │                           │ - Type guard для CustomEvent                        │  │
│  │ - Методы: on(), off(), emit()       │                           │ - Синглтон documentEventEmitter                     │  │
│  │ - Не зависит от DOM API             │                           │ - Методы: onDocument(), offDocument(), emit(), removeAllListeners()       │  │
│  └─────────────────────────────────────┘                           └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐                           ┌─────────────────────────────────────────────────────┐  │
│  │            Интерфейсы               │                           │                      Типы                           │  │
│  │                                     │                           │                                                     │  │
│  │ IEventEmitter<T>                    │                           │ EventListener<T> - базовый тип обработчиков         │  │
│  │ - on(eventName, listener)           │                           │ CustomEventListener<T> - тип для DOM обработчиков   │  │
│  │ - off(eventName, listener)          │                           │ - Полная типизация с TypeScript                     │  │
│  │ - emit(eventName, detail?)          │                           │ - Поддержка дженериков для типобезопасности         │  │
│  │                                     │                           │ - Совместимость с DOM CustomEvent API               │  │
│  │ IDocumentEventEmitter<T>            │                           │                                                     │  │
│  │ - onDocument(eventName, listener)   │                           │                                                     │  │
│  │ - offDocument(eventName, listener)  │                           │                                                     │  │
│  │ - emit(eventName, detail?)          │                           │                                                     │  │
│  └─────────────────────────────────────┘                           └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

### Ключевые компоненты

#### EventEmitter

- **Реализация**: `IEventEmitter<T>` интерфейс с полной типизацией
- **Хранилище**: `Map<string, Set<EventListener<T>>>` для эффективного управления обработчиками
- **Методы**: `on()`, `off()`, `emit()` с поддержкой дженериков
- **Особенности**: Не зависит от DOM API, легковесная реализация
- **Синглтон**: `eventEmitter` для глобального использования
- **Память**: Автоматическое управление памятью через Set

#### DocumentEventEmitter

- **Реализация**: `IDocumentEventEmitter<T>` интерфейс с DOM интеграцией
- **Хранилище**: `Map<string, Set<CustomEventListener<unknown>>>` с type guard
- **Методы**: `onDocument()`, `offDocument()`, `emit()` с автоматическим управлением слушателями
- **Особенности**: Работает через DOM CustomEvent API с type guard для безопасности
- **Синглтон**: `documentEventEmitter` для глобального использования
- **Память**: Автоматическое управление памятью через Set
- **Безопасность**: Type guard `isCustomEvent()` для проверки типов событий

#### Типы

- **`EventListener<T>`**: Базовый тип для обработчиков (не зависит от DOM)
- **`CustomEventListener<T>`**: Тип для обработчиков DOM событий с поддержкой CustomEvent
- **`IEventEmitter<T>`**: Интерфейс для базового EventEmitter с дженериками
- **`IDocumentEventEmitter<T>`**: Интерфейс для DOM EventEmitter с методами onDocument/offDocument

## Директория `events`

Набор утилит для управления событиями в плагинах YCLIENTS.

### Файлы

#### `EventEmitter.ts`

- `EventEmitter<T>` - базовый класс для управления локальными событиями
- `default` - синглтон EventEmitter для глобальной обработки событий
- Реализует паттерн Наблюдатель (Observer) с полной поддержкой TypeScript
- Методы: `on()`, `off()`, `emit()`

#### `DocumentEventEmitter.ts`

- `DocumentEventEmitter<T>` - класс для работы с событиями document
- `default` - синглтон DocumentEventEmitter для глобальной обработки событий документа
- Работа с событиями на уровне document
- Методы: `emit()`, `onDocument()`, `offDocument()`

#### `types.ts`

- `CustomEventListener<T>` - тип для обработчиков событий
- Типизация для обеспечения безопасности типов при работе с событиями

#### `index.ts`

- Экспорт всех классов и типов из модуля
- Экспорт синглтонов для глобального использования
- Единая точка входа для импорта системы событий

## Подробное описание компонентов

### EventEmitter - базовый класс

Базовый класс для управления локальными событиями. Реализует паттерн Наблюдатель (Observer).

**Основные возможности:**

- Подписка и отписка от событий с полной типизацией
- Типизированная отправка событий через дженерики
- Эффективное управление обработчиками событий через Set
- Поддержка асинхронных обработчиков
- Автоматическое управление памятью
- Легковесная реализация без зависимости от DOM API

**Подробнее:** [EventEmitter - базовый класс событий](./event-emitter.md)

### DocumentEventEmitter - DOM события

Реализует интерфейс `IDocumentEventEmitter` и предоставляет возможность работы с событиями на уровне `document`.

**Основные возможности:**

- Работа с событиями `document` через DOM CustomEvent API
- Типизированная работа с событиями через дженерики
- Глобальная коммуникация между компонентами
- Type guard `isCustomEvent()` для проверки типов событий
- Безопасное приведение типов для runtime совместимости
- Обработка как CustomEvent, так и обычных Event
- Управление памятью с помощью `removeAllListeners()`

**Подробнее:** [DocumentEventEmitter - события документа](./document-event-emitter.md)

## Принципы работы

### 1. Типизация

Все события полностью типизированы с помощью TypeScript:

```typescript
interface UserEvent {
  id: number;
  name: string;
}

const emitter = new DocumentEventEmitter<TPluginEvent<UserEvent>>();

// TypeScript проверяет тип данных
emitter.emit('user:created', {
  area: 'my-plugin-area',
  containerId: 'container-123',
  payload: {
    id: 1,
    name: 'John',
  },
}); // ✅ OK

emitter.emit('user:created', {
  area: 'my-plugin-area',
  containerId: 'container-123',
  payload: {
    id: '1', // ❌ Error: Type 'string' is not assignable to type 'number'
    name: 'John',
  },
});
```

### 2. Именование событий

Рекомендуется использовать префиксы для группировки связанных событий:

```typescript
// ✅ Хорошо
'user:created';
'user:updated';
'user:deleted';
'app:initialized';
'plugin:ready';

// ❌ Плохо
'event1';
'data';
'update';
```

### 3. Управление памятью

Важно правильно отписываться от событий для предотвращения утечек памяти:

```typescript
// Для EventEmitter
const listener = (detail) => console.log(detail);
emitter.on('event', listener);
emitter.off('event', listener);

// Для DocumentEventEmitter
const documentListener = (event) => console.log(event.detail);
emitter.onDocument('event', documentListener);
emitter.offDocument('event', documentListener);

// Удаление всех слушателей для конкретного события
emitter.removeAllListeners('event');

// Удаление всех слушателей для всех событий
emitter.removeAllListeners();
```

## Сценарии использования

### 1. Локальная коммуникация

Используйте `EventEmitter` для событий внутри одного компонента:

```typescript
const localEmitter = new EventEmitter<string>();

localEmitter.on('status-changed', (detail) => {
  console.log('Status:', detail);
});

localEmitter.emit('status-changed', 'ready');
```

### 2. Глобальная коммуникация

Используйте `DocumentEventEmitter` для событий между разными компонентами:

```typescript
const globalEmitter = new DocumentEventEmitter<UserEvent>();

// В одном компоненте
globalEmitter.onDocument('user:created', (event) => {
  console.log('User created:', event.detail.name);
});

// В другом компоненте
globalEmitter.emit('user:created', { id: 1, name: 'John' });
```

### 3. Коммуникация плагинов

Используйте `DocumentEventEmitter` для коммуникации между плагинами и хост-приложением:

```typescript
import { createHostEventNames, createPluginEventNames } from '../core';

const HOST_EVENT_NAMES = createHostEventNames('my-plugin-area');
const PLUGIN_EVENT_NAMES = createPluginEventNames('my-plugin-area');

const emitter = new DocumentEventEmitter<TPluginEvent<any>>();

// Подписка на события хоста
emitter.onDocument(HOST_EVENT_NAMES.READY, (event) => {
  console.log('Host is ready:', event.detail);
});

// Отправка событий плагина
emitter.emit(PLUGIN_EVENT_NAMES.READY, {
  area: 'my-plugin-area',
  containerId: 'container-123',
  payload: { version: '1.0.0' },
});
```

## Лучшие практики

### 1. Выбор правильного эмиттера

- **EventEmitter**: для локальных событий внутри компонента
- **DocumentEventEmitter**: для глобальных событий между компонентами

### 2. Типизация

- Всегда определяйте типы для данных событий
- Используйте интерфейсы для сложных объектов
- Используйте union типы для перечислений
- Используйте универсальный тип `TPluginEvent<T>` для всех событий

### 3. Обработка ошибок

```typescript
// Для EventEmitter
emitter.on('error', (detail) => {
  try {
    // Обработка события
    console.error('Error:', detail);
  } catch (error) {
    console.error('Error in event handler:', error);
  }
});

// Для DocumentEventEmitter
emitter.onDocument('error', (event) => {
  try {
    // Обработка события
    console.error('Error:', event.detail);
  } catch (error) {
    console.error('Error in event handler:', error);
  }
});
```

### 4. Асинхронные обработчики

```typescript
// Для EventEmitter
emitter.on('fetch-data', async (detail) => {
  try {
    const data = await fetchData(detail.id);
    console.log('Data received:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// Для DocumentEventEmitter
emitter.onDocument('fetch-data', async (event) => {
  try {
    const data = await fetchData(event.detail.payload.id);
    console.log('Data received:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
```

## Универсальный тип событий

Система использует единый универсальный тип `TPluginEvent<T>` для всех событий, что:

- Устраняет дублирование кода
- Упрощает поддержку и изменения
- Сохраняет полную типобезопасность
- Позволяет легко создавать семантические алиасы

```typescript
// Универсальный тип для всех событий
type TPluginEvent<T> = {
  area: string;
  containerId: string;
  payload: T;
};

// Семантические алиасы для ясности кода
type THostReadyEvent = TPluginEvent<THostReadyPayload>;
type TPluginReadyEvent = TPluginEvent<TPluginReadyPayload>;
```

## Связанная документация

- [EventEmitter - базовый класс событий](./event-emitter.md) - подробная документация по EventEmitter
- [DocumentEventEmitter - события документа](./document-event-emitter.md) - подробная документация по DocumentEventEmitter
