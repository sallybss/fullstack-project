<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import RecipeCard from "../../components/recipes/RecipeCard.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import PaginationBar from "../../components/common/PaginationBar.vue";

import { mockRecipes } from "../../data/mockRecipes";
import type { Recipe } from "../../types/recipe";

const route = useRoute();
const router = useRouter();

function goBack() {
  router.back();
}

/** Profile id from url */
const profileId = computed(() => String(route.params.id || ""));

/** Demo: filter recipes by author id */
const allRecipes = ref<Recipe[]>(
  mockRecipes.map((r) => ({ ...r, saved: r.saved ?? false })),
);

const userRecipes = computed(() =>
  allRecipes.value.filter((r) => r.author?.id === profileId.value),
);

/** Use first recipe author data as profile header */
const profile = computed(() => {
  const first = userRecipes.value[0];
  return (
    first?.author ?? {
      id: profileId.value,
      name: "Unknown",
      email: "",
      initials: "U",
    }
  );
});

/** Follow state (demo) */
const isFollowing = ref(false);
function toggleFollow() {
  isFollowing.value = !isFollowing.value;
}

/** Pagination */
const pageSize = 8; // 2 rows of 4
const page = ref(1);

const pagedRecipes = computed(() => {
  const start = (page.value - 1) * pageSize;
  return userRecipes.value.slice(start, start + pageSize);
});

/** Save toggle (if your RecipeCard emits @toggle-save) */
function toggleSave(id: string) {
  const r = allRecipes.value.find((x) => x.id === id);
  if (r) r.saved = !r.saved;
}
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/profilehero/1400/700" />

    <main class="container">
      <div class="profile-card">
        <button class="back" type="button" @click="goBack">← Go back</button>

        <!-- header -->
        <div class="profile-top">
          <div class="left">
            <div class="avatar">{{ profile.initials }}</div>

            <div class="meta">
              <h1 class="name">{{ profile.name }}</h1>
              <p class="sub">Member since January 2025 · 12 recipes posted</p>
            </div>
          </div>

          <div class="right">
            <BaseButton
              :variant="isFollowing ? 'outline' : 'primary'"
              type="button"
              @click="toggleFollow"
            >
              {{ isFollowing ? "Following" : "Follow" }}
            </BaseButton>

            <div class="stat">
              <i class="pi pi-users"></i>
              <span><b>5</b> followers</span>
            </div>

            <div class="stat">
              <i class="pi pi-book"></i>
              <span
                ><b>{{ userRecipes.length }}</b> recipes</span
              >
            </div>
          </div>
        </div>

        <p class="bio">
          Passionate home chef exploring flavors from around the world. I love
          creating simple yet elegant dishes that bring people together.
        </p>

        <!-- grid -->
        <section class="section">
          <div class="grid">
            <RecipeCard
              v-for="r in pagedRecipes"
              :key="r.id"
              :recipe="r"
              @toggle-save="toggleSave"
            />
          </div>

          <!-- pagination -->
          <div class="pager" v-if="userRecipes.length > pageSize">
            <PaginationBar
              v-model:page="page"
              :pageSize="pageSize"
              :total="userRecipes.length"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* same base layout */
.page {
  background: #f6f6fb;
  min-height: 100vh;
}

/* wider container like figma */
.container {
  max-width: 1180px; /* was 980 */
  margin: -180px auto 60px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

.profile-card {
  background: #fff;
  border-radius: 28px;
  padding: 22px;
}

.back {
  border: 0;
  background: transparent;
  color: #666;
  padding: 6px 0;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.profile-top {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}

.left {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #f1f1f6;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #333;
}

.meta {
  display: grid;
  gap: 4px;
}

.name {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.sub {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.stat {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f6f6fb;
  color: #333;
  font-size: 13px;
}

.bio {
  margin: 14px 0 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.section {
  margin-top: 18px;
}

/* ✅ 4-column grid like Home */
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

/* pagination alignment */
.pager {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

/* responsive */
@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .profile-top {
    align-items: flex-start;
    flex-direction: column;
  }
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
