<template>
  <div class="page">
  <HeroSection v-if="recipe" :imageUrl="heroImageSrc" />
    <main class="container">
      <div v-if="loading" class="recipe-card">
        <p>Loading recipe...</p>
      </div>

      <div v-else-if="error" class="recipe-card">
        <RouterLink to="/" class="back">← Go back</RouterLink>
        <p style="margin-top: 12px">{{ error }}</p>
      </div>

      <div v-else-if="!recipe" class="recipe-card">
        <RouterLink to="/" class="back">← Go back</RouterLink>
        <p style="margin-top: 12px">Recipe not found.</p>
      </div>

      <template v-else>
        <RecipeDetails
          :recipe="recipe"
          @back="goBack"
          @toggle-save="toggleSave"
        />
        <section class="section">
          <h2>Comments</h2>
          <div class="box">[Comment editor]</div>
          <div class="box" style="margin-top: 16px">[Comment item]</div>
        </section>

        <section class="section">
          <h2>Other recipes</h2>
          <div class="other-grid">
            <RecipeCard
              v-for="r in otherRecipes"
              :key="r._id"
              :recipe="r"
              @auth-required="() => {}"
              @save-click="toggleSave"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useRecipes } from "../../modules/useRecipes";

import RecipeDetails from "../../components/recipes/RecipeDetails.vue";
import HeroSection from "../../components/common/HeroSection.vue";
import RecipeCard from "../../components/recipes/RecipeCard.vue";

const route = useRoute();
const router = useRouter();

const { recipes, loading, error, fetchRecipes, toggleSave } = useRecipes();

const fallbackImage = "https://picsum.photos/seed/recipe/1200/700";
const API_URL = import.meta.env.VITE_API_URL;

// Read recipe id from URL: /recipes/:id
const recipeId = computed(() => String(route.params.id));

onMounted(async () => {
  if (recipes.value.length === 0) {
    await fetchRecipes();
  }
});

function goBack() {
  router.back();
}

// Find the current recipe by backend _id
const recipe = computed(() =>
  recipes.value.find((r) => r._id === recipeId.value),
);

const heroImageSrc = computed(() => {
  if (!recipe.value?.imageUrl) return fallbackImage;

  if (recipe.value.imageUrl.startsWith("http")) {
    return recipe.value.imageUrl;
  }

  return `${API_URL}${recipe.value.imageUrl}`;
});

// Show up to 4 other recipes excluding the current one
const otherRecipes = computed(() =>
  recipes.value.filter((r) => r._id !== recipeId.value).slice(0, 4),
);
</script>

<style scoped>
.page {
  background: #f6f6fb;
  min-height: 100vh;
}

.container {
  max-width: 980px;
  margin: -180px auto 0px;
  padding: 0 16px;
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
