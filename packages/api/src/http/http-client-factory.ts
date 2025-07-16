import type { IHttpClient, IHttpClientConfig } from '../types';
import { FetchHttpClient } from './fetch-http-client';

/**
 * Типы поддерживаемых HTTP-клиентов
 */
type HttpClientType = 'axios' | 'fetch';

/**
 * Фабрика для создания HTTP-клиентов
 */
export class HttpClientFactory {
  /**
   * Создать HTTP-клиент указанного типа
   */
  public static create(
    type: HttpClientType = 'fetch',
    config?: IHttpClientConfig,
  ): IHttpClient {
    switch (type) {
      case 'axios':
        // TODO: Implement axios client
        throw new Error('Axios client not implemented yet');
      case 'fetch':
        return new FetchHttpClient(config);
      default:
        throw new Error(`Unsupported HTTP client type: ${type}`);
    }
  }

  /**
   * Создать HTTP-клиент на основе доступности библиотек
   */
  public static createAuto(config?: IHttpClientConfig): IHttpClient {
    // Проверяем доступность axios
    try {
      require('axios');
      // TODO: Implement axios client
      throw new Error('Axios client not implemented yet');
    } catch {
      // Если axios недоступен, используем fetch
      return new FetchHttpClient(config);
    }
  }

  /**
   * Создать HTTP-клиент с предпочтением определенного типа
   */
  public static createWithFallback(
    preferredType: HttpClientType,
    fallbackType: HttpClientType = 'fetch',
    config?: IHttpClientConfig,
  ): IHttpClient {
    try {
      return this.create(preferredType, config);
    } catch {
      return this.create(fallbackType, config);
    }
  }
}
