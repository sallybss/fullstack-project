import { ref, computed } from "vue";
import { mockRecipes } from "../data/mockRecipes";
import type { Recipe, RecipeCategory } from "../types/recipe";

function buildDemoRecipes(times = 10): Recipe[] {
  const result: Recipe[] = [];

  for (let t = 0; t < times; t++) {
    for (const r of mockRecipes) {
      result.push({
        ...r,
        id: `${r.id}-${t}`,
        title: `${r.title} ${t + 1}`,
        createdAt: r.createdAt - t * 86400000,
      });
    }
  }

  return result;
}

const recipes = ref<Recipe[]>(buildDemoRecipes(10));

function toggleSave(id: string) {
  const recipe = recipes.value.find((r) => r.id === id);
  if (recipe) {
    recipe.saved = !recipe.saved;
  }
}

const savedRecipes = computed(() => {
  return recipes.value.filter((recipe) => recipe.saved);
});

const categories: RecipeCategory[] = [
  "Desserts",
  "Meat",
  "Vegan",
  "Vegetarian",
];

export function useRecipes() {
  return {
    recipes,
    savedRecipes,
    categories,
    toggleSave,
  };
}