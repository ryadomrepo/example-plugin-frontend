/**
 * Валидация директории dist
 */

const fs = require('fs')
const path = require('path')
const {log} = require('../utils/logger')
const {DIST_DIR} = require('../utils/constants')

/**
 * Проверяет наличие и доступность директории dist
 * @returns {boolean} true если директория существует и доступна, false в противном случае
 */
function validateDistDirectory() {
  const distPath = path.resolve(process.cwd(), DIST_DIR)

  try {
    const stats = fs.statSync(distPath)
    if (!stats.isDirectory()) {
      log(`[FAIL] ${DIST_DIR}/ не является директорией`, 'red')
      return false
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      log(`[FAIL] Директория ${DIST_DIR}/ не найдена`, 'red')
      log(`   Ожидаемый путь: ${distPath}`, 'yellow')
    } else {
      log(`[FAIL] Ошибка при проверке директории ${DIST_DIR}/`, 'red')
      log(`   Ошибка: ${error.message}`, 'yellow')
    }
    return false
  }

  log(`[PASS] Директория ${DIST_DIR}/ найдена`, 'green')
  return true
}

module.exports = {
  validateDistDirectory,
}

