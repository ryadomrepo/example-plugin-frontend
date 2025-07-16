/**
 * Типы событий для коммуникации между хостом и плагином timetable-record-client-name
 *
 * Этот файл определяет типы данных для событий, которые используются
 * для обмена данными между хост-приложением и плагином timetable-record-client-name.
 *
 * События разделены на две категории:
 * 1. События от хоста к плагину (Host -> Plugin)
 * 2. События от плагина к хосту (Plugin -> Host)
 * 3. События между плагинами (Plugin -> Plugin)
 */

import type { TPluginEvent } from '@yclients-plugins/utils';

/**
 * Данные, передаваемые хостом при уведомлении о своей готовности
 *
 * Содержит информацию, необходимую для корректной инициализации
 * и работы плагина после того, как хост сообщил о своей готовности
 * к взаимодействию.
 *
 * @property {string} clientName - Имя клиента.
 * @property {string} clientSurname - Фамилия клиента.
 * @property {string} clientPatronymic - Отчество клиента.
 * Передается хостом для инициализации внутренней структуры плагина.
 */
export type THostReadyPayload = {
  clientName: string;
  clientSurname: string;
  clientPatronymic: string;
};

/**
 * Данные, передаваемые плагином при уведомлении о своем обновлении
 *
 * Содержит информацию, необходимую для корректной работы плагина после обновления.
 */
export type TPluginUpdatePayload = {
  isVisible: boolean;
};

/**
 * Событие готовности хоста
 *
 * Отправляется хостом плагину после того, как хост завершил
 * свою инициализацию и готов к обмену данными с плагином.
 *
 * @template THostReadyPayload - Данные, необходимые для инициализации плагина
 */
export type THostReadyEvent = TPluginEvent<THostReadyPayload>;

/**
 * Событие обновления хоста
 *
 * Отправляется хостом плагину после того, как хост обновился.
 * Сигнализирует плагину о том, что хост обновлен.
 *
 * @template null - Данные не передаются.
 */
export type THostUpdateEvent = TPluginEvent<null>;

/**
 * Событие завершения работы хоста
 *
 * Отправляется при завершении работы хоста.
 * Сигнализирует остальным плагинам о том, что хост завершен.
 *
 * @template null - Данные не передаются.
 */
export type THostShutdownEvent = TPluginEvent<null>;

/**
 * Событие готовности плагина
 *
 * Отправляется после инициализации плагина.
 * Сигнализирует хосту о готовности к работе.
 *
 * @template null - Данные не передаются.
 */
export type TPluginReadyEvent = TPluginEvent<null>;

/**
 * Событие обновления плагина
 *
 * Отправляется при обновлении плагина.
 * Сигнализирует остальным плагинам о том, что плагин обновлен.
 *
 * @template TPluginUpdatePayload - Данные, необходимые для обновления плагина.
 */
export type TPluginUpdateEvent = TPluginEvent<TPluginUpdatePayload>;

/**
 * Событие завершения работы плагина
 *
 * Отправляется при завершении работы плагина.
 * Сигнализирует остальным плагинам о том, что плагин завершен.
 *
 * @template null - Данные не передаются.
 */
export type TPluginShutdownEvent = TPluginEvent<null>;
