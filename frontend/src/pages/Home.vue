<template>
  <div class="page">
    <main class="page__main">
      <HeroSection imageUrl="https://picsum.photos/seed/homehero/1400/700">
        <HeroSearch v-model="query" />
      </HeroSection>

      <section class="section">
        <div v-if="loading" class="empty-state">
          <h2>Loading recipes...</h2>
        </div>

        <div v-else-if="error" class="empty-state">
          <h2>Something went wrong</h2>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="filteredRecipes.length === 0" class="empty-state">
          <h2>No recipes found</h2>
          <p>No recipes match your search.</p>
        </div>

        <div v-else class="recipe-list">
          <RecipeGrid>
            <RecipeCard
              v-for="recipe in filteredRecipes"
              :key="recipe._id"
              :recipe="recipe"
            />
          </RecipeGrid>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRecipes } from "../modules/useRecipes";

import HeroSearch from "../components/home/HeroSearch.vue";
import HeroSection from "../components/common/HeroSection.vue";
import RecipeGrid from "../components/recipes/RecipeGrid.vue";
import RecipeCard from "../components/recipes/RecipeCard.vue";

const query = ref("");

const { recipes, loading, error, fetchRecipes } = useRecipes();

onMounted(() => {
  fetchRecipes();
});

const filteredRecipes = computed(() => {
  const q = query.value.trim().toLowerCase();

  return recipes.value.filter((recipe) =>
    recipe.title.toLowerCase().includes(q),
  );
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

.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.recipe-item {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.recipe-item h2 {
  margin-bottom: 10px;
}

.recipe-item p {
  margin-bottom: 8px;
  color: #444;
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
