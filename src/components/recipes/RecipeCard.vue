<template>
  <article class="card">
    <div class="card__imageWrap">
      <img class="card__image" :src="recipe.image" :alt="recipe.title" />
    </div>

    <div class="card__meta">
      <div class="card__time">
        <span class="card__clock">🕒</span>
        <span>{{ recipe.timeMinutes }} min</span>
      </div>

      <div class="card__rating">
        <span class="stars" aria-hidden="true">
          <span v-for="n in 5" :key="n" class="star">
            {{ n <= Math.round(recipe.rating) ? '★' : '☆' }}
          </span>
        </span>
        <span class="ratingCount">({{ recipe.ratingCount }})</span>
      </div>
    </div>

    <h3 class="card__title">{{ recipe.title }}</h3>

    <div class="card__actions">
      <BaseButton variant="outline" class="card__view" type="button" @click="$emit('view', recipe)">View</BaseButton>

      <button
        class="saveBtn"
        type="button"
        :class="{ 'is-saved': recipe.saved }"
        @click="$emit('toggle-save', recipe.id)"
        aria-label="Save recipe"
      >
        <i class="pi pi-bookmark"></i>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Recipe } from '../../types/recipe'
import BaseButton from '../common/BaseButton.vue'

defineProps<{ recipe: Recipe }>()

defineEmits<{
  (e: 'toggle-save', id: string): void
  (e: 'view', recipe: Recipe): void
}>()
</script>

<style scoped lang="scss">
.card {
  display: grid;
  gap: 10px;
}

.card__imageWrap {
  border-radius: 18px;
  overflow: hidden;
  background: #eee;
  aspect-ratio: 1 / 1;
}

.card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.card__time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.card__clock {
  font-size: 12px;
  opacity: 0.7;
}

.card__rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.stars {
  letter-spacing: 1px;
}

.star {
  font-size: 12px;
  color: #ffb74d;
}

.ratingCount {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111;
}

.card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Only layout sizing for the BaseButton */
.card__view {
  flex: 1;
  height: 34px;
  font-size: 13px;
}

/* Icon button stays local to this card */
.saveBtn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: #fff;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;

  display: grid;
  place-items: center;
}

.saveBtn .pi {
  font-size: 14px;
}

.saveBtn:hover {
  border-color: rgba(0, 0, 0, 0.25);
}

.saveBtn.is-saved {
  background: var(--accent);
  color: var(--text);
  border-color: var(--accent);
}

</style>