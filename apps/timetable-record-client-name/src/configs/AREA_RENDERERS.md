# Архитектура рендереров зон

## Обзор

Новая архитектура рендереров зон предоставляет более модульный и расширяемый подход к созданию компонентов в зонах плагина.

## Основные компоненты

### 1. IPluginRenderer (Интерфейс)

```typescript
interface IPluginRenderer {
  description: string;
  render: (
    areaName: string,
    container: Element,
    payload: THostReadyPayload,
  ) => void;
  handleUpdate?: (
    event: CustomEvent<TPluginUpdateEvent>,
    container: Element,
  ) => void;
}
```

Каждый рендерер отвечает за:

- Создание компонента в контейнере
- Обработку событий обновления (опционально)
- Управление состоянием компонента

### 2. VisibilityControlRenderer

Рендерер для зоны управления отображением (checkbox).

**Функции:**

- Создает checkbox компонент с помощью `CheckboxService.createCheckbox()`
- Отправляет события `pluginUpdate` при изменении состояния checkbox
- Использует `data-plugin-container` для получения containerId в событиях
- По умолчанию checkbox отмечен (`checked: true`)

### 3. ClientNameRenderer

Рендерер для зоны отображения имени клиента.

**Функции:**

- Отображает полное имя клиента через `ClientNameService.formatFullName()`
- Автоматически подписывается на события `pluginUpdate` зоны управления
- Показывает/скрывает имя в зависимости от состояния checkbox
- Сохраняет отформатированное имя в приватном поле `fullName`

### 4. PluginRendererRegistry

Реестр для управления рендерерами зон.

**Методы:**

- `register(areaName, renderer)` - регистрация рендерера
- `get(areaName)` - получение рендерера
- `has(areaName)` - проверка существования
- `getRegisteredAreas()` - список зарегистрированных зон

## Использование

### Базовое использование

```typescript
import {
  initializeDefaultRenderers,
  getPluginRenderer,
} from './plugin-renderers';

// Инициализация рендереров
initializeDefaultRenderers();

// Получение рендерера
const renderer = getPluginRenderer('erp-timetable-controls');
if (renderer) {
  renderer.render('erp-timetable-controls', container, payload);
}
```

### Добавление нового рендерера

```typescript
class CustomRenderer implements IPluginRenderer {
  description = 'Описание нового рендерера';

  render(
    areaName: string,
    container: Element,
    payload: THostReadyPayload,
  ): void {
    // Логика рендеринга
  }
}

// Регистрация
PluginRendererRegistry.register('custom-area', new CustomRenderer());
```

### Конфигурация через атрибуты

```html
<!-- Зона управления -->
<div data-plugin-container="erp-timetable-controls"></div>

<!-- Зона отображения -->
<div data-plugin-container="erp-timetable-record-client-name"></div>
```

**Примечание:** Связь между зонами определяется через константы в коде, а не через атрибуты HTML. Зона отображения автоматически подписывается на события зоны управления через `AreaConstantsUtils.getControlArea()`.

## Примеры использования

### Простой рендерер

```typescript
class SimpleTextRenderer implements IPluginRenderer {
  description = 'Отображение простого текста';

  render(
    areaName: string,
    container: Element,
    payload: THostReadyPayload,
  ): void {
    console.log(`[Plugin] Рендерим простой текст в зоне "${areaName}"`);
    container.textContent = 'Простой текст';
  }
}
```

### Рендерер с состоянием

```typescript
class StatefulRenderer implements IPluginRenderer {
  description = 'Рендерер с внутренним состоянием';
  private state = { count: 0 };

  render(
    areaName: string,
    container: Element,
    payload: THostReadyPayload,
  ): void {
    console.log(
      `[Plugin] Рендерим компонент с состоянием в зоне "${areaName}"`,
    );

    const button = document.createElement('button');
    button.textContent = `Клик: ${this.state.count}`;
    button.onclick = () => {
      this.state.count++;
      button.textContent = `Клик: ${this.state.count}`;
    };
    container.replaceChildren(button);
  }
}
```

### Рендерер с обработкой событий

```typescript
class EventDrivenRenderer implements IPluginRenderer {
  description = 'Рендерер с обработкой внешних событий';

  render(
    areaName: string,
    container: Element,
    payload: THostReadyPayload,
  ): void {
    console.log(
      `[Plugin] Рендерим компонент с обработкой событий в зоне "${areaName}"`,
    );
    container.textContent = 'Ожидание события...';

    document.addEventListener('custom-event', (event) => {
      container.textContent = `Получено событие: ${event.detail}`;
    });
  }

  handleUpdate(
    event: CustomEvent<TPluginUpdateEvent>,
    container: Element,
  ): void {
    console.log(
      `[Plugin] Обработка события обновления: ${JSON.stringify(event.detail.payload)}`,
    );
    container.textContent = `Обновление: ${JSON.stringify(event.detail.payload)}`;
  }
}
```
