import type { StaffMediaResponse, GetStaffMediaParams } from '../types/api';
import { LoggerUtil } from '../utils/logger';

/**
 * Конфигурация API
 */
const API_CONFIG = {
  baseUrl: 'https://backapi.charmdirect.ru',
  endpoints: {
    getStaffMedia: '/get_staff_media',
  },
} as const;

/**
 * Сервис для работы с CharmDirect API
 */
export class CharmDirectApiService {
  /**
   * Получение медиа данных мастера по staff_id
   * @param params - параметры запроса
   * @returns Promise с данными мастера
   */
  static async getStaffMedia(
    params: GetStaffMediaParams,
  ): Promise<StaffMediaResponse> {
    try {
      const url = new URL(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.getStaffMedia}`,
      );
      url.searchParams.append('staff_id', params.staff_id);

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 404) {
          LoggerUtil.warn(`Мастер с ID ${params.staff_id} не найден в API`);
          // Возвращаем пустой ответ для 404
          return {
            staff_id: params.staff_id,
            collections: [],
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as StaffMediaResponse;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        // Уже обработано выше
        throw error;
      }
      LoggerUtil.error(
        `Ошибка при загрузке данных для мастера ${params.staff_id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Получение данных для нескольких мастеров
   * @param staffIds - массив ID мастеров
   * @returns Promise с массивом данных мастеров
   */
  static async getMultipleStaffMedia(
    staffIds: string[],
  ): Promise<StaffMediaResponse[]> {
    try {
      LoggerUtil.info(`Загрузка данных для ${staffIds.length} мастеров`);

      const promises = staffIds.map((staff_id) =>
        this.getStaffMedia({ staff_id }),
      );

      const results = await Promise.allSettled(promises);

      const successfulResults: StaffMediaResponse[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value);
        } else {
          errors.push(`Мастер ${staffIds[index]}: ${result.reason}`);
        }
      });

      if (errors.length > 0) {
        LoggerUtil.warn(
          'Ошибки при загрузке данных некоторых мастеров:',
          errors,
        );
      }

      LoggerUtil.info(
        `Успешно загружены данные для ${successfulResults.length} из ${staffIds.length} мастеров`,
      );

      return successfulResults;
    } catch (error) {
      LoggerUtil.error('Ошибка при загрузке данных мастеров:', error);
      throw error;
    }
  }
}
