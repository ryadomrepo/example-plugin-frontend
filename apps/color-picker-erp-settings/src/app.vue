<template>
  <main class="color-picker">
    <section class="color-picker__section">
      <header class="color-picker__header">
        <h2 class="color-picker__title">Настройка цветов виджета</h2>
      </header>

      <div class="color-picker__content">
        <aside class="color-picker__tokens" aria-label="Настройки цветов">
          <color-token-row
            v-for="token in COLOR_TOKEN_KEYS"
            :key="token"
            :token="token"
            :color="colorTokensByType.get(token)"
            @update:color="updateColorToken(token, $event)"
            class="color-picker__token"
          />
        </aside>

        <div class="color-picker__preview">
          <iframe
            ref="widgetRef"
            :src="colorPickerWidgetUrl.href"
            class="color-picker__frame"
            title="Предпросмотр виджета"
            aria-label="Предпросмотр виджета с выбранными цветами"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { TColorTokenKey, TColorTokensMap } from './types/tokens';
import { TWidgetColorMessage } from './types/messages';
import { COLOR_TOKEN_KEYS } from './constants/color-tokens';
import ColorTokenRow from './components/color-token-row.vue';

interface Props {
  iframeUrl: string;
}

const props = defineProps<Props>();

const colorPickerWidgetRef = useTemplateRef<HTMLIFrameElement>('widgetRef');
const colorPickerWidgetUrl = new URL(props.iframeUrl);
const colorTokensByType = new Map<TColorTokenKey, string>();

const createColorTokensMessage = (
  tokens: Map<TColorTokenKey, string>,
): TWidgetColorMessage => ({
  type: 'color_tokens_map',
  data: Object.fromEntries(tokens) as TColorTokensMap,
});

const sendMessageToWidget = (message: TWidgetColorMessage) => {
  if (!colorPickerWidgetRef.value?.contentWindow) return;

  colorPickerWidgetRef.value.contentWindow.postMessage(
    message,
    colorPickerWidgetUrl.origin,
  );
};

const updateColorToken = (token: TColorTokenKey, color: string) => {
  const currentColor = colorTokensByType.get(token);
  if (currentColor === color) return;

  colorTokensByType.set(token, color);
  const message = createColorTokensMessage(colorTokensByType);
  sendMessageToWidget(message);
};
</script>

<style scoped>
.color-picker {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1440px;
  margin: 0 auto;
}

.color-picker__section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.color-picker__header {
  margin-bottom: 8px;
}

.color-picker__title {
  font-size: 1.2em;
  margin: 0;
  color: #333;
}

.color-picker__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 768px) {
  .color-picker__content {
    flex-direction: row;
    gap: 60px;
  }
}

.color-picker__tokens {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
}

.color-picker__preview {
  flex: 1;
  min-height: 500px;
}

.color-picker__frame {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
