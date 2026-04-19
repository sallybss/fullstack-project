<template>
  <div class="page">
    <main class="page__main">
      <HeroSection imageUrl="https://picsum.photos/seed/savedhero/1400/700" setting-key="saved-recipes-hero">
        <div class="saved-hero">
          <h1 class="saved-hero__title">Saved Recipes</h1>
        </div>
      </HeroSection>

      <section class="section">
        <div class="section__actions">
          <div class="categoryControls">
            <span class="categoryControls__label">Category</span>
            <CategoryChips v-model="selectedCategory" :items="categoryChips" />
          </div>
        </div>

        <div v-if="savedRecipes.length === 0" class="empty-state">
          <h2>No saved recipes yet</h2>
          <p>Your saved recipes will appear here.</p>
        </div>

        <div v-else-if="filteredSavedRecipes.length === 0" class="empty-state">
          <h2>No saved recipes found</h2>
          <p>{{ emptyStateMessage }}</p>
        </div>

        <RecipeGrid v-else>
          <RecipeCard
            v-for="recipe in pagedSavedRecipes"
            :key="recipe._id"
            :recipe="recipe"
            :onAuthRequired="() => {}"
            :onSaveClick="toggleSave"
          />
        </RecipeGrid>

        <PaginationBar
          v-if="filteredSavedRecipes.length > pageSize"
          v-model:page="page"
          :pageSize="pageSize"
          :total="filteredSavedRecipes.length"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import HeroSection from "../components/common/HeroSection.vue";
import PaginationBar from "../components/common/PaginationBar.vue";
import CategoryChips from "../components/home/CategoryChips.vue";
import RecipeGrid from "../components/recipes/RecipeGrid.vue";
import RecipeCard from "../components/recipes/RecipeCard.vue";
import { usePagination } from "../composables/usePagination";
import { useRecipes } from "../modules/useRecipes";

const { recipes, fetchRecipes, toggleSave } = useRecipes();
const selectedCategory = ref("All");
const viewportWidth = ref(typeof window === "undefined" ? 1200 : window.innerWidth);
const categoryChips = ["All", "Breakfast", "Lunch", "Dinner", "Dessert"];

const pageSize = computed(() => {
  if (viewportWidth.value <= 820) return 6;
  if (viewportWidth.value <= 1100) return 9;
  return 12;
});
const handleResize = () => {
  viewportWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  if (recipes.value.length === 0) {
    fetchRecipes();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const savedRecipes = computed(() => {
  return recipes.value.filter((recipe) => recipe.saved);
});

const filteredSavedRecipes = computed(() => {
  if (selectedCategory.value === "All") return savedRecipes.value;

  return savedRecipes.value.filter((recipe) => {
    const cuisine = (recipe.cuisine || "").trim().toLowerCase();
    const mealType = (recipe.mealType || "").trim().toLowerCase();
    const selected = selectedCategory.value.toLowerCase();

    return cuisine === selected || mealType === selected;
  });
});

const { page, pagedItems: pagedSavedRecipes, resetPage } = usePagination(filteredSavedRecipes, pageSize);

watch(selectedCategory, () => {
  resetPage();
});

const emptyStateMessage = computed(() => {
  return `No saved ${selectedCategory.value.toLowerCase()} recipes found.`;
});
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
  align-items: flex-start;
  gap: 16px;
  margin: 18px 0 18px;
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

.saved-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  text-align: center;
}

.saved-hero__title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
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

@media (max-width: 700px) {
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
}
</style>
