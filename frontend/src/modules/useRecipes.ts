import { ref } from "vue";
import type { Recipe } from "../interfaces/recipe";

/**
 * Global reactive state
 */
const recipes = ref<Recipe[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

/**
 * Key used for persisting saved recipes
 */
const SAVED_RECIPES_KEY = "savedRecipeIds";

/**
 * Helper: read saved recipe ids from localStorage
 */
function getSavedRecipeIds(): string[] {
  const raw = localStorage.getItem(SAVED_RECIPES_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Helper: store saved recipe ids in localStorage
 */
function setSavedRecipeIds(ids: string[]): void {
  localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(ids));
}

function getTokenAndUserId(): { token: string; userId: string } {
  const token = localStorage.getItem("lsToken");
  const userId = localStorage.getItem("userIDToken");

  if (!token) {
    throw new Error("Authentication token missing");
  }

  if (!userId) {
    throw new Error("User ID missing");
  }
  return { token, userId };
}

/**
 * Helper: apply default values before sending recipe to API
 */
type NewRecipe = {
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
};

const validateRecipe = (recipe: NewRecipe): void => {
  if (!recipe.title.trim()) {
    throw new Error("Recipe title is required");
  }

  if (!recipe.description.trim()) {
    throw new Error("Recipe description is required");
  }

  if (!recipe.ingredients.some((item) => item.trim())) {
    throw new Error("Please add at least one ingredient");
  }

  if (!recipe.instructions.some((step) => step.trim())) {
    throw new Error("Please add at least one instruction step");
  }
};

function setDefaultRecipeValues(recipe: NewRecipe, userId: string) {
  return {
    title: recipe.title.trim(),
    description: recipe.description.trim(),
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    prepTimeMinutes: recipe.prepTimeMinutes ?? 0,
    cookTimeMinutes: recipe.cookTimeMinutes ?? 0,
    servings: recipe.servings ?? 1,
    cuisine: recipe.cuisine || "International",
    isPublic: recipe.isPublic ?? true,
    imageUrl: recipe.imageUrl || "https://picsum.photos/seed/recipe/600/600",
    _createdBy: userId,
  };
}

/**
 * Recipes composable
 */
export const useRecipes = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Fetch all recipes from backend
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
   */
  const toggleSave = (recipeId: string): void => {
    const recipe = recipes.value.find((r) => r._id === recipeId);
    if (!recipe) return;

    recipe.saved = !recipe.saved;

    const savedIds = recipes.value.filter((r) => r.saved).map((r) => r._id);

    setSavedRecipeIds(savedIds);
  };

  /**
   * Create new recipe
   */
  const addRecipe = async (recipeData: NewRecipe): Promise<void> => {
    try {
      error.value = null;
      validateRecipe(recipeData);
      const { token, userId } = getTokenAndUserId();
      const recipeWithDefaults = setDefaultRecipeValues(recipeData, userId);

      const response = await fetch(`${API_URL}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(recipeWithDefaults),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create recipe");
      }

      const newRecipe: Recipe = await response.json();

      newRecipe.saved = false;

      recipes.value.push(newRecipe);

      console.log("Recipe added:", newRecipe);
    } catch (err) {
      error.value = (err as Error).message;
    }
  };


  //Update
const updateRecipeOnServer = async (id: string, updatedRecipe: NewRecipe, token: string): Promise<Recipe> => {
  const response = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify(updatedRecipe),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Failed to update recipe");
  }

  return await response.json();
};

const updateRecipeInState = (id: string, updatedRecipe: Recipe): void => {
  const index = recipes.value.findIndex((recipe) => recipe._id === id);

  if (index !== -1) {
    recipes.value[index] = {
      ...updatedRecipe,
      saved: recipes.value[index].saved,
    };
  }
};

const updateRecipe = async (id: string, recipeData: NewRecipe): Promise<void> => {
  try {
    error.value = null;

    validateRecipe(recipeData);

    const { token } = getTokenAndUserId();
    const updatedRecipeResponse = await updateRecipeOnServer(id, recipeData, token);

    updateRecipeInState(id, updatedRecipeResponse);
    await fetchRecipes();
  } catch (err) {
    error.value = (err as Error).message;
  }
};

//Delete
  const deleteRecipeFromServer = async (
    id: string,
    token: string,
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/api/recipes/${id}`, {
      method: "DELETE",
      headers: {
        "auth-token": token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("recipe not deleted");
      throw new Error(errorText || "Failed to delete recipe");
    }
  };

  const removeRecipeFromState = (id: string): void => {
    recipes.value = recipes.value.filter((recipe) => recipe._id !== id);
    console.log("Recipe deleted from state:", id);
  };

  const deleteRecipe = async (id: string): Promise<void> => {
    try {
      error.value = null;

      const { token } = getTokenAndUserId();
      await deleteRecipeFromServer(id, token);
      removeRecipeFromState(id);

      console.log("id test", id);
    } catch (err) {
      error.value = (err as Error).message;
    }
  };

  return {
    recipes,
    loading,
    error,
    deleteRecipe,
    fetchRecipes,
    toggleSave,
    addRecipe,
    updateRecipe,
    getTokenAndUserId,
  };
};
