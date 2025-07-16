import type { IHttpResponse } from '../types';

/**
 * HTTP статус коды, которые не должны содержать тело ответа
 * согласно RFC 7231 и другим спецификациям
 */
const NULL_BODY_STATUS_CODES = new Set([
  100, // Continue
  101, // Switching Protocols
  102, // Processing
  103, // Early Hints
  204, // No Content
  205, // Reset Content
  304, // Not Modified
]);

/**
 * Класс для обработки HTTP ответов
 * Инкапсулирует логику обработки различных типов контента и преобразования Response в IHttpResponse
 */
export class HttpResponse {
  /**
   * Создать IHttpResponse с автоматическим определением типа контента
   * Основной метод для создания типобезопасных HTTP ответов
   */
  static async fromResponse<T = unknown>(
    response: Response,
  ): Promise<IHttpResponse<T>> {
    // Проверяем, может ли статус код содержать тело ответа
    if (NULL_BODY_STATUS_CODES.has(response.status)) {
      // Приведение типов необходимо: null не может быть автоматически приведен к произвольному типу T
      // Это безопасно, поскольку для null-ответов мы не ожидаем данных
      return this.fromNullResponse(response) as Promise<IHttpResponse<T>>;
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return this.fromJsonResponse<T>(response);
    } else if (contentType?.includes('text/')) {
      // Приведение типов необходимо: string не может быть автоматически приведен к произвольному типу T
      // Это безопасно, поскольку текстовые данные могут быть интерпретированы как T
      return this.fromTextResponse(response) as Promise<IHttpResponse<T>>;
    } else {
      // Приведение типов необходимо: ArrayBuffer не может быть автоматически приведен к произвольному типу T
      // Это безопасно, поскольку бинарные данные могут быть интерпретированы как T
      return this.fromBinaryResponse(response) as Promise<IHttpResponse<T>>;
    }
  }

  /**
   * Создать IHttpResponse для ответов без тела
   */
  static async fromNullResponse(
    response: Response,
  ): Promise<IHttpResponse<null>> {
    return this.createResponse(response, null);
  }

  /**
   * Создать IHttpResponse с JSON данными
   */
  static async fromJsonResponse<T = unknown>(
    response: Response,
  ): Promise<IHttpResponse<T>> {
    const data = await response.json();
    return this.createResponse<T>(response, data);
  }

  /**
   * Создать IHttpResponse с текстовыми данными
   */
  static async fromTextResponse(
    response: Response,
  ): Promise<IHttpResponse<string>> {
    const data = await response.text();
    return this.createResponse(response, data);
  }

  /**
   * Создать IHttpResponse с бинарными данными
   */
  static async fromBinaryResponse(
    response: Response,
  ): Promise<IHttpResponse<ArrayBuffer>> {
    const data = await response.arrayBuffer();
    return this.createResponse(response, data);
  }

  /**
   * Создать базовый объект ответа
   */
  private static createResponse<T>(
    response: Response,
    data: T,
  ): IHttpResponse<T> {
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      ok: response.ok,
    };
  }
}
