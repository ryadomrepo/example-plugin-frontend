# Regenerate Lockfile

Скрипт для пересоздания `package-lock.json` на Linux платформе через Docker.

## Проблема

Ранее при генерации `package-lock.json` на macOS или Windows отсутствовали Linux-специфичные optional dependencies (например, `@rollup/rollup-linux-x64-gnu`), которые необходимы для успешной сборки в CI на Linux. Это приводило к ошибке:

```text
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

## Важное замечание: npm 10.x

**npm версии 10.x и выше** автоматически включает все платформо-специфичные optional dependencies при создании `package-lock.json`, независимо от платформы (macOS, Windows, Linux).

Проверено на npm 10.9.0: при пересоздании `package-lock.json` на macOS все Linux optional dependencies автоматически включаются в lockfile.

### Когда использовать скрипт

Скрипт все еще полезен в следующих случаях:

- Если используется npm версии ниже 10.x
- Для гарантии совместимости и воспроизводимости сборки
- Для проверки, что все optional dependencies корректно включены
- Для явного создания lockfile в Linux-окружении, идентичном CI

## Решение

Скрипт использует Docker контейнер с Linux/AMD64 для генерации `package-lock.json`, гарантируя включение всех необходимых optional dependencies для Linux платформы.

## Требования

- Docker установлен и запущен
- Доступ к Docker Hub (для загрузки публичного образа `node:20-bookworm`)

## Использование

### Через npm-скрипт (рекомендуется)

```bash
npm run regenerate-lockfile
```

### Напрямую

```bash
./scripts/lockfile/regenerate-lockfile.sh
```

## Что делает скрипт

1. Запускает Docker контейнер с Node.js 20 на Linux/AMD64
2. Удаляет существующий `package-lock.json`
3. Очищает все `node_modules` (корень и workspaces)
4. Устанавливает зависимости в правильном порядке:
   - Сначала `packages/utils`
   - Затем корень проекта
5. Проверяет наличие Linux-специфичных optional dependencies

## После выполнения

1. Проверьте изменения: `git diff package-lock.json`
2. Закоммитьте изменения: `git add package-lock.json && git commit -m 'chore: Пересоздан package-lock.json на Linux платформе'`
3. Отправьте в репозиторий и убедитесь, что CI проходит успешно
