<template>
  <div class="client-loyalty-card">
    <section class="client-loyalty-card__section">
      <h4 class="client-loyalty-card__title">Внешняя лояльность</h4>

      <div class="client-loyalty-card__main">
        <client-loyalty-card-row
          title="Карта 437058"
          balance="Баланс 4 из 6 услуг"
          info="автосписание 1431"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ClientLoyaltyCardRow from '@/apps/client-loyalty-card/src/components/client-loyalty-card-row.vue';
</script>

<style scoped>
.client-loyalty-card {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1440px;
  margin: 0 auto;
}

.client-loyalty-card__main,
.client-loyalty-card__section {
  display: flex;
  flex-direction: column;
}
</style>
