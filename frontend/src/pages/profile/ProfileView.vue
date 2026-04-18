<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/profilehero/1400/700" setting-key="profile-hero" />

    <main class="container">
      <div class="profile-card">
        <button class="back" type="button" @click="goBack">← Go back</button>

        <div v-if="loadingProfile" class="empty-state">
          <h2>Loading profile...</h2>
        </div>

        <div v-else-if="pageError" class="empty-state">
          <h2>Something went wrong</h2>
          <p>{{ pageError }}</p>
        </div>

        <template v-else>
          <div class="profile-top">
            <div class="left">
              <div class="avatar">{{ ownerInitial }}</div>

              <div class="meta">
                <h1 class="name">{{ profileData?.username || "Unknown" }}</h1>
                <p class="sub">
                  Member profile · <b>{{ userRecipes.length }}</b> recipes posted
                </p>
              </div>
            </div>

            <div class="right">
              <BaseButton
                v-if="canFollow"
                :variant="isFollowing ? 'outline' : 'primary'"
                type="button"
                @click="toggleFollow"
              >
                {{ isFollowing ? "Following" : "Follow" }}
              </BaseButton>

              <button class="stat stat--button" type="button" @click="openPeopleModal('followers')">
                <i class="pi pi-users"></i>
                <span><b>{{ followers.length }}</b> followers</span>
              </button>

              <button class="stat stat--button" type="button" @click="openPeopleModal('following')">
                <i class="pi pi-share-alt"></i>
                <span><b>{{ following.length }}</b> following</span>
              </button>

              <div class="stat">
                <i class="pi pi-book"></i>
                <span><b>{{ userRecipes.length }}</b> recipes</span>
              </div>

              <div class="stat">
                <i class="pi pi-bookmark"></i>
                <span><b>{{ savedRecipes.length }}</b> saved</span>
              </div>
            </div>
          </div>

          <p class="bio">
            {{ profileData?.bio || "This user has not added a bio yet." }}
          </p>

          <section class="section">
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

            <div
              v-if="activeSection === 'posts' && pagedRecipes.length === 0"
              class="empty-state"
            >
              <h2>No recipes yet</h2>
              <p>This user has not published any recipes yet.</p>
            </div>

            <div
              v-else-if="activeSection === 'saved' && pagedSavedRecipes.length === 0"
              class="empty-state"
            >
              <h2>No saved recipes yet</h2>
              <p>This user has not saved any recipes yet.</p>
            </div>

            <div v-else class="grid">
              <RecipeCard
                v-for="r in activeSection === 'posts' ? pagedRecipes : pagedSavedRecipes"
                :key="r._id"
                :recipe="r"
                :show-delete="canAdminDeleteRecipes"
                @auth-required="goToSignIn"
                @save-click="handleToggleSave"
                @delete="handleAdminDeleteRecipe"
              />
            </div>

            <div class="pager" v-if="activeTotal > pageSize">
              <PaginationBar
                v-model:page="activePage"
                :pageSize="pageSize"
                :total="activeTotal"
              />
            </div>
          </section>
        </template>
      </div>
    </main>

    <div
      v-if="peopleModal"
      class="people-modal-overlay"
      @click.self="closePeopleModal"
    >
      <div class="people-modal">
        <div class="people-modal__head">
          <h2>{{ peopleModal === 'followers' ? 'Followers' : 'Following' }}</h2>
          <button class="people-modal__close" type="button" @click="closePeopleModal">×</button>
        </div>

        <p
          v-if="(peopleModal === 'followers' ? followers : following).length === 0"
          class="list-empty"
        >
          {{ peopleModal === 'followers' ? 'No followers yet.' : 'Not following anyone yet.' }}
        </p>

        <div v-else class="people-list">
          <button
            v-for="person in (peopleModal === 'followers' ? followers : following)"
            :key="person._id"
            class="people-row"
            type="button"
            @click="router.push({ name: 'profile', params: { id: person._id } }); closePeopleModal();"
          >
            {{ person.username }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import RecipeCard from "../../components/recipes/RecipeCard.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import PaginationBar from "../../components/common/PaginationBar.vue";
import { usePagination } from "../../composables/usePagination";

import type { Profile } from "../../interfaces/user";
import type { Recipe } from "../../interfaces/recipe";
import { useRecipes } from "../../modules/useRecipes";
import { useUser } from "../../modules/auth/useUser";

const route = useRoute();
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

const { recipes, fetchRecipes, toggleSave, deleteRecipe } = useRecipes();
const { isLoggedIn, profile, user, fetchCurrentUser } = useUser();

const loadingProfile = ref(true);
const pageError = ref("");
const profileData = ref<Profile | null>(null);
const userRecipes = ref<Recipe[]>([]);
const savedRecipes = ref<Recipe[]>([]);
const followers = ref<Array<{ _id: string; username: string }>>([]);
const following = ref<Array<{ _id: string; username: string }>>([]);
const activeSection = ref<"posts" | "saved">("posts");
const peopleModal = ref<"followers" | "following" | null>(null);

const profileId = computed(() => String(route.params.id || ""));
const pageSize = 8;
const {
  page: postsPage,
  totalItems: totalPosts,
  pagedItems: pagedRecipes,
  syncPageWithinBounds: syncPostsPageWithinBounds,
} = usePagination(userRecipes, pageSize);
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

const ownerInitial = computed(() => {
  const username = profileData.value?.username ?? "U";
  return username.charAt(0).toUpperCase();
});

const canFollow = computed(() => {
  return Boolean(
    isLoggedIn.value &&
      profile.value &&
      profileData.value &&
      profile.value.user !== profileData.value.user,
  );
});

const isFollowing = computed(() => {
  if (!profile.value || !profileData.value) return false;
  return profile.value.following.includes(profileData.value.user);
});

const canAdminDeleteRecipes = computed(() => {
  return Boolean(
    user.value?.role === "admin" &&
      profileData.value &&
      user.value._id !== profileData.value.user &&
      activeSection.value === "posts",
  );
});

onMounted(async () => {
  try {
    loadingProfile.value = true;
    pageError.value = "";

    await Promise.all([
      isLoggedIn.value && !profile.value ? fetchCurrentUser() : Promise.resolve(),
      fetchRecipes(),
    ]);

    const [profileResponse, recipesResponse, savedResponse, followersResponse, followingResponse] = await Promise.all([
      fetch(`${API_URL}/api/profiles/${profileId.value}`),
      fetch(`${API_URL}/api/profiles/${profileId.value}/recipes`),
      fetch(`${API_URL}/api/profiles/${profileId.value}/saved`),
      fetch(`${API_URL}/api/profiles/${profileId.value}/followers`),
      fetch(`${API_URL}/api/profiles/${profileId.value}/following`),
    ]);

    if (!profileResponse.ok) {
      throw new Error((await profileResponse.text()) || "Failed to fetch profile");
    }
    if (!recipesResponse.ok) {
      throw new Error((await recipesResponse.text()) || "Failed to fetch user recipes");
    }
    if (!savedResponse.ok) {
      throw new Error((await savedResponse.text()) || "Failed to fetch saved recipes");
    }
    if (!followersResponse.ok) {
      throw new Error((await followersResponse.text()) || "Failed to fetch followers");
    }
    if (!followingResponse.ok) {
      throw new Error((await followingResponse.text()) || "Failed to fetch following");
    }

    const [profilePayload, recipesPayload, savedPayload, followersPayload, followingPayload] = await Promise.all([
      profileResponse.json(),
      recipesResponse.json(),
      savedResponse.json(),
      followersResponse.json(),
      followingResponse.json(),
    ]);

    profileData.value = profilePayload.data;
    userRecipes.value = (recipesPayload.data ?? []).map((recipe: Recipe) => ({
      ...recipe,
      saved: recipes.value.find((item) => item._id === recipe._id)?.saved ?? false,
    }));
    savedRecipes.value = (savedPayload.data ?? []).map((recipe: Recipe) => ({
      ...recipe,
      saved: recipes.value.find((item) => item._id === recipe._id)?.saved ?? true,
    }));
    followers.value = followersPayload.data ?? [];
    following.value = followingPayload.data ?? [];
  } catch (err) {
    pageError.value = (err as Error).message || "Failed to load profile";
  } finally {
    loadingProfile.value = false;
  }
});

function goBack() {
  router.back();
}

function goToSignIn() {
  router.push("/signin");
}

function openPeopleModal(type: "followers" | "following") {
  peopleModal.value = type;
}

function closePeopleModal() {
  peopleModal.value = null;
}

async function toggleFollow() {
  if (!profileData.value || !canFollow.value) return;

  try {
    const wasFollowing = isFollowing.value;
    const response = await fetch(`${API_URL}/api/profiles/${profileData.value.user}/follow`, {
      method: wasFollowing ? "DELETE" : "POST",
      headers: {
        "auth-token": localStorage.getItem("lsToken") || "",
      },
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to update follow status");
    }

    await fetchCurrentUser();

    profileData.value = {
      ...profileData.value,
      followers: wasFollowing
        ? profileData.value.followers.filter((id) => id !== profile.value?.user)
        : [...profileData.value.followers, profile.value?.user || ""].filter(Boolean),
    };
    followers.value = wasFollowing
      ? followers.value.filter((person) => person._id !== profile.value?._id)
      : [...followers.value, { _id: profile.value?.user || "", username: profile.value?.username || "You" }].filter((person) => person._id);
  } catch (err) {
    pageError.value = (err as Error).message || "Failed to update follow status";
  }
}

async function handleToggleSave(recipeId: string) {
  await toggleSave(recipeId);
  userRecipes.value = userRecipes.value.map((recipe) =>
    recipe._id === recipeId ? { ...recipe, saved: !recipe.saved } : recipe,
  );
  savedRecipes.value = savedRecipes.value
    .map((recipe) =>
      recipe._id === recipeId ? { ...recipe, saved: !recipe.saved } : recipe,
    )
    .filter((recipe) => recipe.saved);
}

async function handleAdminDeleteRecipe(recipeId: string) {
  if (!canAdminDeleteRecipes.value) return;
  if (!window.confirm("Delete this recipe as admin?")) return;

  await deleteRecipe(recipeId);
  userRecipes.value = userRecipes.value.filter((recipe) => recipe._id !== recipeId);
  syncPostsPageWithinBounds();
}
</script>

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

.stat--button {
  border: 0;
  cursor: pointer;
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

.list-empty {
  color: #888;
  margin: 12px 0 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.people-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 30;
}

.people-modal {
  width: min(460px, 92vw);
  max-height: min(70vh, 640px);
  overflow: auto;
  background: white;
  border-radius: 24px;
  padding: 20px;
}

.people-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.people-modal__head h2 {
  margin: 0;
}

.people-modal__close {
  border: 0;
  background: transparent;
  font-size: 26px;
  cursor: pointer;
}

.people-list {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.people-row {
  border: 1px solid #ececec;
  background: #fafafa;
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
}

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
