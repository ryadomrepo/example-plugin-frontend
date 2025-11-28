/**
 * Валидация contract.json
 */

const fs = require('fs')
const {log} = require('../utils/logger')
const {CONTRACT_FILE} = require('../utils/constants')

/**
 * Валидирует поле "application" в конфигурации пакета
 * @param {string} packageName - Имя пакета
 * @param {Object} packageConfig - Конфигурация пакета
 * @returns {boolean} true если поле валидно, false в противном случае
 */
function validateApplicationField(packageName, packageConfig) {
  if (!packageConfig.hasOwnProperty('application')) {
    log(`[FAIL] В пакете "${packageName}" отсутствует обязательное поле "application"`, 'red')
    return false
  }

  if (typeof packageConfig.application !== 'string') {
    log(`[FAIL] Поле "application" в пакете "${packageName}" должно быть строкой`, 'red')
    return false
  }

  return true
}

/**
 * Валидирует поле "areas" в конфигурации пакета
 * @param {string} packageName - Имя пакета
 * @param {Object} packageConfig - Конфигурация пакета
 * @returns {boolean} true если поле валидно, false в противном случае
 */
function validateAreasField(packageName, packageConfig) {
  if (!packageConfig.hasOwnProperty('areas')) {
    log(`[FAIL] В пакете "${packageName}" отсутствует обязательное поле "areas"`, 'red')
    return false
  }

  if (!Array.isArray(packageConfig.areas)) {
    log(`[FAIL] Поле "areas" в пакете "${packageName}" должно быть массивом`, 'red')
    return false
  }

  if (packageConfig.areas.length === 0) {
    log(`[FAIL] Поле "areas" в пакете "${packageName}" не может быть пустым массивом`, 'red')
    return false
  }

  // Проверка, что все элементы areas - строки
  const invalidAreas = packageConfig.areas.filter(area => typeof area !== 'string')
  if (invalidAreas.length > 0) {
    log(`[FAIL] В пакете "${packageName}" поле "areas" должно содержать только строки`, 'red')
    return false
  }

  return true
}

/**
 * Валидирует структуру всех пакетов в контракте
 * @param {Object} contract - Объект контракта
 * @returns {boolean} true если все пакеты валидны, false в противном случае
 */
function validatePackagesStructure(contract) {
  let hasPackageErrors = false
  for (const [packageName, packageConfig] of Object.entries(contract.packages)) {
    if (!validateApplicationField(packageName, packageConfig)) {
      hasPackageErrors = true
      continue
    }

    if (!validateAreasField(packageName, packageConfig)) {
      hasPackageErrors = true
    }
  }

  return !hasPackageErrors
}

/**
 * Валидирует поле "packages" в контракте
 * @param {Object} contract - Объект контракта
 * @returns {Array<string>|null} Массив имен пакетов или null при ошибке
 */
function validatePackagesField(contract) {
  if (!contract.hasOwnProperty('packages')) {
    log(`[FAIL] В ${CONTRACT_FILE} отсутствует обязательное поле "packages"`, 'red')
    return null
  }

  if (typeof contract.packages !== 'object' || contract.packages === null || Array.isArray(contract.packages)) {
    log(`[FAIL] Поле "packages" в ${CONTRACT_FILE} должно быть объектом`, 'red')
    return null
  }

  const packageNames = Object.keys(contract.packages)
  if (packageNames.length === 0) {
    log(`[FAIL] Поле "packages" в ${CONTRACT_FILE} не может быть пустым`, 'red')
    return null
  }

  return packageNames
}

/**
 * Валидирует поле "plugin-slug" в контракте
 * @param {Object} contract - Объект контракта
 * @returns {boolean} true если поле валидно, false в противном случае
 */
function validatePluginSlugField(contract) {
  if (!contract.hasOwnProperty('plugin-slug')) {
    log(`[FAIL] В ${CONTRACT_FILE} отсутствует обязательное поле "plugin-slug"`, 'red')
    return false
  }

  if (typeof contract['plugin-slug'] !== 'string') {
    log(`[FAIL] Поле "plugin-slug" в ${CONTRACT_FILE} должно быть строкой`, 'red')
    return false
  }

  if (contract['plugin-slug'].trim() === '') {
    log(`[FAIL] Поле "plugin-slug" в ${CONTRACT_FILE} не может быть пустой строкой`, 'red')
    return false
  }

  return true
}

/**
 * Загружает и валидирует contract.json
 * @param {string} contractPath - Путь к файлу contract.json
 * @returns {Object|null} Объект контракта или null при ошибке
 */
function loadAndValidateContract(contractPath) {
  // Загрузка и парсинг JSON
  let contractContent
  try {
    contractContent = fs.readFileSync(contractPath, 'utf8')
  } catch (error) {
    log(`[FAIL] Ошибка при чтении файла ${CONTRACT_FILE}`, 'red')
    log(`   Ошибка: ${error.message}`, 'yellow')
    return null
  }

  let contract
  try {
    contract = JSON.parse(contractContent)
  } catch (error) {
    log(`[FAIL] Файл ${CONTRACT_FILE} содержит невалидный JSON`, 'red')
    log(`   Ошибка: ${error.message}`, 'yellow')
    return null
  }

  // Валидация поля "packages"
  const packageNames = validatePackagesField(contract)
  if (!packageNames) {
    return null
  }

  // Валидация поля "plugin-slug"
  if (!validatePluginSlugField(contract)) {
    return null
  }

  // Валидация структуры каждого пакета
  if (!validatePackagesStructure(contract)) {
    return null
  }

  log(`[PASS] ${CONTRACT_FILE} загружен и валидирован`, 'green')
  log(`   Найдено пакетов: ${packageNames.length}`, 'cyan')
  if (packageNames.length > 0) {
    packageNames.forEach(packageName => {
      log(`   - ${packageName}`, 'cyan')
    })
  }

  return contract
}

module.exports = {
  loadAndValidateContract,
}
