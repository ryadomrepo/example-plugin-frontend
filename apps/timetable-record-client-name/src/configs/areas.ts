/**
 * Конфигурация маппинга зон к containerId
 * Этот файл можно изменять без изменения основного кода плагина
 */

/**
 * Генерировать уникальный containerId для записи
 * @param area - название зоны
 * @param recordId - уникальный идентификатор записи
 * @returns уникальный containerId
 */
export function generateContainerIdForRecord(
  area: string,
  recordId: string | number,
): string {
  return `${area}-${recordId}`;
}

/**
 * Найти все контейнеры для зоны по паттерну
 * @param area - название зоны
 * @returns массив containerId для зоны
 */
export function findContainersForArea(area: string): string[] {
  // Ищем все контейнеры с data-атрибутом, соответствующим зоне
  const containers = document.querySelectorAll(
    `[data-plugin-container*="${area}"]`,
  );
  const containerIds: string[] = [];

  containers.forEach((container) => {
    const containerId = container.getAttribute('data-plugin-container');
    if (containerId) {
      containerIds.push(containerId);
    }
  });

  return containerIds;
}

/**
 * Проверить, является ли containerId валидным для зоны
 * @param containerId - ID контейнера
 * @param area - название зоны
 * @returns true, если контейнер принадлежит зоне
 */
export function isValidContainerForArea(
  containerId: string,
  area: string,
): boolean {
  return containerId.startsWith(area) || containerId.includes(area);
}
