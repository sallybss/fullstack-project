<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { Recipe } from "../../interfaces/recipe";
import BaseButton from "../common/BaseButton.vue";

const props = defineProps<{
  recipe: Recipe;
}>();

const emit = defineEmits<{
  (e: "toggle-save", id: string): void;
  (e: "edit", id: string): void;
  (e: "delete", id: string): void;
}>();

const router = useRouter();

function view() {
  router.push(`/recipes/${props.recipe._id}`);
}

const totalTime = computed(
  () => props.recipe.prepTimeMinutes + props.recipe.cookTimeMinutes
);

const stars = computed(() =>
  Math.round(props.recipe.ratingSummary?.average ?? 0)
);

const ratingCount = computed(() => props.recipe.ratingSummary?.count ?? 0);
</script>

<template>
  <article class="card">
    <div class="imgWrap">
      <img class="img" :src="recipe.imageUrl" :alt="recipe.title" />
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
        @click="emit('toggle-save', recipe._id)"
      >
        <i class="pi pi-bookmark"></i>
      </button>

      <button
        class="iconBtn"
        type="button"
        aria-label="Edit"
        @click="emit('edit', recipe._id)"
      >
        <i class="pi pi-pencil"></i>
      </button>

      <button
        class="iconBtn danger"
        type="button"
        aria-label="Delete"
        @click="emit('delete', recipe._id)"
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
  color: #777;
  font-size: 12px;
}

.time {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.rating {
  display: inline-flex;
  gap: 6px;
  align-items: center;
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
</style>