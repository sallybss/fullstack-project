<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { Recipe } from "../../interfaces/recipe";
import BaseButton from "../common/BaseButton.vue";

const props = defineProps<{
  recipe: Recipe;
  onToggleSave?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}>();

const router = useRouter();

const API_URL = import.meta.env.VITE_API_URL;
const fallbackImage = "https://picsum.photos/seed/recipe/600/600";

function view() {
  router.push(`/recipes/${props.recipe._id}`);
}

const totalTime = computed(
  () => props.recipe.prepTimeMinutes + props.recipe.cookTimeMinutes,
);

const stars = computed(() =>
  Math.round(props.recipe.ratingSummary?.average ?? 0),
);

const ratingCount = computed(() => props.recipe.ratingSummary?.count ?? 0);

const imageSrc = computed(() => {
  if (!props.recipe.imageUrl) return fallbackImage;

  if (props.recipe.imageUrl.startsWith("http")) {
    return props.recipe.imageUrl;
  }

  return `${API_URL}${props.recipe.imageUrl}`;
});

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = fallbackImage;
}
</script>

<template>
  <article class="card">
    <div class="imgWrap">
      <img
        class="img"
        :src="imageSrc"
        :alt="recipe.title"
        @error="handleImageError"
      />
    </div>

    <div class="metaRow">
      <span class="time">
        <i class="pi pi-clock"></i>
        {{ totalTime }} min
      </span>

      <span class="rating">
        <span class="stars" aria-hidden="true">
          <span v-for="n in 5" :key="n">{{ n <= stars ? "★" : "☆" }}</span>
        </span>
        <span class="count">({{ ratingCount }})</span>
      </span>
    </div>

    <h3 class="title">{{ recipe.title }}</h3>

    <div class="actions">
      <BaseButton variant="outline" class="viewBtn" type="button" @click="view">
        View
      </BaseButton>

      <button
        class="iconBtn"
        type="button"
        :class="{ active: recipe.saved }"
        aria-label="Save"
        @click="props.onToggleSave?.(recipe._id)"
      >
        <i class="pi pi-bookmark"></i>
      </button>

      <button
        class="iconBtn"
        type="button"
        aria-label="Edit"
        @click="props.onEdit?.(recipe._id)"
      >
        <i class="pi pi-pencil"></i>
      </button>

      <button
        class="iconBtn danger"
        type="button"
        aria-label="Delete"
        @click="props.onDelete?.(recipe._id)"
      >
        <i class="pi pi-trash"></i>
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.imgWrap {
  border-radius: 18px;
  overflow: hidden;
  background: #eee;
  aspect-ratio: 1 / 1;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.metaRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: #777;
  font-size: 12px;
}

.time {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.rating {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.stars {
  letter-spacing: 1px;
}

.count {
  color: #888;
}

.title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #222;
  line-height: 1.3;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: grid;
  grid-template-columns: 1fr repeat(3, 34px);
  gap: 10px;
  align-items: center;
}

.viewBtn {
  height: 34px;
}

.iconBtn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  background: #fff;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.iconBtn:hover {
  border-color: rgba(0, 0, 0, 0.24);
}

.iconBtn.active {
  background: var(--accent, #ff724c);
  border-color: var(--accent, #ff724c);
  color: #fff;
}

.iconBtn.danger {
  border-color: rgba(255, 114, 76, 0.35);
  color: #ff724c;
}

.iconBtn.danger:hover {
  border-color: rgba(255, 114, 76, 0.6);
}

@media (max-width: 520px) {
  .card {
    gap: 8px;
    padding: 8px;
    border-radius: 20px;
    background: #fff;
    border: 1px solid #f0edf4;
    box-shadow: 0 8px 22px rgba(36, 29, 24, 0.05);
  }

  .metaRow {
    display: grid;
    grid-template-columns: 1fr;
    justify-items: start;
    gap: 6px;
    font-size: 11px;
  }

  .time,
  .rating {
    gap: 5px;
    min-height: 28px;
    padding: 0 9px;
    border-radius: 999px;
    background: #f7f6fb;
  }

  .stars {
    letter-spacing: 0;
  }

  .title {
    font-size: 13px;
  }

  .actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .viewBtn {
    grid-column: 1 / -1;
    width: 100%;
  }

  .actions .iconBtn:last-child {
    display: none;
  }

  .actions .iconBtn {
    width: 100%;
  }

  .viewBtn {
    height: 32px;
    min-height: 32px;
    font-size: 12px;
  }

  .iconBtn {
    height: 32px;
  }
}
</style>
