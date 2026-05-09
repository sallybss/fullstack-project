<template>
  <article class="card">
    <div class="card__imageWrap">
      <img
        class="card__image"
        :src="imageSrc"
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
            {{ n <= roundedRating ? "★" : "☆" }}
          </span>
        </span>
        <span class="ratingAverage">{{ formattedAverageRating }}</span>
        <span class="ratingCount">({{ ratingCount }})</span>
      </div>
    </div>

    <h3 class="card__title">{{ recipe.title }}</h3>

    <div class="card__actions">
      <template v-if="plannerMode">
        <button
          class="plannerBtn"
          :class="{
            'plannerBtn--added': plannerAdded,
            'plannerBtn--disabled': plannerDisabled,
          }"
          :disabled="plannerDisabled && !plannerAdded"
          type="button"
          @click="handlePlannerAddClick"
        >
          {{ plannerAdded ? "Added" : plannerLabel }}
        </button>
      </template>

      <template v-else>
        <BaseButton
          variant="outline"
          class="card__view"
          type="button"
          @click="handleViewClick"
        >
          View
        </BaseButton>

        <button
          class="saveBtn"
          :class="{ 'saveBtn--active': recipe.saved }"
          @click="handleSaveClick"
        >
          <i
            class="pi"
            :class="recipe.saved ? 'pi-bookmark-fill' : 'pi-bookmark'"
          ></i>
        </button>

        <button
          v-if="showDelete"
          class="deleteBtn"
          type="button"
          aria-label="Delete"
          @click="props.onDelete?.(recipe._id)"
        >
          <i class="pi pi-trash"></i>
        </button>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "../common/BaseButton.vue";
import type { Recipe } from "../../interfaces/recipe";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();
const { isLoggedIn } = useUser();

const props = defineProps<{
  recipe: Recipe;
  plannerMode?: boolean;
  plannerAdded?: boolean;
  plannerDisabled?: boolean;
  plannerLabel?: string;
  showDelete?: boolean;
  onAuthRequired?: () => void;
  onSaveClick?: (recipeId: string) => void;
  onPlannerAdd?: (recipeId: string) => void;
  onDelete?: (recipeId: string) => void;
}>();

const fallbackImage = "https://picsum.photos/seed/recipe/600/600";

const API_URL = import.meta.env.VITE_API_URL;

const imageSrc = computed(() => {
  if (!props.recipe.imageUrl) return fallbackImage;

  if (props.recipe.imageUrl.startsWith("http")) {
    return props.recipe.imageUrl;
  }

  return `${API_URL}${props.recipe.imageUrl}`;
});

// Combines prep and cook time for a single display value
const totalTime = computed(() => {
  return props.recipe.prepTimeMinutes + props.recipe.cookTimeMinutes;
});

// Uses backend rating summary if available
const averageRating = computed(() => {
  return props.recipe.ratingSummary?.average ?? 0;
});

const formattedAverageRating = computed(() => {
  if (!ratingCount.value) return "0.0";
  return averageRating.value.toFixed(1);
});

const roundedRating = computed(() => {
  return Math.round(averageRating.value);
});

const ratingCount = computed(() => {
  return props.recipe.ratingSummary?.count ?? 0;
});

function handleViewClick() {
  if (!isLoggedIn.value) {
    props.onAuthRequired?.();
    return;
  }

  router.push({
    name: "recipe",
    params: { id: props.recipe._id },
  });
}

// Save action is also protected for guests
function handleSaveClick() {
  if (!isLoggedIn.value) {
    props.onAuthRequired?.();
    return;
  }

  props.onSaveClick?.(props.recipe._id);
}

function handlePlannerAddClick() {
  if (props.plannerDisabled) {
    return;
  }

  props.onPlannerAdd?.(props.recipe._id);
}

// Falls back to a placeholder if image URL is broken
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = fallbackImage;
}
</script>

<style scoped lang="scss">
.card {
  display: grid;
  gap: 10px;
  width: 100%;
}

.card__imageWrap {
  overflow: hidden;
  border-radius: 18px;
  background: #eee;
  aspect-ratio: 1 / 1;
}

.card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.card__time,
.card__rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f7f6fb;
}

.card__clock {
  font-size: 12px;
  opacity: 0.7;
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

.ratingAverage {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.62);
}

.card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111;
  line-height: 1.3;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--text);
  color: var(--accent);
  border: 1px solid #ff734c53;
  cursor: pointer;
}

.saveBtn .pi {
  font-size: 14px;
}

.saveBtn:hover {
  border-color: #ff734c;
}

.deleteBtn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #fff;
  color: #ff724c;
  border: 1px solid rgba(255, 114, 76, 0.35);
  cursor: pointer;
}

.deleteBtn:hover {
  border-color: rgba(255, 114, 76, 0.65);
}

.plannerBtn {
  width: 100%;
  min-height: 38px;
  border: 0;
  border-radius: 999px;
  background: #ff724c;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.plannerBtn--added,
.plannerBtn--disabled {
  background: #f3f3f5;
  color: #888;
}

.plannerBtn--added {
  cursor: pointer;
}

.plannerBtn--disabled {
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .card {
    gap: 10px;
  }

  .card__meta {
    gap: 6px;
  }

  .card__time,
  .card__rating {
    min-height: 36px;
    padding: 0 10px;
    font-size: 13px;
  }

  .card__rating {
    max-width: 100%;
  }

  .stars {
    display: inline-flex;
    gap: 1px;
  }

  .star,
  .ratingAverage,
  .ratingCount {
    font-size: 13px;
  }

  .card__title {
    font-size: 15px;
  }

  .card__actions {
    gap: 8px;
  }

  .card__view,
  .saveBtn,
  .deleteBtn {
    min-height: 38px;
  }
}
</style>
