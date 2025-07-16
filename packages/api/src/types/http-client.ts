/**
 * HTTP методы
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Универсальный тип тела запроса
 *
 * При использовании в IHttpRequest.body - может быть string | object | FormData | URLSearchParams
 * При использовании после обработки - может быть string | FormData | URLSearchParams | undefined
 *
 * @template T - 'input' для входного типа, 'prepared' для подготовленного типа
 */
export type RequestBody<T extends 'input' | 'prepared' = 'input'> =
  T extends 'input'
    ? string | object | FormData | URLSearchParams
    : string | FormData | URLSearchParams | undefined;

/**
 * Конфигурация retry для HTTP-запросов
 */
export interface IHttpRetryConfig {
  /** Количество повторных попыток */
  count: number;
  /** Задержка между попытками в миллисекундах */
  delay: number;
}

/**
 * Конфигурация HTTP-клиента
 *
 * Это глобальная конфигурация, которая устанавливается при создании HTTP-клиента и применяется ко всем запросам по умолчанию.
 */
export interface IHttpClientConfig {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retry?: IHttpRetryConfig;
}

/**
 * HTTP запрос
 */
export interface IHttpRequest {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: RequestBody<'input'>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * HTTP ответ
 */
export interface IHttpResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  ok: boolean;
}

/**
 * Интерфейс для интерцепторов HTTP-клиента
 */
export interface IHttpInterceptor {
  onRequest?: (request: IHttpRequest) => IHttpRequest | Promise<IHttpRequest>;
  onResponse?: <T>(
    response: IHttpResponse<T>,
  ) => IHttpResponse<T> | Promise<IHttpResponse<T>>;
  onError?: (error: unknown) => unknown | Promise<unknown>;
}

/**
 * Опции HTTP запроса
 *
 * Это опции для конкретного запроса, которые позволяют переопределить глобальные настройки для отдельного запроса.
 */
export interface IHttpRequestOptions {
  retry?: IHttpRetryConfig;
}

/**
 * Интерфейс для HTTP-клиента
 */
export interface IHttpClient {
  /**
   * Основной метод для выполнения HTTP-запросов
   */
  request<T = unknown>(
    config: IHttpRequest,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>>;

  /**
   * GET запрос
   */
  get<T = unknown>(
    url: string,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>>;

  /**
   * POST запрос
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>>;

  /**
   * PUT запрос
   */
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>>;

  /**
   * PATCH запрос
   */
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>>;

  /**
   * DELETE запрос
   */
  delete<T = unknown>(
    url: string,
    config?: Partial<IHttpRequest>,
    options?: IHttpRequestOptions,
  ): Promise<IHttpResponse<T>>;

  /**
   * Добавить интерцептор
   */
  addInterceptor(interceptor: IHttpInterceptor): void;

  /**
   * Удалить интерцептор
   */
  removeInterceptor(interceptor: IHttpInterceptor): void;

  /**
   * Очистить все интерцепторы
   */
  clearInterceptors(): void;
}
