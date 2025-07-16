import type { IHttpRequest, RequestBody } from '../types';

/**
 * Класс для подготовки HTTP запросов
 * Инкапсулирует логику подготовки тела запроса и заголовков
 */
export class HttpRequest {
  private readonly request: IHttpRequest;
  private preparedBody: RequestBody<'prepared'>;
  private preparedHeaders: Record<string, string>;

  constructor(request: IHttpRequest) {
    this.request = request;
    this.preparedHeaders = { ...request.headers };
    this.prepareBody();
    this.prepareHeaders();
  }

  /**
   * Подготовка тела запроса
   */
  private prepareBody(): void {
    const { body } = this.request;

    if (!body) {
      this.preparedBody = undefined;
      return;
    }

    if (typeof body === 'string') {
      this.preparedBody = body;
    } else if (body instanceof FormData || body instanceof URLSearchParams) {
      // FormData и URLSearchParams передаются напрямую, браузер автоматически установит Content-Type
      this.preparedBody = body;
      // Удаляем Content-Type заголовок, чтобы браузер установил правильный
      delete this.preparedHeaders['Content-Type'];
    } else {
      // Объекты сериализуем в JSON
      this.preparedBody = JSON.stringify(body);
    }
  }

  /**
   * Подготовка заголовков
   */
  private prepareHeaders(): void {
    // Если тело запроса - JSON, устанавливаем Content-Type
    if (
      this.preparedBody &&
      typeof this.preparedBody === 'string' &&
      !this.preparedHeaders['Content-Type']
    ) {
      try {
        JSON.parse(this.preparedBody);
        this.preparedHeaders['Content-Type'] = 'application/json';
      } catch {
        // Если не JSON, оставляем как есть
      }
    }
  }

  /**
   * Получить подготовленный URL
   */
  get url(): string {
    return this.request.url;
  }

  /**
   * Получить метод запроса
   */
  get method(): string {
    return this.request.method;
  }

  /**
   * Получить подготовленные заголовки
   */
  get headers(): Record<string, string> {
    return this.preparedHeaders;
  }

  /**
   * Получить подготовленное тело запроса
   */
  get body(): RequestBody<'prepared'> {
    return this.preparedBody;
  }

  /**
   * Получить таймаут
   */
  get timeout(): number | undefined {
    return this.request.timeout;
  }

  /**
   * Получить сигнал отмены
   */
  get signal(): AbortSignal | undefined {
    return this.request.signal;
  }

  /**
   * Получить объект для передачи в fetch API
   */
  toFetchInit(): RequestInit {
    return {
      method: this.method,
      headers: this.headers,
      body: this.body,
      signal: this.signal,
    };
  }
}
