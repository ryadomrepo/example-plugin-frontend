# Эмиттер событий для плагина timetable-record-client-name

## Обзор

Эмиттер событий (`PluginEventEmitter`) объединяет все типы событий плагина в один эмиттер с полной типизацией:

- **События от хоста к плагину** (`THostReadyEvent`, `THostUpdateEvent`, `THostShutdownEvent`)
- **События от плагина к хосту** (`TPluginReadyEvent`, `TPluginUpdateEvent`, `TPluginShutdownEvent`)

## Архитектура

Система эмиттера событий построена по принципам SOLID с разделением ответственностей:

### Структура компонентов

```text
src/emitters/
├── index.ts                           # Экспорт всех компонентов
├── plugin-event-emitter.ts            # Основной эмиттер событий
├── core/
│   └── event-manager.ts              # Базовый менеджер событий
├── validators/
│   └── event-validator.ts            # Валидатор событий
├── config/
│   └── event-config.ts               # Конфигурация событий
├── loggers/
│   └── event-logger.ts               # Логгер событий
├── types/
│   ├── event-types.ts                # Общие типы событий
│   └── plugin-areas.ts               # Типы областей плагина
└── docs/
    └── PLUGIN_EVENT_EMITTER.md       # Основная документация
```

### Компоненты системы

#### 1. EventValidator (`validators/event-validator.ts`)

**Ответственность**: Валидация данных и областей плагина

```typescript
export class EventValidator {
  static validateArea(area: string): area is TPluginArea;
  static validatePayload(payload: unknown): boolean;
  static getSupportedAreas(): readonly TPluginArea[];
  static isAreaSupported(area: string): area is TPluginArea;
}
```

#### 2. EventConfig (`config/event-config.ts`)

**Ответственность**: Управление конфигурацией имен событий

```typescript
export class EventConfig {
  static getHostEventNames(area: string): THostEventNames | undefined;
  static getPluginEventNames(area: string): TPluginEventNames | undefined;
  static getSupportedAreas(): readonly TPluginArea[];
}
```

#### 3. EventLogger (`loggers/event-logger.ts`)

**Ответственность**: Логирование всех операций с событиями

```typescript
export class EventLogger {
  static logSubscription(direction, eventType, area);
  static logUnsubscription(direction, eventType, area);
  static logEmission(direction, eventType, area, payload);
  static logCleanupStart();
  static logCleanupComplete();
  static logAreaValidationError(area);
  static logPayloadValidationError(payload);
}
```

#### 4. EventManager (`core/event-manager.ts`)

**Ответственность**: Базовая логика управления событиями

```typescript
export abstract class EventManager {
  protected subscribe<T>(direction, eventType, area, listener);
  protected unsubscribe<T>(direction, eventType, area, listener);
  protected emitEvent<T>(direction, eventType, area, payload);
  getSupportedAreas(): readonly TPluginArea[];
  isAreaSupported(area: string): area is TPluginArea;
  getHostEventNames(area: string);
  getPluginEventNames(area: string);
  abstract cleanup(): void;
}
```

#### 5. PluginEventEmitter (`plugin-event-emitter.ts`)

**Ответственность**: Специфичные методы для конкретного плагина

```typescript
export class PluginEventEmitter extends EventManager {
  // Методы для событий хоста
  onHostReady(area, listener);
  offHostReady(area, listener);
  emitHostReady(area, payload);
  onHostUpdate(area, listener);
  offHostUpdate(area, listener);
  emitHostUpdate(area, payload);
  onHostShutdown(area, listener);
  offHostShutdown(area, listener);
  emitHostShutdown(area, payload);

  // Методы для событий плагина
  onPluginReady(area, listener);
  offPluginReady(area, listener);
  emitPluginReady(area, payload);
  onPluginUpdate(area, listener);
  offPluginUpdate(area, listener);
  emitPluginUpdate(area, payload);
  onPluginShutdown(area, listener);
  offPluginShutdown(area, listener);
  emitPluginShutdown(area, payload);

  cleanup(): void;
}
```

## API

### Основные методы

#### `onHostReady(area: TPluginArea, listener: CustomEventListener<THostReadyEvent>): void`

Подписка на события готовности хоста для указанной области.

```typescript
pluginEventEmitter.onHostReady('erp-timetable-controls', (event) => {
  console.log('Хост готов:', event.detail);
});
```

#### `offHostReady(area: TPluginArea, listener: CustomEventListener<THostReadyEvent>): void`

Отписка от событий готовности хоста.

```typescript
pluginEventEmitter.offHostReady('erp-timetable-controls', listener);
```

#### `emitHostReady(area: TPluginArea, payload: THostReadyEvent): void`

Отправка события готовности хоста.

```typescript
pluginEventEmitter.emitHostReady('erp-timetable-controls', {
  area: 'erp-timetable-controls',
  containerId: 'container-1',
  payload: {
    clientName: 'John',
    clientSurname: 'Doe',
    clientPatronymic: 'Jhozef',
  },
});
```

#### `emitPluginReady(area: TPluginArea, payload: TPluginReadyEvent): void`

Отправка события готовности плагина.

```typescript
pluginEventEmitter.emitPluginReady('erp-timetable-controls', {
  area: 'erp-timetable-controls',
  containerId: 'container-1',
  payload: null,
});
```

#### `emitPluginUpdate(area: TPluginArea, payload: TPluginUpdateEvent): void`

Отправка события обновления плагина.

```typescript
pluginEventEmitter.emitPluginUpdate('erp-timetable-controls', {
  area: 'erp-timetable-controls',
  containerId: 'container-1',
  payload: { isVisible: true },
});
```

#### `onPluginUpdate(area: TPluginArea, listener: CustomEventListener<TPluginUpdateEvent>): void`

Подписка на события обновления плагина.

```typescript
pluginEventEmitter.onPluginUpdate('erp-timetable-controls', (event) => {
  console.log('Плагин обновлен:', event.detail);
});
```

#### `offPluginUpdate(area: TPluginArea, listener: CustomEventListener<TPluginUpdateEvent>): void`

Отписка от событий обновления плагина.

```typescript
pluginEventEmitter.offPluginUpdate('erp-timetable-controls', listener);
```

### Вспомогательные методы

#### `getSupportedAreas(): readonly TPluginArea[]`

Получение всех поддерживаемых областей плагина.

```typescript
const areas = pluginEventEmitter.getSupportedAreas();
console.log('Поддерживаемые области:', areas);
// ['erp-timetable-controls', 'erp-timetable-record-client-name']
```

#### `isAreaSupported(area: string): area is TPluginArea`

Проверка поддержки области плагином.

```typescript
const isSupported = pluginEventEmitter.isAreaSupported(
  'erp-timetable-controls',
);
console.log('Область поддерживается:', isSupported); // true
```

#### `getHostEventNames(area: string): THostEventNames | undefined`

Получение имен событий хоста для указанной области.

```typescript
const hostEventNames = pluginEventEmitter.getHostEventNames(
  'erp-timetable-controls',
);
console.log('Имена событий хоста:', hostEventNames);
// { READY: 'host:erp-timetable-controls:ready', ... }
```

#### `getPluginEventNames(area: string): TPluginEventNames | undefined`

Получение имен событий плагина для указанной области.

```typescript
const pluginEventNames = pluginEventEmitter.getPluginEventNames(
  'erp-timetable-controls',
);
console.log('Имена событий плагина:', pluginEventNames);
// { READY: 'plugin:erp-timetable-controls:ready', ... }
```

#### `cleanup(): void`

Очистка всех подписок. Используется при уничтожении плагина.

```typescript
pluginEventEmitter.cleanup();
```

## Использование

### Базовое использование

```typescript
import { pluginEventEmitter } from './emitters';

// Инициализация плагина
function initializePlugin() {
  const supportedAreas = pluginEventEmitter.getSupportedAreas();

  // Подписываемся на события готовности хоста для всех областей
  supportedAreas.forEach((area) => {
    pluginEventEmitter.onHostReady(area, (event) => {
      console.log(`Хост готов для области ${area}:`, event.detail);
      handleHostReady(event);
    });
  });

  // Подписываемся на события обновления плагина
  supportedAreas.forEach((area) => {
    pluginEventEmitter.onPluginUpdate(area, (event) => {
      console.log(`Плагин обновлен для области ${area}:`, event.detail);
      handlePluginUpdate(event);
    });
  });
}

// Обработка события готовности хоста
function handleHostReady(event) {
  const { containerId, payload, area } = event.detail;

  // Проверяем поддержку области
  if (!pluginEventEmitter.isAreaSupported(area)) {
    console.warn(`Область ${area} не поддерживается`);
    return;
  }

  // Обрабатываем данные
  processClientData(payload);

  // Отправляем событие готовности плагина
  pluginEventEmitter.emitPluginReady(area, {
    area,
    containerId,
    payload: null,
  });
}

// Обработка события обновления плагина
function handlePluginUpdate(event) {
  const { area, containerId, payload } = event.detail;

  if (payload.isVisible) {
    showPlugin(containerId);
  } else {
    hidePlugin(containerId);
  }
}

// Очистка при уничтожении
function cleanup() {
  pluginEventEmitter.cleanup();
}
```

### Использование отдельных компонентов

После рефакторинга можно использовать отдельные компоненты системы:

```typescript
import {
  pluginEventEmitter,
  EventValidator,
  EventLogger,
  EventConfig,
} from './emitters';

// Использование валидатора
if (EventValidator.isAreaSupported('erp-timetable-controls')) {
  const eventNames = EventConfig.getHostEventNames('erp-timetable-controls');
  EventLogger.logSubscription('host', 'READY', 'erp-timetable-controls');
}

// Основное использование остается тем же
pluginEventEmitter.onHostReady('erp-timetable-controls', listener);
pluginEventEmitter.emitPluginReady('erp-timetable-controls', payload);
```

## Типы событий

### THostReadyEvent

Событие готовности хоста с данными клиента.

```typescript
type THostReadyEvent = {
  area: string;
  containerId: string;
  payload: {
    clientName: string;
    clientSurname: string;
    clientPatronymic: string;
  };
};
```

### TPluginReadyEvent

Событие готовности плагина.

```typescript
type TPluginReadyEvent = {
  area: string;
  containerId: string;
  payload: null;
};
```

### TPluginUpdateEvent

Событие обновления плагина.

```typescript
type TPluginUpdateEvent = {
  area: string;
  containerId: string;
  payload: {
    isVisible: boolean;
  };
};
```

### TPluginArea

Тип области плагина, основанный на данных из contract.json.

```typescript
type TPluginArea =
  | 'erp-timetable-controls'
  | 'erp-timetable-record-client-name';
```

## Примеры

### Полный пример использования

```typescript
import { pluginEventEmitter } from './emitters';

class PluginManager {
  constructor() {
    this.initialize();
  }

  initialize() {
    // Подписываемся на события готовности хоста
    pluginEventEmitter.getSupportedAreas().forEach((area) => {
      pluginEventEmitter.onHostReady(area, this.handleHostReady.bind(this));
    });

    // Подписываемся на события обновления плагина
    pluginEventEmitter.getSupportedAreas().forEach((area) => {
      pluginEventEmitter.onPluginUpdate(
        area,
        this.handlePluginUpdate.bind(this),
      );
    });
  }

  handleHostReady(event) {
    const { containerId, payload, area } = event.detail;

    // Проверяем поддержку области
    if (!pluginEventEmitter.isAreaSupported(area)) {
      console.warn(`Область ${area} не поддерживается`);
      return;
    }

    // Обрабатываем данные клиента
    this.processClientData(payload, containerId);

    // Отправляем событие готовности
    pluginEventEmitter.emitPluginReady(area, {
      area,
      containerId,
      payload: null,
    });
  }

  handlePluginUpdate(event) {
    const { area, containerId, payload } = event.detail;

    if (payload.isVisible) {
      this.showPlugin(containerId);
    } else {
      this.hidePlugin(containerId);
    }
  }

  destroy() {
    pluginEventEmitter.cleanup();
  }
}
```

### Тестирование

Каждый компонент теперь можно тестировать изолированно:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PluginEventEmitter } from './plugin-event-emitter';
import { EventValidator } from './validators/event-validator';
import { EventConfig } from './config/event-config';
import { EventLogger } from './loggers/event-logger';

describe('PluginEventEmitter', () => {
  let emitter: PluginEventEmitter;

  beforeEach(() => {
    emitter = new PluginEventEmitter();
  });

  it('должен поддерживать все области плагина', () => {
    const areas = emitter.getSupportedAreas();
    expect(areas).toEqual([
      'erp-timetable-controls',
      'erp-timetable-record-client-name',
    ]);
  });

  it('должен отправлять события готовности плагина', () => {
    const mockDispatchEvent = vi.fn();
    global.document.dispatchEvent = mockDispatchEvent;

    emitter.emitPluginReady('erp-timetable-controls', {
      area: 'erp-timetable-controls',
      containerId: 'container-1',
      payload: null,
    });

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'plugin:erp-timetable-controls:ready',
      }),
    );
  });
});

describe('EventValidator', () => {
  it('должен валидировать области', () => {
    expect(EventValidator.validateArea('erp-timetable-controls')).toBe(true);
    expect(EventValidator.validateArea('invalid-area')).toBe(false);
  });
});

describe('EventConfig', () => {
  it('должен возвращать имена событий', () => {
    const names = EventConfig.getHostEventNames('erp-timetable-controls');
    expect(names).toBeDefined();
  });
});

describe('EventLogger', () => {
  it('должен логировать события', () => {
    const spy = jest.spyOn(console, 'log');
    EventLogger.logSubscription('host', 'READY', 'erp-timetable-controls');
    expect(spy).toHaveBeenCalled();
  });
});
```

## Запуск тестов

```bash
# Запуск тестов для эмиттера событий
npm run test:unit ./src/emitters/plugin-event-emitter.test.ts

# Запуск тестов для отдельных компонентов
npm run test:unit ./src/emitters/validators/event-validator.test.ts
npm run test:unit ./src/emitters/config/event-config.test.ts
npm run test:unit ./src/emitters/loggers/event-logger.test.ts

# Запуск всех тестов
npm run test:unit
```
