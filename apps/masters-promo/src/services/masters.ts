import { MASTER_PORTFOLIO_DATA } from '../configs/masters';
import { LoggerUtil } from '../utils/logger';
import { WidgetApiUtil } from '../utils/widget-api';
import { CharmDirectApiService } from './api';
import { initMockWidgetApi, isDevelopmentMode } from '../utils/widget-api-mock';
import type { StaffMediaResponse } from '../types/api';
import { createApp } from 'vue';
import PortfolioWidget from '../components/PortfolioWidget.vue';

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
        containerType: 'masterInfoAfterInformation',
        containerOptions: { masterId },
        componentType: 'html',
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
   * Монтирует Vue компонент PortfolioWidget в HTML элемент
   */
  private static mountPortfolioWidget(staffId: string) {
    const elementId = `portfolio-widget-${staffId}`;
    const element = document.getElementById(elementId);
    
    if (!element) {
      LoggerUtil.warn(`Элемент ${elementId} не найден для монтирования Vue компонента`);
      return;
    }

    try {
      const app = createApp(PortfolioWidget, {
        staffId: staffId
      });
      
      app.mount(element);
      LoggerUtil.info(`Vue компонент PortfolioWidget смонтирован в ${elementId}`);
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
          containerType: 'masterInfoAfterInformation',
          containerOptions: { masterId: masterPortfolio.masterId },
          componentType: 'html',
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
