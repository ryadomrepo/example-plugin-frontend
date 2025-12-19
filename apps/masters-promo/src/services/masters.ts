import { MASTER_PORTFOLIO_DATA } from '../configs/masters';
import { LoggerUtil } from '../utils/logger';
import { WidgetApiUtil } from '../utils/widget-api';
import { CharmDirectApiService } from './api';
import { initMockWidgetApi, isDevelopmentMode } from '../utils/widget-api-mock';
import type { StaffMediaResponse } from '../types/api';
import { createApp } from 'vue';
import PortfolioWidget from '../components/PortfolioWidget.vue';
import PortfolioMiniWidget from '../components/PortfolioMiniWidget.vue';

export class MastersService {
  // Хранилище смонтированных Vue приложений для очистки при навигации
  private static mountedApps: Map<string, ReturnType<typeof createApp>> =
    new Map();

  // Хранилище созданных слотов для переиспользования при навигации
  private static createdSlots: Map<string, string> = new Map();

  /**
   * Инициализация сервиса мастеров
   */
  static initialize() {
    // Инициализируем mock API в режиме разработки
    if (isDevelopmentMode()) {
      initMockWidgetApi();
    }
  }

  /**
   * Очистка всех смонтированных приложений и слотов
   */
  private static cleanupMountedApps() {
    this.mountedApps.forEach((app, elementId) => {
      try {
        app.unmount();
        LoggerUtil.info(`Размонтирован компонент ${elementId}`);
      } catch {
        // Игнорируем ошибки при размонтировании
      }
    });
    this.mountedApps.clear();
    
    // Очищаем слоты при навигации, чтобы создавать новые
    this.createdSlots.clear();
    LoggerUtil.info('Очищены слоты для пересоздания');
  }

  /**
   * Добавляет слоты с портфолио для мастеров (новая версия с динамическими данными)
   */
  static async addDynamicPortfolioSlots() {
    this.initialize();

    // Очищаем предыдущие смонтированные приложения при навигации
    this.cleanupMountedApps();

    if (!WidgetApiUtil.isMethodAvailable('addSlotInfo')) {
      LoggerUtil.error('Метод addSlotInfo недоступен');
      return;
    }

    try {
      // Получаем список ID мастеров из конфига
      const staffIds = MASTER_PORTFOLIO_DATA.map((master) =>
        master.masterId.toString(),
      );

      LoggerUtil.info(`Загрузка портфолио для ${staffIds.length} мастеров`);

      // Загружаем данные для всех мастеров
      const mastersData =
        await CharmDirectApiService.getMultipleStaffMedia(staffIds);

      // Предзагружаем изображения для быстрого отображения
      this.preloadImages(mastersData);

      // Создаем слоты для каждого мастера с данными
      for (const masterData of mastersData) {
        await this.createPortfolioSlot(masterData);
        await this.createStaffSelectionSlot(masterData);
      }

      LoggerUtil.info(
        `Успешно созданы слоты для ${mastersData.length} мастеров`,
      );
    } catch (error) {
      LoggerUtil.error(
        'Ошибка при создании динамических слотов портфолио:',
        error,
      );
      // Fallback к старому методу при ошибке
      this.addSlotsForMasterPortfolios();
    }
  }

  /**
   * Предзагрузка изображений для быстрого отображения
   */
  private static preloadImages(mastersData: StaffMediaResponse[]) {
    const imageUrls: string[] = [];

    for (const masterData of mastersData) {
      for (const collection of masterData.collections) {
        for (const item of collection.items) {
          if (item.media_url) {
            imageUrls.push(item.media_url);
          }
        }
      }
    }

    LoggerUtil.info(`Предзагрузка ${imageUrls.length} изображений`);

    // Предзагружаем изображения в фоне
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }

  /**
   * Создает слот портфолио для конкретного мастера
   */
  private static async createPortfolioSlot(masterData: StaffMediaResponse) {
    try {
      const masterId = parseInt(masterData.staff_id);
      const slotKey = `portfolio-widget-${masterId}`;
      const totalItems = masterData.collections.reduce(
        (sum, col) => sum + col.items.length,
        0,
      );

      if (totalItems === 0) {
        LoggerUtil.warn(`У мастера ${masterId} нет работ в портфолио`);
        return;
      }

      // Проверяем, есть ли уже созданный слот для этого мастера
      const existingSlotId = this.createdSlots.get(slotKey);

      // Создаем или обновляем слот с упрощенной конфигурацией
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const slotId = (window as any).widgetApi.addSlotInfo(
        {
          containerType: 'staff_info_comments',
          containerOptions: { masterId },
          componentType: 'custom_html',
          componentOptions: {
            html: `<div id="portfolio-widget-${masterId}" data-staff-id="${masterData.staff_id}"></div>`,
          },
        },
        existingSlotId,
      );

      // Сохраняем slotId для последующего переиспользования
      this.createdSlots.set(slotKey, slotId);

      LoggerUtil.info(
        `${existingSlotId ? 'Обновлён' : 'Создан'} слот портфолио для мастера ${masterId}: ${slotId} (${totalItems} работ)`,
      );

      // Монтируем Vue компонент в созданный элемент (ждём появления через MutationObserver)
      this.mountPortfolioWidget(masterData.staff_id);
    } catch (error) {
      LoggerUtil.error(
        `Ошибка при создании слота для мастера ${masterData.staff_id}:`,
        error,
      );
    }
  }

  /**
   * Создает слот мини-виджета портфолио на странице выбора специалиста
   * Примечание: в YCLIENTS Widget API нет подходящего containerType для встраивания
   * внутрь карточки конкретного мастера. Доступные варианты:
   * - master_tag: показывает как теги справа от имени (текущий вариант)
   * - master_select_prepend: добавит ПЕРЕД всем блоком выбора мастера
   *
   * Для корректной реализации мини-виджета внутри карточки нужна поддержка
   * нового containerType от YCLIENTS (например, 'staff_card' или 'staff_item')
   */
  private static async createStaffSelectionSlot(
    masterData: StaffMediaResponse,
  ) {
    try {
      const masterId = parseInt(masterData.staff_id);
      const slotKey = `portfolio-mini-widget-${masterId}`;
      const totalItems = masterData.collections.reduce(
        (sum, col) => sum + col.items.length,
        0,
      );

      if (totalItems === 0) {
        LoggerUtil.warn(
          `У мастера ${masterId} нет работ в портфолио для страницы выбора`,
        );
        return;
      }

      // Проверяем, есть ли уже созданный слот для этого мастера
      const existingSlotId = this.createdSlots.get(slotKey);

      // Используем master_tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const slotId = (window as any).widgetApi.addSlotInfo(
        {
          containerType: 'master_tag',
          containerOptions: { masterId },
          componentType: 'custom_html',
          componentOptions: {
            html: `<div id="portfolio-mini-widget-${masterId}" data-staff-id="${masterData.staff_id}"></div>`,
          },
        },
        existingSlotId,
      );

      // Сохраняем slotId для последующего переиспользования
      this.createdSlots.set(slotKey, slotId);

      LoggerUtil.info(
        `${existingSlotId ? 'Обновлён' : 'Создан'} слот мини-виджета для мастера ${masterId} (master_tag): ${slotId} (${totalItems} работ)`,
      );

      // Монтируем Vue компонент в созданный элемент (ждём появления через MutationObserver)
      this.mountPortfolioWidget(masterData.staff_id, 'portfolio-mini-widget');
    } catch (error) {
      LoggerUtil.error(
        `Ошибка при создании слота мини-виджета для мастера ${masterData.staff_id}:`,
        error,
      );
    }
  }

  /**
   * Ожидает появления элемента в DOM с помощью MutationObserver и polling
   */
  private static waitForElement(
    elementId: string,
    timeout: number = 10000,
  ): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
      // Сначала проверяем, есть ли элемент уже
      const existingElement = document.getElementById(elementId);
      if (existingElement) {
        resolve(existingElement);
        return;
      }

      let resolved = false;
      const startTime = Date.now();

      // Создаём observer для отслеживания появления элемента
      const observer = new MutationObserver(() => {
        if (resolved) return;
        const element = document.getElementById(elementId);
        if (element) {
          resolved = true;
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Дополнительный polling каждые 200ms как fallback
      const pollInterval = setInterval(() => {
        if (resolved) {
          clearInterval(pollInterval);
          return;
        }

        const element = document.getElementById(elementId);
        if (element) {
          resolved = true;
          observer.disconnect();
          clearInterval(pollInterval);
          resolve(element);
          return;
        }

        // Проверяем таймаут
        if (Date.now() - startTime >= timeout) {
          resolved = true;
          observer.disconnect();
          clearInterval(pollInterval);
          resolve(null);
        }
      }, 200);
    });
  }

  /**
   * Монтирует Vue компонент PortfolioWidget или PortfolioMiniWidget в HTML элемент
   */
  private static async mountPortfolioWidget(
    staffId: string,
    prefix: string = 'portfolio-widget',
  ) {
    const elementId = `${prefix}-${staffId}`;

    // Ждём появления элемента в DOM
    const element = await this.waitForElement(elementId);

    if (!element) {
      LoggerUtil.warn(
        `Элемент ${elementId} не найден для монтирования Vue компонента`,
      );
      return;
    }

    // Проверяем, не был ли уже смонтирован компонент
    if (element.hasAttribute('data-vue-mounted')) {
      LoggerUtil.info(`Компонент уже смонтирован в ${elementId}`);
      return;
    }

    try {
      // Используем мини-виджет для страницы выбора специалиста
      const component =
        prefix === 'portfolio-mini-widget'
          ? PortfolioMiniWidget
          : PortfolioWidget;

      const app = createApp(component, {
        staffId: staffId,
      });

      app.mount(element);
      element.setAttribute('data-vue-mounted', 'true');

      // Сохраняем приложение для последующей очистки
      this.mountedApps.set(elementId, app);

      LoggerUtil.info(
        `Vue компонент ${component.name || 'Portfolio'} смонтирован в ${elementId}`,
      );
    } catch (error) {
      LoggerUtil.error(
        `Ошибка при монтировании Vue компонента для ${elementId}:`,
        error,
      );
    }
  }

  /**
   * Старый метод для совместимости (fallback)
   */
  static addSlotsForMasterPortfolios() {
    this.initialize();

    if (!WidgetApiUtil.isMethodAvailable('addSlotInfo')) {
      LoggerUtil.error('Метод addSlotInfo недоступен');
      return;
    }

    LoggerUtil.warn('Используется fallback метод создания слотов');

    for (const masterPortfolio of MASTER_PORTFOLIO_DATA) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const slotId = (window as any).widgetApi.addSlotInfo({
          containerType: 'staff_info_comments',
          containerOptions: { masterId: masterPortfolio.masterId },
          componentType: 'custom_html',
          componentOptions: {
            html: `<div id="portfolio-widget-${masterPortfolio.masterId}" data-staff-id="${masterPortfolio.masterId}"></div>`,
          },
        });
        LoggerUtil.info(
          `Добавлен fallback слот для мастера ${masterPortfolio.masterId}: ${slotId}`,
        );
      } catch (error) {
        LoggerUtil.error(
          `Ошибка при создании fallback слота для мастера ${masterPortfolio.masterId}:`,
          error,
        );
      }
    }
  }
}
