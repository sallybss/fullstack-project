<template>
  <div class="page">
    <main class="page__main">
      <HeroSection imageUrl="https://picsum.photos/seed/homehero/1400/700" setting-key="home-hero">
        <HeroSearch v-model="query" />
      </HeroSection>

      <section class="section">
        <div class="section__actions">
          <div class="categoryControls">
            <span class="categoryControls__label">Category</span>
            <CategoryChips v-model="selectedCategory" :items="categoryChips" />
          </div>

          <BaseButton
            variant="primary"
            type="button"
            @click="handleAddRecipeClick"
          >
            + Add Recipe
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
            v-for="recipe in pagedRecipes"
            :key="recipe._id"
            :recipe="recipe"
            :onAuthRequired="openAuthRequiredModal"
            :onSaveClick="toggleSave"
          />
        </RecipeGrid>

        <PaginationBar
          v-if="filteredRecipes.length > pageSize"
          v-model:page="page"
          :pageSize="pageSize"
          :total="filteredRecipes.length"
        />
      </section>
    </main>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { useRecipes } from "../modules/useRecipes";
import { useUser } from "../modules/auth/useUser";

import HeroSearch from "../components/home/HeroSearch.vue";
import CategoryChips from "../components/home/CategoryChips.vue";
import HeroSection from "../components/common/HeroSection.vue";
import PaginationBar from "../components/common/PaginationBar.vue";
import RecipeGrid from "../components/recipes/RecipeGrid.vue";
import RecipeCard from "../components/recipes/RecipeCard.vue";
import BaseButton from "../components/common/BaseButton.vue";
import { usePagination } from "../composables/usePagination";
import { useResponsivePageSize } from "../composables/useResponsivePageSize";
import { useAuthRequiredModal } from "../composables/useAuthRequiredModal";

const router = useRouter();
const { openAuthRequiredModal } = useAuthRequiredModal();

const query = ref("");
const selectedCategory = ref("All");

const categoryChips = ["All", "Breakfast", "Lunch", "Dinner", "Dessert"];

const { recipes, loading, error, fetchRecipes, toggleSave } = useRecipes();
const { isLoggedIn } = useUser();

const { pageSize } = useResponsivePageSize([
  { maxWidth: 820, pageSize: 6 },
  { maxWidth: 1100, pageSize: 9 },
], 12);
const { page, pagedItems: pagedRecipes, resetPage } = usePagination(recipes, pageSize);

onMounted(() => {
  fetchRecipes();
});

let searchTimeout: number | undefined;

watch([query, selectedCategory], ([nextQuery, nextCategory]) => {
  resetPage();
  window.clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(() => {
    void fetchRecipes({
      title: nextQuery,
      cuisine: nextCategory === "All" ? "" : nextCategory,
    });
  }, 250);
});

const filteredRecipes = computed(() => recipes.value);

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
    openAuthRequiredModal();
    return;
  }

  router.push("/add-recipe");
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

.categoryControls {
  display: grid;
  gap: 10px;
  flex: 1 1 540px;
}

.categoryControls__label {
  color: #676767;
  font-size: 13px;
  font-weight: 600;
}

.categoryControls :deep(.chips) {
  gap: 12px;
}

.categoryControls :deep(.chip) {
  height: 38px;
  padding: 0 18px;
  border-color: rgba(255, 114, 76, 0.18);
  color: #5c544d;
  font-size: 13px;
  font-weight: 600;
}

.categoryControls :deep(.chip--active) {
  color: #fff;
}

.categoryControls :deep(.chip--icon) {
  display: none;
}

@media (max-width: 700px) {
  .section__actions {
    align-items: stretch;
  }

  .categoryControls {
    flex-basis: 100%;
  }

  .categoryControls :deep(.chips) {
    gap: 8px;
    justify-content: flex-start;
    align-items: center;
  }

  .categoryControls :deep(.chip) {
    width: auto;
    flex: 0 0 auto;
    height: 34px;
    padding: 0 14px;
    font-size: 12px;
  }

  .section :deep(.btn) {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .section :deep(.grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
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

@media (max-width: 640px) {
  .section__actions {
    justify-content: stretch;
  }

  .section__actions :deep(button) {
    width: 100%;
  }
}
</style>
