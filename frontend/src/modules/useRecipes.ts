import { ref } from "vue";
import type { Recipe } from "../interfaces/recipe";

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
      const savedIds = getSavedRecipeIds();

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
   *
   * IMPORTANT:
   * This updates both Vue state and localStorage persistence.
   */
  const toggleSave = (recipeId: string): void => {
    const recipe = recipes.value.find((r) => r._id === recipeId);
    if (!recipe) return;

    recipe.saved = !recipe.saved;

    const savedIds = recipes.value
      .filter((r) => r.saved)
      .map((r) => r._id);

    setSavedRecipeIds(savedIds);
  };

  /**
   * Create a new recipe
   *
   * IMPORTANT:
   * Protected endpoints require the auth token.
   * We also keep userId because many backends attach ownership to the created item.
   */
   // Creates a new recipe through the protected backend endpoint
  const addRecipe = async (recipeData: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    servings: number;
    cuisine: string;
    isPublic: boolean;
    imageUrl?: string;
  }): Promise<void> => {
    try {
      error.value = null;

      const token = localStorage.getItem("lsToken");
      const userId = localStorage.getItem("userIDToken");

      if (!token) {
        throw new Error("No token available");
      }

      if (!userId) {
        throw new Error("No user id available");
      }

      const response = await fetch(`${API_URL}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          ...recipeData,
          _createdBy: userId,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to create recipe");
      }

      const newRecipe: Recipe = await response.json();
      newRecipe.saved = false;

      recipes.value.push(newRecipe);

      console.log("Recipe added:", newRecipe);
    } catch (err) {
      error.value = (err as Error).message;
    }
  };


  return {
    error,
    loading,
    recipes,
    fetchRecipes,
    toggleSave,
    addRecipe,
  };
};