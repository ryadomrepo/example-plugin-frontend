<template>
  <div
    class="color-token-row"
    role="group"
    :aria-label="`Цветовая переменная: ${token}`"
  >
    <label :for="`color-picker-${token}`" class="color-token-row__name">
      {{ token }}
    </label>

    <div class="color-token-row__picker">
      <input
        type="color"
        :id="`color-picker-${token}`"
        :value="color"
        @input="updateColor"
        :title="token"
        class="color-picker__input"
      />

      <div v-if="color" class="color-picker__reset" @click="resetColor">
        Сбросить
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TColorTokenKey } from '../types/tokens';

const DEFAULT_COLOR = '#000000';

interface Props {
  token: TColorTokenKey;
  color?: string;
}

interface Emits {
  (event: 'update:color', value: string): void;
}

withDefaults(defineProps<Props>(), {
  color: DEFAULT_COLOR,
});

const emit = defineEmits<Emits>();

const updateColor = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:color', target.value);
};

const resetColor = () => {
  emit('update:color', '');
};
</script>

<style scoped>
.color-token-row {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.color-token-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.color-token-row__name {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #333;
  cursor: pointer;
  user-select: none;
}

.color-token-row__picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 112px;
  flex-shrink: 0;
}

.color-picker__input {
  -webkit-appearance: none;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.color-picker__input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker__input::-webkit-color-swatch {
  border: 2px solid #e0e0e0;
  border-radius: 4px;
}

.color-picker__input::-moz-color-swatch {
  border: 2px solid #e0e0e0;
  border-radius: 4px;
}

.color-picker__reset {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

@media (max-width: 480px) {
  .color-token-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .color-token-row__picker {
    width: 100%;
  }
}
</style>
