# Работа с динамическими контейнерами

## Проблема

В реальных сценариях у нас может быть множество элементов с одинаковой логической зоной, но разными контейнерами. Например:

- Список записей в журнале записей
- Таблица с множественными строками
- Карточки товаров в каталоге

## Решение

### 1. Динамическое обнаружение контейнеров

Вместо статического маппинга зон к контейнерам, хост теперь динамически ищет все контейнеры для каждой зоны:

```typescript
// В host.ts
function findContainersForArea(area: string): string[] {
  const containers = document.querySelectorAll(
    `[data-plugin-container*="${area}"]`,
  );
  const containerIds: string[] = [];

  containers.forEach((container) => {
    const containerId = container.getAttribute('data-plugin-container');
    if (containerId) {
      containerIds.push(containerId);
    }
  });

  return containerIds;
}
```

### 2. Генерация уникальных containerId

Для создания уникальных идентификаторов контейнеров:

```typescript
import { generateContainerIdForRecord } from './configs/areas';

// Генерация уникального ID для записи
const containerId = generateContainerIdForRecord(
  'erp-timetable-record-client-name',
  record.id,
);
```

### 3. Пример использования в Vue

```vue
<template>
  <div class="timetable-records">
    <div v-for="record in records" :key="record.id" class="record-item">
      <!-- Уникальный контейнер для каждой записи -->
      <div
        :data-plugin-container="`erp-timetable-record-client-name-${record.id}`"
        class="client-name-container"
      >
        <!-- Здесь будет отображаться имя клиента -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { generateContainerIdForRecord } from './configs/areas';

interface Record {
  id: number;
  client: {
    name: string;
    surname: string;
    patronymic: string;
  };
}

const props = defineProps<{
  records: Record[];
}>();

onMounted(() => {
  // Инициализация хоста плагина
  // Хост автоматически найдет все контейнеры и отправит события
  initializeHost();
});
</script>
```

### 4. Пример использования в React

```tsx
import { useEffect } from 'react';
import { generateContainerIdForRecord } from './configs/areas';

interface Record {
  id: number;
  client: {
    name: string;
    surname: string;
    patronymic: string;
  };
}

interface TimetableRecordsProps {
  records: Record[];
}

export function TimetableRecords({ records }: TimetableRecordsProps) {
  useEffect(() => {
    // Инициализация хоста плагина
    initializeHost();
  }, []);

  return (
    <div className="timetable-records">
      {records.map((record) => (
        <div key={record.id} className="record-item">
          <div
            data-plugin-container={`erp-timetable-record-client-name-${record.id}`}
            className="client-name-container"
          >
            {/* Здесь будет отображаться имя клиента */}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Преимущества нового подхода

### 1. Масштабируемость

- Поддерживает любое количество контейнеров
- Автоматическое обнаружение новых контейнеров
- Не требует изменения кода при добавлении новых записей

### 2. Гибкость

- Уникальные идентификаторы для каждой записи
- Возможность передачи разных данных для каждого контейнера
- Поддержка динамического контента

### 3. Простота использования

- Хост автоматически находит все контейнеры
- Не нужно вручную регистрировать каждый контейнер
- Единообразный подход для всех зон

## Примеры именования контейнеров

### Для записей в журнале

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

### Для товаров в каталоге

```html
<!-- Товар 1 -->
<div data-plugin-container="catalog-product-color-picker-789">
  <!-- Цветовая палитра для товара с ID 789 -->
</div>

<!-- Товар 2 -->
<div data-plugin-container="catalog-product-color-picker-101">
  <!-- Цветовая палитра для товара с ID 101 -->
</div>
```

## Обработка событий

Каждый контейнер получает свое уникальное событие:

```typescript
// События для разных контейнеров
'plugin:erp-timetable-record-client-name-123:ready';
'plugin:erp-timetable-record-client-name-456:ready';
'plugin:erp-timetable-record-client-name-789:ready';
```

Это позволяет:

- Избежать конфликтов имен событий
- Отслеживать состояние каждого контейнера отдельно
- Корректно обрабатывать множественные инициализации

## Рекомендации

### 1. Именование контейнеров

Используйте паттерн: `{zone-name}-{unique-id}`

```typescript
const containerId = `${area}-${recordId}`;
```

### 2. Передача данных

Передавайте уникальные данные для каждого контейнера:

```typescript
const hostReadyPayload: THostReadyEvent = {
  area: area,
  containerId: containerId,
  payload: {
    clientName: record.client.name,
    clientSurname: record.client.surname,
    clientPatronymic: record.client.patronymic,
  },
};
```

### 3. Очистка ресурсов

При удалении записей не забывайте очищать ресурсы:

```typescript
// При удалении записи
cleanupPlugin();
```

## Заключение

Новый подход с динамическими контейнерами решает проблему масштабируемости и позволяет легко работать с множественными экземплярами плагина в рамках одной страницы.
