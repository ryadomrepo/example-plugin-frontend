import { HttpRequest } from '../src/http/http-request';
import type { IHttpRequest } from '../src/types';
import { HttpClientFactory } from '../src/http';

/**
 * Примеры использования класса HttpRequest
 */
export class HttpRequestExamples {
  /**
   * Пример подготовки JSON запроса
   */
  static jsonRequestExample(): void {
    const request: IHttpRequest = {
      url: 'https://api.example.com/users',
      method: 'POST',
      headers: {
        Authorization: 'Bearer token123',
      },
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      },
    };

    const httpRequest = new HttpRequest(request);

    console.log('JSON Request Example:');
    console.log('URL:', httpRequest.url);
    console.log('Method:', httpRequest.method);
    console.log('Headers:', httpRequest.headers);
    console.log('Body:', httpRequest.body);
    console.log('Fetch Init:', httpRequest.toFetchInit());
  }

  /**
   * Пример подготовки FormData запроса
   */
  static formDataRequestExample(): void {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob(['file content'], { type: 'text/plain' }),
      'test.txt',
    );
    formData.append('description', 'Test file upload');

    const request: IHttpRequest = {
      url: 'https://api.example.com/upload',
      method: 'POST',
      body: formData,
    };

    const httpRequest = new HttpRequest(request);

    console.log('FormData Request Example:');
    console.log('URL:', httpRequest.url);
    console.log('Method:', httpRequest.method);
    console.log('Headers:', httpRequest.headers);
    console.log('Body type:', httpRequest.body?.constructor.name);
  }

  /**
   * Пример подготовки URLSearchParams запроса
   */
  static urlSearchParamsRequestExample(): void {
    const params = new URLSearchParams();
    params.append('query', 'search term');
    params.append('page', '1');
    params.append('limit', '10');

    const request: IHttpRequest = {
      url: 'https://api.example.com/search',
      method: 'POST',
      body: params,
    };

    const httpRequest = new HttpRequest(request);

    console.log('URLSearchParams Request Example:');
    console.log('URL:', httpRequest.url);
    console.log('Method:', httpRequest.method);
    console.log('Headers:', httpRequest.headers);
    console.log('Body type:', httpRequest.body?.constructor.name);
  }

  /**
   * Пример подготовки строкового запроса
   */
  static stringRequestExample(): void {
    const request: IHttpRequest = {
      url: 'https://api.example.com/raw',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Raw text content',
    };

    const httpRequest = new HttpRequest(request);

    console.log('String Request Example:');
    console.log('URL:', httpRequest.url);
    console.log('Method:', httpRequest.method);
    console.log('Headers:', httpRequest.headers);
    console.log('Body:', httpRequest.body);
  }
}

/**
 * Пример использования HTTP клиента с retry
 */
export async function runHttpRequestExamples(): Promise<void> {
  console.log('🚀 HTTP Client Examples\n');

  // 1. Базовый клиент с retry
  console.log('1. Базовый клиент с retry:');
  const basicClient = HttpClientFactory.create('fetch', {
    baseURL: 'https://httpbin.org',
    timeout: 5000,
    retry: {
      count: 3,
      delay: 1000,
    },
  });

  try {
    const response = await basicClient.get('/status/200');
    console.log('✅ Успешный запрос:', response.status);
  } catch (error) {
    console.log('❌ Ошибка запроса:', error);
  }

  // 2. Клиент без retry
  console.log('\n2. Клиент без retry:');
  const noRetryClient = HttpClientFactory.create('fetch', {
    baseURL: 'https://httpbin.org',
    retry: {
      count: 0,
      delay: 1000,
    },
  });

  try {
    const response = await noRetryClient.get('/status/200');
    console.log('✅ Успешный запрос:', response.status);
  } catch (error) {
    console.log('❌ Ошибка запроса:', error);
  }

  // 3. Клиент с большим количеством retry
  console.log('\n3. Клиент с большим количеством retry:');
  const manyRetryClient = HttpClientFactory.create('fetch', {
    baseURL: 'https://httpbin.org',
    retry: {
      count: 5,
      delay: 500,
    },
  });

  try {
    const response = await manyRetryClient.get('/status/200');
    console.log('✅ Успешный запрос:', response.status);
  } catch (error) {
    console.log('❌ Ошибка запроса:', error);
  }

  // 4. Запрос с переопределением retry настроек
  console.log('\n4. Запрос с переопределением retry настроек:');
  try {
    const response = await basicClient.get(
      '/status/200',
      {},
      {
        retry: {
          count: 1,
          delay: 500,
        },
      },
    );
    console.log(
      '✅ Успешный запрос с кастомными retry настройками:',
      response.status,
    );
  } catch (error) {
    console.log('❌ Ошибка запроса:', error);
  }

  // 5. Тестирование с ошибками сервера
  console.log('\n5. Тестирование с ошибками сервера:');
  try {
    // Этот запрос должен вызвать retry из-за статуса 500
    await basicClient.get('/status/500');
  } catch (error) {
    console.log('❌ Ожидаемая ошибка сервера:', error);
  }

  // 6. Тестирование с таймаутом
  console.log('\n6. Тестирование с таймаутом:');
  const timeoutClient = HttpClientFactory.create('fetch', {
    baseURL: 'https://httpbin.org',
    timeout: 100, // Очень короткий таймаут
    retry: {
      count: 2,
      delay: 1000,
    },
  });

  try {
    await timeoutClient.get('/delay/5'); // Запрос, который займет 5 секунд
  } catch (error) {
    console.log('❌ Ожидаемый таймаут:', error);
  }

  // 7. Тестирование с отменой запроса
  console.log('\n7. Тестирование с отменой запроса:');
  const controller = new AbortController();

  // Отменяем запрос через 1 секунду
  setTimeout(() => {
    controller.abort();
    console.log('🛑 Запрос отменен');
  }, 1000);

  try {
    await basicClient.get('/delay/10', { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('✅ Запрос был успешно отменен');
    } else {
      console.log('❌ Неожиданная ошибка:', error);
    }
  }

  console.log('\n✨ Все примеры завершены!');
}

/**
 * Пример создания специализированного клиента для API
 */
export function createApiClient(baseURL: string, apiKey?: string) {
  const client = HttpClientFactory.create('fetch', {
    baseURL,
    timeout: 10000,
    defaultHeaders: {
      'Content-Type': 'application/json',
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    },
    retry: {
      count: 3,
      delay: 1000,
    },
  });

  // Добавляем интерцептор для логирования
  client.addInterceptor({
    onRequest: (request) => {
      console.log(`🚀 ${request.method} ${request.url}`);
      return request;
    },
    onResponse: (response) => {
      console.log(`✅ ${response.status} ${response.statusText}`);
      return response;
    },
    onError: (error) => {
      console.error(`❌ Request failed:`, error);
      return error;
    },
  });

  return client;
}

/**
 * Пример использования специализированного клиента
 */
export async function runApiClientExample(): Promise<void> {
  console.log('\n🔧 API Client Example\n');

  const apiClient = createApiClient('https://httpbin.org');

  try {
    // GET запрос
    const users = await apiClient.get('/json');
    console.log('Users data:', users.data);

    // POST запрос
    const newUser = await apiClient.post('/post', {
      name: 'John Doe',
      email: 'john@example.com',
    });
    console.log('Created user:', newUser.data);

    // PUT запрос
    const updatedUser = await apiClient.put('/put', {
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
    console.log('Updated user:', updatedUser.data);

    // DELETE запрос
    await apiClient.delete('/delete');
    console.log('User deleted successfully');
  } catch (error) {
    console.error('API Error:', error);
  }
}
