<template>
  <div class="page">
    <main class="page__main">
      <HeroSection imageUrl="https://picsum.photos/seed/savedhero/1400/700">
        <div class="saved-hero">
          <h1 class="saved-hero__title">Saved Recipes</h1>
        </div>
      </HeroSection>

      <section class="section">
        <div class="section__top">
          <CategoryChips :items="categories" v-model="selectedCategory" />
          <SortSelect v-model="sortBy" />
        </div>

        <RecipeGrid v-if="pagedSavedRecipes.length">
          <RecipeCard
            v-for="recipe in pagedSavedRecipes"
            :key="recipe.id"
            :recipe="recipe"
            @toggle-save="toggleSave"
          />
        </RecipeGrid>

        <div v-else class="empty-state">
          <h2>No saved recipes yet</h2>
          <p>Your saved recipes will appear here.</p>
        </div>

        <PaginationBar
          v-if="filteredSavedRecipes.length > 0"
          :page="page"
          :page-size="pageSize"
          :total="filteredSavedRecipes.length"
          @update:page="page = $event"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import PaginationBar from "../components/common/PaginationBar.vue";
import HeroSection from "../components/common/HeroSection.vue";
import CategoryChips from "../components/home/CategoryChips.vue";
import SortSelect from "../components/home/SortSelect.vue";
import RecipeGrid from "../components/recipes/RecipeGrid.vue";
import RecipeCard from "../components/recipes/RecipeCard.vue";

import { useRecipes } from "../composables/useRecipes";
import type { RecipeCategory } from "../types/recipe";

const { savedRecipes, categories, toggleSave } = useRecipes();

const selectedCategory = ref<RecipeCategory>("Desserts");
const sortBy = ref<"newest" | "rating" | "time">("newest");

const page = ref(1);
const pageSize = 12;

const filteredSavedRecipes = computed(() => {
  return savedRecipes.value
    .filter((r) =>
      selectedCategory.value ? r.category === selectedCategory.value : true
    )
    .slice()
    .sort((a, b) => {
      if (sortBy.value === "newest") return b.createdAt - a.createdAt;
      if (sortBy.value === "rating") return b.rating - a.rating;
      return a.timeMinutes - b.timeMinutes;
    });
});

watch([selectedCategory, sortBy], () => {
  page.value = 1;
});

const pagedSavedRecipes = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredSavedRecipes.value.slice(start, start + pageSize);
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

.section__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 18px 0 18px;
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
</style>