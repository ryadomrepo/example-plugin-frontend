# Документация по базовой конфигурации TypeScript

Этот файл содержит базовую конфигурацию TypeScript для проекта YCLIENTS. Ниже приведено подробное описание всех настроек.

## Схема конфигурации

```json
"$schema": "https://json.schemastore.org/tsconfig"
```

Указывает на схему JSON, которая используется для валидации конфигурационного файла.

## Настройки компилятора (compilerOptions)

### Основные настройки

- `"target": "esnext"` - версия JavaScript, в которую будет компилироваться TypeScript код (используется самая последняя версия)
- `"lib"` - список библиотек, которые будут доступны в проекте:
  - `"ESNext"` - типы для самых современных возможностей JavaScript
  - `"DOM"` - типы для DOM API
  - `"DOM.Iterable"` - типы для итерируемых DOM коллекций

### Настройки модулей

- `"module": "esnext"` - использует современный формат модулей ES
- `"moduleResolution": "nodenext"` - использует новый алгоритм разрешения модулей Node.js (Node 16+)
- `"baseUrl": "./"` - указывает базовый каталог для разрешения неотносительных имен модулей

### Настройки совместимости

- `"allowSyntheticDefaultImports": true` - разрешает импорт модулей без default export как если бы они имели default
- `"esModuleInterop": true` - улучшает совместимость с модулями CommonJS
- `"forceConsistentCasingInFileNames": true` - обеспечивает согласованность регистра в именах файлов

### Настройки строгости

- `"strict": true` - включает все строгие проверки типов
- `"noImplicitAny": true` - запрещает неявное использование типа `any`
- `"strictNullChecks": true` - включает строгую проверку null и undefined
- `"strictFunctionTypes": true` - включает строгую проверку типов функций
- `"strictBindCallApply": true` - включает строгую проверку аргументов методов bind/call/apply
- `"strictPropertyInitialization": true` - проверяет инициализацию свойств класса
- `"strictBuiltinIteratorReturn": true` - использует `undefined` вместо `any` для итераторов
- `"noImplicitThis": true` - проверяет тип `this` в функциях
- `"useUnknownInCatchVariables": true` - использует `unknown` вместо `any` в catch блоках
- `"alwaysStrict": true` - всегда генерирует 'use strict'
- `"noUnusedLocals": true` - проверяет неиспользуемые локальные переменные
- `"noUnusedParameters": true` - проверяет неиспользуемые параметры функций
- `"noImplicitReturns": true` - проверяет явные возвраты в функциях
- `"noFallthroughCasesInSwitch": true` - проверяет провал в switch конструкциях
- `"noUncheckedIndexedAccess": true` - добавляет `undefined` при индексированном доступе к массивам и объектам
- `"noPropertyAccessFromIndexSignature": true` - требует индексированный доступ для свойств с индексной сигнатурой

### Настройки генерации кода

- `"removeComments": true` - удаляет комментарии из сгенерированного JavaScript
- `"importHelpers": true` - импортирует хелперы из tslib для уменьшения размера бандла
- `"noEmitOnError": true` - не генерирует файлы при наличии ошибок компиляции

### Дополнительные настройки

- `"skipLibCheck": true` - пропускает проверку типов в файлах из node_modules

## Особенности конфигурации

### Современный подход к модулям

Конфигурация использует `"moduleResolution": "nodenext"`, что является новым стандартом для Node.js проектов. Это обеспечивает:

- Лучшую поддержку ESM модулей
- Корректное разрешение импортов в современных Node.js версиях
- Совместимость с новыми возможностями package.json

### Строгая типизация

Конфигурация включает максимально строгие настройки типизации:

- Все проверки `strict` режима включены
- Дополнительные проверки для предотвращения ошибок
- Строгая проверка null/undefined значений
- Проверка неиспользуемых переменных и параметров

### Оптимизация для современных инструментов

- Использование `esnext` как target и module обеспечивает максимальную совместимость с современными бандлерами
- `importHelpers` уменьшает размер итогового бандла
- `removeComments` очищает сгенерированный код

## Использование в проектах

Эта базовая конфигурация может быть расширена в конкретных проектах:

```json
{
  "extends": "@yclients-configs/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
