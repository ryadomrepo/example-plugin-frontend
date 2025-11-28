/**
 * Валидация директорий пакетов
 */

const fs = require('fs')
const path = require('path')
const {log} = require('../utils/logger')

/**
 * Валидирует директории пакетов на соответствие записям в contract.json
 * @param {Object} contract - Объект контракта
 * @param {string} distPath - Путь к директории dist
 * @returns {boolean} true если все директории валидны, false в противном случае
 */
function validatePackageDirectories(contract, distPath) {
  const packageNames = Object.keys(contract.packages)
  let hasErrors = false

  for (const packageName of packageNames) {
    const packageDirPath = path.join(distPath, packageName)

    try {
      const stats = fs.statSync(packageDirPath)
      if (!stats.isDirectory()) {
        log(`[FAIL] "${packageName}" не является директорией`, 'red')
        log(`   Путь: ${packageDirPath}`, 'yellow')
        hasErrors = true
        continue
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        log(`[FAIL] Директория пакета "${packageName}" не найдена`, 'red')
        log(`   Ожидаемый путь: ${packageDirPath}`, 'yellow')
      } else {
        log(`[FAIL] Ошибка при проверке директории пакета "${packageName}"`, 'red')
        log(`   Ошибка: ${error.message}`, 'yellow')
      }
      hasErrors = true
      continue
    }

    log(`[PASS] Директория пакета "${packageName}" найдена`, 'green')
  }

  // Проверяем, нет ли лишних директорий (директории, которые не упомянуты в contract.json)
  // Игнорируем файлы (например, contract.json)
  const distEntries = fs.readdirSync(distPath, {withFileTypes: true})
  const extraDirectories = distEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(dirName => !packageNames.includes(dirName))

  if (extraDirectories.length > 0) {
    log(`\n[WARN] Найдены директории, не упомянутые в contract.json:`, 'yellow')
    extraDirectories.forEach(dirName => {
      log(`   - ${dirName}`, 'yellow')
    })
    // Это предупреждение, не ошибка, поэтому не устанавливаем hasErrors = true
  }

  return !hasErrors
}

module.exports = {
  validatePackageDirectories,
}

