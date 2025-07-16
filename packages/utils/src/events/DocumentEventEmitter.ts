import { CustomEventListener, IDocumentEventEmitter } from './types';

/**
 * Класс для работы с событиями документа
 * Реализует паттерн Наблюдатель (Observer) для событий на уровне document
 * Использует Map с автоматической очисткой памяти при удалении слушателей
 */
export class DocumentEventEmitter<T = unknown>
  implements IDocumentEventEmitter<T>
{
  // Хранилище для DOM событий - используем Map для строковых ключей
  private documentEvents: Map<string, Set<CustomEventListener<unknown>>> =
    new Map();

  constructor() {
    // Привязываем контекст для корректной работы this в обработчиках
    this.handleDocumentEvent = this.handleDocumentEvent.bind(this);
  }

  /**
   * Вызов события
   * Диспатчит событие на уровне document
   * @param eventName - имя события
   * @param detail - дополнительные данные события
   */
  emit(eventName: string, detail?: T): void {
    // Диспатчим событие на уровне document
    document.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
  }

  /**
   * Подписка на событие документа
   * @param eventName - имя события документа
   * @param listener - обработчик события
   */
  onDocument<T>(eventName: string, listener: CustomEventListener<T>): void {
    // Добавляем слушатель в наше внутреннее хранилище
    this.addDocumentListener(eventName, listener);
    // Добавляем слушатель на document
    document.addEventListener(eventName, this.handleDocumentEvent, true);
  }

  /**
   * Отписка от события документа
   * @param eventName - имя события документа
   * @param listener - обработчик события для удаления
   */
  offDocument<T>(eventName: string, listener: CustomEventListener<T>): void {
    // Удаляем слушатель из нашего внутреннего хранилища
    this.removeDocumentListener(eventName, listener);
    // Удаляем слушатель с document
    document.removeEventListener(eventName, this.handleDocumentEvent, true);
  }

  /**
   * Удаление всех слушателей для указанного события или всех событий
   * @param eventName - имя события (если не указано, удаляет все слушатели)
   */
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      // Удаляем все слушатели для конкретного события
      this.removeAllListenersForEvent(eventName);
    } else {
      // Удаляем все слушатели для всех событий
      this.removeAllListenersForAllEvents();
    }
  }

  /**
   * Добавление слушателя документа (внутренняя реализация)
   * @param eventName - имя события
   * @param listener - обработчик события
   */
  private addDocumentListener<T>(
    eventName: string,
    listener: CustomEventListener<T>,
  ): void {
    if (!this.documentEvents.has(eventName)) {
      this.documentEvents.set(eventName, new Set());
    }
    // Безопасное приведение типов - все CustomEventListener совместимы в runtime
    this.documentEvents
      .get(eventName)
      ?.add(listener as CustomEventListener<unknown>);
  }

  /**
   * Удаление слушателя документа (внутренняя реализация)
   * @param eventName - имя события
   * @param listener - обработчик события для удаления
   */
  private removeDocumentListener<T>(
    eventName: string,
    listener: CustomEventListener<T>,
  ): void {
    const listeners = this.documentEvents.get(eventName);
    if (listeners) {
      // Безопасное приведение типов - все CustomEventListener совместимы в runtime
      listeners.delete(listener as CustomEventListener<unknown>);

      // Если больше нет слушателей для этого события, удаляем его из Map
      if (listeners.size === 0) {
        this.documentEvents.delete(eventName);
      }
    }
  }

  /**
   * Удаление всех слушателей для конкретного события
   * @param eventName - имя события
   */
  private removeAllListenersForEvent(eventName: string): void {
    const listeners = this.documentEvents.get(eventName);
    if (listeners) {
      // Очищаем все слушатели
      listeners.clear();
      // Удаляем событие из Map
      this.documentEvents.delete(eventName);
      // Удаляем слушатель с document
      document.removeEventListener(eventName, this.handleDocumentEvent, true);
    }
  }

  /**
   * Удаление всех слушателей для всех событий
   */
  private removeAllListenersForAllEvents(): void {
    this.documentEvents.forEach((_, eventName) => {
      this.removeAllListenersForEvent(eventName);
    });
  }

  /**
   * Type guard для проверки, что событие является CustomEvent с правильным типом
   * @param event - событие для проверки
   * @returns true если событие является CustomEvent
   */
  private isCustomEvent(event: Event): event is CustomEvent<T> {
    return event instanceof CustomEvent;
  }

  /**
   * Обработчик события документа
   * Передает событие всем подписчикам
   * @param {Event | CustomEvent<T>} event - Событие, полученное от document (может быть Event или CustomEvent)
   * @private
   */
  private handleDocumentEvent(event: Event | CustomEvent<T>): void {
    const listeners = this.documentEvents.get(event.type);
    if (listeners) {
      // Проверяем, что событие является CustomEvent
      if (this.isCustomEvent(event)) {
        // Если это CustomEvent, используем его напрямую
        listeners.forEach((listener) => listener(event));
      } else {
        // Если это обычное Event, создаем CustomEvent с пустым detail
        const customEvent = new CustomEvent<T>(event.type, {
          detail: undefined,
        });
        listeners.forEach((listener) => listener(customEvent));
      }
    }
  }
}

/**
 * Синглтон DocumentEventEmitter для глобальной обработки событий документа
 * Используется для централизованной работы с событиями на уровне document во всем приложении
 */
export default new DocumentEventEmitter();
