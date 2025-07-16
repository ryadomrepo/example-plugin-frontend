/**
 * Логгер событий плагина
 */

import type { TEventType, TEventDirection } from '../types/event-types';
import type { TPluginArea } from '../types/plugin-areas';

/**
 * Логгер событий плагина
 */
export class EventLogger {
  /**
   * Логирование подписки на события
   * @param direction - направление события (host/plugin)
   * @param eventType - тип события (READY/UPDATE/SHUTDOWN)
   * @param area - область плагина
   */
  static logSubscription(
    direction: TEventDirection,
    eventType: TEventType,
    area: TPluginArea,
  ): void {
    console.log(
      `[EventLogger] Подписка на события ${direction}:${eventType.toLowerCase()} для области: ${area}`,
    );
  }

  /**
   * Логирование отписки от событий
   * @param direction - направление события (host/plugin)
   * @param eventType - тип события (READY/UPDATE/SHUTDOWN)
   * @param area - область плагина
   */
  static logUnsubscription(
    direction: TEventDirection,
    eventType: TEventType,
    area: TPluginArea,
  ): void {
    console.log(
      `[EventLogger] Отписка от событий ${direction}:${eventType.toLowerCase()} для области: ${area}`,
    );
  }

  /**
   * Логирование отправки событий
   * @param direction - направление события (host/plugin)
   * @param eventType - тип события (READY/UPDATE/SHUTDOWN)
   * @param area - область плагина
   * @param payload - данные события
   */
  static logEmission<T>(
    direction: TEventDirection,
    eventType: TEventType,
    area: TPluginArea,
    payload: T,
  ): void {
    console.log(
      `[EventLogger] Отправлено событие ${direction}:${eventType.toLowerCase()} для области: ${area}`,
      payload,
    );
  }

  /**
   * Логирование начала очистки
   */
  static logCleanupStart(): void {
    console.log('[EventLogger] Начало очистки всех подписок');
  }

  /**
   * Логирование отписки от событий хоста
   * @param area - область плагина
   */
  static logHostUnsubscription(area: TPluginArea): void {
    console.log(`[EventLogger] Отписка от событий хоста для области: ${area}`);
  }

  /**
   * Логирование отписки от событий плагина
   * @param area - область плагина
   */
  static logPluginUnsubscription(area: TPluginArea): void {
    console.log(
      `[EventLogger] Отписка от событий плагина для области: ${area}`,
    );
  }

  /**
   * Логирование завершения очистки
   */
  static logCleanupComplete(): void {
    console.log('[EventLogger] Все подписки очищены');
  }

  /**
   * Логирование ошибки валидации области
   * @param area - область плагина
   */
  static logAreaValidationError(area: string): void {
    console.error(`[EventLogger] Неподдерживаемая область: ${area}`);
  }

  /**
   * Логирование ошибки валидации данных
   * @param payload - данные события
   */
  static logPayloadValidationError(payload: unknown): void {
    console.error('[EventLogger] Некорректные данные события:', payload);
  }
}
