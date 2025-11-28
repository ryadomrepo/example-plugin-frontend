# EventEmitter

`EventEmitter` - это базовый класс для управления событиями, реализующий паттерн Наблюдатель (Observer).

## Основные возможности

- Подписки на события
- Отправки событий
- Управления обработчиками событий
- Типизации данных событий

## API Reference

### Методы

#### `on(eventName: string, listener: EventListener<T>): void`

Подписывает обработчик на указанное событие.

```typescript
emitter.on('event', (detail) => {
  console.log(detail);
});
```

#### `off(eventName: string, listener: EventListener<T>): void`

Отписывает обработчик от указанного события.

```typescript
const listener = (detail) => console.log(detail);
emitter.on('event', listener);
// ... использование ...
emitter.off('event', listener);
```

#### `emit(eventName: string, detail?: T): void`

Вызывает событие с указанными данными.

```typescript
emitter.emit('event', { data: 'value' });
```

## Примеры использования

### Базовое использование

```typescript
import { EventEmitter } from '@yclients-plugins/utils';

// Создание экземпляра с конкретным типом данных
interface ColorEvent {
  color: string;
  alpha?: number;
}

const colorEmitter = new EventEmitter<ColorEvent>();

// Подписка на событие
colorEmitter.on('color-changed', (detail) => {
  console.log('Color changed:', detail.color, 'Alpha:', detail.alpha);
});

// Вызов события
colorEmitter.emit('color-changed', { color: 'red', alpha: 0.5 }); // OK
colorEmitter.emit('color-changed', { color: 123 }); // Error: Type 'number' is not assignable to type 'string'

// Отписка от события
const listener = (detail: ColorEvent) => {
  console.log('Color changed:', detail.color);
};
colorEmitter.on('color-changed', listener);
colorEmitter.off('color-changed', listener);
```

### Расширенные примеры использования

#### 1. Использование с примитивными типами

```typescript
const numberEmitter = new EventEmitter<number>();

numberEmitter.on('count', (detail) => {
  console.log('Count:', detail);
});

numberEmitter.emit('count', 42); // OK
numberEmitter.emit('count', '42'); // Error: Type 'string' is not assignable to type 'number'
```

#### 2. Использование с union типами

```typescript
type StatusEvent = 'success' | 'error' | 'loading';
const statusEmitter = new EventEmitter<StatusEvent>();

statusEmitter.on('status', (detail) => {
  console.log('Status:', detail);
});

statusEmitter.emit('status', 'success'); // OK
statusEmitter.emit('status', 'pending'); // Error: Type '"pending"' is not assignable to type 'StatusEvent'
```

#### 3. Использование глобального EventEmitter

```typescript
import { eventEmitter } from '@yclients-plugins/utils';

// Подписка на глобальное событие
eventEmitter.on('app:initialized', (detail) => {
  console.log('Application initialized');
});

// Вызов глобального события
eventEmitter.emit('app:initialized');
```

#### 4. Асинхронная обработка событий

```typescript
const asyncEmitter = new EventEmitter<{ id: number }>();

// Асинхронный обработчик
asyncEmitter.on('fetch-data', async (detail) => {
  try {
    const data = await fetchData(detail.id);
    console.log('Data received:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// Вызов события
asyncEmitter.emit('fetch-data', { id: 1 });
```

#### 5. Работа с несколькими типами событий

```typescript
// Определение типов для разных событий
interface UserEvent {
  id: number;
  name: string;
}

interface SystemEvent {
  status: 'ready' | 'error';
  message: string;
}

// Создание эмиттеров для разных типов событий
const userEmitter = new EventEmitter<UserEvent>();
const systemEmitter = new EventEmitter<SystemEvent>();

// Подписка на разные события
userEmitter.on('user:created', (detail) => {
  console.log('User created:', detail.name);
});

systemEmitter.on('system:status', (detail) => {
  console.log('System status:', detail.status);
});

// Вызов событий
userEmitter.emit('user:created', { id: 1, name: 'John' });
systemEmitter.emit('system:status', {
  status: 'ready',
  message: 'System initialized',
});
```

#### 6. Обработка ошибок

```typescript
const errorEmitter = new EventEmitter<{ error: Error }>();

// Подписка на события с обработкой ошибок
errorEmitter.on('error', (detail) => {
  try {
    // Обработка события
    if (detail.error) {
      throw detail.error;
    }
  } catch (error) {
    console.error('Error in event handler:', error);
    // Дополнительная обработка ошибки
  }
});

// Вызов события с ошибкой
errorEmitter.emit('error', { error: new Error('Something went wrong') });
```

## Лучшие практики

### 1. Управление памятью

```typescript
class Component {
  private emitter = new EventEmitter<string>();
  private listener: EventListener<string>;

  constructor() {
    // Сохраняем ссылку на обработчик для последующей отписки
    this.listener = (detail) => this.handleEvent(detail);
    this.emitter.on('event', this.listener);
  }

  private handleEvent(detail: string) {
    console.log(detail);
  }

  destroy() {
    // Важно отписаться от событий при уничтожении компонента
    this.emitter.off('event', this.listener);
  }
}
```

### 2. Именование событий

```typescript
// Хорошие примеры именования событий
emitter.emit('user:created', { id: 1 });
emitter.emit('order:status-changed', { status: 'processing' });
emitter.emit('system:error', { code: 'E001' });

// Плохие примеры (избегайте)
emitter.emit('event1', { data: 'value' });
emitter.emit('update', { id: 1 });
```

### 3. Типизация данных

```typescript
// Используйте интерфейсы для сложных объектов
interface OrderEvent {
  id: number;
  status: 'pending' | 'processing' | 'completed';
  items: Array<{
    id: number;
    quantity: number;
  }>;
}

const orderEmitter = new EventEmitter<OrderEvent>();

// TypeScript будет проверять тип данных
orderEmitter.emit('order:updated', {
  id: 1,
  status: 'processing',
  items: [{ id: 1, quantity: 2 }],
});
```

## Экспорты

### Основные экспорты

```typescript
import { EventEmitter } from '@yclients-plugins/utils';
```

### Глобальный синглтон

```typescript
import { eventEmitter } from '@yclients-plugins/utils';
```

### Типы

```typescript
import type { EventListener } from '@yclients-plugins/utils';
```
