<template>
  <article class="card">
    <div class="card__imageWrap">
      <img
        class="card__image"
        :src="recipe.imageUrl || fallbackImage"
        :alt="recipe.title"
        @error="handleImageError"
      />
    </div>

    <div class="card__meta">
      <div class="card__time">
        <span class="card__clock">🕒</span>
        <span>{{ totalTime }} min</span>
      </div>

      <div class="card__rating">
        <span class="stars" aria-hidden="true">
          <span v-for="n in 5" :key="n" class="star">
            {{ n <= Math.round(averageRating) ? "★" : "☆" }}
          </span>
        </span>
        <span class="ratingCount">({{ ratingCount }})</span>
      </div>
    </div>

    <h3 class="card__title">{{ recipe.title }}</h3>

    <div class="card__actions">
      <BaseButton
        variant="outline"
        class="card__view"
        type="button"
        @click="goToRecipe"
      >
        View
      </BaseButton>

      <button class="saveBtn" type="button" aria-label="Save recipe">
        <i class="pi pi-bookmark"></i>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "../common/BaseButton.vue";
import type { Recipe } from "../../interfaces/recipe";

const router = useRouter();

const props = defineProps<{
  recipe: Recipe;
}>();

const fallbackImage = "https://picsum.photos/seed/recipe/600/600";

const totalTime = computed(() => {
  return props.recipe.prepTimeMinutes + props.recipe.cookTimeMinutes;
});

const averageRating = computed(() => {
  return props.recipe.ratingSummary?.average ?? 0;
});

const ratingCount = computed(() => {
  return props.recipe.ratingSummary?.count ?? 0;
});

function goToRecipe() {
  router.push({ name: "recipe", params: { id: props.recipe._id } });
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = fallbackImage;
}
</script>

<style scoped lang="scss">
.section {
  margin-top: 22px;
  padding-bottom: 24px;
}

.card {
  display: grid;
  gap: 10px;
  width: 100%;
  max-width: none;
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

.card__view {
  flex: 1;
  height: 34px;
  font-size: 13px;
}

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
</style>
