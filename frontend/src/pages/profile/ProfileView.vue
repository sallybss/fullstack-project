<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/profilehero/1400/700" setting-key="profile-hero" />

    <main class="container">
      <div class="profile-card">
        <button class="back" type="button" @click="goBack">Go back</button>

        <div v-if="loadingProfile" class="empty-state">
          <h2>Loading profile...</h2>
        </div>

        <div v-else-if="pageError" class="empty-state">
          <h2>Something went wrong</h2>
          <p>{{ pageError }}</p>
        </div>

        <template v-else>
          <PublicProfileHeader
            :username="profileData?.username || 'Unknown'"
            :bio="profileData?.bio || 'This user has not added a bio yet.'"
            :avatar-src="avatarSrc"
            :owner-initial="ownerInitial"
            :recipe-count="userRecipes.length"
            :saved-count="savedRecipes.length"
            :follower-count="followers.length"
            :following-count="following.length"
            :can-follow="canFollow"
            :is-following="isFollowing"
            @follow="toggleFollow"
            @open-people="openPeopleModal"
          />

          <ProfileRecipeSections
            v-model:active-section="activeSection"
            v-model:active-page="activePage"
            :page-size="pageSize"
            :active-total="activeTotal"
            :paged-recipes="pagedRecipes"
            :paged-saved-recipes="pagedSavedRecipes"
            :can-admin-delete-recipes="canAdminDeleteRecipes"
            @auth-required="goToSignIn"
            @toggle-save="handleToggleSave"
            @delete-recipe="handleAdminDeleteRecipe"
          />
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
import PeopleModal from "../../components/profile/PeopleModal.vue";
import ProfileRecipeSections from "../../components/profile/ProfileRecipeSections.vue";
import PublicProfileHeader from "../../components/profile/PublicProfileHeader.vue";
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

  :deep(.hero .coverEditor) {
    top: 88px;
    bottom: auto;
    right: 14px;
  }
}
</style>
