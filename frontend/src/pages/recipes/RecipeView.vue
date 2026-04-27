<template>
  <div class="page">
    <HeroSection v-if="recipe" :imageUrl="heroImageSrc" />

    <main class="container">
      <div v-if="pageLoading" class="recipe-card">
        <p>Loading recipe...</p>
      </div>

      <div v-else-if="errorMessage" class="recipe-card">
        <RouterLink to="/" class="back">← Go back</RouterLink>
        <p style="margin-top: 12px">{{ errorMessage }}</p>
      </div>

      <div v-else-if="!recipe" class="recipe-card">
        <RouterLink to="/" class="back">← Go back</RouterLink>
        <p style="margin-top: 12px">Recipe not found.</p>
      </div>

      <template v-else>
        <RecipeDetails
          :recipe="recipe"
          :isFollowing="isFollowing"
          :showFollowAction="canFollowOwner"
          :onBack="goBack"
          :onToggleSave="toggleSave"
          :onToggleFollow="toggleFollow"
        />

        <RecipeRatingSection
          v-model:selected-rating="selectedRating"
          :feedback="ratingFeedback"
          @submit="submitRating"
        />

        <RecipeCommentsSection
          v-model:comment-text="commentText"
          v-model:editing-comment-text="editingCommentText"
          v-model:show-all-comments="showAllComments"
          :comments="comments"
          :visible-comments="visibleComments"
          :remaining-comment-count="remainingCommentCount"
          :comment-error="commentError"
          :editing-comment-id="editingCommentId"
          :can-edit-comment="canEditComment"
          :can-delete-comment="canDeleteComment"
          :comment-avatar-src="commentAvatarSrc"
          :comment-initials="commentInitials"
          :format-date="formatDate"
          @submit="submitComment"
          @start-editing="startEditing"
          @cancel-editing="cancelEditing"
          @save-editing="saveEditedComment"
          @delete-comment="removeComment"
        />

        <OtherRecipesSection
          :recipes="otherRecipes"
          :onAuthRequired="goToSignIn"
          :onSaveClick="toggleSave"
        />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useRecipes } from "../../modules/useRecipes";
import { useUser } from "../../modules/auth/useUser";
import type { RecipeComment } from "../../interfaces/recipe";

import RecipeDetails from "../../components/recipes/RecipeDetails.vue";
import HeroSection from "../../components/common/HeroSection.vue";
import OtherRecipesSection from "../../components/recipes/OtherRecipesSection.vue";
import RecipeCommentsSection from "../../components/recipes/RecipeCommentsSection.vue";
import RecipeRatingSection from "../../components/recipes/RecipeRatingSection.vue";
import { updateFollowStatus } from "../../services/profileService";

const route = useRoute();
const router = useRouter();

const {
  recipes,
  loading,
  error,
  fetchRecipes,
  fetchRecipeById,
  fetchComments,
  addComment,
  deleteComment,
  updateComment,
  rateRecipe,
  toggleSave,
} = useRecipes();
const { isLoggedIn, user, profile, fetchCurrentUser } = useUser();

const fallbackImage = "https://picsum.photos/seed/recipe/1200/700";
const API_URL = import.meta.env.VITE_API_URL;

const pageLoading = ref(true);
const errorMessage = ref("");
const comments = ref<RecipeComment[]>([]);
const commentText = ref("");
const commentError = ref("");
const editingCommentId = ref("");
const editingCommentText = ref("");
const showAllComments = ref(false);
const selectedRating = ref(0);
const ratingFeedback = ref("");
const initialVisibleComments = 1;

const recipeId = computed(() => String(route.params.id));
const commentAvatarSrc = (avatarUrl?: string) => {
  if (!avatarUrl) return "";
  return avatarUrl.startsWith("http") ? avatarUrl : `${API_URL}${avatarUrl}`;
};
const commentInitials = (username: string) =>
  (username || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const recipe = computed(() => recipes.value.find((item) => item._id === recipeId.value));

const heroImageSrc = computed(() => {
  if (!recipe.value?.imageUrl) return fallbackImage;

  if (recipe.value.imageUrl.startsWith("http")) {
    return recipe.value.imageUrl;
  }

  return `${API_URL}${recipe.value.imageUrl}`;
});

const otherRecipes = computed(() =>
  recipes.value.filter((item) => item._id !== recipeId.value).slice(0, 4),
);
const visibleComments = computed(() =>
  showAllComments.value ? comments.value : comments.value.slice(0, initialVisibleComments),
);
const remainingCommentCount = computed(() =>
  Math.max(0, comments.value.length - initialVisibleComments),
);

const canFollowOwner = computed(() => {
  if (!isLoggedIn.value || !recipe.value?.owner?._id || !user.value?._id) return false;
  return recipe.value.owner._id !== user.value._id;
});

const isFollowing = computed(() => {
  const ownerId = recipe.value?.owner?._id;
  if (!ownerId || !profile.value) return false;
  return profile.value.following.includes(ownerId);
});

onMounted(async () => {
  try {
    pageLoading.value = true;
    errorMessage.value = "";

    if (recipes.value.length === 0) {
      await fetchRecipes();
    }

    if (!recipe.value) {
      await fetchRecipeById(recipeId.value);
    }

    comments.value = await fetchComments(recipeId.value);
    showAllComments.value = false;

    if (isLoggedIn.value && !user.value) {
      await fetchCurrentUser();
    }
  } catch (err) {
    errorMessage.value = (err as Error).message || "Failed to load recipe";
  } finally {
    pageLoading.value = false;
  }
});

function goBack() {
  router.back();
}

function goToSignIn() {
  router.push("/signin");
}

function startEditing(comment: RecipeComment) {
  editingCommentId.value = comment._id;
  editingCommentText.value = comment.text;
}

function cancelEditing() {
  editingCommentId.value = "";
  editingCommentText.value = "";
}

async function submitComment() {
  if (!isLoggedIn.value) {
    goToSignIn();
    return;
  }

  try {
    commentError.value = "";
    const createdComment = await addComment(recipeId.value, commentText.value);
    comments.value.unshift(createdComment);
    showAllComments.value = false;
    commentText.value = "";
  } catch (err) {
    commentError.value = (err as Error).message || "Failed to add comment";
  }
}

async function removeComment(commentId: string) {
  try {
    commentError.value = "";
    await deleteComment(recipeId.value, commentId);
    comments.value = comments.value.filter((comment) => comment._id !== commentId);
    if (comments.value.length <= initialVisibleComments) {
      showAllComments.value = false;
    }
  } catch (err) {
    commentError.value = (err as Error).message || "Failed to delete comment";
  }
}

async function saveEditedComment() {
  if (!editingCommentId.value) return;

  try {
    commentError.value = "";
    const updated = await updateComment(
      recipeId.value,
      editingCommentId.value,
      editingCommentText.value,
    );

    comments.value = comments.value.map((comment) =>
      comment._id === editingCommentId.value ? { ...comment, ...updated } : comment,
    );

    cancelEditing();
  } catch (err) {
    commentError.value = (err as Error).message || "Failed to update comment";
  }
}

async function submitRating() {
  if (!isLoggedIn.value) {
    goToSignIn();
    return;
  }

  try {
    if (!selectedRating.value) {
      ratingFeedback.value = "Select a rating first.";
      return;
    }

    await rateRecipe(recipeId.value, selectedRating.value);
    ratingFeedback.value = "Rating saved.";
  } catch (err) {
    ratingFeedback.value = (err as Error).message || "Failed to save rating";
  }
}

async function toggleFollow() {
  if (!canFollowOwner.value || !recipe.value?.owner?._id) {
    return;
  }

  if (!isLoggedIn.value) {
    goToSignIn();
    return;
  }

  try {
    await updateFollowStatus(
      recipe.value.owner._id,
      isFollowing.value,
      localStorage.getItem("lsToken") || "",
    );

    await fetchCurrentUser();
  } catch (err) {
    errorMessage.value = (err as Error).message || "Failed to update follow status";
  }
}

function canEditComment(commentUserId: string) {
  return user.value?._id === commentUserId;
}

function canDeleteComment(commentUserId: string) {
  return user.value?._id === commentUserId || user.value?.role === "admin";
}

function formatDate(value?: string) {
  if (!value) return "Just now";
  return new Date(value).toLocaleString();
}
</script>

<style scoped>
.page {
  background: #f6f6fb;
  min-height: 100vh;
}

.container {
  max-width: 980px;
  margin: -180px auto 0px;
  padding: 0 16px 48px;
  position: relative;
  z-index: 2;
}

.recipe-card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.back {
  color: #666;
  text-decoration: none;
}

@media (max-width: 640px) {
  .container {
    margin-top: -132px;
    padding: 0 12px 40px;
  }

  .recipe-card {
    border-radius: 18px;
  }
}
</style>
