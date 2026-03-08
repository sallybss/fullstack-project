import { ref } from "vue";
import type { Recipe } from "../interfaces/recipe.ts"

export const useRecipes = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const recipes = ref<Recipe[]>([]);

  const fetchRecipes = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

  const API_URL = import.meta.env.VITE_API_URL;

    try {
        const response = await fetch(`${API_URL}/api/recipes`);

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data: Recipe[] = await response.json();
      recipes.value = data;

      console.log("Recipes fetched:", recipes.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  return {
    error,
    loading,
    recipes,
    fetchRecipes,
  };
};