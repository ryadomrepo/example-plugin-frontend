/**
 * Плагин для управления отображением ФИО клиента в расписании
 *
 * Этот плагин предоставляет возможность управлять отображением ФИО клиента в расписании
 * через checkbox компонент.
 *
 * Плагин поддерживает две области:
 * - checkbox для управления отображением ФИО клиента
 * - fullName для отображения полного имени клиента в расписании
 */

import type { THostReadyEvent, THostReadyPayload } from './types/events';
import { getZoneHandler } from './configs/area-adapter';
import { pluginEventEmitter } from './emitters';
import { EventManager } from './emitters/core/event-manager';

// Константы для улучшения читаемости
const LOG_PREFIX = '[Plugin]';

/**
 * Интерфейс для работы с областями
 */
interface IAreaRenderer {
  render(area: string, payload: THostReadyPayload, container: Element): void;
  getHandler(area: string): ReturnType<typeof getZoneHandler> | null;
}

/**
 * Интерфейс для работы с DOM
 */
interface IDomManager {
  findContainer(containerId: string): Element | null;
  addEventListener(event: string, listener: () => void): void;
  removeEventListener(event: string, listener: () => void): void;
}

/**
 * Менеджер для работы с областями
 */
class AreaManager implements IAreaRenderer {
  private handlersCache: Record<
    string,
    ReturnType<typeof getZoneHandler> | null
  > | null = null;

  public render(
    area: string,
    payload: THostReadyPayload,
    container: Element,
  ): void {
    const handler = this.getHandler(area);
    if (handler) {
      handler.handler(payload, container);
    } else {
      console.warn(`${LOG_PREFIX} Обработчик для области "${area}" не найден`);
    }
  }

  public getHandler(area: string): ReturnType<typeof getZoneHandler> | null {
    if (!this.handlersCache) {
      this.handlersCache = {};
      const supportedAreas = [...pluginEventEmitter.getSupportedAreas()];
      supportedAreas.forEach((supportedArea) => {
        this.handlersCache![supportedArea] = getZoneHandler(
          supportedArea,
          supportedAreas,
        );
      });
    }
    return this.handlersCache[area] || null;
  }

  public clearCache(): void {
    this.handlersCache = null;
  }
}

/**
 * Менеджер для работы с DOM
 */
class DomManager implements IDomManager {
  public findContainer(containerId: string): Element | null {
    return document.querySelector(`[data-plugin-container="${containerId}"]`);
  }

  public addEventListener(event: string, listener: () => void): void {
    window.addEventListener(event, listener);
  }

  public removeEventListener(event: string, listener: () => void): void {
    window.removeEventListener(event, listener);
  }
}

/**
 * Менеджер событий плагина
 */
class PluginEventManager {
  constructor(
    private eventManager: EventManager,
    private areaRenderer: IAreaRenderer,
    private domManager: IDomManager,
  ) {}

  public handleHostReady = (event: CustomEvent<THostReadyEvent>): void => {
    const { containerId, payload, area } = event.detail;

    if (!this.eventManager.isAreaSupported(area)) {
      console.warn(`${LOG_PREFIX} Неподдерживаемая область: ${area}`);
      return;
    }

    const container = this.domManager.findContainer(containerId);
    if (!container) {
      console.error(`${LOG_PREFIX} Контейнер "${containerId}" не найден`);
      return;
    }

    this.areaRenderer.render(area, payload, container);
    this.emitReady(area, containerId);
  };

  public handleBeforeUnload = (): void => {
    console.log(`${LOG_PREFIX} Страница выгружается, выполняем очистку`);
  };

  private emitReady(area: string, containerId: string): void {
    const pluginEventNames = pluginEventEmitter.getPluginEventNames(area);
    if (pluginEventNames) {
      pluginEventEmitter.emitPluginReady(area, {
        area,
        containerId,
        payload: null,
      });
    } else {
      console.error(
        `${LOG_PREFIX} Не найдены имена событий для области "${area}"`,
      );
    }
  }
}

/**
 * Основной класс плагина для управления отображением ФИО клиента
 */
class Plugin {
  private eventManager: PluginEventManager;
  private areaManager: AreaManager;
  private domManager: DomManager;

  constructor() {
    this.areaManager = new AreaManager();
    this.domManager = new DomManager();
    this.eventManager = new PluginEventManager(
      pluginEventEmitter,
      this.areaManager,
      this.domManager,
    );
  }

  /**
   * Очистка ресурсов плагина
   */
  public cleanup(): void {
    console.log(`${LOG_PREFIX} Начало очистки ресурсов плагина`);

    pluginEventEmitter.getSupportedAreas().forEach((area: string) => {
      pluginEventEmitter.offHostReady(area, this.eventManager.handleHostReady);
    });

    this.domManager.removeEventListener(
      'beforeunload',
      this.eventManager.handleBeforeUnload,
    );
    pluginEventEmitter.cleanup();
    this.areaManager.clearCache();

    console.log(`${LOG_PREFIX} Очистка ресурсов плагина завершена`);
  }

  /**
   * Инициализация плагина
   */
  public init(): () => void {
    console.log(`${LOG_PREFIX} Инициализация плагина`);

    pluginEventEmitter.getSupportedAreas().forEach((area: string) => {
      console.log(
        `${LOG_PREFIX} Подписка на события хоста для области: ${area}`,
      );
      pluginEventEmitter.onHostReady(area, this.eventManager.handleHostReady);
    });

    this.domManager.addEventListener(
      'beforeunload',
      this.eventManager.handleBeforeUnload,
    );

    return () => this.cleanup();
  }
}

// Создаем экземпляр плагина
const plugin = new Plugin();

/**
 * Очистка ресурсов плагина
 * Должна вызываться при уничтожении плагина для предотвращения утечек памяти
 */
export function cleanupPlugin(): void {
  plugin.cleanup();
}

/**
 * Инициализация приложения
 * Настраивает обработку событий
 * @returns {Function} Функция для отписки от событий
 */
export function initializePlugin(): () => void {
  return plugin.init();
}
