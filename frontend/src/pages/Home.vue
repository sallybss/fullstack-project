<template>
  <div class="page">
    <main class="page__main">
      <HeroSection imageUrl="https://picsum.photos/seed/homehero/1400/700">
        <HeroSearch v-model="query" />
      </HeroSection>

      <section class="section">
        <div class="section__actions">
          <div class="chips">
            <button
              v-for="chip in categoryChips"
              :key="chip"
              type="button"
              class="chip"
              :class="{ 'chip--active': selectedCategory === chip }"
              @click="selectedCategory = chip"
            >
              {{ chip }}
            </button>
          </div>

          <BaseButton
            variant="primary"
            type="button"
            @click="handleAddRecipeClick"
          >
            Add Recipe
          </BaseButton>
        </div>

        <div v-if="loading" class="empty-state">
          <h2>Loading recipes...</h2>
        </div>

        <div v-else-if="error" class="empty-state">
          <h2>Something went wrong</h2>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="filteredRecipes.length === 0" class="empty-state">
          <h2>No recipes found</h2>
          <p>{{ emptyStateMessage }}</p>
        </div>

        <RecipeGrid v-else>
          <RecipeCard
            v-for="recipe in filteredRecipes"
            :key="recipe._id"
            :recipe="recipe"
            @auth-required="openAuthModal"
            @save-click="toggleSave"
          />
        </RecipeGrid>
      </section>
    </main>

    <div
      v-if="showAuthModal"
      class="auth-modal-overlay"
      @click.self="closeAuthModal"
    >
      <div class="auth-modal">
        <button
          class="auth-modal__closeBtn"
          type="button"
          aria-label="Close"
          @click="closeAuthModal"
        >
          <i class="pi pi-times"></i>
        </button>

        <h2 class="auth-modal__title">You are not logged in</h2>

        <p class="auth-modal__text">
          You need an account to perform this action.
        </p>

        <div class="auth-modal__actions">
          <BaseButton variant="outline" type="button" @click="goToSignIn">
            Sign In
          </BaseButton>

          <BaseButton variant="primary" type="button" @click="goToSignUp">
            Sign Up
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useRecipes } from "../modules/useRecipes";
import { useUser } from "../modules/auth/useUser";

import HeroSearch from "../components/home/HeroSearch.vue";
import HeroSection from "../components/common/HeroSection.vue";
import RecipeGrid from "../components/recipes/RecipeGrid.vue";
import RecipeCard from "../components/recipes/RecipeCard.vue";
import BaseButton from "../components/common/BaseButton.vue";

const router = useRouter();

const query = ref("");
const showAuthModal = ref(false);
const selectedCategory = ref("All");

const categoryChips = ["All", "Breakfast", "Lunch", "Dinner", "Dessert"];

const { recipes, loading, error, fetchRecipes, toggleSave } = useRecipes();
const { isLoggedIn } = useUser();

onMounted(() => {
  fetchRecipes();
});

// Filters recipes by title and selected chip
const filteredRecipes = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase();

  return recipes.value.filter((recipe) => {
    const matchesQuery = recipe.title.toLowerCase().includes(normalizedQuery);

    const matchesCategory =
      selectedCategory.value === "All" ||
      recipe.cuisine?.toLowerCase() === selectedCategory.value.toLowerCase();

    return matchesQuery && matchesCategory;
  });
});

const emptyStateMessage = computed(() => {
  if (selectedCategory.value === "All" && !query.value.trim()) {
    return "There are no recipes to display yet.";
  }

  if (selectedCategory.value === "All") {
    return "No recipes match your search.";
  }

  if (!query.value.trim()) {
    return `No ${selectedCategory.value.toLowerCase()} recipes available yet.`;
  }

  return `No ${selectedCategory.value.toLowerCase()} recipes match your search.`;
});

// Protected action: only logged-in users can add a recipe
function handleAddRecipeClick() {
  if (!isLoggedIn.value) {
    openAuthModal();
    return;
  }

  router.push("/add-recipe");
}

// Opens the guest modal when a protected action is triggered
function openAuthModal() {
  showAuthModal.value = true;
}

function closeAuthModal() {
  showAuthModal.value = false;
}

function goToSignIn() {
  closeAuthModal();
  router.push("/signin");
}

function goToSignUp() {
  closeAuthModal();
  router.push("/signup");
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f5f5f7;
}

.page__main {
  display: grid;
  gap: 28px;
}

.section {
  width: min(1200px, 92vw);
  margin: 0 auto 64px;
}

.section__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.chips {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chip {
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid #e4e4e7;
  background: white;
  color: #444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease;
}

.chip:hover {
  border-color: #ff724c;
  color: #ff724c;
}

.chip--active {
  background: #ff724c;
  border-color: #ff724c;
  color: white;
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
  background: white;
  border-radius: 20px;
}

.empty-state h2 {
  margin-bottom: 8px;
  font-size: 1.5rem;
}

.empty-state p {
  color: #666;
}

.auth-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
}

.auth-modal {
  position: relative;
  width: min(460px, 92vw);
  padding: 32px;
  border-radius: 24px;
  background: white;
  text-align: center;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.auth-modal__title {
  margin: 0 0 10px;
  font-size: 1.7rem;
  color: #111;
}

.auth-modal__text {
  margin: 0 0 22px;
  color: #666;
}

.auth-modal__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
}

.auth-modal__closeBtn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: #777;
  font-size: 18px;
}

.auth-modal__closeBtn:hover {
  color: #111;
}

@media (max-width: 640px) {
  .section__actions {
    justify-content: stretch;
  }

  .section__actions :deep(button) {
    width: 100%;
  }

  .auth-modal__actions {
    flex-direction: column;
  }
}
</style>