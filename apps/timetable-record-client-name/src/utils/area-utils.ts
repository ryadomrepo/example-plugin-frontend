/**
 * Утилиты для работы с областями плагина
 * Общий утилитарный класс для работы с зонами
 */

import contract from '@/contract.json';

/**
 * Константа с областями плагина из contract.json
 */
export const PLUGIN_AREAS =
  contract.packages['timetable-record-client-name'].areas;

/**
 * Тип области плагина на основе данных из contract.json
 */
export type TPluginArea = (typeof PLUGIN_AREAS)[number];

/**
 * Константы зон для удобства использования
 * Используйте эти константы вместо хардкода названий зон
 */
export const AREA_CONSTANTS = {
  /** Зона управления (checkbox) - первая зона в contract.json */
  CONTROL: PLUGIN_AREAS[0]!,
  /** Зона отображения имени клиента - вторая зона в contract.json */
  DISPLAY: PLUGIN_AREAS[1]!,
} as const;

/**
 * Утилиты для работы с зонами
 */
export class AreaConstantsUtils {
  /**
   * Получить все зоны плагина
   */
  static getAllAreas(): readonly TPluginArea[] {
    return PLUGIN_AREAS;
  }

  /**
   * Получить зону управления
   */
  static getControlArea(): TPluginArea {
    return AREA_CONSTANTS.CONTROL;
  }

  /**
   * Получить зону отображения
   */
  static getDisplayArea(): TPluginArea {
    return AREA_CONSTANTS.DISPLAY;
  }

  /**
   * Проверить, является ли зона зоной управления
   */
  static isControlArea(area: string): area is TPluginArea {
    return area === AREA_CONSTANTS.CONTROL;
  }

  /**
   * Проверить, является ли зона зоной отображения
   */
  static isDisplayArea(area: string): area is TPluginArea {
    return area === AREA_CONSTANTS.DISPLAY;
  }

  /**
   * Получить индекс зоны в массиве
   */
  static getAreaIndex(area: string): number {
    return PLUGIN_AREAS.indexOf(area as TPluginArea);
  }

  /**
   * Получить зону по индексу
   */
  static getAreaByIndex(index: number): TPluginArea | undefined {
    return PLUGIN_AREAS[index];
  }

  /**
   * Проверить, что зона поддерживается плагином
   */
  static isSupportedArea(area: string): area is TPluginArea {
    return PLUGIN_AREAS.includes(area);
  }
}
