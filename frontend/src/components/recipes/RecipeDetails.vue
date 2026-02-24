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
          :label="recipe.author?.initials ?? 'U'"
          shape="circle"
          class="avatar"
        />
        <div>
          <div class="authorName">{{ recipe.author?.name ?? "Unknown" }}</div>
          <div class="authorEmail">{{ recipe.author?.email ?? "" }}</div>
        </div>
      </div>

      <div class="actions">
        <BaseButton variant="outline" class="actionBtn"
          >View profile</BaseButton
        >
        <BaseButton variant="primary" class="actionBtn">Follow</BaseButton>
      </div>
    </div>

    <!-- title + save -->
    <div class="titleRow">
      <h1 class="title">{{ recipe.title }}</h1>

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

    <!-- meta -->
    <div class="meta">
      <span class="metaItem">
        <i class="pi pi-clock"></i>
        {{ recipe.timeMinutes }} min
      </span>

      <span class="metaItem" v-if="recipe.servings">
        <i class="pi pi-users"></i>
        {{ recipe.servings }} servings
      </span>

      <span class="metaItem rating">
        <Rating
          :modelValue="Math.round(recipe.rating)"
          :cancel="false"
          readonly
        />
        <span class="count">({{ recipe.ratingCount }})</span>
      </span>
    </div>

    <!-- description -->
    <p class="desc">
      {{ recipe.description ?? "No description yet." }}
    </p>

    <!-- two columns -->
    <div class="grid">
      <section class="panel">
        <h2>Ingredients</h2>

        <ul class="list">
          <li v-for="(ing, i) in recipe.ingredients ?? []" :key="i" class="li">
            <span class="dot"></span>
            <span>{{ ing }}</span>
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
import Avatar from "primevue/avatar";
import Rating from "primevue/rating";
import type { Recipe } from "../../types/recipe";
import BaseButton from "../common/BaseButton.vue";

defineProps<{ recipe: Recipe }>();
defineEmits<{
  (e: "back"): void;
  (e: "toggle-save", id: string): void;
}>();
</script>

<style scoped>
.details {
  background: #fff;
  border-radius: 26px;
  padding: 22px 26px 26px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
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
.actionBtn {
  height: 34px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.6px;
}

.saveBtn {
  width: 38px;
  height: 38px;
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
  color: #fff;
  border-color: var(--accent);
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
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
}
.dot {
  width: 18px;
  height: 18px;
  border: 2px solid #ff724c;
  border-radius: 50%;
  display: inline-block;
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
