import { IWApiBase } from '@test_entry_user/widget-api';

export class WidgetApiUtil {
  static isMethodAvailable<T extends keyof IWApiBase>(name: T) {
    return (
      typeof window !== 'undefined' &&
      window.widgetApi &&
      typeof window.widgetApi[name] === 'function'
    );
  }
}
