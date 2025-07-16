import { initializePlugin } from './plugin';

// Инициализируем плагин и сохраняем функцию отписки
const cleanup = initializePlugin();

// Экспортируем функцию очистки для возможности ручного вызова
export { cleanup };
