import {
  createHostEventNames,
  createPluginEventNames,
  DocumentEventEmitter,
  THostEventNames,
} from '@yclients-plugins/utils';

import type { THostReadyEvent, TPluginReadyEvent } from './types/events';

import { createApp } from 'vue';
import App from './app.vue';

// Импортируем contract.json для получения PLUGIN_AREAS
import contract from '@/contract.json';

const PLUGIN_AREAS = contract.packages['client-loyalty-card'].areas;

// Создаем имена событий хоста для всех областей
const HOST_EVENT_NAMES = Object.fromEntries(
  PLUGIN_AREAS.map((area) => [area, createHostEventNames(area)]),
) satisfies Record<string, THostEventNames>;

const hostEventEmitter = new DocumentEventEmitter<THostReadyEvent>();

const pluginEventEmitter = new DocumentEventEmitter<TPluginReadyEvent>();

/**
 * Обработчик события готовности хоста
 * @param event - событие готовности хоста
 */
const handleHostReadyEvent = (event: CustomEvent<THostReadyEvent>): void => {
  console.log('[Plugin] Получено событие готовности хоста:', event);
  const { containerId } = event.detail;

  const app = createApp(App);
  app.config.errorHandler = (err) => {
    console.error('[Plugin] Ошибка в Vue приложении:', err);
  };
  app.mount(`[data-plugin-container="${containerId}"]`);

  // Создаем уникальные имена событий плагина для данного контейнера
  // Это позволяет избежать конфликтов при множественной инициализации
  const PLUGIN_EVENT_NAMES = createPluginEventNames(containerId);

  pluginEventEmitter.emit(PLUGIN_EVENT_NAMES.READY, {
    payload: null,
  });
};

/**
 * Обработчик события жизненного цикла window
 * Используется для очистки ресурсов при выгрузке страницы
 */
const handleBeforeUnload = (): void => {
  console.log('[Plugin] Страница выгружается, выполняем очистку');
  cleanupPlugin();
};

/**
 * Функция отписки от всех событий
 * Должна вызываться при уничтожении плагина для предотвращения утечек памяти
 */
export function cleanupPlugin(): void {
  console.log('[Plugin] Отписка от событий хоста и плагина');

  // Отписываемся от событий готовности хоста для всех областей
  PLUGIN_AREAS.forEach((area) => {
    const hostEventNames = HOST_EVENT_NAMES[area];
    if (hostEventNames) {
      hostEventEmitter.offDocument(hostEventNames.READY, handleHostReadyEvent);
    }
  });

  // Отписываемся от события жизненного цикла window
  window.removeEventListener('beforeunload', handleBeforeUnload);
}

/**
 * Инициализация приложения
 * Создает Vue приложение и настраивает обработку событий
 * @returns {Function} Функция для отписки от событий
 */
export function initializePlugin(): () => void {
  console.log('[Plugin] Инициализация плагина');

  // Подписываемся на события готовности хоста для всех областей
  PLUGIN_AREAS.forEach((area) => {
    const hostEventNames = HOST_EVENT_NAMES[area];
    if (hostEventNames) {
      hostEventEmitter.onDocument(hostEventNames.READY, handleHostReadyEvent);
    }
  });

  // Подписываемся на событие жизненного цикла window
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Возвращаем функцию отписки
  return cleanupPlugin;
}
