<template>
  <article class="card">
    <div class="card__imgWrap">
      <img class="card__img" :src="recipe.imageUrl" :alt="recipe.title" />
    </div>

    <div class="card__meta">
      <span>⏱ {{ recipe.timeMinutes }} min</span>
      <span class="card__stars">★ {{ recipe.rating.toFixed(1) }} ({{ recipe.ratingCount }})</span>
    </div>

    <h3 class="card__title">{{ recipe.title }}</h3>

    <div class="card__actions">
      <button class="card__view" type="button" @click="$emit('view', recipe)">View</button>
      <button
        class="card__save"
        type="button"
        :aria-label="recipe.saved ? 'Unsave recipe' : 'Save recipe'"
        @click="$emit('toggle-save', recipe.id)"
      >
        {{ recipe.saved ? '🔖' : '📑' }}
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Recipe } from '@/types/recipe'
defineProps<{ recipe: Recipe }>()
defineEmits<{
  (e: 'toggle-save', id: string): void
  (e: 'view', recipe: Recipe): void
}>()
</script>

<style scoped>
.card { display: grid; gap: 10px; }
.card__imgWrap { border-radius: 18px; overflow: hidden; aspect-ratio: 1 / 1; background: #ddd; }
.card__img { width: 100%; height: 100%; object-fit: cover; display: block; }

.card__meta { display: flex; justify-content: space-between; font-size: 12px; opacity: .75; }
.card__title { margin: 0; font-size: 14px; font-weight: 600; }

.card__actions { display: flex; gap: 10px; align-items: center; }
.card__view {
  flex: 1;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  cursor: pointer;
}
.card__save {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.15);
  background: white;
  cursor: pointer;
}
</style>