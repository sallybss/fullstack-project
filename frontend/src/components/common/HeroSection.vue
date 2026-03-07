<template>
  <section class="hero" :style="{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }">
    <div class="overlay"></div>

    <div class="content">
      <!-- If user provides slot, show it -->
      <slot v-if="$slots.default" />

      <!-- Otherwise show title/subtitle -->
      <div v-else class="text">
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  imageUrl?: string;
  title?: string;
  subtitle?: string;
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
  text-align: center;
}

.text h1 {
  color: white;
  font-size: 36px;
  margin: 0;
}

.text p {
  color: rgba(255, 255, 255, 0.85);
  margin-top: 10px;
  font-size: 16px;
}
</style>