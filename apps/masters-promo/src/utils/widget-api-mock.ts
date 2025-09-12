/**
 * Mock для Widget API в режиме разработки
 */

import { LoggerUtil } from './logger';

// Типы для mock Widget API
interface MockWidgetApi {
  addSlotInfo: (config: any) => string;
}

// Mock реализация Widget API
const mockWidgetApi: MockWidgetApi = {
  addSlotInfo: (config: any) => {
    const slotId = `mock-slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    LoggerUtil.info('Mock Widget API: addSlotInfo вызван', {
      slotId,
      config
    });
    
    // В режиме разработки добавляем HTML элемент в DOM
    if (config.componentType === 'html' && config.componentOptions?.html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = config.componentOptions.html;
      const element = tempDiv.firstElementChild;
      
      if (element) {
        // Добавляем элемент в body для тестирования
        document.body.appendChild(element);
        LoggerUtil.info(`Mock Widget API: HTML элемент добавлен в DOM`, element.id);
      }
    }
    
    return slotId;
  }
};

/**
 * Инициализация mock Widget API для разработки
 */
export function initMockWidgetApi() {
  if (typeof window !== 'undefined' && !window.widgetApi) {
    LoggerUtil.info('Инициализация Mock Widget API для разработки');
    (window as any).widgetApi = mockWidgetApi;
  }
}

/**
 * Проверка, работаем ли мы в режиме разработки
 */
export function isDevelopmentMode(): boolean {
  return typeof window !== 'undefined' && 
         (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          !window.widgetApi);
}
