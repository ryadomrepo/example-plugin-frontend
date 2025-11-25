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
   * Добавляет слоты с портфолио для мастеров (новая версия с динамическими данными)
   */
  static async addDynamicPortfolioSlots() {
    this.initialize();
    
    if (!WidgetApiUtil.isMethodAvailable('addSlotInfo')) {
      LoggerUtil.error('Метод addSlotInfo недоступен');
      return;
    }

    try {
      // Получаем список ID мастеров из конфига
      const staffIds = MASTER_PORTFOLIO_DATA.map(master => master.masterId.toString());
      
      LoggerUtil.info(`Загрузка портфолио для ${staffIds.length} мастеров`);
      
      // Загружаем данные для всех мастеров
      const mastersData = await CharmDirectApiService.getMultipleStaffMedia(staffIds);
      
      // Создаем слоты для каждого мастера с данными
      for (const masterData of mastersData) {
        await this.createPortfolioSlot(masterData);
        await this.createStaffSelectionSlot(masterData);
      }
      
      LoggerUtil.info(`Успешно созданы слоты для ${mastersData.length} мастеров`);
    } catch (error) {
      LoggerUtil.error('Ошибка при создании динамических слотов портфолио:', error);
      // Fallback к старому методу при ошибке
      this.addSlotsForMasterPortfolios();
    }
  }

  /**
   * Создает слот портфолио для конкретного мастера
   */
  private static async createPortfolioSlot(masterData: StaffMediaResponse) {
    try {
      const masterId = parseInt(masterData.staff_id);
      const totalItems = masterData.collections.reduce((sum, col) => sum + col.items.length, 0);
      
      if (totalItems === 0) {
        LoggerUtil.warn(`У мастера ${masterId} нет работ в портфолио`);
        return;
      }

      // Создаем слот с упрощенной конфигурацией
      const slotId = (window as any).widgetApi.addSlotInfo({
        containerType: 'staff_info_comments',
        containerOptions: { masterId },
        componentType: 'custom_html',
        componentOptions: {
          html: `<div id="portfolio-widget-${masterId}" data-staff-id="${masterData.staff_id}"></div>`
        },
      });
      
      LoggerUtil.info(`Создан динамический слот портфолио для мастера ${masterId}: ${slotId} (${totalItems} работ)`);
      
      // Монтируем Vue компонент в созданный элемент
      setTimeout(() => {
        this.mountPortfolioWidget(masterData.staff_id);
      }, 100);
    } catch (error) {
      LoggerUtil.error(`Ошибка при создании слота для мастера ${masterData.staff_id}:`, error);
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
  private static async createStaffSelectionSlot(masterData: StaffMediaResponse) {
    try {
      const masterId = parseInt(masterData.staff_id);
      const totalItems = masterData.collections.reduce((sum, col) => sum + col.items.length, 0);
      
      if (totalItems === 0) {
        LoggerUtil.warn(`У мастера ${masterId} нет работ в портфолио для страницы выбора`);
        return;
      }

      // Используем master_tag
      const slotId = (window as any).widgetApi.addSlotInfo({
        containerType: 'master_tag',
        containerOptions: { masterId },
        componentType: 'custom_html',
        componentOptions: {
          html: `<div id="portfolio-mini-widget-${masterId}" data-staff-id="${masterData.staff_id}"></div>`
        },
      });
      
      LoggerUtil.info(`Создан слот мини-виджета для мастера ${masterId} (master_tag): ${slotId} (${totalItems} работ)`);
      
      // Монтируем Vue компонент в созданный элемент
      setTimeout(() => {
        this.mountPortfolioWidget(masterData.staff_id, 'portfolio-mini-widget');
      }, 100);
    } catch (error) {
      LoggerUtil.error(`Ошибка при создании слота мини-виджета для мастера ${masterData.staff_id}:`, error);
    }
  }

  /**
   * Монтирует Vue компонент PortfolioWidget или PortfolioMiniWidget в HTML элемент
   */
  private static mountPortfolioWidget(staffId: string, prefix: string = 'portfolio-widget') {
    const elementId = `${prefix}-${staffId}`;
    const element = document.getElementById(elementId);
    
    if (!element) {
      LoggerUtil.warn(`Элемент ${elementId} не найден для монтирования Vue компонента`);
      return;
    }

    try {
      // Используем мини-виджет для страницы выбора специалиста
      const component = prefix === 'portfolio-mini-widget' ? PortfolioMiniWidget : PortfolioWidget;
      
      const app = createApp(component, {
        staffId: staffId
      });
      
      app.mount(element);
      LoggerUtil.info(`Vue компонент ${component.name || 'Portfolio'} смонтирован в ${elementId}`);
    } catch (error) {
      LoggerUtil.error(`Ошибка при монтировании Vue компонента для ${elementId}:`, error);
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
        const slotId = (window as any).widgetApi.addSlotInfo({
          containerType: 'staff_info_comments',
          containerOptions: { masterId: masterPortfolio.masterId },
          componentType: 'custom_html',
          componentOptions: {
            html: `<div id="portfolio-widget-${masterPortfolio.masterId}" data-staff-id="${masterPortfolio.masterId}"></div>`
          },
        });
        LoggerUtil.info(`Добавлен fallback слот для мастера ${masterPortfolio.masterId}: ${slotId}`);
      } catch (error) {
        LoggerUtil.error(`Ошибка при создании fallback слота для мастера ${masterPortfolio.masterId}:`, error);
      }
    }
  }
}
