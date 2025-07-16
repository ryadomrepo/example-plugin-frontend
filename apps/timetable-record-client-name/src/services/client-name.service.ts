/**
 * Сервис для работы с именами клиентов
 *
 * Предоставляет методы для форматирования и обработки
 * персональных данных клиентов
 */

import type { THostReadyPayload } from '../types/events';

/**
 * Сервис для работы с именами клиентов
 */
export class ClientNameService {
  /**
   * Создает читаемое представление клиента для отображения в пользовательском интерфейсе.
   *
   * @param personalData - Персональные данные клиента.
   * @returns Готовое к отображению полное имя клиента.
   */
  static formatFullName({
    clientSurname,
    clientName,
    clientPatronymic,
  }: THostReadyPayload): string {
    return [clientSurname, clientName, clientPatronymic]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(' ');
  }
}
