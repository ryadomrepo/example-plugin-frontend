import type { EventListener, IEventEmitter } from './types';

/**
 * Базовый класс для управления событиями
 * Реализует паттерн Наблюдатель (Observer)
 * Не зависит от DOM API
 */
export class EventEmitter<T = unknown> implements IEventEmitter<T> {
  // Хранилище событий и их обработчиков
  protected events: Map<string, Set<EventListener<T>>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * Подписка на событие
   * @param eventName - имя события
   * @param listener - обработчик события
   */
  on(eventName: string, listener: EventListener<T>): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)?.add(listener);
  }

  /**
   * Вызов события
   * @param eventName - имя события
   * @param detail - дополнительные данные события
   */
  emit(eventName: string, detail?: T): void {
    const listeners = this.events.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => listener(detail));
    }
  }

  /**
   * Отписка от события
   * @param eventName - имя события
   * @param listener - обработчик события для удаления
   */
  off(eventName: string, listener: EventListener<T>): void {
    const listeners = this.events.get(eventName);
    if (listeners) {
      listeners.delete(listener);
    }
  }
}

/**
 * Синглтон EventEmitter для глобальной обработки событий
 * Используется для централизованной работы с событиями во всем приложении
 */
export default new EventEmitter();
