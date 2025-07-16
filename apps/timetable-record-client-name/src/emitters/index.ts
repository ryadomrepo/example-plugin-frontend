/**
 * Экспорт всех компонентов эмиттера событий
 */

// Основной эмиттер событий
export { PluginEventEmitter, pluginEventEmitter } from './plugin-event-emitter';

// Базовые компоненты
export { EventManager } from './core/event-manager';
export { EventValidator } from './validators/event-validator';
export { EventConfig } from './config/event-config';
export { EventLogger } from './loggers/event-logger';

// Типы областей плагина
export type { TPluginArea } from './types/plugin-areas';
