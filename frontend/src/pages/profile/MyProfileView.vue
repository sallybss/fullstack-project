<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import PaginationBar from "../../components/common/PaginationBar.vue";
import AdvancedRecipeCard from "../../components/recipes/AdvancedRecipeCard.vue";

import { useRecipes } from "../../modules/useRecipes";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();

const { recipes, error, loading, fetchRecipes, toggleSave, deleteRecipe } =
  useRecipes();

const { user } = useUser();

/**
 * Current logged-in user id from localStorage
 */
const currentUserId = ref<string | null>(localStorage.getItem("userIDToken"));

/**
 * Back navigation
 */
function goBack() {
  router.back();
}

/**
 * Fetch recipes when page loads
 */
onMounted(async () => {
  await fetchRecipes();
});

/**
 * Current user display data
 * Uses real auth user if available, otherwise safe fallbacks
 */
const me = computed(() => {
  const username = user.value?.username || "User";
  const email = user.value?.email || "";
  const initials = username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: currentUserId.value || "",
    name: username,
    initials: initials || "U",
    email,
    memberSince: "Recently joined",
    recipesPosted: 0,
    followers: 0,
  };
});

/**
 * Only current user's recipes
 */
const myRecipes = computed(() =>
  recipes.value.filter((recipe) => recipe.owner?._id === currentUserId.value),
);

/**
 * Pagination
 */
const pageSize = 8;
const page = ref(1);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(myRecipes.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return myRecipes.value.slice(start, start + pageSize);
});

/**
 * Edit recipe
 * Update route if your edit page uses a different path
 */
function editRecipe(id: string) {
  router.push({ name: "edit-recipe", params: { id } });
}

/**
 * Delete recipe
 */
async function handleDeleteRecipe(id: string) {
  const ok = window.confirm("Delete this recipe?");
  if (!ok) return;

  await deleteRecipe(id);

  if (page.value > totalPages.value) {
    page.value = totalPages.value;
  }
}

/**
 * Edit profile placeholder
 * Replace later when profile edit page exists
 */
function goToEditProfile() {
  router.push("/profile/edit");
}
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/myprofilehero/1400/700" />

    <main class="container">
      <div class="card">
        <!-- TOP AREA -->
        <div class="top">
          <!-- LEFT: back + tabs (stacked) -->
          <div class="topLeft">
            <button class="back" type="button" @click="goBack">
              ← Go back
            </button>

            <div class="tabs">
              <button class="tab is-active" type="button">Profile</button>

              <button
                class="tab"
                type="button"
                @click="router.push({ name: 'my-profile-advanced' })"
              >
                Advanced
              </button>

              <button
                class="tab"
                type="button"
                @click="router.push({ name: 'admin-panel' })"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>

        <!-- HEADER -->
        <div class="header">
          <div class="left">
            <div class="avatar">{{ me.initials }}</div>

            <div class="meta">
              <h1 class="name">{{ me.name }}</h1>
              <p class="sub">
                Member since {{ me.memberSince }} ·
                {{ me.recipesPosted }} recipes posted
              </p>
            </div>
          </div>

          <!-- RIGHT: edit + stats (same row) -->
          <div class="topRight">
            <div class="stat">
              <i class="pi pi-users"></i>
              <span
                ><b>{{ me.followers }}</b> followers</span
              >
            </div>

            <div class="stat">
              <i class="pi pi-book"></i>
              <span
                ><b>{{ myRecipes.length }}</b> recipes</span
              >
            </div>

            <BaseButton
              variant="primary"
              type="button"
              @click="goToEditProfile"
            >
              Edit profile
            </BaseButton>
          </div>
        </div>

        <p class="bio">
          Passionate home chef exploring flavors from around the world. I love
          creating simple yet elegant dishes that bring people together.
        </p>

        <p v-if="loading">Loading recipes...</p>
        <p v-if="error">{{ error }}</p>
        <!-- GRID -->
        <section class="grid">
          <AdvancedRecipeCard
            v-for="r in paged"
            :key="r._id"
            :recipe="r"
            @toggle-save="toggleSave"
            @edit="editRecipe"
            @delete="handleDeleteRecipe"
          />
        </section>

        <!-- PAGER -->
        <div class="pager" v-if="myRecipes.length > pageSize">
          <PaginationBar
            v-model:page="page"
            :pageSize="pageSize"
            :total="myRecipes.length"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  background: #f6f6fb;
  min-height: 100vh;
}

.container {
  max-width: 1180px;
  margin: -180px auto 60px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

.card {
  background: #fff;
  border-radius: 28px;
  padding: 22px;
}

/* === TOP LAYOUT (matches your Figma intent) === */
.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.topLeft {
  display: flex;
  flex-direction: column; /* ✅ tabs under back */
  gap: 14px;
  min-width: 240px;
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
  white-space: nowrap;
}

/* tabs */
.tabs {
  display: inline-flex;
  gap: 10px;
}

.tab {
  border: 1px solid rgba(255, 114, 76, 0.35);
  background: transparent;
  color: rgba(255, 114, 76, 0.9);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.tab.is-active {
  background: var(--accent, #ff724c);
  border-color: var(--accent, #ff724c);
  color: #fff;
}

/* right side buttons (edit + stats aligned) */
.topRight {
  display: inline-flex;
  align-items: center; /* ✅ same baseline */
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: nowrap; /* ✅ keep on same line */
}

/* stat pills */
.stat {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f6f6fb;
  color: #333;
  font-size: 13px;
  white-space: nowrap;
}

/* === HEADER === */
.header {
  margin-top: 16px;
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

.bio {
  margin: 14px 0 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* grid */
.grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

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
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* allow wrapping on small screens */
  .topRight {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 520px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.info {
  text-align: center;
  margin-top: 20px;
  color: #777;
}

.error {
  text-align: center;
  margin-top: 20px;
  color: #e53935;
}
</style>
