<template>
  <div class="page">
    <main class="page__main">
      <HeroSection imageUrl="https://picsum.photos/seed/homehero/1400/700">
        <HeroSearch v-model="query" />
      </HeroSection>

      <section class="section">
        <div class="section__top">
          <CategoryChips :items="categories" v-model="selectedCategory" />
          <SortSelect v-model="sortBy" />
        </div>

        <RecipeGrid v-if="pagedRecipes.length">
          <RecipeCard
            v-for="recipe in pagedRecipes"
            :key="recipe.id"
            :recipe="recipe"
            @toggle-save="toggleSave"
          />
        </RecipeGrid>

        <div v-else class="empty-state">
          <h2>No recipes found</h2>
          <p>
            There are no recipes in
            <strong>{{ selectedCategory }}</strong>
            <span v-if="query"> matching “{{ query }}”</span>.
          </p>
        </div>

        <PaginationBar
          v-if="filteredRecipes.length > 0"
          :page="page"
          :page-size="pageSize"
          :total="filteredRecipes.length"
          @update:page="page = $event"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import PaginationBar from "../components/common/PaginationBar.vue";
import HeroSearch from "../components/home/HeroSearch.vue";
import HeroSection from "../components/common/HeroSection.vue";
import CategoryChips from "../components/home/CategoryChips.vue";
import SortSelect from "../components/home/SortSelect.vue";
import RecipeGrid from "../components/recipes/RecipeGrid.vue";
import RecipeCard from "../components/recipes/RecipeCard.vue";

import { useRecipes } from "../composables/useRecipes";
import type { RecipeCategory } from "../types/recipe";

const { recipes, categories, toggleSave } = useRecipes();

const query = ref("");
const selectedCategory = ref<RecipeCategory>("Desserts");
const sortBy = ref<"newest" | "rating" | "time">("newest");

const page = ref(1);
const pageSize = 12;

const filteredRecipes = computed(() => {
  const q = query.value.trim().toLowerCase();

  return recipes.value
    .filter((r) =>
      selectedCategory.value ? r.category === selectedCategory.value : true,
    )
    .filter((r) => (q ? r.title.toLowerCase().includes(q) : true))
    .slice()
    .sort((a, b) => {
      if (sortBy.value === "newest") return b.createdAt - a.createdAt;
      if (sortBy.value === "rating") return b.rating - a.rating;
      return a.timeMinutes - b.timeMinutes;
    });
});

watch([query, selectedCategory, sortBy], () => {
  page.value = 1;
});

const pagedRecipes = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRecipes.value.slice(start, start + pageSize);
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
