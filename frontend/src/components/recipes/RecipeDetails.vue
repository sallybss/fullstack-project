<template>
  <article class="details">
    <div class="top">
      <button class="back" type="button" @click="$emit('back')">
        <i class="pi pi-arrow-left"></i>
        <span>Go back</span>
      </button>
    </div>

    <div class="authorRow">
      <div class="author">
        <Avatar
          :label="ownerAvatarSrc ? undefined : ownerInitial"
          :image="ownerAvatarSrc || undefined"
          shape="circle"
          class="avatar"
        />
        

        <div>
          <div class="authorName">{{ recipe.owner?.username ?? "Unknown" }}</div>
          <div class="authorEmail">{{ recipe.owner?.bio ?? "" }}</div>
        </div>
      </div>

      <div class="actions">
        <BaseButton
          v-if="showFollowAction"
          :variant="isFollowing ? 'outline' : 'primary'"
          class="actionBtn"
          type="button"
          @click="$emit('toggle-follow')"
        >
          {{ isFollowing ? "Following" : "Follow" }}
        </BaseButton>

        <BaseButton
          variant="outline"
          class="actionBtn"
          type="button"
          @click="goToProfile"
        >
          View profile
        </BaseButton>
      </div>
    </div>

    <div class="titleRow">
      <h1 class="title">{{ recipe.title }}</h1>

      <button
        class="saveBtn"
        type="button"
        :class="{ 'is-saved': recipe.saved }"
        @click="$emit('toggle-save', recipe._id)"
        aria-label="Save recipe"
      >
        <i
          class="pi"
          :class="recipe.saved ? 'pi-bookmark-fill' : 'pi-bookmark'"
        ></i>
      </button>
    </div>

    <div class="meta">
      <span class="metaItem">
        <i class="pi pi-clock"></i>
        {{ totalTime }} min
      </span>

      <span class="metaItem" v-if="recipe.servings">
        <i class="pi pi-users"></i>
        {{ recipe.servings }} servings
      </span>

      <span class="metaItem rating">
        <Rating :modelValue="roundedRating" :cancel="false" readonly />
        <span class="average">{{ formattedAverageRating }}</span>
        <span class="count">({{ ratingCount }})</span>
      </span>
    </div>

    <p class="desc">
      {{ recipe.description || "No description yet." }}
    </p>

    <div class="grid">
      <section class="panel">
        <h2>Ingredients</h2>

        <ul class="list">
          <li
            v-for="(ing, i) in recipe.ingredients ?? []"
            :key="`${recipe._id}-${i}`"
            class="li"
          >
            <label class="ingredientItem">
              <input
                :checked="completedIngredients.has(i)"
                type="checkbox"
                class="ingredientItem__checkbox"
                @change="toggleIngredient(i)"
              />
              <span class="ingredientItem__indicator">
                <i class="pi pi-check"></i>
              </span>
              <span
                class="ingredientItem__text"
                :class="{ 'ingredientItem__text--done': completedIngredients.has(i) }"
              >
                {{ ing }}
              </span>
            </label>
          </li>

          <li v-if="!recipe.ingredients?.length" class="empty">
            No ingredients yet.
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2>Instructions</h2>

        <ol class="olist">
          <li v-for="(step, i) in recipe.instructions ?? []" :key="i">
            {{ step }}
          </li>

          <li v-if="!recipe.instructions?.length" class="empty">
            No instructions yet.
          </li>
        </ol>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Avatar from "primevue/avatar";
import Rating from "primevue/rating";
import BaseButton from "../common/BaseButton.vue";
import type { Recipe } from "../../interfaces/recipe";

const props = defineProps<{
  recipe: Recipe;
  isFollowing?: boolean;
  showFollowAction?: boolean;
}>();

defineEmits<{
  (e: "back"): void;
  (e: "toggle-save", id: string): void;
  (e: "toggle-follow"): void;
}>();

const router = useRouter();
const completedIngredients = ref<Set<number>>(new Set());

watch(
  () => props.recipe._id,
  () => {
    completedIngredients.value = new Set();
  },
  { immediate: true },
);

// Combine prep + cook time because backend stores them separately
const totalTime = computed(() => {
  return props.recipe.prepTimeMinutes + props.recipe.cookTimeMinutes;
});

// Backend rating comes from ratingSummary
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

// Build a simple avatar label from the owner username
const ownerInitial = computed(() => {
  const username = props.recipe.owner?.username ?? "U";
  return username.charAt(0).toUpperCase();
});

const API_URL = import.meta.env.VITE_API_URL;

const ownerAvatarSrc = computed(() => {
  const avatarUrl = props.recipe.owner?.avatarUrl;
  if (!avatarUrl) return "";
  return avatarUrl.startsWith("http") ? avatarUrl : `${API_URL}${avatarUrl}`;
});

// Opens the profile page of the recipe owner
function goToProfile() {
  const ownerId = props.recipe.owner?._id;
  if (!ownerId) return;

  router.push({
    name: "profile",
    params: { id: ownerId },
  });
}

function toggleIngredient(index: number) {
  const next = new Set(completedIngredients.value);

  if (next.has(index)) {
    next.delete(index);
  } else {
    next.add(index);
  }

  completedIngredients.value = next;
}
</script>

<style scoped>
.details {
  background: #fff;
  border-radius: 26px;
  padding: 22px 26px 26px;
}

.top {
  display: flex;
  align-items: center;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.authorRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 12px;
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
}

.authorName {
  font-weight: 700;
}

.authorEmail {
  color: #8a8a8a;
  font-size: 13px;
  margin-top: 2px;
}

.actions {
  display: flex;
  gap: 12px;
}



.saveBtn {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #ff734c53;
  background: #fff;
  color: var(--accent);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.saveBtn .pi {
  font-size: 14px;
}

.saveBtn:hover {
  border-color: var(--accent);
}

.saveBtn.is-saved {  
  background: var(--text);
  color: var(--accent);
  border: 1px solid #ff734c53;
}

.titleRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: 14px;
}

.title {
  margin: 0;
  font-size: 44px;
  line-height: 1.05;
  letter-spacing: -0.5px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 10px;
  color: #777;
  font-size: 14px;
}

.metaItem {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.rating {
  gap: 10px;
}

.count {
  color: #777;
}

.average {
  color: #555;
  font-weight: 600;
}

.desc {
  margin: 14px 0 0;
  color: #6f6f6f;
  line-height: 1.55;
  max-width: 820px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 22px;
  margin-top: 18px;
}

.panel {
  border: 1px solid #f0f0f0;
  border-radius: 18px;
  padding: 18px;
}

.panel h2 {
  margin: 0 0 12px;
  font-size: 20px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.li {
  color: #666;
}

.ingredientItem {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  cursor: pointer;
}

.ingredientItem__checkbox {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.ingredientItem__indicator {
  width: 18px;
  height: 18px;
  border: 2px solid #ff724c;
  border-radius: 50%;
  color: transparent;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.ingredientItem__indicator .pi {
  font-size: 10px;
}

.ingredientItem__checkbox:checked + .ingredientItem__indicator {
  background: #ff724c;
  border-color: #ff724c;
  color: #fff;
}

.ingredientItem__text {
  transition: color 0.18s ease, opacity 0.18s ease;
}

.ingredientItem__text--done {
  color: #959595;
  opacity: 0.82;
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.olist {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
  color: #666;
}

.empty {
  color: #999;
}

@media (max-width: 860px) {
  .title {
    font-size: 34px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
