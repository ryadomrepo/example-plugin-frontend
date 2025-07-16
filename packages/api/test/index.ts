import { HttpClientFactory } from '../src/http';
import type { IHttpInterceptor } from '../src/types';

async function testHttpClient() {
  console.log('🧪 Testing YCLIENTS HTTP Client...\n');

  // Создаем HTTP-клиент с конфигурацией
  const httpClient = HttpClientFactory.create('fetch', {
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    retry: {
      count: 2,
      delay: 1000,
    },
  });

  // Добавляем интерцептор для логирования
  const loggingInterceptor: IHttpInterceptor = {
    onRequest: (request) => {
      console.log(`🚀 Request: ${request.method} ${request.url}`);
      return request;
    },
    onResponse: (response) => {
      console.log(`✅ Response: ${response.status} ${response.statusText}`);
      return response;
    },
    onError: (error) => {
      console.log(`❌ Error:`, error);
      return error;
    },
  };

  httpClient.addInterceptor(loggingInterceptor);

  // Тест 1: GET запрос
  console.log('\n1. Testing GET request...');
  try {
    const retry = { count: 1, delay: 1000 };
    const posts = await httpClient.get<any[]>('/posts', {}, { retry });
    console.log(`📝 Got ${posts.data.length} posts`);
  } catch (error) {
    console.error('Failed to get posts:', error);
  }

  // Тест 2: POST запрос
  console.log('\n2. Testing POST request...');
  try {
    const newPost = await httpClient.post<any>('/posts', {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1,
    });
    console.log(`📝 Created post with ID: ${newPost.data.id}`);
  } catch (error) {
    console.error('Failed to create post:', error);
  }

  // Тест 3: PUT запрос
  console.log('\n3. Testing PUT request...');
  try {
    const updatedPost = await httpClient.put<any>('/posts/1', {
      id: 1,
      title: 'Updated Post',
      body: 'This post has been updated',
      userId: 1,
    });
    console.log(`📝 Updated post: ${updatedPost.data.title}`);
  } catch (error) {
    console.error('Failed to update post:', error);
  }

  // Тест 4: DELETE запрос
  console.log('\n4. Testing DELETE request...');
  try {
    const deleteResponse = await httpClient.delete('/posts/1');
    console.log(`🗑️ Deleted post, status: ${deleteResponse.status}`);
  } catch (error) {
    console.error('Failed to delete post:', error);
  }

  // Тест 5: Отмена запроса
  console.log('\n6. Testing request cancellation...');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
    console.log('⏹️ Request cancelled');
  }, 100);

  try {
    await httpClient.get('/posts', { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('✅ Request was successfully cancelled');
    } else {
      console.error('Unexpected error during cancellation:', error);
    }
  }

  console.log('\n🎉 All tests completed!');
}

// Запускаем тесты
if (typeof window !== 'undefined') {
  // В браузере
  window.addEventListener('load', testHttpClient);
} else {
  // В Node.js
  testHttpClient().catch(console.error);
}
