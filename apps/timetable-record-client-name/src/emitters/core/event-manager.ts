/**
 * Базовый менеджер событий плагина
 */

import type {
  CustomEventListener,
  THostEventNames,
  TPluginEventNames,
} from '@yclients-plugins/utils';
import { DocumentEventEmitter } from '@yclients-plugins/utils';

import type { TEventType, TEventDirection } from '../types/event-types';
import type { TPluginArea } from '../types/plugin-areas';
import { EventValidator } from '../validators/event-validator';
import { EventConfig } from '../config/event-config';
import { EventLogger } from '../loggers/event-logger';

/**
 * Базовый менеджер событий
 */
export abstract class EventManager {
  protected eventEmitter: DocumentEventEmitter;

  constructor() {
    this.eventEmitter = new DocumentEventEmitter();
  }

  /**
   * Универсальный метод для подписки на события
   * @param direction - направление события (host/plugin)
   * @param eventType - тип события (READY/UPDATE/SHUTDOWN)
   * @param area - область плагина
   * @param listener - обработчик события
   */
  protected subscribe<T>(
    direction: TEventDirection,
    eventType: TEventType,
    area: TPluginArea,
    listener: CustomEventListener<T>,
  ): void {
    if (!EventValidator.validateArea(area)) return;

    const eventNames =
      direction === 'host'
        ? EventConfig.getHostEventNames(area)
        : EventConfig.getPluginEventNames(area);

    if (eventNames && eventNames[eventType]) {
      this.eventEmitter.onDocument(eventNames[eventType], listener);
      EventLogger.logSubscription(direction, eventType, area);
    }
  }

  /**
   * Универсальный метод для отписки от событий
   * @param direction - направление события (host/plugin)
   * @param eventType - тип события (READY/UPDATE/SHUTDOWN)
   * @param area - область плагина
   * @param listener - обработчик события
   */
  protected unsubscribe<T>(
    direction: TEventDirection,
    eventType: TEventType,
    area: TPluginArea,
    listener: CustomEventListener<T>,
  ): void {
    if (!EventValidator.validateArea(area)) return;

    const eventNames =
      direction === 'host'
        ? EventConfig.getHostEventNames(area)
        : EventConfig.getPluginEventNames(area);

    if (eventNames && eventNames[eventType]) {
      this.eventEmitter.offDocument(eventNames[eventType], listener);
      EventLogger.logUnsubscription(direction, eventType, area);
    }
  }

  /**
   * Универсальный метод для отправки событий
   * @param direction - направление события (host/plugin)
   * @param eventType - тип события (READY/UPDATE/SHUTDOWN)
   * @param area - область плагина
   * @param payload - данные события
   */
  protected emitEvent<T>(
    direction: TEventDirection,
    eventType: TEventType,
    area: TPluginArea,
    payload: T,
  ): void {
    if (
      !EventValidator.validateArea(area) ||
      !EventValidator.validatePayload(payload)
    ) {
      return;
    }

    const eventNames =
      direction === 'host'
        ? EventConfig.getHostEventNames(area)
        : EventConfig.getPluginEventNames(area);

    if (eventNames && eventNames[eventType]) {
      this.eventEmitter.emit(eventNames[eventType], payload);
      EventLogger.logEmission(direction, eventType, area, payload);
    }
  }

  /**
   * Получение всех поддерживаемых областей плагина
   * @returns массив областей
   */
  getSupportedAreas(): readonly TPluginArea[] {
    return EventValidator.getSupportedAreas();
  }

  /**
   * Проверка поддержки области плагином
   * @param area - область для проверки
   * @returns true если область поддерживается
   */
  isAreaSupported(area: string): area is TPluginArea {
    return EventValidator.isAreaSupported(area);
  }

  /**
   * Получение имен событий хоста для указанной области
   * @param area - область плагина
   * @returns имена событий хоста или undefined
   */
  getHostEventNames(area: string): THostEventNames | null {
    return EventConfig.getHostEventNames(area);
  }

  /**
   * Получение имен событий плагина для указанной области
   * @param area - область плагина
   * @returns имена событий плагина или undefined
   */
  getPluginEventNames(area: string): TPluginEventNames | null {
    return EventConfig.getPluginEventNames(area);
  }

  /**
   * Абстрактный метод для очистки ресурсов
   */
  abstract cleanup(): void;
}
