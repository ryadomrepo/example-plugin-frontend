import {
  createHostEventNames,
  createPluginEventNames,
} from '@yclients-plugins/utils';

import contract from '@/contract.json';

const CONTAINER_ID = 'client-loyalty-card';
const PLUGIN_AREAS = contract.packages[CONTAINER_ID].areas;

export function initializeHost() {
  // Инициализируем для каждой области
  PLUGIN_AREAS.forEach((area) => {
    const PLUGIN_EVENT_NAMES = createPluginEventNames(area);
    const HOST_EVENT_NAMES = createHostEventNames(area);

    document.addEventListener(PLUGIN_EVENT_NAMES.READY, (data) => {
      console.log(
        `[Host] Получено событие готовности плагина для области ${area}:`,
        data,
      );
    });

    document.addEventListener(PLUGIN_EVENT_NAMES.SHUTDOWN, (data) => {
      console.log(
        `[Host] Получено событие завершения работы плагина для области ${area}:`,
        data,
      );
    });

    document.dispatchEvent(
      new CustomEvent(HOST_EVENT_NAMES.READY, {
        detail: {
          containerId: CONTAINER_ID,
          payload: null,
        },
      }),
    );
  });
}
