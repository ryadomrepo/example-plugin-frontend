/**
 * Утилиты для логирования с цветным выводом в консоль
 */

/**
 * ANSI коды цветов для вывода в консоль
 * @type {Object<string, string>}
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

/**
 * Выводит сообщение в консоль с указанным цветом
 * @param {string} message - Текст сообщения
 * @param {string} [color='reset'] - Цвет сообщения
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

module.exports = {
  log,
}

