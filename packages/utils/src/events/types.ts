/**
 * Типы для работы с событиями
 */

/**
 * Базовый тип для обработчиков событий (не зависит от DOM)
 * @template T - Тип данных для detail в событии
 */
export type EventListener<T = unknown> = (detail?: T) => void;

/**
 * Тип для обработчиков DOM событий
 * @template T - Тип данных для detail в событии
 */
export type CustomEventListener<T = unknown> = (event: CustomEvent<T>) => void;

/**
 * Интерфейс для базового EventEmitter
 * @template T - Тип данных для detail в событии
 */
export interface IEventEmitter<T = unknown> {
  on(eventName: string, listener: EventListener<T>): void;
  off(eventName: string, listener: EventListener<T>): void;
  emit(eventName: string, detail?: T): void;
}

/**
 * Интерфейс для DOM EventEmitter
 * @template T - Тип данных для detail в событии
 */
export interface IDocumentEventEmitter<T = unknown> {
  onDocument<T>(eventName: string, listener: CustomEventListener<T>): void;
  offDocument<T>(eventName: string, listener: CustomEventListener<T>): void;
  emit(eventName: string, detail?: T): void;
  removeAllListeners(eventName?: string): void;
}
