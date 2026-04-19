<template>
  <article class="contactCard">
    <div class="contactCard__icon">
      <i class="pi" :class="icon"></i>
    </div>
    <h2>{{ title }}</h2>
    <p>
      <a v-if="href" :href="href">{{ text }}</a>
      <span v-else>{{ text }}</span>
    </p>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  text: string;
  href?: string;
}>();
</script>

<style scoped lang="scss">
.contactCard {
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(34, 26, 20, 0.08);
  padding: 26px 24px;
  text-align: center;
}

.contactCard__icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 14px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 114, 76, 0.1);
  color: #ef8358;
  font-size: 1rem;
}

.contactCard h2 {
  margin: 0;
  color: #332d28;
  font-size: 1rem;
  letter-spacing: 0;
}

.contactCard p {
  margin: 8px 0 0;
  color: #9a8f85;
  font-size: 0.92rem;
}

.contactCard a {
  color: inherit;
  text-decoration: none;
}

.contactCard a:hover {
  text-decoration: underline;
}

@media (max-width: 560px) {
  .contactCard {
    padding: 22px 18px;
  }
}
</style>
