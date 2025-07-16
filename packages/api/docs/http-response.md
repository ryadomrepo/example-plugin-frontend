# HttpResponse

Класс для обработки HTTP ответов. Преобразует объект `Response` в типизированный `IHttpResponse`.

## Основные возможности

- Автоматическое определение типа контента по заголовку `Content-Type`
- Поддержка JSON, текстовых и бинарных ответов
- Обработка статус кодов без тела ответа (204, 304 и др.)
- Строгая типизация с поддержкой дженериков
- Union типы для гибкой обработки разных типов контента

## API

### `fromResponse<T>(response: Response)`

Основной метод для создания `IHttpResponse` с автоматическим определением типа контента и поддержкой дженериков.

```typescript
static async fromResponse<T = unknown>(response: Response): Promise<IHttpResponse<T | string | ArrayBuffer | null>>
```

**Логика определения типа:**

- `application/json` → JSON объект типа `T`
- `text/*` → строка
- Остальные типы → `ArrayBuffer`
- Статус коды без тела → `null`

**Примеры:**

```typescript
// Без указания типа (будет unknown)
const response1 = await HttpResponse.fromResponse(fetch('/api/data'));

// С указанием типа для JSON ответов
interface User {
  id: number;
  name: string;
}

const response2 = await HttpResponse.fromResponse<User>(fetch('/api/user'));
// response2.data будет типа User | string | ArrayBuffer | null

// Проверка типа данных
if (
  response2.data &&
  typeof response2.data === 'object' &&
  'id' in response2.data
) {
  console.log(response2.data.name); // типизированный доступ
}
```

### `fromJsonResponse<T>(response: Response)`

Создает `IHttpResponse` с JSON данными.

```typescript
static async fromJsonResponse<T = unknown>(response: Response): Promise<IHttpResponse<T>>
```

**Пример:**

```typescript
const response = await fetch('/api/users/1');
const httpResponse = await HttpResponse.fromJsonResponse<User>(response);
console.log(httpResponse.data.name); // типизированный доступ
```

### `fromTextResponse(response: Response)`

Создает `IHttpResponse` с текстовыми данными.

```typescript
static async fromTextResponse(response: Response): Promise<IHttpResponse<string>>
```

### `fromBinaryResponse(response: Response)`

Создает `IHttpResponse` с бинарными данными.

```typescript
static async fromBinaryResponse(response: Response): Promise<IHttpResponse<ArrayBuffer>>
```

## Статус коды без тела ответа

Следующие статус коды автоматически обрабатываются как ответы без тела:

- 100, 101, 102, 103 (информационные)
- 204, 205 (успешные без контента)
- 304 (не изменено)

## Рекомендации по использованию

1. **Для автоматического определения типа с дженериками:**

   ```typescript
   // Для JSON API
   const httpResponse = await HttpResponse.fromResponse<User>(response);

   // Для неизвестного типа
   const httpResponse = await HttpResponse.fromResponse(response);
   ```

2. **Для известного типа контента:**

   ```typescript
   const jsonResponse = await HttpResponse.fromJsonResponse<User>(response);
   const textResponse = await HttpResponse.fromTextResponse(response);
   const binaryResponse = await HttpResponse.fromBinaryResponse(response);
   ```

3. **Проверка типа данных с union типами:**

   ```typescript
   const httpResponse = await HttpResponse.fromResponse<User>(response);

   if (httpResponse.data === null) {
     // ответ без тела
   } else if (typeof httpResponse.data === 'string') {
     // текстовый ответ
   } else if (httpResponse.data instanceof ArrayBuffer) {
     // бинарный ответ
   } else if ('id' in httpResponse.data) {
     // JSON ответ с типом User
     console.log(httpResponse.data.name);
   }
   ```

4. **Обработка union типов:**

   ```typescript
   const response = await HttpResponse.fromResponse<{ success: boolean }>(
     fetch('/api/status'),
   );

   // TypeScript будет знать, что data может быть:
   // - { success: boolean } (для JSON)
   // - string (для text/*)
   // - ArrayBuffer (для других типов)
   // - null (для статус кодов без тела)
   ```

## Интерфейс IHttpResponse

```typescript
interface IHttpResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  ok: boolean;
}
```

## Интеграция с HTTP клиентами

Класс автоматически используется в `FetchHttpClient`:

```typescript
import { FetchHttpClient } from '@yclients/api/http';

const client = new FetchHttpClient();
const response = await client.get<User[]>('/users');
// Внутри используется HttpResponse.fromResponse<T>()
```
