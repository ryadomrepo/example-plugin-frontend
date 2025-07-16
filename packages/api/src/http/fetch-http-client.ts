import { AbstractHttpClient } from './abstract-http-client';
import { HttpRequest } from './http-request';
import { HttpResponse } from './http-response';
import type { IHttpRequest, IHttpResponse } from '../types';

/**
 * Реализация HTTP-клиента на основе Fetch API
 */
export class FetchHttpClient extends AbstractHttpClient {
  /**
   * Выполнить HTTP-запрос используя Fetch API
   */
  protected async executeRequest<T>(
    request: IHttpRequest,
  ): Promise<IHttpResponse<T>> {
    const { timeout } = request;

    // Создаем AbortController для таймаута
    const controller = new AbortController();
    const timeoutId = timeout
      ? setTimeout(() => controller.abort(), timeout)
      : null;

    try {
      // Подготавливаем запрос
      const httpRequest = new HttpRequest(request);

      // Выполняем запрос
      const response = await fetch(httpRequest.url, {
        // TODO: PFB-367
        ...httpRequest.toFetchInit(),
        signal: httpRequest.signal || controller.signal,
      });

      // Обрабатываем ответ через HttpResponse
      const httpResponse = await HttpResponse.fromResponse<T>(response);

      return httpResponse;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
