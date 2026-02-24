<template>
  <section class="hero" :style="{ backgroundImage: `url(${imageUrl})` }">
    <div class="overlay"></div>

    <div class="content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  imageUrl: string;
}>();
</script>

<style scoped>
.hero {
  height: 420px;
  background-position: center;
  background-size: cover;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  overflow: hidden;
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 24px 16px;
}
</style>
