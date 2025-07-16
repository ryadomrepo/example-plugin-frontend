import { pluginEventEmitter } from '../emitters/plugin-event-emitter';
import { ClientNameService, CheckboxService } from '../services';
import type { THostReadyPayload, TPluginUpdateEvent } from '../types/events';
import { AreaConstantsUtils } from '../utils';

/**
 * Интерфейс рендерера плагина
 * Каждый рендерер отвечает за создание и управление компонентом плагина в определенной зоне
 */
export interface IPluginRenderer {
  /** Описание назначения рендерера */
  description: string;
  /** Функция рендеринга компонента */
  render: (
    areaName: string,
    container: Element,
    payload: THostReadyPayload,
  ) => void;
  /** Обработчик событий обновления (опционально) */
  handleUpdate?: (
    event: CustomEvent<TPluginUpdateEvent>,
    container: Element,
  ) => void;
}

/**
 * Рендерер для зоны управления отображением (checkbox)
 */
export class VisibilityControlRenderer implements IPluginRenderer {
  description =
    'Создание checkbox компонента для управления отображением ФИО клиента';

  render(areaName: string, container: Element): void {
    console.log('[Plugin] Рендерим компонент управления видимостью');

    const checkboxElement = CheckboxService.createCheckbox({
      id: 'client-visibility-control',
      name: 'client-visibility-control',
      label: 'Управление отображением ФИО клиента',
      checked: true,
      disabled: false,
      className: 'client-visibility-control',
      onChange: (checked) => {
        this.handleVisibilityChange(checked, areaName, container);
      },
    });

    container.replaceChildren(checkboxElement);
  }

  private handleVisibilityChange(
    checked: boolean,
    areaName: string,
    container: Element,
  ): void {
    console.log(
      `[Plugin] Изменение видимости: ${checked ? 'отмечен' : 'снят'}`,
    );

    const pluginEventNames = pluginEventEmitter.getPluginEventNames(areaName);
    if (!pluginEventNames) {
      console.error(`[Plugin] Не найдены имена событий для зоны "${areaName}"`);
      return;
    }

    pluginEventEmitter.emitPluginUpdate(areaName, {
      area: areaName,
      containerId: container.getAttribute('data-plugin-container') ?? '',
      payload: { isVisible: checked },
    });
  }
}

/**
 * Рендерер для зоны отображения имени клиента
 */
export class ClientNameRenderer implements IPluginRenderer {
  description =
    'Создание интерактивного полного имени клиента для записи в расписании';
  private fullName: string = '';

  render(
    areaName: string,
    container: Element,
    payload: THostReadyPayload,
  ): void {
    console.log('[Plugin] Рендерим компонент имени клиента');

    this.fullName = ClientNameService.formatFullName(payload);
    container.textContent = this.fullName;

    // Подписываемся на события зоны управления
    const targetArea = AreaConstantsUtils.getControlArea();
    console.log(
      `[Plugin] Подписываемся на события зоны управления "${targetArea}" для зоны "${areaName}"`,
    );
    this.subscribeToVisibilityUpdates(targetArea, container);
  }

  handleUpdate(
    event: CustomEvent<TPluginUpdateEvent>,
    container: Element,
  ): void {
    console.log(
      `[Plugin] Обработка события обновления: ${JSON.stringify(event.detail.payload)}`,
    );

    const { payload } = event.detail;
    if (payload.isVisible) {
      container.textContent = this.fullName;
    } else {
      container.textContent = '';
    }
  }

  private subscribeToVisibilityUpdates(
    targetArea: string,
    container: Element,
  ): void {
    console.log(
      `[Plugin] Подписываемся на события обновления видимости из зоны "${targetArea}"`,
    );
    pluginEventEmitter.onPluginUpdate(
      targetArea,
      (event: CustomEvent<TPluginUpdateEvent>) => {
        this.handleUpdate(event, container);
      },
    );
  }
}

/**
 * Реестр рендереров плагина
 * Связывает названия зон с соответствующими рендерерами плагина
 */
export class PluginRendererRegistry {
  private static renderers = new Map<string, IPluginRenderer>();

  /**
   * Регистрирует рендерер для зоны
   */
  static register(areaName: string, renderer: IPluginRenderer): void {
    this.renderers.set(areaName, renderer);
  }

  /**
   * Получает рендерер для зоны
   */
  static get(areaName: string): IPluginRenderer | null {
    return this.renderers.get(areaName) || null;
  }

  /**
   * Проверяет, зарегистрирован ли рендерер для зоны
   */
  static has(areaName: string): boolean {
    return this.renderers.has(areaName);
  }

  /**
   * Возвращает все зарегистрированные зоны
   */
  static getRegisteredAreas(): string[] {
    return Array.from(this.renderers.keys());
  }
}

/**
 * Инициализация рендереров по умолчанию
 * Эта функция должна вызываться при инициализации плагина
 */
export function initializeDefaultRenderers(): void {
  // Регистрируем рендереры по умолчанию
  // В будущем это можно будет настраивать через конфигурацию
  PluginRendererRegistry.register(
    AreaConstantsUtils.getControlArea(),
    new VisibilityControlRenderer(),
  );
  PluginRendererRegistry.register(
    AreaConstantsUtils.getDisplayArea(),
    new ClientNameRenderer(),
  );
}

/**
 * Получить рендерер для зоны
 * @param areaName - название зоны
 * @returns рендерер плагина для зоны или null если не найден
 */
export function getPluginRenderer(areaName: string): IPluginRenderer | null {
  return PluginRendererRegistry.get(areaName);
}
