# HTTP Client API

Современный и гибкий HTTP-клиент для TypeScript/JavaScript приложений с поддержкой интерцепторов, повторных попыток и отмены запросов.

## Основные возможности

- ✅ **Типобезопасность** - полная поддержка TypeScript
- 🔄 **Повторные попытки** - автоматические retry с экспоненциальной задержкой
- 🛡️ **Интерцепторы** - перехват и модификация запросов/ответов
- ⏹️ **Отмена запросов** - поддержка AbortController
- 🏭 **Фабрика клиентов** - простое создание клиентов разных типов
- 📦 **Модульность** - легко расширяемая архитектура

## Быстрый старт

```typescript
import { HttpClientFactory } from '@yclients/api/http';

// Создание клиента
const httpClient = HttpClientFactory.create('fetch', {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retry: {
    count: 3,
    delay: 1000,
  },
});

// Простой GET запрос
const response = await httpClient.get<User[]>('/users');
console.log(response.data);
```

## Конфигурация

### IHttpClientConfig

```typescript
interface IHttpClientConfig {
  baseURL?: string; // Базовый URL для всех запросов
  defaultHeaders?: Record<string, string>; // Заголовки по умолчанию
  timeout?: number; // Таймаут в миллисекундах
  retry?: IHttpRetryConfig; // Конфигурация повторных попыток
}
```

### IHttpRetryConfig

```typescript
interface IHttpRetryConfig {
  count: number; // Количество повторных попыток
  delay: number; // Задержка между попытками в миллисекундах
}
```

## Повторные попытки (Retry)

HTTP клиент автоматически повторяет запросы при ошибках с экспоненциальной задержкой:

```typescript
const config = {
  retry: {
    count: 3, // 3 повторные попытки
    delay: 1000, // Базовая задержка 1 секунда
  },
};

// Задержки будут: 1000ms, 2000ms, 4000ms
```

## Методы API

### Основные HTTP методы

```typescript
// GET запрос
const users = await httpClient.get<User[]>('/users');

// POST запрос
const newUser = await httpClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT запрос
const updatedUser = await httpClient.put<User>('/users/1', {
  name: 'Jane Doe',
  email: 'jane@example.com',
});

// PATCH запрос
const patchedUser = await httpClient.patch<User>('/users/1', {
  name: 'Jane Doe',
});

// DELETE запрос
await httpClient.delete('/users/1');
```

### Универсальный метод request

```typescript
const response = await httpClient.request<User>({
  method: 'POST',
  url: '/users',
  headers: {
    Authorization: 'Bearer token',
  },
  body: { name: 'John' },
  timeout: 5000,
});
```

## Интерцепторы

Интерцепторы позволяют перехватывать и модифицировать запросы, ответы и ошибки.

### Добавление интерцептора

```typescript
const authInterceptor: IHttpInterceptor = {
  onRequest: (request) => {
    // Добавляем токен авторизации
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${getToken()}`,
    };
    return request;
  },

  onResponse: (response) => {
    // Логируем успешные ответы
    console.log(`✅ ${response.status}: ${response.statusText}`);
    return response;
  },

  onError: (error) => {
    // Обрабатываем ошибки авторизации
    if (error.status === 401) {
      refreshToken();
    }
    return error;
  },
};

httpClient.addInterceptor(authInterceptor);
```

### Удаление интерцептора

```typescript
httpClient.removeInterceptor(authInterceptor);
httpClient.clearInterceptors(); // Удалить все интерцепторы
```

## Опции запросов

### IHttpRequestOptions

```typescript
interface IHttpRequestOptions {
  retry?: IHttpRetryConfig; // Переопределить retry настройки для конкретного запроса
}
```

### Примеры использования опций

```typescript
// Запрос с кастомными retry настройками
const response = await httpClient.get(
  '/api/data',
  {},
  {
    retry: {
      count: 5,
      delay: 2000,
    },
  },
);

// Запрос с отменой
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

try {
  const response = await httpClient.get('/api/slow', {
    signal: controller.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Запрос был отменен');
  }
}
```

## Фабрика клиентов

### Создание клиента определенного типа

```typescript
// Fetch клиент (по умолчанию)
const fetchClient = HttpClientFactory.create('fetch', config);

// Axios клиент (когда будет реализован)
const axiosClient = HttpClientFactory.create('axios', config);
```

### Автоматический выбор клиента

```typescript
// Автоматически выберет доступный клиент
const client = HttpClientFactory.createAuto(config);
```

### Клиент с fallback

```typescript
// Попробует axios, если не получится - использует fetch
const client = HttpClientFactory.createWithFallback('axios', 'fetch', config);
```

## Создание новых клиентов

```typescript
// Создать новый клиент с дополнительной конфигурацией
const apiClient = httpClient.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

// Новый клиент наследует все интерцепторы и настройки
const adminClient = httpClient.create({
  baseURL: 'https://admin.example.com',
  defaultHeaders: {
    'X-Admin-Token': 'admin-token',
  },
});
```

## Обработка ошибок

```typescript
try {
  const response = await httpClient.get('/api/data');
} catch (error) {
  if (error instanceof Error) {
    console.error('Ошибка запроса:', error.message);

    // Проверка статуса ошибки
    if ('status' in error) {
      switch (error.status) {
        case 401:
          console.log('Не авторизован');
          break;
        case 404:
          console.log('Ресурс не найден');
          break;
        case 500:
          console.log('Ошибка сервера');
          break;
      }
    }
  }
}
```

## Примеры использования

### Сервис для работы с API

```typescript
class UserService {
  constructor(private httpClient: IHttpClient) {}

  async getUsers(): Promise<User[]> {
    const response = await this.httpClient.get<User[]>('/users');
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.httpClient.post<User>('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await this.httpClient.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.httpClient.delete(`/users/${id}`);
  }
}

// Использование
const userService = new UserService(httpClient);
const users = await userService.getUsers();
```

### Интерцептор для логирования

```typescript
const loggingInterceptor: IHttpInterceptor = {
  onRequest: (request) => {
    console.log(`🚀 ${request.method} ${request.url}`, {
      headers: request.headers,
      body: request.body,
    });
    return request;
  },

  onResponse: (response) => {
    console.log(`✅ ${response.status} ${response.statusText}`, {
      data: response.data,
      headers: response.headers,
    });
    return response;
  },

  onError: (error) => {
    console.error(`❌ Request failed:`, error);
    return error;
  },
};

httpClient.addInterceptor(loggingInterceptor);
```

### Интерцептор для авторизации

```typescript
const authInterceptor: IHttpInterceptor = {
  onRequest: async (request) => {
    const token = await getAuthToken();
    if (token) {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return request;
  },

  onError: async (error) => {
    if (error.status === 401) {
      // Попытка обновить токен
      const newToken = await refreshAuthToken();
      if (newToken) {
        // Повторить запрос с новым токеном
        return retryRequest(error.config, newToken);
      }
    }
    return error;
  },
};
```

## Архитектура

```text
IHttpClient (интерфейс)
    ↓
AbstractHttpClient (абстрактный класс)
    ↓
FetchHttpClient (конкретная реализация)
    ↓
HttpClientFactory (фабрика)
```

### Вспомогательные классы

#### HttpRequest

Класс для подготовки HTTP запросов. Инкапсулирует логику подготовки тела запроса и заголовков.

```typescript
import { HttpRequest } from '@yclients/api/http';

const request = {
  url: 'https://api.example.com/users',
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' },
};

const httpRequest = new HttpRequest(request);
const fetchInit = httpRequest.toFetchInit();

// Использование с fetch
const response = await fetch(httpRequest.url, fetchInit);
```

**Особенности:**

- Автоматическая сериализация объектов в JSON
- Правильная обработка FormData и URLSearchParams
- Автоматическое управление заголовками Content-Type

#### HttpResponse

Класс для обработки HTTP ответов. Инкапсулирует логику обработки различных типов контента.

```typescript
import { HttpResponse } from '@yclients/api/http';

// Получаем Response от fetch
const response = await fetch('https://api.example.com/users');

// Преобразуем в IHttpResponse
const httpResponse = await HttpResponse.fromResponse<User[]>(response);

console.log(httpResponse.status); // 200
console.log(httpResponse.data); // массив пользователей
```

**Особенности:**

- Автоматическое определение типа контента
- Поддержка JSON, текстовых и бинарных ответов
- Преобразование заголовков в удобный формат

### Расширение функциональности

Для добавления новых возможностей можно:

1. **Расширить интерфейс** `IHttpClient`
2. **Наследоваться от** `AbstractHttpClient`
3. **Добавить новые интерцепторы**
4. **Создать специализированные клиенты**

Основные изменения:

- Используйте `HttpClientFactory` для создания клиентов
- Добавьте интерцепторы для расширенной функциональности
- Используйте опции запросов для тонкой настройки
- Обрабатывайте ошибки через try-catch
