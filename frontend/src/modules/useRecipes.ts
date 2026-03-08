import { ref } from "vue";
import type { Recipe } from "../interfaces/recipe";

// Global state shared between all components using this composable
const error = ref<string | null>(null);
const loading = ref<boolean>(false);
const recipes = ref<Recipe[]>([]);

// Key used to store saved recipes in localStorage
const SAVED_RECIPES_KEY = "savedRecipeIds";

/**
 * Helper function to read saved recipe IDs from localStorage
 * NOTE: localStorage stores strings, so we convert back to array
 */
function getSavedRecipeIds(): string[] {
  const raw = localStorage.getItem(SAVED_RECIPES_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Helper function to update saved recipe IDs in localStorage
 */
function setSavedRecipeIds(ids: string[]) {
  localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(ids));
}

export const useRecipes = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Fetch recipes from backend API
   *
   * IMPORTANT:
   * After fetching, we also sync the saved state with localStorage
   * so that saved recipes remain persisted across page reloads.
   */
  const fetchRecipes = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/api/recipes`);

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data: Recipe[] = await response.json();

      // Read saved recipes from localStorage
      const savedIds = getSavedRecipeIds();

      // Attach saved state to each recipe
      recipes.value = data.map((recipe) => ({
        ...recipe,
        saved: savedIds.includes(recipe._id),
      }));

      console.log("Recipes fetched:", recipes.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Toggle saved state of a recipe
   * This updates both:
   * -Vue reactive state
   * -localStorage persistence
   */
  const toggleSave = (recipeId: string): void => {
    const recipe = recipes.value.find((r) => r._id === recipeId);

    if (!recipe) return;

    // Toggle saved state
    recipe.saved = !recipe.saved;

    // Update saved IDs list
    const savedIds = recipes.value
      .filter((r) => r.saved)
      .map((r) => r._id);

    setSavedRecipeIds(savedIds);
  };

  return {
    error,
    loading,
    recipes,
    fetchRecipes,
    toggleSave,
  };
};