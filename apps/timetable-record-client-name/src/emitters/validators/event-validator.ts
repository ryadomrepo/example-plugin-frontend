/**
 * Валидатор событий и областей плагина
 */

import { PLUGIN_AREAS, type TPluginArea } from '../types/plugin-areas';
import { EventLogger } from '../loggers/event-logger';

/**
 * Валидатор событий плагина
 */
export class EventValidator {
  /**
   * Валидирует область плагина
   * @param area - область для валидации
   * @returns true если область валидна
   */
  static validateArea(area: string): area is TPluginArea {
    const isValid = PLUGIN_AREAS.includes(area);
    if (!isValid) {
      EventLogger.logAreaValidationError(area);
    }
    return isValid;
  }

  /**
   * Валидирует данные события
   * @param payload - данные для валидации
   * @returns true если данные валидны
   */
  static validatePayload(payload: unknown): boolean {
    // TODO: Переделать на более точную валидацию, поскольку в payload может быть null
    if (!payload || typeof payload !== 'object') {
      EventLogger.logPayloadValidationError(payload);
      return false;
    }
    return true;
  }

  /**
   * Получение всех поддерживаемых областей плагина
   * @returns массив областей
   */
  static getSupportedAreas(): readonly TPluginArea[] {
    return PLUGIN_AREAS;
  }

  /**
   * Проверка поддержки области плагином
   * @param area - область для проверки
   * @returns true если область поддерживается
   */
  static isAreaSupported(area: string): area is TPluginArea {
    return this.validateArea(area);
  }
}
