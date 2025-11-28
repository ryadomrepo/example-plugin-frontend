/**
 * Валидация файлов из manifest.json
 */

const fs = require('fs')
const path = require('path')
const {log} = require('../utils/logger')
const {MANIFEST_FILE} = require('../utils/constants')

/**
 * Валидирует существование файлов из manifest.json и соответствие их типов расширениям
 * @param {string} packageName - Имя пакета
 * @param {Object} manifest - Объект манифеста
 * @param {string} packagePath - Путь к директории пакета
 * @returns {boolean} true если все файлы валидны, false в противном случае
 */
function validateManifestFiles(packageName, manifest, packagePath) {
  const packageFiles = manifest[packageName]
  if (!Array.isArray(packageFiles) || packageFiles.length === 0) {
    return true // Если файлов нет, то и проверять нечего
  }

  let hasErrors = false
  let existingFilesCount = 0

  for (const fileInfo of packageFiles) {
    const fileName = fileInfo.name
    const fileType = fileInfo.type
    const filePath = path.join(packagePath, fileName)

    // Проверка существования файла и его типа
    try {
      const stats = fs.statSync(filePath)
      if (!stats.isFile()) {
        log(`[FAIL] "${fileName}" в пакете "${packageName}" не является файлом`, 'red')
        hasErrors = true
        continue
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        log(`[FAIL] Файл "${fileName}" из ${MANIFEST_FILE} не найден в пакете "${packageName}"`, 'red')
        log(`   Ожидаемый путь: ${filePath}`, 'yellow')
      } else {
        log(`[FAIL] Ошибка при проверке файла "${fileName}" в пакете "${packageName}"`, 'red')
        log(`   Ошибка: ${error.message}`, 'yellow')
      }
      hasErrors = true
      continue
    }

    // Проверка соответствия типа файла расширению
    const fileExtension = path.extname(fileName).toLowerCase()
    let expectedExtension

    if (fileType === 'script') {
      expectedExtension = '.js'
    } else if (fileType === 'stylesheet') {
      expectedExtension = '.css'
    } else {
      // Это не должно произойти, так как тип уже проверен в validatePackageManifest
      log(`[WARN] Неизвестный тип файла "${fileType}" для "${fileName}" в пакете "${packageName}"`, 'yellow')
      expectedExtension = null
    }

    if (expectedExtension && fileExtension !== expectedExtension) {
      log(`[FAIL] Несоответствие типа и расширения файла "${fileName}" в пакете "${packageName}"`, 'red')
      log(`   Тип в манифесте: "${fileType}", ожидаемое расширение: "${expectedExtension}", фактическое: "${fileExtension}"`, 'yellow')
      hasErrors = true
      continue
    }

    existingFilesCount++
  }

  if (!hasErrors) {
    log(`[PASS] Все файлы из ${MANIFEST_FILE} найдены (${existingFilesCount})`, 'green')
    
    // Выводим список всех файлов для наглядности
    if (packageFiles.length > 0) {
      packageFiles.forEach(fileInfo => {
        log(`   - ${fileInfo.name} (${fileInfo.type})`, 'cyan')
      })
    }
  }

  return !hasErrors
}

module.exports = {
  validateManifestFiles,
}

