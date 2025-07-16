/**
 * Модуль для инициализации хоста плагина
 *
 * Этот модуль настраивает обработку событий между хостом и плагином
 * и отправляет события готовности хоста для всех областей.
 */

// Импортируем contract.json для получения PLUGIN_AREA
import contract from '@/contract.json';

import { findContainersForArea } from './configs/areas';
import { pluginEventEmitter } from './emitters';

import type {
  THostReadyEvent,
  TPluginReadyEvent,
  TPluginShutdownEvent,
} from './types/events';

const PLUGIN_AREAS = contract.packages['timetable-record-client-name'].areas;

/**
 * Обработчик события готовности плагина
 * @param event - событие готовности плагина
 */
const handlePluginReadyEvent = (event: CustomEvent<TPluginReadyEvent>) => {
  console.log('[Host] Получено событие готовности плагина:', event);
  console.log('[Host] Имя события:', event.type);
  console.log('[Host] Область:', event.detail.area);
  console.log('[Host] Container ID:', event.detail.containerId);
};

/**
 * Обработчик события завершения работы плагина
 * @param event - событие завершения работы плагина
 */
const handlePluginShutdownEvent = (
  event: CustomEvent<TPluginShutdownEvent>,
) => {
  console.log('[Host] Получено событие завершения работы плагина:', event);
  console.log('[Host] Имя события:', event.type);
  console.log('[Host] Область:', event.detail.area);
  console.log('[Host] Container ID:', event.detail.containerId);
};

/**
 * Инициализация хоста плагина
 * Настраивает обработку событий между хостом и плагином
 */
export function initializeHost() {
  console.log('[Host] Инициализация хоста плагина');
  console.log(
    '[Host] Поддерживаемые области:',
    pluginEventEmitter.getSupportedAreas(),
  );

  // Подписываемся на события плагина для всех областей
  pluginEventEmitter.getSupportedAreas().forEach((area) => {
    console.log(`[Host] Подписка на события плагина для области: ${area}`);

    // Подписка на событие готовности плагина
    pluginEventEmitter.onPluginReady(area, handlePluginReadyEvent);

    // Подписка на событие завершения работы плагина
    pluginEventEmitter.onPluginShutdown(area, handlePluginShutdownEvent);
  });

  // Отправка события готовности хоста для всех найденных контейнеров
  pluginEventEmitter.getSupportedAreas().forEach((area) => {
    const containerIds = findContainersForArea(area);
    console.log(
      `[Host] Найдено ${containerIds.length} контейнеров для области: ${area}`,
    );
    containerIds.forEach((containerId) => {
      console.log(
        `[Host] Отправка события готовности хоста для области: ${area}`,
      );
      console.log(`[Host] Container ID: ${containerId}`);

      const hostReadyPayload: THostReadyEvent = {
        area: area,
        containerId: containerId,
        payload: {
          clientName: 'John',
          clientSurname: 'Doe',
          clientPatronymic: 'Jhozef',
        },
      };

      pluginEventEmitter.emitHostReady(area, hostReadyPayload);
    });
  });

  console.log('[Host] Инициализация хоста завершена');
}

/**
 * Очистка ресурсов хоста
 * Отписывается от всех событий и очищает эмиттер
 */
export function cleanupHost() {
  console.log('[Host] Начало очистки ресурсов хоста');

  // Отписываемся от всех событий плагина
  PLUGIN_AREAS.forEach((area) => {
    console.log(`[Host] Отписка от событий плагина для области: ${area}`);
    pluginEventEmitter.offPluginReady(area, handlePluginReadyEvent);
    pluginEventEmitter.offPluginShutdown(area, handlePluginShutdownEvent);
  });

  // Очищаем эмиттер
  pluginEventEmitter.cleanup();

  console.log('[Host] Очистка ресурсов хоста завершена');
}
