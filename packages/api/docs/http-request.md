# HttpRequest

Класс для подготовки HTTP запросов. Инкапсулирует логику подготовки тела запроса и заголовков для совместимости с fetch API.

## Особенности

- **Автоматическая сериализация объектов в JSON**
- **Правильная обработка FormData и URLSearchParams**
- **Автоматическое управление заголовками Content-Type**
- **Совместимость с fetch API**

## Использование

### Базовое использование

```typescript
import { HttpRequest } from '@yclients/api/http';
import type { IHttpRequest } from '@yclients/api/types';

const request: IHttpRequest = {
  url: 'https://api.example.com/users',
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' },
};

const httpRequest = new HttpRequest(request);
const fetchInit = httpRequest.toFetchInit();

// Использование с fetch
const response = await fetch(httpRequest.url, fetchInit);
```

### Поддержка различных типов тела запроса

#### JSON объекты

```typescript
const request: IHttpRequest = {
  url: 'https://api.example.com/users',
  method: 'POST',
  body: { name: 'John', age: 30 },
};

const httpRequest = new HttpRequest(request);
// Автоматически устанавливается Content-Type: application/json
// Тело сериализуется в JSON строку
```

#### FormData

```typescript
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('description', 'Uploaded file');

const request: IHttpRequest = {
  url: 'https://api.example.com/upload',
  method: 'POST',
  body: formData,
};

const httpRequest = new HttpRequest(request);
// Content-Type удаляется для правильной установки браузером
// FormData передается напрямую
```

#### URLSearchParams

```typescript
const params = new URLSearchParams();
params.append('query', 'search term');
params.append('page', '1');

const request: IHttpRequest = {
  url: 'https://api.example.com/search',
  method: 'POST',
  body: params,
};

const httpRequest = new HttpRequest(request);
// Content-Type удаляется для правильной установки браузером
// URLSearchParams передается напрямую
```

#### Строки

```typescript
const request: IHttpRequest = {
  url: 'https://api.example.com/raw',
  method: 'POST',
  body: 'Raw text content',
};

const httpRequest = new HttpRequest(request);
// Строка передается как есть
```

## API

### Конструктор

```typescript
constructor(request: IHttpRequest)
```

### Свойства

- `url: string` - URL запроса
- `method: string` - HTTP метод
- `headers: Record<string, string>` - подготовленные заголовки
- `body: string | FormData | URLSearchParams | undefined` - подготовленное тело запроса
- `timeout: number | undefined` - таймаут запроса
- `signal: AbortSignal | undefined` - сигнал отмены

### Методы

#### toFetchInit()

Возвращает объект для передачи в fetch API.

```typescript
toFetchInit(): RequestInit
```

## Преимущества использования

1. **Разделение ответственности** - логика подготовки запроса вынесена в отдельный класс
2. **Переиспользование** - класс можно использовать в разных HTTP клиентах
3. **Тестируемость** - легко тестировать логику подготовки запроса отдельно
4. **Расширяемость** - легко добавлять новые типы тел запросов
5. **Типобезопасность** - полная поддержка TypeScript

## Интеграция с FetchHttpClient

Класс `HttpRequest` интегрирован в `FetchHttpClient` и автоматически используется для подготовки всех запросов:

```typescript
import { FetchHttpClient } from '@yclients/api/http';

const client = new FetchHttpClient();
const response = await client.post('/users', { name: 'John' });
// Внутри автоматически создается HttpRequest и подготавливается запрос
```
