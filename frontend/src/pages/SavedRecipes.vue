<template>
  <div class="page">
    <main class="page__main">
      <HeroSection imageUrl="https://picsum.photos/seed/savedhero/1400/700">
        <div class="saved-hero">
          <h1 class="saved-hero__title">Saved Recipes</h1>
        </div>
      </HeroSection>

      <section class="section">
        <div v-if="savedRecipes.length === 0" class="empty-state">
          <h2>No saved recipes yet</h2>
          <p>Your saved recipes will appear here.</p>
        </div>

        <RecipeGrid v-else>
          <RecipeCard
            v-for="recipe in savedRecipes"
            :key="recipe._id"
            :recipe="recipe"
            @auth-required="() => {}"
            @save-click="toggleSave"
          />
        </RecipeGrid>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import HeroSection from "../components/common/HeroSection.vue";
import RecipeGrid from "../components/recipes/RecipeGrid.vue";
import RecipeCard from "../components/recipes/RecipeCard.vue";
import { useRecipes } from "../modules/useRecipes";

const { recipes, fetchRecipes, toggleSave } = useRecipes();

onMounted(() => {
  if (recipes.value.length === 0) {
    fetchRecipes();
  }
});

const savedRecipes = computed(() => {
  return recipes.value.filter((recipe) => recipe.saved);
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
