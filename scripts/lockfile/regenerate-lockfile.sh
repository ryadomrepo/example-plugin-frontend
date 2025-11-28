#!/bin/bash
# Скрипт для пересоздания package-lock.json на Linux платформе
# Использование: ./regenerate-lockfile.sh

set -e

# Определяем абсолютный путь к корню проекта
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Ошибка: Docker не установлен или не доступен в PATH"
  echo "   Установите Docker: https://docs.docker.com/get-docker/"
  exit 1
fi

# Проверяем, что Docker запущен
if ! docker info &> /dev/null; then
  echo "❌ Ошибка: Docker не запущен"
  echo "   Запустите Docker и попробуйте снова"
  exit 1
fi

# Переходим в корень проекта
cd "${PROJECT_ROOT}"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
  echo "❌ Ошибка: package.json не найден в директории ${PROJECT_ROOT}"
  echo "   Убедитесь, что скрипт находится в scripts/lockfile/ внутри проекта"
  exit 1
fi

echo "🔄 Начинаем пересоздание package-lock.json на Linux..."
echo "📦 Текущая директория: $(pwd)"
echo "📋 Версии Node.js и npm локально:"
node --version
npm --version

echo ""
echo "🐳 Запускаем Docker контейнер для пересоздания package-lock.json..."
echo ""

# Запускаем Docker контейнер и выполняем команды для пересоздания package-lock.json
docker run --platform linux/amd64 --rm \
  -v "${PROJECT_ROOT}:/code" \
  -w /code \
  --entrypoint=/bin/bash \
  node:20-bookworm \
  -c "
    echo '📦 Версии Node.js и npm в контейнере:'
    node --version
    npm --version
    echo ''
    echo '🗑️  Удаляем старый package-lock.json...'
    rm -f package-lock.json
    echo ''
    echo '🧹 Очищаем все node_modules (корень и workspaces)...'
    npm run clean
    echo ''
    echo '📥 Шаг 1: Устанавливаем зависимости в packages/utils для пересоздания package-lock.json...'
    if [ ! -d packages/utils ]; then
      echo '⚠️  Предупреждение: packages/utils не найден, пропускаем установку'
    else
      cd packages/utils
      npm install
      cd /code
    fi
    echo ''
    echo '📥 Шаг 2: Устанавливаем зависимости в корне проекта...'
    cd /code
    npm install
    echo ''
    echo '🔍 Проверяем, что package-lock.json создан...'
    if [ ! -f package-lock.json ]; then
      echo '❌ Ошибка: package-lock.json не был создан'
      exit 1
    fi
    echo '✅ package-lock.json пересоздан на Linux платформе!'
    echo ''
    echo '🔍 Проверяем наличие Linux-специфичных optional dependencies...'
    if grep -q '@rollup/rollup-linux-x64-gnu' package-lock.json; then
      echo '✅ @rollup/rollup-linux-x64-gnu найден в package-lock.json'
    else
      echo '⚠️  @rollup/rollup-linux-x64-gnu не найден в package-lock.json'
    fi
  "

echo ""
echo "✅ Готово! package-lock.json пересоздан на Linux платформе."
echo ""
echo "📋 Следующие шаги:"
echo "1. Проверьте изменения в package-lock.json: git diff package-lock.json"
echo "2. Закоммитьте изменения: git add package-lock.json && git commit -m 'chore: пересоздать package-lock.json на Linux платформе'"
echo "3. Отправьте изменения в репозиторий и проверьте, что CI проходит успешно"

