/**
 * Типы для работы с API CharmDirect
 */

/**
 * Элемент медиа в коллекции
 */
export interface MediaItem {
  /** Уникальный идентификатор медиа */
  mediaId: string;
  /** URL изображения */
  media_url: string;
}

/**
 * Коллекция портфолио мастера
 */
export interface Collection {
  /** Уникальный идентификатор коллекции */
  id: string;
  /** Название коллекции */
  name: string;
  /** Описание коллекции */
  description: string | null;
  /** URL коллекции на сайте */
  url: string;
  /** Массив медиа элементов */
  items: MediaItem[];
}

/**
 * Ответ API для получения медиа данных мастера
 */
export interface StaffMediaResponse {
  /** ID мастера */
  staff_id: string;
  /** Массив коллекций портфолио */
  collections: Collection[];
}

/**
 * Параметры запроса для получения медиа данных
 */
export interface GetStaffMediaParams {
  /** ID мастера */
  staff_id: string;
}

/**
 * Состояние загрузки данных
 */
export interface LoadingState {
  /** Флаг загрузки */
  isLoading: boolean;
  /** Ошибка загрузки */
  error: string | null;
}
