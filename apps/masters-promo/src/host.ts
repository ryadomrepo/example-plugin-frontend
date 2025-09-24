import {
  createHostEventNames,
  createPluginEventNames,
} from '@yclients-plugins/utils';
import contract from '../../../contract.json';
import type { ContractConfig } from './types/contract';

const CONTAINER_ID = 'widget-masters-promo';
// Получаем области плагина из contract.json
const PLUGIN_AREAS = (contract as ContractConfig).packages['widget-masters-promo'].areas;

/**
 * Инициализация хоста плагина
 * Настраивает обработку событий между хостом и плагином
 */
export function initializeHost() {
  // Инициализируем для каждой области
  PLUGIN_AREAS.forEach((area) => {
    const PLUGIN_EVENT_NAMES = createPluginEventNames(area);
    const HOST_EVENT_NAMES = createHostEventNames(area);

    // Обработчик события готовности плагина
    document.addEventListener(PLUGIN_EVENT_NAMES.READY, (data) => {
      console.log(
        `[Host] Получено событие готовности плагина для области ${area}:`,
        data,
      );
    });

    // Обработчик события завершения работы плагина
    document.addEventListener(PLUGIN_EVENT_NAMES.SHUTDOWN, (data) => {
      console.log(
        `[Host] Получено событие завершения работы плагина для области ${area}:`,
        data,
      );
    });

    // Отправка события готовности хоста
    document.dispatchEvent(
      new CustomEvent(HOST_EVENT_NAMES.READY, {
        detail: {
          containerId: CONTAINER_ID,
        },
      }),
    );
  });
}
