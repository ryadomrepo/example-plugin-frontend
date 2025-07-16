import {
  EWApiLinkType,
  EWApiSlotComponentType,
  EWApiSlotContainerType,
} from '@test_entry_user/widget-api';

import { MASTER_PORTFOLIO_DATA } from '../configs/masters';
import { LoggerUtil } from '../utils/logger';
import { WidgetApiUtil } from '../utils/widget-api';

export class MastersService {
  static addSlotsForMasterPortfolios() {
    if (!WidgetApiUtil.isMethodAvailable('addSlotInfo')) {
      LoggerUtil.error('Метод addSlotInfo недоступен');
      return;
    }
    for (const masterPortfolio of MASTER_PORTFOLIO_DATA) {
      const slotId = window.widgetApi.addSlotInfo({
        containerType: EWApiSlotContainerType.masterInfoAfterInformation,
        containerOptions: { masterId: masterPortfolio.masterId },
        componentType: EWApiSlotComponentType.link,
        componentOptions: {
          linkLabel: 'Портфолио',
          linkType: EWApiLinkType.ghost,
          url: masterPortfolio.charmDirectLink,
        },
      });
      LoggerUtil.info(`Добавлен слот для мастера ${masterPortfolio.masterId}: ${slotId}`);
    }
  }
}
