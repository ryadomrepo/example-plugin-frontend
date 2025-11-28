# DocumentEventEmitter

Класс для работы с событиями документа. Реализует интерфейс `IDocumentEventEmitter` и добавляет обработку событий на уровне `document`.

## Основные возможности

- Подписка на события документа
- Отправка событий на уровне документа
- Типизированная работа с событиями
- Автоматическая очистка слушателей

## API Reference

### Методы

#### `onDocument(eventName, listener)`

Подписка на событие документа.

```typescript
onDocument<T>(eventName: string, listener: CustomEventListener<T>): void
```

#### `offDocument(eventName, listener)`

Отписка от события документа.

```typescript
offDocument<T>(eventName: string, listener: CustomEventListener<T>): void
```

#### `emit(eventName, detail)`

Отправка события на уровне документа.

```typescript
emit(eventName: string, detail?: T): void
```

#### `removeAllListeners(eventName?)`

Удаление всех слушателей для указанного события или всех событий.

```typescript
removeAllListeners(eventName?: string): void
```

**Параметры:**

- `eventName` (опционально) - имя события. Если не указано, удаляет все слушатели для всех событий.

**Примеры:**

```typescript
// Удалить все слушатели для конкретного события
emitter.removeAllListeners('user-login');

// Удалить все слушатели для всех событий
emitter.removeAllListeners();
```

## Примеры использования

### Базовое использование

```typescript
import { DocumentEventEmitter } from '@yclients-plugins/utils';

const emitter = new DocumentEventEmitter<string>();

// Подписка на событие
emitter.onDocument('user-login', (event) => {
  console.log('User logged in:', event.detail);
});

// Отправка события
emitter.emit('user-login', 'john.doe@example.com');
```

### Использование с интерфейсами

```typescript
import { DocumentEventEmitter } from '@yclients-plugins/utils';

interface UserData {
  id: number;
  name: string;
  email: string;
}

const emitter = new DocumentEventEmitter<UserData>();

// Подписка на событие
emitter.onDocument('user-update', (event) => {
  console.log('User updated:', event.detail.name);
});

// Отправка события
emitter.emit('user-update', {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
});
```

### Использование в плагинах

```typescript
import { DocumentEventEmitter } from '@yclients-plugins/utils';

interface PluginEvent {
  type: 'ready' | 'update';
  payload: any;
}

class MyPlugin {
  private eventEmitter = new DocumentEventEmitter<PluginEvent>();

  init() {
    // Подписка на события хоста
    this.eventEmitter.onDocument('host-ready', (event) => {
      console.log('Host is ready:', event.detail);
    });

    // Отправка события готовности плагина
    this.eventEmitter.emit('plugin-ready', {
      type: 'ready',
      payload: { status: 'initialized' },
    });
  }
}
```

### Использование с универсальным типом TPluginEvent

```typescript
import { DocumentEventEmitter, TPluginEvent } from '@yclients-plugins/utils';

interface UserEvent {
  id: number;
  name: string;
}

const emitter = new DocumentEventEmitter<TPluginEvent<UserEvent>>();

// Подписка на событие
emitter.onDocument('user:created', (event) => {
  console.log('User created:', event.detail.payload.name);
  console.log('Container ID:', event.detail.containerId);
  console.log('Area:', event.detail.area);
});

// Отправка события
emitter.emit('user:created', {
  area: 'my-plugin-area',
  containerId: 'container-123',
  payload: {
    id: 1,
    name: 'John Doe',
  },
});
```

### Использование глобального DocumentEventEmitter

```typescript
import { documentEventEmitter } from '@yclients-plugins/utils';

// Подписка на глобальное событие документа
documentEventEmitter.onDocument('app:initialized', (event) => {
  console.log('Application initialized:', event.detail);
});

// Вызов глобального события документа
documentEventEmitter.emit('app:initialized', { version: '1.0.0' });

// Удаление всех слушателей для конкретного события
documentEventEmitter.removeAllListeners('app:initialized');

// Удаление всех слушателей для всех событий
documentEventEmitter.removeAllListeners();
```

## Экспорты

### Основные экспорты

```typescript
import { DocumentEventEmitter } from '@yclients-plugins/utils';
```

### Глобальный синглтон

```typescript
import { documentEventEmitter } from '@yclients-plugins/utils';
```

### Типы

```typescript
import type { CustomEventListener } from '@yclients-plugins/utils';
```
