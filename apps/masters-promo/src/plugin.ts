import {
  createHostEventNames,
  DocumentEventEmitter,
  THostEventNames,
} from '@charmdirect/plugins-utils';

import type { THostReadyEvent } from './types/events';

import { LoggerUtil } from './utils/logger';
import { MastersService } from './services/masters';
import contract from '../../../contract.json';
import type { ContractConfig } from './types/contract';

// Получаем области плагина из contract.json
const PLUGIN_AREAS = (contract as ContractConfig).packages[
  'widget-masters-promo'
].areas;

// Создаем имена событий хоста для всех областей
const HOST_EVENT_NAMES = Object.fromEntries(
  PLUGIN_AREAS.map((area) => [area, createHostEventNames(area)]),
) satisfies Record<string, THostEventNames>;

/**
 * Эмиттер событий для обработки сообщений от хоста к плагину
 * Используется для получения уведомлений от хоста о его состоянии и событиях
 * @type {DocumentEventEmitter<THostReadyEvent>}
 */
const hostEventEmitter = new DocumentEventEmitter<THostReadyEvent>();

/**
 * Обработчик события готовности хоста
 * @param event - событие готовности хоста
 */
function handleHostReadyEvent(event: CustomEvent<THostReadyEvent>): void {
  LoggerUtil.info('Получено событие готовности хоста:', event);

  // Используем новый метод с динамическими данными
  MastersService.addDynamicPortfolioSlots();
}

/**
 * Обработчик события жизненного цикла window
 * Используется для очистки ресурсов при выгрузке страницы
 */
const handleBeforeUnload = (): void => {
  LoggerUtil.info('Страница выгружается, выполняем очистку');
  cleanupPlugin();
};

/**
 * Функция отписки от всех событий
 * Должна вызываться при уничтожении плагина для предотвращения утечек памяти
 */
export function cleanupPlugin(): void {
  LoggerUtil.info('Очистка ресурсов плагина');

  // Отписываемся от событий готовности хоста для всех областей
  PLUGIN_AREAS.forEach((area) => {
    const hostEventNames = HOST_EVENT_NAMES[area];
    if (hostEventNames) {
      hostEventEmitter.offDocument(hostEventNames.READY, handleHostReadyEvent);
    }
  });

  // Отписываемся от события жизненного цикла window
  window.removeEventListener('beforeunload', handleBeforeUnload);
  
  // Отписываемся от событий навигации
  window.removeEventListener('popstate', handleNavigation);
  window.removeEventListener('hashchange', handleNavigation);
  
  // Останавливаем MutationObserver
  if (navigationObserver) {
    navigationObserver.disconnect();
    navigationObserver = null;
  }
  
  // Останавливаем периодическую проверку
  if (navigationCheckInterval) {
    clearInterval(navigationCheckInterval);
    navigationCheckInterval = null;
  }
}

// Переменные для отслеживания навигации
let lastUrl = '';
let navigationObserver: MutationObserver | null = null;
let navigationCheckInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Обработчик навигации - вызывается при изменении URL или DOM
 */
function handleNavigation(): void {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    LoggerUtil.info('Обнаружена навигация, переинициализируем слоты:', currentUrl);
    MastersService.addDynamicPortfolioSlots();
  }
}

/**
 * Инициализация приложения
 * Создает Vue приложение и настраивает обработку событий
 * @returns {Function} Функция для отписки от событий
 */
export function initializePlugin(): () => void {
  LoggerUtil.info('Инициализация плагина');

  // Подписываемся на события готовности хоста для всех областей
  PLUGIN_AREAS.forEach((area) => {
    const hostEventNames = HOST_EVENT_NAMES[area];
    if (hostEventNames) {
      hostEventEmitter.onDocument(hostEventNames.READY, handleHostReadyEvent);
    }
  });

  // Подписываемся на событие жизненного цикла window
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Подписываемся на события навигации SPA
  window.addEventListener('popstate', handleNavigation);
  window.addEventListener('hashchange', handleNavigation);

  // Перехватываем pushState и replaceState для отслеживания программной навигации
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);
  
  history.pushState = function(...args) {
    originalPushState(...args);
    setTimeout(handleNavigation, 100);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState(...args);
    setTimeout(handleNavigation, 100);
  };

  // MutationObserver для отслеживания изменений DOM (SPA навигация)
  navigationObserver = new MutationObserver((mutations) => {
    // Проверяем, есть ли значительные изменения в DOM
    const hasSignificantChanges = mutations.some(mutation => 
      mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0
    );
    
    if (hasSignificantChanges) {
      // Debounce - не вызываем слишком часто
      setTimeout(handleNavigation, 200);
    }
  });

  // Наблюдаем за изменениями в body
  navigationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Периодическая проверка URL (fallback для SPA)
  navigationCheckInterval = setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      handleNavigation();
    }
  }, 1000);

  // Немедленная инициализация при загрузке плагина
  const initializeSlots = () => {
    LoggerUtil.info('Запуск инициализации слотов');
    lastUrl = window.location.href;
    MastersService.addDynamicPortfolioSlots();
  };

  // Запускаем сразу, если документ готов
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    LoggerUtil.info('Документ уже загружен, инициализируем немедленно');
    initializeSlots();
  } else {
    // Иначе ждём загрузки DOM
    document.addEventListener('DOMContentLoaded', initializeSlots, {
      once: true,
    });
  }

  // Возвращаем функцию отписки
  return cleanupPlugin;
}
