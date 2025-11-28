#!/usr/bin/env node

/**
 * Скрипт валидации артефактов сборки
 *
 * Проверяет:
 * 1. Наличие и корректность contract.json
 * 2. Соответствие директорий пакетов записям в contract.json
 * 3. Наличие и корректность manifest.json в каждом пакете
 * 4. Существование файлов, указанных в manifest.json, и соответствие их типов расширениям
 */

const fs = require('fs')
const path = require('path')

const {log} = require('./utils/logger')
const {DIST_DIR, CONTRACT_FILE} = require('./utils/constants')
const {validateDistDirectory} = require('./validators/dist-directory')
const {loadAndValidateContract} = require('./validators/contract')
const {validatePackageDirectories} = require('./validators/package-directories')
const {validatePackageManifest} = require('./validators/manifest')
const {validateManifestFiles} = require('./validators/manifest-files')

/**
 * Завершает валидацию с ошибкой
 */
function exitWithError() {
  log('\n[FAIL] Валидация завершена с ошибками', 'red')
  process.exit(1)
}

/**
 * Проверяет существование и тип файла contract.json
 * @param {string} contractPath - Путь к файлу contract.json
 * @returns {boolean} true если файл существует и является файлом, false в противном случае
 */
function validateContractPath(contractPath) {
  try {
    const stats = fs.statSync(contractPath)
    if (!stats.isFile()) {
      log(`[FAIL] ${CONTRACT_FILE} не является файлом`, 'red')
      return false
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      log(`[FAIL] Файл ${CONTRACT_FILE} не найден`, 'red')
      log(`   Ожидаемый путь: ${contractPath}`, 'yellow')
    } else {
      log(`[FAIL] Ошибка при проверке файла ${CONTRACT_FILE}`, 'red')
      log(`   Ошибка: ${error.message}`, 'yellow')
    }
    return false
  }

  log(`[PASS] Файл ${CONTRACT_FILE} найден`, 'green')
  return true
}

/**
 * Валидирует пути и загружает manifest.json для всех пакетов
 * @param {Object} contract - Объект контракта
 * @param {string} distPath - Путь к директории dist
 * @returns {Object|null} Объект с манифестами пакетов или null при ошибке
 */
function validatePackageManifestPaths(contract, distPath) {
  log('\nВалидация manifest.json в каждом пакете', 'cyan')
  log('─'.repeat(50), 'cyan')

  const packageNames = Object.keys(contract.packages)
  let hasManifestErrors = false
  const packageManifests = {}

  for (const packageName of packageNames) {
    const packagePath = path.join(distPath, packageName)
    log(`\nПакет: ${packageName}`, 'cyan')

    const manifest = validatePackageManifest(packageName, packagePath)
    if (!manifest) {
      hasManifestErrors = true
    } else {
      packageManifests[packageName] = {
        manifest: manifest,
        path: packagePath,
      }
    }
  }

  if (hasManifestErrors) {
    return null
  }

  return packageManifests
}

/**
 * Валидирует файлы из manifest.json для всех пакетов
 * @param {Object} packageManifests - Объект с манифестами пакетов
 * @returns {boolean} true если все файлы валидны, false в противном случае
 */
function validatePackageManifestFiles(packageManifests) {
  log('\nВалидация файлов из manifest.json', 'cyan')
  log('─'.repeat(50), 'cyan')

  let hasFileErrors = false
  for (const [packageName, {manifest, path: packagePath}] of Object.entries(packageManifests)) {
    log(`\nПакет: ${packageName}`, 'cyan')
    if (!validateManifestFiles(packageName, manifest, packagePath)) {
      hasFileErrors = true
    }
  }

  return !hasFileErrors
}

/**
 * Валидирует contract.json (путь, чтение, проверка директорий)
 * @param {string} distPath - Путь к директории dist
 * @returns {Object|null} Объект контракта или null при ошибке
 */
function validateContract(distPath) {
  log('\nВалидация contract.json', 'cyan')
  log('─'.repeat(50), 'cyan')

  const contractPath = path.resolve(distPath, CONTRACT_FILE)
  if (!validateContractPath(contractPath)) {
    return null
  }

  const contract = loadAndValidateContract(contractPath)
  if (!contract) {
    return null
  }

  log('\nВалидация директорий пакетов', 'cyan')
  log('─'.repeat(50), 'cyan')

  if (!validatePackageDirectories(contract, distPath)) {
    return null
  }

  return contract
}

/**
 * Валидирует manifest.json для всех пакетов (пути и файлы)
 * @param {Object} contract - Объект контракта
 * @param {string} distPath - Путь к директории dist
 * @returns {boolean} true если все манифесты валидны, false в противном случае
 */
function validatePackagesManifests(contract, distPath) {
  const packageManifests = validatePackageManifestPaths(contract, distPath)
  if (!packageManifests) {
    return false
  }

  if (!validatePackageManifestFiles(packageManifests)) {
    return false
  }

  return true
}

/**
 * Основная функция валидации
 */
function validateBuildArtifacts() {
  log('\nВалидация артефактов сборки\n', 'cyan')

  log('Проверка структуры директории', 'cyan')
  log('─'.repeat(50), 'cyan')

  if (!validateDistDirectory()) {
    exitWithError()
  }

  const distPath = path.resolve(process.cwd(), DIST_DIR)

  const contract = validateContract(distPath)
  if (!contract) {
    exitWithError()
  }

  if (!validatePackagesManifests(contract, distPath)) {
    exitWithError()
  }

  log(`\n${'='.repeat(50)}`, 'cyan')
  log('\n[PASS] Валидация артефактов сборки пройдена успешно', 'green')
}

// Запускаем валидацию
validateBuildArtifacts()
