<template>
  <section class="card">
    <div class="top-row">
      <button class="back" type="button" @click="$emit('back')">← Go back</button>
    </div>

    <div class="header">
      <div class="author-row">[Author block here]</div>

      <div class="title-row">
        <h1 class="title">{{ recipe.title }}</h1>

        <button class="bookmark" type="button" aria-label="Save recipe">
          ⛶
        </button>
      </div>

      <div class="meta-row">
        <span>🕒 {{ recipe.timeMinutes }} min</span>
        <span class="dot">•</span>
        <span>⭐ {{ recipe.rating }} ({{ recipe.ratingCount }})</span>
      </div>

        <p v-if="descriptionText" class="description">
        {{ descriptionText }}
        </p>
    </div>

    <div class="grid-2">
      <div class="box">[Ingredients]</div>
      <div class="box">[Instructions]</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Recipe } from '../../types/recipe'

defineProps<{
  recipe: Recipe
  descriptionText?: string
}>()

defineEmits<{
  (e: 'back'): void
}>()
</script>

<style scoped>

.card {
  background: #fff;
  border-radius: 22px;
  padding: 26px 26px 22px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.10);
}

.description {
  margin: 12px 0 0;
  color: rgba(0,0,0,0.6);
  font-size: 14px;
  line-height: 1.45;
}

.top-row { display: flex; justify-content: space-between; margin-bottom: 12px; }

.back {
  background: transparent;
  border: 0;
  padding: 0;
  color: #666;
  cursor: pointer;
  font: inherit;
}

.title-row{
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.title { font-size: 34px; margin: 0; }

.bookmark{
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.16);
  background: #fff;
  cursor: pointer;
}

.meta-row { display: flex; align-items: center; gap: 10px; color: rgba(0,0,0,0.55); font-size: 13px; }
.dot { opacity: 0.6; }

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 18px;
}

.box {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}
</style>