<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/profilehero/1400/700" />

    <main class="container">
      <div class="profile-card">
        <button class="back" type="button" @click="goBack">← Go back</button>

        <div v-if="loading" class="empty-state">
          <h2>Loading profile...</h2>
        </div>

        <div v-else-if="error" class="empty-state">
          <h2>Something went wrong</h2>
          <p>{{ error }}</p>
        </div>

        <template v-else>
          <div class="profile-top">
            <div class="left">
              <div class="avatar">{{ ownerInitial }}</div>

              <div class="meta">
                <h1 class="name">{{ profileName }}</h1>
                <p class="sub">
                  Member profile · <b>{{ userRecipes.length }}</b> recipes posted
                </p>
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
                <span><b>{{ userRecipes.length }}</b> recipes</span>
              </div>
            </div>
          </div>

          <p class="bio">
            {{ profileBio }}
          </p>

          <section class="section">
            <div v-if="pagedRecipes.length === 0" class="empty-state">
              <h2>No recipes yet</h2>
              <p>This user has not published any recipes yet.</p>
            </div>

            <div v-else class="grid">
              <RecipeCard
                v-for="r in pagedRecipes"
                :key="r._id"
                :recipe="r"
                @auth-required="() => {}"
                @save-click="toggleSave"
              />
            </div>

            <div class="pager" v-if="userRecipes.length > pageSize">
              <PaginationBar
                v-model:page="page"
                :pageSize="pageSize"
                :total="userRecipes.length"
              />
            </div>
          </section>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import RecipeCard from "../../components/recipes/RecipeCard.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import PaginationBar from "../../components/common/PaginationBar.vue";

import { useRecipes } from "../../modules/useRecipes";

const route = useRoute();
const router = useRouter();

const { recipes, loading, error, fetchRecipes, toggleSave } = useRecipes();

function goBack() {
  router.back();
}

// Read profile id from route
const profileId = computed(() => String(route.params.id || ""));

onMounted(async () => {
  if (recipes.value.length === 0) {
    await fetchRecipes();
  }
});

// Filter recipes that belong to the current owner
const userRecipes = computed(() =>
  recipes.value.filter((r) => r.owner?._id === profileId.value),
);

// Use first recipe owner as profile source
const profile = computed(() => {
  return userRecipes.value[0]?.owner ?? null;
});

const profileName = computed(() => {
  return profile.value?.username ?? "Unknown";
});

const profileBio = computed(() => {
  return profile.value?.bio || "This user has not added a bio yet.";
});

const ownerInitial = computed(() => {
  const username = profile.value?.username ?? "U";
  return username.charAt(0).toUpperCase();
});

// Demo follow state
const isFollowing = ref(false);

function toggleFollow() {
  isFollowing.value = !isFollowing.value;
}

// Pagination
const pageSize = 8;
const page = ref(1);

const pagedRecipes = computed(() => {
  const start = (page.value - 1) * pageSize;
  return userRecipes.value.slice(start, start + pageSize);
});
</script>

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
