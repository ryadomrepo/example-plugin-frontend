import { IWApiBase } from '@test_entry_user/widget-api';

declare global {
  interface Window {
    widgetApi: IWApiBase;
  }
}
