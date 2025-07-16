/**
 * Конфигурация имен событий плагина
 */

import type {
  THostEventNames,
  TPluginEventNames,
} from '@yclients-plugins/utils';

import {
  createHostEventNames,
  createPluginEventNames,
} from '@yclients-plugins/utils';

import { PLUGIN_AREAS, type TPluginArea } from '../types/plugin-areas';

/**
 * Конфигуратор имен событий
 */
export class EventConfig {
  // Создаем имена событий для всех областей
  private static readonly HOST_EVENT_NAMES = Object.fromEntries(
    PLUGIN_AREAS.map((area) => [area, createHostEventNames(area)]),
  ) satisfies Record<TPluginArea, THostEventNames>;

  private static readonly PLUGIN_EVENT_NAMES = Object.fromEntries(
    PLUGIN_AREAS.map((area) => [area, createPluginEventNames(area)]),
  ) satisfies Record<TPluginArea, TPluginEventNames>;

  /**
   * Получение имен событий хоста для указанной области
   * @param area - область плагина
   * @returns имена событий хоста или null
   */
  static getHostEventNames(area: string): THostEventNames | null {
    if (!this.isAreaSupported(area)) {
      return null;
    }
    const eventNames = this.HOST_EVENT_NAMES[area];
    return eventNames ?? null;
  }

  /**
   * Получение имен событий плагина для указанной области
   * @param area - область плагина
   * @returns имена событий плагина или null
   */
  static getPluginEventNames(area: string): TPluginEventNames | null {
    if (!this.isAreaSupported(area)) {
      return null;
    }
    const eventNames = this.PLUGIN_EVENT_NAMES[area];
    return eventNames ?? null;
  }

  /**
   * Проверка поддержки области плагином
   * @param area - область для проверки
   * @returns true если область поддерживается
   */
  private static isAreaSupported(area: string): area is TPluginArea {
    return PLUGIN_AREAS.includes(area);
  }

  /**
   * Получение всех поддерживаемых областей плагина
   * @returns массив областей
   */
  static getSupportedAreas(): readonly TPluginArea[] {
    return PLUGIN_AREAS;
  }
}
