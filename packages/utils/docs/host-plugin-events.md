# Структура утилит для разработки плагинов

## Директория `core`

Набор утилит для взаимодействия плагина с хост-приложением.

### Файлы

#### `events.ts`

- `createHostEventNames(area: string)` - функция для создания коллекции имен событий от хост-приложения к плагину
- `createPluginEventNames(area: string)` - функция для создания коллекции имен событий от плагина к хост-приложению
- `THostEventNames` - тип для событий хоста
- `TPluginEventNames` - тип для событий плагина
- Формат имен событий: `host:${area}:${eventName}` или `plugin:${area}:${eventName}`

#### `types.ts`

- `TPluginEvent<T>` - универсальный тип для событий в системе плагинов
- Унифицированная структура событий с полями `area`, `containerId` и `payload`

## Принципы организации

1. **Разделение ответственности**
   - `events.ts` - определение событий и функций-фабрик
   - `types.ts` - определение универсального типа для типизации событий

2. **Именование событий**

   ```typescript
   // Создание имен событий для конкретного плагина
   const HOST_EVENT_NAMES = createHostEventNames('my-plugin-area');
   const PLUGIN_EVENT_NAMES = createPluginEventNames('my-plugin-area');

   // Подписка на событие готовности хоста
   window.addEventListener(HOST_EVENT_NAMES.READY, () => {
     console.log('Хост-приложение готово к работе с плагином');
   });

   // Отправка события готовности плагина
   window.dispatchEvent(
     new CustomEvent(PLUGIN_EVENT_NAMES.READY, {
       detail: { version: '1.0.0' },
     }),
   );
   ```

   ```typescript
   // Пример плагин-к-плагин коммуникации
   // Плагин A создает свои события
   const PLUGIN_A_EVENTS = createPluginEventNames('plugin-a-area');

   // Плагин B создает свои события
   const PLUGIN_B_EVENTS = createPluginEventNames('plugin-b-area');

   // Плагин A отправляет событие готовности
   window.dispatchEvent(
     new CustomEvent(PLUGIN_A_EVENTS.READY, {
       detail: { data: 'from plugin A', timestamp: Date.now() },
     }),
   );

   // Плагин B слушает события от плагина A
   window.addEventListener(PLUGIN_A_EVENTS.READY, (event) => {
     console.log('Получено событие от плагина A:', event.detail);
   });

   // Плагин B отвечает своим событием
   window.dispatchEvent(
     new CustomEvent(PLUGIN_B_EVENTS.READY, {
       detail: { response: 'acknowledged', from: 'plugin B' },
     }),
   );
   ```

3. **Типизация**

   Все события типизированы для обеспечения безопасности типов:
   - `THostEventNames` - тип для событий хоста
   - `TPluginEventNames` - тип для событий плагина
   - `TPluginEvent<T>` - универсальный тип для всех событий в системе плагинов

4. **Изоляция плагинов**

   Каждый плагин получает уникальные имена событий благодаря передаче `area` в функции-фабрики, что предотвращает конфликты между разными плагинами.

   Эта изоляция также позволяет использовать `createPluginEventNames` для плагин-к-плагин коммуникации, где каждый плагин может:
   - Отправлять события с уникальными именами
   - Слушать события от других плагинов
   - Избегать конфликтов имен благодаря уникальным областям

5. **Универсальный тип событий**

   Вместо отдельных типов для разных направлений событий используется единый универсальный тип `TPluginEvent<T>`, который:
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
