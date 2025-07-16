/**
 * Эмиттер событий для плагина timetable-record-client-name
 *
 * Объединяет все три типа событий в один эмиттер:
 * - События от хоста к плагину (THostReadyEvent, THostUpdateEvent, THostShutdownEvent)
 * - События от плагина к хосту (TPluginReadyEvent, TPluginUpdateEvent, TPluginShutdownEvent)
 * - События от плагина к плагину (TPluginUpdateEvent)
 */

import type { CustomEventListener } from '@yclients-plugins/utils';

import type {
  THostReadyEvent,
  THostUpdateEvent,
  THostShutdownEvent,
  TPluginReadyEvent,
  TPluginUpdateEvent,
  TPluginShutdownEvent,
} from '../types/events';

import { EventManager } from './core/event-manager';
import { EventLogger } from './loggers/event-logger';
import type { TPluginArea } from './types/plugin-areas';

/**
 * Эмиттер событий для плагина timetable-record-client-name
 * Наследуется от EventManager для использования общей логики управления событиями
 */
export class PluginEventEmitter extends EventManager {
  // Методы для событий хоста
  onHostReady(
    area: TPluginArea,
    listener: CustomEventListener<THostReadyEvent>,
  ): void {
    this.subscribe('host', 'READY', area, listener);
  }

  offHostReady(
    area: TPluginArea,
    listener: CustomEventListener<THostReadyEvent>,
  ): void {
    this.unsubscribe('host', 'READY', area, listener);
  }

  emitHostReady(area: TPluginArea, payload: THostReadyEvent): void {
    this.emitEvent('host', 'READY', area, payload);
  }

  onHostUpdate(
    area: TPluginArea,
    listener: CustomEventListener<THostUpdateEvent>,
  ): void {
    this.subscribe('host', 'UPDATE', area, listener);
  }

  offHostUpdate(
    area: TPluginArea,
    listener: CustomEventListener<THostUpdateEvent>,
  ): void {
    this.unsubscribe('host', 'UPDATE', area, listener);
  }

  emitHostUpdate(area: TPluginArea, payload: THostUpdateEvent): void {
    this.emitEvent('host', 'UPDATE', area, payload);
  }

  onHostShutdown(
    area: TPluginArea,
    listener: CustomEventListener<THostShutdownEvent>,
  ): void {
    this.subscribe('host', 'SHUTDOWN', area, listener);
  }

  offHostShutdown(
    area: TPluginArea,
    listener: CustomEventListener<THostShutdownEvent>,
  ): void {
    this.unsubscribe('host', 'SHUTDOWN', area, listener);
  }

  emitHostShutdown(area: TPluginArea, payload: THostShutdownEvent): void {
    this.emitEvent('host', 'SHUTDOWN', area, payload);
  }

  // Методы для событий плагина
  onPluginReady(
    area: TPluginArea,
    listener: CustomEventListener<TPluginReadyEvent>,
  ): void {
    this.subscribe('plugin', 'READY', area, listener);
  }

  offPluginReady(
    area: TPluginArea,
    listener: CustomEventListener<TPluginReadyEvent>,
  ): void {
    this.unsubscribe('plugin', 'READY', area, listener);
  }

  emitPluginReady(area: TPluginArea, payload: TPluginReadyEvent): void {
    this.emitEvent('plugin', 'READY', area, payload);
  }

  onPluginUpdate(
    area: TPluginArea,
    listener: CustomEventListener<TPluginUpdateEvent>,
  ): void {
    this.subscribe('plugin', 'UPDATE', area, listener);
  }

  offPluginUpdate(
    area: TPluginArea,
    listener: CustomEventListener<TPluginUpdateEvent>,
  ): void {
    this.unsubscribe('plugin', 'UPDATE', area, listener);
  }

  emitPluginUpdate(area: TPluginArea, payload: TPluginUpdateEvent): void {
    this.emitEvent('plugin', 'UPDATE', area, payload);
  }

  onPluginShutdown(
    area: TPluginArea,
    listener: CustomEventListener<TPluginShutdownEvent>,
  ): void {
    this.subscribe('plugin', 'SHUTDOWN', area, listener);
  }

  offPluginShutdown(
    area: TPluginArea,
    listener: CustomEventListener<TPluginShutdownEvent>,
  ): void {
    this.unsubscribe('plugin', 'SHUTDOWN', area, listener);
  }

  emitPluginShutdown(area: TPluginArea, payload: TPluginShutdownEvent): void {
    this.emitEvent('plugin', 'SHUTDOWN', area, payload);
  }

  /**
   * Очистка всех подписок
   * Используется при уничтожении плагина
   */
  cleanup(): void {
    EventLogger.logCleanupStart();

    // Очищаем все подписки для всех областей
    this.getSupportedAreas().forEach((area) => {
      const hostEventNames = this.getHostEventNames(area);
      const pluginEventNames = this.getPluginEventNames(area);

      if (hostEventNames) {
        // Удаляем все слушатели для событий хоста
        this.eventEmitter.removeAllListeners(hostEventNames.READY);
        this.eventEmitter.removeAllListeners(hostEventNames.UPDATE);
        this.eventEmitter.removeAllListeners(hostEventNames.SHUTDOWN);

        EventLogger.logHostUnsubscription(area);
      }

      if (pluginEventNames) {
        // Удаляем все слушатели для событий плагина
        this.eventEmitter.removeAllListeners(pluginEventNames.READY);
        this.eventEmitter.removeAllListeners(pluginEventNames.UPDATE);
        this.eventEmitter.removeAllListeners(pluginEventNames.SHUTDOWN);

        EventLogger.logPluginUnsubscription(area);
      }
    });

    EventLogger.logCleanupComplete();
  }
}

/**
 * Синглтон оптимизированного эмиттера событий для плагина timetable-record-client-name
 */
export const pluginEventEmitter = new PluginEventEmitter();
