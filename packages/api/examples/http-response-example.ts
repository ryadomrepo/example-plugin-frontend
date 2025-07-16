import { HttpResponse } from '../src/http/http-response';

// Типы для примеров
interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Примеры использования класса HttpResponse
 */
export class HttpResponseExamples {
  /**
   * Пример обработки JSON ответа с типизацией
   */
  static async jsonResponseTypedExample(): Promise<void> {
    const jsonData = JSON.stringify({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });

    const response = new Response(jsonData, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': '1',
      },
    });

    // Используем типизированный метод для JSON
    const httpResponse = await HttpResponse.fromJsonResponse<User>(response);

    console.log('JSON Response Typed Example:');
    console.log('Status:', httpResponse.status);
    console.log('Data:', httpResponse.data);
    console.log('User ID:', httpResponse.data.id);
    console.log('User Name:', httpResponse.data.name);
  }

  /**
   * Пример автоматического определения типа контента для разных форматов
   */
  static async autoDetectContentTypeExample(): Promise<void> {
    // JSON ответ
    const jsonResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    // Текстовый ответ
    const textResponse = new Response('Hello World', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

    // Бинарный ответ
    const binaryResponse = new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
    });

    // HTML ответ
    const htmlResponse = new Response(
      '<html><body><h1>Hello</h1></body></html>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      },
    );

    // Автоматическое определение типа
    const jsonResult = await HttpResponse.fromResponse(jsonResponse);
    const textResult = await HttpResponse.fromResponse(textResponse);
    const binaryResult = await HttpResponse.fromResponse(binaryResponse);
    const htmlResult = await HttpResponse.fromResponse(htmlResponse);

    console.log('Auto-detect Content Type Example:');
    console.log('JSON result type:', typeof jsonResult.data);
    console.log('Text result type:', typeof textResult.data);
    console.log(
      'Binary result type:',
      binaryResult.data instanceof ArrayBuffer
        ? 'ArrayBuffer'
        : typeof binaryResult.data,
    );
    console.log('HTML result type:', typeof htmlResult.data);
  }

  /**
   * Пример обработки текстового ответа
   */
  static async textResponseExample(): Promise<void> {
    const response = new Response('Server is running', {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    // Используем метод для текстовых данных
    const httpResponse = await HttpResponse.fromTextResponse(response);

    console.log('Text Response Example:');
    console.log('Status:', httpResponse.status);
    console.log('Data:', httpResponse.data);
    console.log('Data type:', typeof httpResponse.data);
    console.log('String length:', httpResponse.data.length);
  }

  /**
   * Пример обработки бинарного ответа
   */
  static async binaryResponseExample(): Promise<void> {
    const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
    const response = new Response(binaryData, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    // Используем метод для бинарных данных
    const httpResponse = await HttpResponse.fromBinaryResponse(response);

    console.log('Binary Response Example:');
    console.log('Status:', httpResponse.status);
    console.log('Data type:', httpResponse.data.constructor.name);
    console.log('Data byte length:', httpResponse.data.byteLength);
  }

  /**
   * Пример обработки ошибки
   */
  static async errorResponseExample(): Promise<void> {
    const errorData = JSON.stringify({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
    });

    const response = new Response(errorData, {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Используем автоматическое определение типа
    const httpResponse = await HttpResponse.fromResponse(response);

    console.log('Error Response Example:');
    console.log('Status:', httpResponse.status);
    console.log('Status Text:', httpResponse.statusText);
    console.log('OK:', httpResponse.ok);
    console.log('Error Data:', httpResponse.data);
  }

  /**
   * Пример обработки ответа с множественными заголовками
   */
  static async multipleHeadersResponseExample(): Promise<void> {
    const response = new Response('OK', {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'X-Request-ID': 'req-12345',
        'X-Rate-Limit-Limit': '100',
        'X-Rate-Limit-Remaining': '99',
        'X-Rate-Limit-Reset': '1640995200',
      },
    });

    // Используем автоматическое определение типа
    const httpResponse = await HttpResponse.fromResponse(response);

    console.log('Multiple Headers Response Example:');
    console.log('Status:', httpResponse.status);
    console.log('All Headers:', httpResponse.headers);
    console.log('Cache Control:', httpResponse.headers['cache-control']);
    console.log('Request ID:', httpResponse.headers['x-request-id']);
    console.log('Rate Limit:', httpResponse.headers['x-rate-limit-remaining']);
  }

  /**
   * Пример обработки ответа без Content-Type
   */
  static async noContentTypeResponseExample(): Promise<void> {
    const response = new Response('Raw data', {
      status: 200,
      statusText: 'OK',
      // Без Content-Type заголовка
    });

    // Используем автоматическое определение типа
    const httpResponse = await HttpResponse.fromResponse(response);

    console.log('No Content-Type Response Example:');
    console.log('Status:', httpResponse.status);
    console.log(
      'Data type:',
      httpResponse.data instanceof ArrayBuffer
        ? 'ArrayBuffer'
        : typeof httpResponse.data,
    );
    // Без Content-Type данные обрабатываются как ArrayBuffer
  }

  /**
   * Пример обработки ответов без тела (204, 304)
   */
  static async noBodyResponseExample(): Promise<void> {
    // 204 No Content
    const noContentResponse = new Response(null, {
      status: 204,
      statusText: 'No Content',
      headers: {
        'X-Request-ID': 'req-12345',
      },
    });

    // 304 Not Modified
    const notModifiedResponse = new Response(null, {
      status: 304,
      statusText: 'Not Modified',
      headers: {
        ETag: '"abc123"',
        'Cache-Control': 'max-age=3600',
      },
    });

    const noContentResult = await HttpResponse.fromResponse(noContentResponse);
    const notModifiedResult =
      await HttpResponse.fromResponse(notModifiedResponse);

    console.log('No Body Response Examples:');
    console.log('204 No Content:');
    console.log('  Status:', noContentResult.status);
    console.log('  Data:', noContentResult.data);
    console.log('  Request ID:', noContentResult.headers['x-request-id']);

    console.log('304 Not Modified:');
    console.log('  Status:', notModifiedResult.status);
    console.log('  Data:', notModifiedResult.data);
    console.log('  ETag:', notModifiedResult.headers['etag']);
    console.log('  Cache Control:', notModifiedResult.headers['cache-control']);
  }
}
