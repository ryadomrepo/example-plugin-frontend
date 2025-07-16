# Timetable Record Client Name Plugin

Плагин для отображения полного имени клиента в записи расписания.

## Описание

Плагин получает данные о клиенте от хоста и отображает полное имя (имя, фамилия, отчество) в указанном контейнере. Поддерживает множественную инициализацию с уникальными именами событий для каждого контейнера.

## Установка и использование

### Автоматическая инициализация

Плагин автоматически инициализируется при импорте:

```typescript
import './index';
```

### Ручная инициализация

Для более детального контроля можно использовать ручную инициализацию:

```typescript
import { initializePlugin, cleanupPlugin } from './plugin';

// Инициализация плагина
const cleanup = initializePlugin();

// При необходимости - ручная очистка
cleanup();
```

## API

### `initializePlugin(): () => void`

Инициализирует плагин и настраивает обработку событий.

**Возвращает:** Функцию очистки для отписки от событий.

**Пример:**

```typescript
const cleanup = initializePlugin();
```

### `cleanupPlugin(): void`

Отписывается от всех событий и очищает ресурсы плагина.

**Пример:**

```typescript
cleanupPlugin();
```

## События

### Входящие события (от хоста)

#### `host:timetable-record-client-name:ready`

Событие готовности хоста с данными клиента.

**Структура данных:**

```typescript
{
  containerId: string;
  payload: {
    clientName: string;
    clientSurname: string;
    clientPatronymic: string;
  }
}
```

### Исходящие события (к хосту)

#### `plugin:{containerId}:ready`

Событие готовности плагина. Имя события создается динамически на основе `containerId`.

**Структура данных:**

```typescript
{
  payload: null;
}
```

**Примеры имен событий:**

- `plugin:client-name-container-1:ready`
- `plugin:client-name-container-2:ready`

## Управление жизненным циклом

### Автоматическая очистка

Плагин автоматически отписывается от событий при:

- Выгрузке страницы (`beforeunload`)

### Ручная очистка

Для предотвращения утечек памяти рекомендуется вызывать функцию очистки при уничтожении компонента:

```typescript
import { cleanupPlugin } from './plugin';

// В компоненте Vue
onUnmounted(() => {
  cleanupPlugin();
});

// В React
useEffect(() => {
  return () => {
    cleanupPlugin();
  };
}, []);
```

## Архитектура

### Компоненты

- **`plugin.ts`** - Основная логика плагина
- **`index.ts`** - Точка входа и автоматическая инициализация
- **`services/client-name.service.ts`** - Сервис для форматирования имени
- **`types/events.ts`** - Типы событий

### Поток данных

1. Хост отправляет событие `host:timetable-record-client-name:ready`
2. Плагин получает данные клиента и `containerId`
3. Находит контейнер по `containerId`
4. Форматирует полное имя через `ClientNameService`
5. Отображает имя в контейнере
6. Создает уникальное имя события плагина на основе `containerId`
7. Отправляет событие `plugin:{containerId}:ready`

### Множественная инициализация

Плагин поддерживает множественную инициализацию благодаря динамическому созданию имен событий:

- **События хоста**: Используют статическое имя `host:timetable-record-client-name:ready`
- **События плагина**: Создаются динамически как `plugin:{containerId}:ready`

Это позволяет:

- Избежать конфликтов имен событий между разными экземплярами
- Каждому контейнеру иметь свое уникальное событие готовности
- Корректно обрабатывать множественные инициализации

## Обработка ошибок

### Отсутствующий контейнер

Если контейнер с указанным `containerId` не найден:

- Ошибка логируется в консоль
- Событие готовности плагина не отправляется

### Обработка множественной инициализации

При множественной инициализации плагина:

- Каждый экземпляр подписывается на события хоста независимо
- События плагина создаются с уникальными именами для каждого контейнера
- Функция очистки отписывает только от событий хоста (события плагина не требуют отписки)
- Рекомендуется использовать один экземпляр на страницу

## Примеры использования

### Базовое использование

```html
<div data-plugin-container="client-name-container-1"></div>
<div data-plugin-container="client-name-container-2"></div>
```

```typescript
// Хост отправляет события для разных контейнеров
hostEventEmitter.emit('host:erp-timetable-record-client-name:ready', {
  containerId: 'client-name-container-1',
  payload: {
    clientName: 'Иван',
    clientSurname: 'Иванов',
    clientPatronymic: 'Иванович',
  },
});

hostEventEmitter.emit('host:erp-timetable-record-client-name:ready', {
  containerId: 'client-name-container-2',
  payload: {
    clientName: 'Петр',
    clientSurname: 'Петров',
    clientPatronymic: 'Петрович',
  },
});

// Результат:
// - В первом контейнере: "Иванов Иван Иванович"
// - Во втором контейнере: "Петров Петр Петрович"
// - Отправляются события: plugin:client-name-container-1:ready и plugin:client-name-container-2:ready
```

### Динамические контейнеры для множественных записей

Для случаев, когда у вас есть множество элементов с одинаковой логической зоной (например, список записей в журнале):

```html
<!-- Запись 1 -->
<div data-plugin-container="erp-timetable-record-client-name-123">
  <!-- Имя клиента для записи с ID 123 -->
</div>

<!-- Запись 2 -->
<div data-plugin-container="erp-timetable-record-client-name-456">
  <!-- Имя клиента для записи с ID 456 -->
</div>
```

```typescript
// Хост автоматически найдет все контейнеры и отправит события
const records = [
  {
    id: 123,
    client: { name: 'Иван', surname: 'Иванов', patronymic: 'Иванович' },
  },
  {
    id: 456,
    client: { name: 'Петр', surname: 'Петров', patronymic: 'Петрович' },
  },
];

records.forEach((record) => {
  const containerId = `erp-timetable-record-client-name-${record.id}`;

  hostEventEmitter.emit('host:erp-timetable-record-client-name:ready', {
    containerId: containerId,
    payload: {
      clientName: record.client.name,
      clientSurname: record.client.surname,
      clientPatronymic: record.client.patronymic,
    },
  });
});
```

Подробнее о работе с динамическими контейнерами см. [DYNAMIC_CONTAINERS.md](./docs/DYNAMIC_CONTAINERS.md).

### Интеграция с Vue

```vue
<template>
  <div data-plugin-container="client-name-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { initializePlugin, cleanupPlugin } from './plugin';

let cleanup: (() => void) | null = null;

onMounted(() => {
  cleanup = initializePlugin();
});

onUnmounted(() => {
  if (cleanup) {
    cleanup();
  }
});
</script>
```

### Интеграция с React

```tsx
import { useEffect } from 'react';
import { initializePlugin, cleanupPlugin } from './plugin';

function ClientNameComponent() {
  useEffect(() => {
    const cleanup = initializePlugin();

    return () => {
      cleanup();
    };
  }, []);

  return <div data-plugin-container="client-name-container" />;
}
```

## Разработка

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка

```bash
npm run build
```

### Тестирование

```bash
npm run test
```
