<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import PaginationBar from "../../components/common/PaginationBar.vue";
import ProfileTabsBar from "../../components/profile/ProfileTabsBar.vue";
import PeopleModal from "../../components/profile/PeopleModal.vue";
import AdvancedRecipeCard from "../../components/recipes/AdvancedRecipeCard.vue";
import { usePagination } from "../../composables/usePagination";
import { useResponsivePageSize } from "../../composables/useResponsivePageSize";

import { useRecipes } from "../../modules/useRecipes";
import { useUser } from "../../modules/auth/useUser";
import type { Recipe } from "../../interfaces/recipe";
import {
  fetchMySavedRecipes,
  fetchProfileFollowers,
  fetchProfileFollowing,
  fetchProfileRecipes,
  type ProfilePerson,
} from "../../services/profileService";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

const { error, toggleSave, deleteRecipe } = useRecipes();
const { user, profile, fetchCurrentUser } = useUser();

const { pageSize } = useResponsivePageSize([
  { maxWidth: 520, pageSize: 4 },
  { maxWidth: 900, pageSize: 6 },
  { maxWidth: 1100, pageSize: 9 },
], 12);
const loadingRecipes = ref(true);
const myRecipes = ref<Recipe[]>([]);
const savedRecipes = ref<Recipe[]>([]);
const followers = ref<ProfilePerson[]>([]);
const following = ref<ProfilePerson[]>([]);
const activeSection = ref<"posts" | "saved">("posts");
const peopleModal = ref<"followers" | "following" | null>(null);

const {
  page: postsPage,
  totalItems: totalPosts,
  pagedItems: pagedPosts,
  syncPageWithinBounds: syncPostsPageWithinBounds,
} = usePagination(myRecipes, pageSize);
const {
  page: savedPage,
  totalItems: totalSavedRecipes,
  pagedItems: pagedSavedRecipes,
} = usePagination(savedRecipes, pageSize);
const activePage = computed({
  get: () =>
    activeSection.value === "posts"
      ? postsPage.value
      : savedPage.value,
  set: (value: number) => {
    if (activeSection.value === "posts") {
      postsPage.value = value;
      return;
    }

    savedPage.value = value;
  },
});
const activeTotal = computed(() =>
  activeSection.value === "posts"
    ? totalPosts.value
    : totalSavedRecipes.value,
);
const isAdmin = computed(() => user.value?.role === "admin");
const avatarSrc = computed(() => {
  const value = profile.value?.avatarUrl || user.value?.avatarUrl || "";
  if (!value) return "";
  return value.startsWith("http") ? value : `${API_URL}${value}`;
});

const memberSince = computed(() => {
  if (!user.value?.createdAt) return "Recently joined";
  return new Date(user.value.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
});

const initials = computed(() => {
  const username = user.value?.username || "User";
  return username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

onMounted(async () => {
  await fetchCurrentUser();
  await Promise.all([loadMyRecipes(), loadSavedRecipes(), loadConnections()]);
});

function editRecipe(id: string) {
  router.push({ name: "edit-recipe", params: { id } });
}

async function handleDeleteRecipe(id: string) {
  if (!window.confirm("Delete this recipe?")) return;

  await deleteRecipe(id);
  myRecipes.value = myRecipes.value.filter((recipe) => recipe._id !== id);
  syncPostsPageWithinBounds();
}

function goToEditProfile() {
  router.push({ name: "my-profile-advanced" });
}

function openPeopleModal(type: "followers" | "following") {
  peopleModal.value = type;
}

function closePeopleModal() {
  peopleModal.value = null;
}

async function loadMyRecipes() {
  if (!user.value?._id) return;

  try {
    loadingRecipes.value = true;
    myRecipes.value = await fetchProfileRecipes(user.value._id);
  } finally {
    loadingRecipes.value = false;
  }
}

async function loadConnections() {
  if (!user.value?._id) return;

  const [followersPayload, followingPayload] = await Promise.all([
    fetchProfileFollowers(user.value._id),
    fetchProfileFollowing(user.value._id),
  ]);

  followers.value = followersPayload;
  following.value = followingPayload;
}

async function loadSavedRecipes() {
  try {
    const payload = await fetchMySavedRecipes(localStorage.getItem("lsToken") || "");
    savedRecipes.value = payload.map((recipe: Recipe) => ({
      ...recipe,
      saved: true,
    }));
  } catch {
    savedRecipes.value = [];
  }
}

async function handleToggleSave(recipeId: string) {
  await toggleSave(recipeId);
  myRecipes.value = myRecipes.value.map((recipe) =>
    recipe._id === recipeId ? { ...recipe, saved: !recipe.saved } : recipe,
  );
  savedRecipes.value = savedRecipes.value
    .map((recipe) =>
      recipe._id === recipeId ? { ...recipe, saved: !recipe.saved } : recipe,
    )
    .filter((recipe) => recipe.saved);
}
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/myprofilehero/1400/700" setting-key="my-profile-hero" />

    <main class="container">
      <div class="card">
        <div class="top">
          <ProfileTabsBar
            active-tab="profile"
            :show-admin="isAdmin"
            back-fallback-name="home"
          />
        </div>

        <div class="header">
          <div class="left">
            <div class="avatar">
              <img v-if="avatarSrc" :src="avatarSrc" alt="Profile avatar" class="avatarImage" />
              <span v-else>{{ initials }}</span>
            </div>

            <div class="meta">
              <h1 class="name">{{ user?.username || "User" }}</h1>
              <p class="sub">
                Member since {{ memberSince }} · {{ myRecipes.length }} recipes posted
              </p>
            </div>
          </div>

          <div class="topRight">
            <button class="stat stat--button" type="button" @click="openPeopleModal('followers')">
              <i class="pi pi-users"></i>
              <span><b>{{ profile?.followers?.length || 0 }}</b> followers</span>
            </button>

            <button class="stat stat--button" type="button" @click="openPeopleModal('following')">
              <i class="pi pi-share-alt"></i>
              <span><b>{{ following.length }}</b> following</span>
            </button>

            <div class="stat">
              <i class="pi pi-book"></i>
              <span><b>{{ myRecipes.length }}</b> recipes</span>
            </div>

            <div class="stat">
              <i class="pi pi-bookmark"></i>
              <span><b>{{ savedRecipes.length }}</b> saved</span>
            </div>

            <BaseButton variant="primary" type="button" @click="goToEditProfile">
              Edit profile
            </BaseButton>
          </div>
        </div>

        <p class="bio">
          {{ profile?.bio || "Add a bio from the advanced profile page." }}
        </p>

        <div class="content-tabs">
          <button
            class="content-tab"
            :class="{ 'content-tab--active': activeSection === 'posts' }"
            type="button"
            @click="activeSection = 'posts'"
          >
            Posts
          </button>
          <button
            class="content-tab"
            :class="{ 'content-tab--active': activeSection === 'saved' }"
            type="button"
            @click="activeSection = 'saved'"
          >
            Saved
          </button>
        </div>

        <p v-if="loadingRecipes">Loading recipes...</p>
        <p v-if="error">{{ error }}</p>

        <div
          v-if="activeSection === 'posts' && !loadingRecipes && pagedPosts.length === 0"
          class="list-empty"
        >
          No recipes posted yet.
        </div>

        <div
          v-else-if="activeSection === 'saved' && !loadingRecipes && pagedSavedRecipes.length === 0"
          class="list-empty"
        >
          No saved recipes yet.
        </div>

        <section v-else class="grid">
          <AdvancedRecipeCard
            v-for="r in activeSection === 'posts' ? pagedPosts : pagedSavedRecipes"
            :key="r._id"
            :recipe="r"
            :onToggleSave="handleToggleSave"
            :onEdit="editRecipe"
            :onDelete="handleDeleteRecipe"
          />
        </section>

        <div class="pager" v-if="activeTotal > pageSize">
          <PaginationBar
            v-model:page="activePage"
            :pageSize="pageSize"
            :total="activeTotal"
          />
        </div>
      </div>
    </main>
    <PeopleModal
      v-if="peopleModal"
      :type="peopleModal"
      :people="peopleModal === 'followers' ? followers : following"
      @close="closePeopleModal"
    />
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

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header {
  margin-top: 18px;
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
  width: 56px;
  height: 56px;
  aspect-ratio: 1 / 1;
  flex: 0 0 56px;
  border-radius: 50%;
  background: #f1f1f6;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #333;
  overflow: hidden;
}

.avatarImage {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.meta {
  display: grid;
  gap: 4px;
}

.name {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.sub {
  margin: 0;
  color: #888;
  font-size: 13px;
  line-height: 1.5;
}

.topRight {
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
  min-height: 46px;
}

.stat--button {
  border: 0;
  cursor: pointer;
}

.bio {
  margin: 14px 0 18px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.list-empty {
  color: #888;
  margin: 12px 0 0;
}

.content-tabs {
  display: inline-flex;
  gap: 10px;
  margin-bottom: 16px;
}

.content-tab {
  border: 1px solid rgba(255, 114, 76, 0.24);
  background: white;
  color: #555;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
}

.content-tab--active {
  background: #ff724c;
  border-color: #ff724c;
  color: white;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.grid > * {
  min-width: 0;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .container {
    margin-top: -138px;
  }

  .card {
    padding: 20px 18px 22px;
    border-radius: 24px;
  }

  .header {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }

  .topRight {
    width: 100%;
    justify-content: flex-start;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .container {
    margin-top: -118px;
    padding: 0 12px;
  }

  .card {
    padding: 18px 16px 20px;
  }

  .top {
    gap: 12px;
  }

  .header {
    margin-top: 14px;
    gap: 18px;
  }

  .left {
    width: 100%;
    align-items: center;
    gap: 14px;
  }

  .avatar {
    width: 64px;
    height: 64px;
    flex-basis: 64px;
  }

  .meta {
    min-width: 0;
  }

  .name {
    font-size: 2rem;
    line-height: 1;
  }

  .sub {
    font-size: 14px;
  }

  .topRight {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .topRight :deep(.btn) {
    grid-column: 1 / -1;
    width: 100%;
    min-height: 46px;
  }

  .stat {
    width: 100%;
    justify-content: flex-start;
    padding: 12px 14px;
    border-radius: 18px;
    font-size: 14px;
  }

  .bio {
    margin: 16px 0 18px;
    font-size: 15px;
  }

  .content-tabs {
    width: 100%;
    gap: 8px;
  }

  .content-tab {
    flex: 1;
    padding: 10px 12px;
    text-align: center;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}
</style>
