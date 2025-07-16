import type { THostReadyPayload } from '../types/events';
import {
  getPluginRenderer,
  initializeDefaultRenderers,
} from './plugin-renderers';
import { AreaConstantsUtils } from '../utils';

/**
 * Адаптер для совместимости с существующим кодом
 * Преобразует новый интерфейс AreaRenderer в старый ZoneHandler
 */

export interface ZoneHandler {
  description: string;
  handler: (payload: THostReadyPayload, container: Element) => void;
}

/**
 * Инициализирует рендереры по умолчанию
 * Должна вызываться при инициализации плагина
 */
export function initializeRenderers(): void {
  initializeDefaultRenderers();
}

/**
 * Создает обработчики зон на основе зарегистрированных рендереров
 * @param areas - массив зон из contract.json
 * @returns объект с обработчиками зон
 */
export function createZoneHandlers(
  areas: string[],
): Record<string, ZoneHandler> {
  const handlers: Record<string, ZoneHandler> = {};

  // Инициализируем рендереры если еще не инициализированы
  initializeRenderers();

  // Создаем обработчики для каждой зоны
  areas.forEach((areaName, index) => {
    if (!areaName) return;

    // Определяем тип рендерера на основе позиции в массиве
    let rendererName: string;
    if (index === 0) {
      rendererName = AreaConstantsUtils.getControlArea();
    } else if (index === 1) {
      rendererName = AreaConstantsUtils.getDisplayArea();
    } else {
      console.warn(
        `[Plugin] Неизвестная зона с индексом ${index}: ${areaName}`,
      );
      return;
    }

    const renderer = getPluginRenderer(rendererName);
    if (!renderer) {
      console.error(`[Plugin] Не найден рендерер для зоны "${rendererName}"`);
      return;
    }

    handlers[areaName] = {
      description: renderer.description,
      handler: (payload: THostReadyPayload, container: Element) => {
        console.log(`[Plugin] Рендеринг зоны "${areaName}"`);

        renderer.render(areaName, container, payload);
      },
    };
  });

  return handlers;
}

/**
 * Получить обработчик для зоны
 * @param area - название зоны
 * @param areas - массив зон из contract.json
 * @returns обработчик зоны или null если не найден
 */
export function getZoneHandler(
  area: string,
  areas: string[],
): ZoneHandler | null {
  const handlers = createZoneHandlers(areas);
  return handlers[area] || null;
}
