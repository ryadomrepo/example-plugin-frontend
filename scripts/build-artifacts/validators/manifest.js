/**
 * Валидация manifest.json
 */

const fs = require('fs')
const path = require('path')
const {log} = require('../utils/logger')
const {MANIFEST_FILE} = require('../utils/constants')

/**
 * Валидирует manifest.json для конкретного пакета
 * @param {string} packageName - Имя пакета
 * @param {string} packagePath - Путь к директории пакета
 * @returns {Object|null} Объект манифеста или null при ошибке
 */
function validatePackageManifest(packageName, packagePath) {
  const manifestPath = path.join(packagePath, MANIFEST_FILE)

  // Проверка наличия файла и его типа
  try {
    const stats = fs.statSync(manifestPath)
    if (!stats.isFile()) {
      log(`[FAIL] ${MANIFEST_FILE} в пакете "${packageName}" не является файлом`, 'red')
      return null
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      log(`[FAIL] Файл ${MANIFEST_FILE} не найден в пакете "${packageName}"`, 'red')
      log(`   Ожидаемый путь: ${manifestPath}`, 'yellow')
    } else {
      log(`[FAIL] Ошибка при проверке файла ${MANIFEST_FILE} в пакете "${packageName}"`, 'red')
      log(`   Ошибка: ${error.message}`, 'yellow')
    }
    return null
  }

  // Загрузка и парсинг JSON
  let manifestContent
  try {
    manifestContent = fs.readFileSync(manifestPath, 'utf8')
  } catch (error) {
    log(`[FAIL] Ошибка при чтении файла ${MANIFEST_FILE} в пакете "${packageName}"`, 'red')
    log(`   Ошибка: ${error.message}`, 'yellow')
    return null
  }

  let manifest
  try {
    manifest = JSON.parse(manifestContent)
  } catch (error) {
    log(`[FAIL] Файл ${MANIFEST_FILE} в пакете "${packageName}" содержит невалидный JSON`, 'red')
    log(`   Ошибка: ${error.message}`, 'yellow')
    return null
  }

  // Проверка наличия ключа с именем пакета
  if (!manifest.hasOwnProperty(packageName)) {
    log(`[FAIL] В ${MANIFEST_FILE} пакета "${packageName}" отсутствует ключ "${packageName}"`, 'red')
    return null
  }

  const packageFiles = manifest[packageName]

  // Проверка, что значение - массив
  if (!Array.isArray(packageFiles)) {
    log(`[FAIL] Значение ключа "${packageName}" в ${MANIFEST_FILE} должно быть массивом`, 'red')
    return null
  }

  // Валидация каждого элемента массива
  let hasFileErrors = false
  packageFiles.forEach((fileInfo, index) => {
    if (!fileInfo.hasOwnProperty('name')) {
      log(`[FAIL] В ${MANIFEST_FILE} пакета "${packageName}" элемент [${index}] не содержит поле "name"`, 'red')
      hasFileErrors = true
      return
    }

    if (typeof fileInfo.name !== 'string' || fileInfo.name.trim() === '') {
      log(`[FAIL] Поле "name" в элементе [${index}] ${MANIFEST_FILE} пакета "${packageName}" должно быть непустой строкой`, 'red')
      hasFileErrors = true
      return
    }

    if (!fileInfo.hasOwnProperty('type')) {
      log(`[FAIL] В ${MANIFEST_FILE} пакета "${packageName}" элемент [${index}] не содержит поле "type"`, 'red')
      hasFileErrors = true
      return
    }

    if (typeof fileInfo.type !== 'string') {
      log(`[FAIL] Поле "type" в элементе [${index}] ${MANIFEST_FILE} пакета "${packageName}" должно быть строкой`, 'red')
      hasFileErrors = true
      return
    }

    const validTypes = ['script', 'stylesheet']
    if (!validTypes.includes(fileInfo.type)) {
      log(`[FAIL] Поле "type" в элементе [${index}] ${MANIFEST_FILE} пакета "${packageName}" должно быть одним из: ${validTypes.join(', ')}`, 'red')
      hasFileErrors = true
    }
  })

  if (hasFileErrors) {
    return null
  }

  log(`[PASS] ${MANIFEST_FILE} в пакете "${packageName}" валидирован`, 'green')
  log(`   Найдено файлов: ${packageFiles.length}`, 'cyan')

  return manifest
}

module.exports = {
  validatePackageManifest,
}

