<template>
  <article class="policyRow">
    <div class="policyRow__icon">
      <i class="pi" :class="icon"></i>
    </div>

    <div class="policyRow__content">
      <h2>{{ title }}</h2>
      <p>{{ text }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  icon: string;
  text: string;
}>();
</script>

<style scoped lang="scss">
.policyRow {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(34, 26, 20, 0.08);
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 16px 18px;
}

.policyRow__icon {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(240, 139, 98, 0.12);
  color: #e18a5d;
  font-size: 1rem;
}

.policyRow__content h2 {
  margin: 0 0 4px;
  color: #322c28;
  font-size: 1.08rem;
  line-height: 1.2;
}

.policyRow__content p {
  margin: 0;
  color: #7f7369;
  font-size: 0.92rem;
  line-height: 1.65;
}

@media (max-width: 760px) {
  .policyRow {
    grid-template-columns: 1fr;
    justify-items: start;
    gap: 10px;
  }
}
</style>
