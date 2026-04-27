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
              <div class="avatar">
                <img v-if="avatarSrc" :src="avatarSrc" alt="Profile avatar" class="avatarImage" />
                <span v-else>{{ ownerInitial }}</span>
              </div>

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
                :onAuthRequired="goToSignIn"
                :onSaveClick="handleToggleSave"
                :onDelete="handleAdminDeleteRecipe"
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

    <PeopleModal
      v-if="peopleModal"
      :type="peopleModal"
      :people="peopleModal === 'followers' ? followers : following"
      @close="closePeopleModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import RecipeCard from "../../components/recipes/RecipeCard.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import PaginationBar from "../../components/common/PaginationBar.vue";
import PeopleModal from "../../components/profile/PeopleModal.vue";
import { usePagination } from "../../composables/usePagination";
import { useResponsivePageSize } from "../../composables/useResponsivePageSize";

import type { Profile } from "../../interfaces/user";
import type { Recipe } from "../../interfaces/recipe";
import { useRecipes } from "../../modules/useRecipes";
import { useUser } from "../../modules/auth/useUser";
import {
  fetchProfile,
  fetchProfileFollowers,
  fetchProfileFollowing,
  fetchProfileRecipes,
  fetchProfileSavedRecipes,
  updateFollowStatus,
  type ProfilePerson,
} from "../../services/profileService";

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
const followers = ref<ProfilePerson[]>([]);
const following = ref<ProfilePerson[]>([]);
const activeSection = ref<"posts" | "saved">("posts");
const peopleModal = ref<"followers" | "following" | null>(null);

const profileId = computed(() => String(route.params.id || ""));
const { pageSize } = useResponsivePageSize([
  { maxWidth: 520, pageSize: 4 },
  { maxWidth: 900, pageSize: 6 },
  { maxWidth: 1100, pageSize: 9 },
], 12);
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
const avatarSrc = computed(() => {
  const value = profileData.value?.avatarUrl || "";
  if (!value) return "";
  return value.startsWith("http") ? value : `${API_URL}${value}`;
});

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

    const [profilePayload, recipesPayload, savedPayload, followersPayload, followingPayload] = await Promise.all([
      fetchProfile(profileId.value),
      fetchProfileRecipes(profileId.value),
      fetchProfileSavedRecipes(profileId.value),
      fetchProfileFollowers(profileId.value),
      fetchProfileFollowing(profileId.value),
    ]);

    profileData.value = profilePayload;
    userRecipes.value = (recipesPayload ?? []).map((recipe: Recipe) => ({
      ...recipe,
      saved: recipes.value.find((item) => item._id === recipe._id)?.saved ?? false,
    }));
    savedRecipes.value = (savedPayload ?? []).map((recipe: Recipe) => ({
      ...recipe,
      saved: recipes.value.find((item) => item._id === recipe._id)?.saved ?? true,
    }));
    followers.value = followersPayload ?? [];
    following.value = followingPayload ?? [];
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
    await updateFollowStatus(profileData.value.user, wasFollowing, localStorage.getItem("lsToken") || "");

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
  aspect-ratio: 1 / 1;
  flex: 0 0 54px;
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
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: flex-end;
  flex-shrink: 0;
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
  white-space: nowrap;
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
  .profile-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .right {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .container {
    margin-top: -126px;
    padding: 0 10px 28px;
  }

  .profile-card {
    border-radius: 24px;
    padding: 18px 16px 20px;
  }

  .back {
    font-size: 13px;
  }

  .profile-top {
    gap: 14px;
    margin-top: 14px;
  }

  .left {
    width: 100%;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 58px;
    height: 58px;
    flex-basis: 58px;
  }

  .meta {
    min-width: 0;
    gap: 6px;
  }

  .name {
    font-size: 20px;
    line-height: 1.05;
  }

  .sub {
    font-size: 12px;
    line-height: 1.45;
  }

  .right {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
  }

  .right > * {
    min-width: 0;
  }

  .right :deep(.baseButton),
  .right :deep(button.baseButton) {
    width: 100%;
  }

  .stat {
    justify-content: center;
    padding: 12px 10px;
    text-align: center;
    white-space: normal;
    line-height: 1.35;
  }

  .bio {
    margin-top: 16px;
    font-size: 15px;
    line-height: 1.6;
  }

  .section {
    margin-top: 20px;
  }

  .content-tabs {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .content-tab {
    width: 100%;
    text-align: center;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 10px;
  }

  :deep(.hero .coverEditor) {
    top: 88px;
    bottom: auto;
    right: 14px;
  }
}
</style>
