import type {
  IHttpClient,
  IHttpRequest,
  IHttpResponse,
  IHttpClientConfig,
  IHttpInterceptor,
  IHttpRequestOptions,
  IHttpRetryConfig,
  RequestBody,
} from '../types';

/**
 * Абстрактный базовый класс для HTTP-клиента
 * Предоставляет общую логику для всех реализаций HTTP-клиентов
 */
export abstract class AbstractHttpClient implements IHttpClient {
  protected config: IHttpClientConfig;
  protected interceptors: IHttpInterceptor[] = [];

  constructor(config: IHttpClientConfig = {}) {
    this.config = {
      timeout: 30000,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      retry: {
        count: 3,
        delay: 1000,
      },
      ...config,
    };
  }

  /**
   * Основной метод для выполнения HTTP-запросов
   */
  public async request<T = unknown>(
    config: IHttpRequest,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>> {
    // Применяем конфигурацию по умолчанию
    const requestConfig = this.mergeConfig(config);

    // Применяем интерцепторы запроса
    let processedRequest = await this.applyRequestInterceptors(requestConfig);

    // Получаем конфигурацию retry
    const retryConfig = this.getRetryConfig(options);

    // Выполняем запрос с повторными попытками или без них
    const response =
      retryConfig.count === 0
        ? await this.executeRequest<T>(processedRequest)
        : await this.executeWithRetry<T>(processedRequest, options);

    // Применяем интерцепторы ответа
    return await this.applyResponseInterceptors(response);
  }

  /**
   * GET запрос
   */
  public async get<T = unknown>(
    url: string,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>> {
    return this.request<T>(
      {
        method: 'GET',
        url,
        ...config,
      },
      options,
    );
  }

  /**
   * POST запрос
   */
  public async post<T = unknown>(
    url: string,
    data?: RequestBody<'input'>,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>> {
    return this.request<T>(
      {
        method: 'POST',
        url,
        body: data,
        ...config,
      },
      options,
    );
  }

  /**
   * PUT запрос
   */
  public async put<T = unknown>(
    url: string,
    data?: RequestBody<'input'>,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>> {
    return this.request<T>(
      {
        method: 'PUT',
        url,
        body: data,
        ...config,
      },
      options,
    );
  }

  /**
   * PATCH запрос
   */
  public async patch<T = unknown>(
    url: string,
    data?: RequestBody<'input'>,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>> {
    return this.request<T>(
      {
        method: 'PATCH',
        url,
        body: data,
        ...config,
      },
      options,
    );
  }

  /**
   * DELETE запрос
   */
  public async delete<T = unknown>(
    url: string,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>> {
    return this.request<T>(
      {
        method: 'DELETE',
        url,
        ...config,
      },
      options,
    );
  }

  /**
   * Добавить интерцептор
   */
  public addInterceptor(interceptor: IHttpInterceptor): void {
    this.interceptors.push(interceptor);
  }

  /**
   * Удалить интерцептор
   */
  public removeInterceptor(interceptor: IHttpInterceptor): void {
    const index = this.interceptors.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.splice(index, 1);
    }
  }

  /**
   * Очистить все интерцепторы
   */
  public clearInterceptors(): void {
    this.interceptors = [];
  }

  /**
   * Абстрактный метод для выполнения HTTP-запроса
   * Должен быть реализован в конкретных классах
   */
  protected abstract executeRequest<T>(
    request: IHttpRequest,
  ): Promise<IHttpResponse<T>>;

  /**
   * Объединить конфигурацию запроса с настройками по умолчанию
   */
  private mergeConfig(config: IHttpRequest): IHttpRequest {
    const fullUrl = config.url.startsWith('http')
      ? config.url
      : `${this.config.baseURL || ''}${config.url}`;

    return {
      url: fullUrl,
      method: config.method,
      headers: {
        ...this.config.defaultHeaders,
        ...config.headers,
      },
      body: config.body,
      timeout: config.timeout || this.config.timeout,
      signal: config.signal,
    };
  }

  /**
   * Применить интерцепторы запроса
   */
  private async applyRequestInterceptors(
    request: IHttpRequest,
  ): Promise<IHttpRequest> {
    let processedRequest = request;

    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        const result = interceptor.onRequest(processedRequest);
        processedRequest = result instanceof Promise ? await result : result;
      }
    }

    return processedRequest;
  }

  /**
   * Применить интерцепторы ответа
   */
  private async applyResponseInterceptors<T>(
    response: IHttpResponse<T>,
  ): Promise<IHttpResponse<T>> {
    let processedResponse = response;

    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        const result = interceptor.onResponse(processedResponse);
        processedResponse = result instanceof Promise ? await result : result;
      }
    }

    return processedResponse;
  }

  /**
   * Выполнить запрос с повторными попытками
   */
  private async executeWithRetry<T>(
    request: IHttpRequest,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>> {
    const retryConfig = this.getRetryConfig(options);

    let lastError: unknown;

    for (let attempt = 0; attempt <= retryConfig.count; attempt++) {
      try {
        return await this.executeRequest<T>(request);
      } catch (error) {
        lastError = error;

        // Применяем интерцепторы ошибок
        for (const interceptor of this.interceptors) {
          if (interceptor.onError) {
            const result = interceptor.onError(error);
            error = result instanceof Promise ? await result : result;
          }
        }

        // Если это последняя попытка или запрос был отменен, выбрасываем ошибку
        if (attempt === retryConfig.count || this.isAbortError(error)) {
          throw error;
        }

        // Ждем перед следующей попыткой с экспоненциальной задержкой
        const delay = retryConfig.delay * Math.pow(2, attempt);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Получить конфигурацию retry для запроса
   */
  private getRetryConfig(options?: IHttpRequestOptions): IHttpRetryConfig {
    const defaultRetry = this.config.retry || {
      count: 0,
      delay: 1000,
    };

    if (!options?.retry) {
      return defaultRetry;
    }

    return {
      ...defaultRetry,
      ...options.retry,
    };
  }

  /**
   * Проверить, является ли ошибка ошибкой отмены запроса
   */
  private isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
  }

  /**
   * Задержка выполнения
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
