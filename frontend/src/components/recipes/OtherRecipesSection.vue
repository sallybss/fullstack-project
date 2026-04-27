<script setup lang="ts">
import type { Recipe } from "../../interfaces/recipe";
import RecipeCard from "./RecipeCard.vue";

defineProps<{
  recipes: Recipe[];
  onAuthRequired: () => void;
  onSaveClick: (recipeId: string) => void | Promise<void>;
}>();
</script>

<template>
  <section class="section">
    <h2>Other recipes</h2>

    <div class="other-grid">
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe._id"
        :recipe="recipe"
        :onAuthRequired="onAuthRequired"
        :onSaveClick="onSaveClick"
      />
    </div>
  </section>
</template>

<style scoped>
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

@media (max-width: 640px) {
  .other-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}
</style>
