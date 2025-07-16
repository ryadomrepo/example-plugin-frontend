/**
 * Сервис для работы с checkbox компонентом
 *
 * Предоставляет методы для создания и управления
 * HTML checkbox элементами
 */

/**
 * Интерфейс для конфигурации checkbox
 */
export interface ICheckboxConfig {
  id?: string;
  name?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (checked: boolean) => void;
}

/**
 * Сервис для работы с checkbox компонентом
 */
export class CheckboxService {
  /**
   * Создает HTML элемент checkbox с заданной конфигурацией
   *
   * @param config - Конфигурация checkbox
   * @returns HTML элемент checkbox
   */
  static createCheckbox(config: ICheckboxConfig = {}): HTMLElement {
    const {
      id = `checkbox-${Date.now()}`,
      name = 'checkbox',
      label = 'Checkbox',
      checked = false,
      disabled = false,
      className = 'plugin-checkbox',
      onChange,
    } = config;

    // Создаем контейнер для checkbox
    const container = document.createElement('div');
    container.className = `${className}-container`;
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    // Создаем input checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.name = name;
    checkbox.checked = checked;
    checkbox.disabled = disabled;
    checkbox.className = `${className}-input`;
    checkbox.style.cssText = `
      width: 16px;
      height: 16px;
      margin: 0;
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      opacity: ${disabled ? '0.6' : '1'};
    `;

    // Создаем label
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    labelElement.className = `${className}-label`;
    labelElement.style.cssText = `
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      user-select: none;
      color: ${disabled ? '#999' : '#333'};
    `;

    // Добавляем обработчик события изменения
    checkbox.addEventListener('change', (event) => {
      const target = event.target;

      // Проверяем, что target является HTMLInputElement
      if (target instanceof HTMLInputElement) {
        // Вызываем callback если предоставлен
        if (onChange) {
          onChange(target.checked);
        }
      }
    });

    // Собираем компонент
    container.appendChild(checkbox);
    container.appendChild(labelElement);

    return container;
  }
}
