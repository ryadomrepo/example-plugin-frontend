<template>
  <div class="client-loyalty-card-row">
    <div class="client-loyalty-card-row__label">
      {{ title }}
    </div>

    <div class="client-loyalty-card-row__title">
      {{ info }}
    </div>

    <div class="client-loyalty-card-row__value">
      {{ balance }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  info: string;
  balance: string;
}

defineProps<Props>();
</script>

<style scoped>
.client-loyalty-card-row__label {
  font-size: 14px;
  line-height: 20px;
}

.client-loyalty-card-row__value,
.client-loyalty-card-row__title {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 2px;
}

.client-loyalty-card-row__title {
  margin-bottom: 2px;
  color: #71757fff;
}

.client-loyalty-card-row {
  display: flex;
  flex-direction: column;
  word-wrap: break-word;
}
</style>
