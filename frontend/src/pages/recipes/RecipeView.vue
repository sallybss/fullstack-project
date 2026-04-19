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
          @back="goBack"
          @toggle-save="toggleSave"
          @toggle-follow="toggleFollow"
        />

        <section class="section">
          <div class="section__head">
            <h2>Rate this recipe</h2>
            <p v-if="ratingFeedback" class="feedback">{{ ratingFeedback }}</p>
          </div>

          <div class="box rating-box">
            <Rating v-model="selectedRating" :cancel="false" />
            <button class="primary-btn" type="button" @click="submitRating">
              Submit rating
            </button>
          </div>
        </section>

        <section class="section">
          <div class="section__head">
            <h2>Comments</h2>
            <p v-if="commentError" class="error">{{ commentError }}</p>
          </div>

          <div class="box">
            <textarea
              v-model="commentText"
              class="comment-input"
              rows="4"
              placeholder="Share your thoughts about this recipe"
            />

            <div class="comment-actions">
              <button class="primary-btn" type="button" @click="submitComment">
                Post comment
              </button>
            </div>
          </div>

          <div v-if="comments.length === 0" class="box" style="margin-top: 16px">
            No comments yet.
          </div>

          <article
            v-for="comment in comments"
            :key="comment._id"
            class="box comment-item"
          >
            <div class="comment-top">
              <div class="comment-meta">
                <div class="comment-avatar">
                  <img
                    v-if="commentAvatarSrc(comment.avatarUrl)"
                    :src="commentAvatarSrc(comment.avatarUrl)"
                    alt="Comment avatar"
                    class="comment-avatar__image"
                  />
                  <span v-else>{{ commentInitials(comment.username) }}</span>
                </div>

                <div>
                  <strong>{{ comment.username }}</strong>
                  <p class="comment-date">{{ formatDate(comment.createdAt) }}</p>
                </div>
              </div>

              <div v-if="canManageComment(comment.user)" class="comment-tools">
                <button
                  class="link-btn"
                  type="button"
                  @click="startEditing(comment)"
                >
                  Edit
                </button>

                <button
                  class="link-btn"
                  type="button"
                  @click="removeComment(comment._id)"
                >
                  Delete
                </button>
              </div>
            </div>

            <template v-if="editingCommentId === comment._id">
              <textarea
                v-model="editingCommentText"
                class="comment-input comment-input--inline"
                rows="3"
              />

              <div class="comment-actions">
                <button class="link-btn" type="button" @click="cancelEditing">
                  Cancel
                </button>
                <button class="primary-btn" type="button" @click="saveEditedComment">
                  Save
                </button>
              </div>
            </template>

            <p v-else class="comment-text">{{ comment.text }}</p>
          </article>
        </section>

        <section class="section">
          <h2>Other recipes</h2>

          <div class="other-grid">
            <RecipeCard
              v-for="r in otherRecipes"
              :key="r._id"
              :recipe="r"
              @auth-required="goToSignIn"
              @save-click="toggleSave"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Rating from "primevue/rating";

import { useRecipes } from "../../modules/useRecipes";
import { useUser } from "../../modules/auth/useUser";
import type { RecipeComment } from "../../interfaces/recipe";

import RecipeDetails from "../../components/recipes/RecipeDetails.vue";
import HeroSection from "../../components/common/HeroSection.vue";
import RecipeCard from "../../components/recipes/RecipeCard.vue";

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
const selectedRating = ref(0);
const ratingFeedback = ref("");

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
    const response = await fetch(`${API_URL}/api/profiles/${recipe.value.owner._id}/follow`, {
      method: isFollowing.value ? "DELETE" : "POST",
      headers: {
        "auth-token": localStorage.getItem("lsToken") || "",
      },
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to update follow status");
    }

    await fetchCurrentUser();
  } catch (err) {
    errorMessage.value = (err as Error).message || "Failed to update follow status";
  }
}

function canManageComment(commentUserId: string) {
  return user.value?._id === commentUserId;
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

.box {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.section {
  margin-top: 22px;
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.rating-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.comment-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  resize: vertical;
  font: inherit;
}

.comment-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.comment-item + .comment-item {
  margin-top: 16px;
}

.comment-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #f1f1f6;
  color: #333;
  display: grid;
  place-items: center;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.comment-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.comment-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-date {
  margin: 4px 0 0;
  color: #777;
  font-size: 13px;
}

.comment-text {
  margin: 12px 0 0;
  color: #333;
  line-height: 1.5;
}

.comment-input--inline {
  margin-top: 12px;
}

.primary-btn,
.link-btn {
  border: 0;
  cursor: pointer;
  font: inherit;
}

.primary-btn {
  padding: 10px 16px;
  border-radius: 999px;
  background: #ff724c;
  color: #fff;
}

.link-btn {
  background: transparent;
  color: #ff724c;
}

.feedback {
  color: #2e7d32;
}

.error {
  color: #c62828;
}

.other-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  align-items: start;
}

@media (max-width: 900px) {
  .other-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
