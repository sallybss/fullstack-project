import { ref } from "vue";
import type { Recipe, NewRecipe } from "../interfaces/recipe";

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
    imageUrl: recipe.imageUrl || "",
    imageFile: recipe.imageFile ?? null,
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
  async function addRecipe(newRecipe: NewRecipe) {
    validateRecipe(newRecipe);

    const auth = getTokenAndUserId();

    const recipe = setDefaultRecipeValues(newRecipe, auth.userId);

    const formData = new FormData();
    formData.append("title", recipe.title);
    formData.append("description", recipe.description);
    formData.append("prepTimeMinutes", String(recipe.prepTimeMinutes));
    formData.append("cookTimeMinutes", String(recipe.cookTimeMinutes));
    formData.append("servings", String(recipe.servings));
    formData.append("cuisine", recipe.cuisine);
    formData.append("isPublic", String(recipe.isPublic));
    formData.append("ingredients", JSON.stringify(recipe.ingredients));
    formData.append("instructions", JSON.stringify(recipe.instructions));

    if (recipe.imageFile) {
      formData.append("photo", recipe.imageFile);
    } else if (recipe.imageUrl) {
      formData.append("imageUrl", recipe.imageUrl);
    }

    const response = await fetch(`${API_URL}/api/recipes`, {
      method: "POST",
      headers: {
        "auth-token": auth.token,
      },
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to add recipe.");
    }

    const createdRecipe = await response.json();

    recipes.value.unshift({
      ...createdRecipe,
      saved: false,
    });

    return createdRecipe;
  }

  //Update
  const updateRecipeOnServer = async (
  id: string,
  updatedRecipe: NewRecipe,
  token: string,
): Promise<Recipe> => {
  const formData = new FormData();
  formData.append("title", updatedRecipe.title);
  formData.append("description", updatedRecipe.description);
  formData.append("prepTimeMinutes", String(updatedRecipe.prepTimeMinutes));
  formData.append("cookTimeMinutes", String(updatedRecipe.cookTimeMinutes));
  formData.append("servings", String(updatedRecipe.servings));
  formData.append("cuisine", updatedRecipe.cuisine);
  formData.append("isPublic", String(updatedRecipe.isPublic));
  formData.append("ingredients", JSON.stringify(updatedRecipe.ingredients));
  formData.append("instructions", JSON.stringify(updatedRecipe.instructions));

  if (updatedRecipe.imageFile) {
    formData.append("photo", updatedRecipe.imageFile);
  } else if (updatedRecipe.imageUrl) {
    formData.append("imageUrl", updatedRecipe.imageUrl);
  }

  const response = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: "PUT",
    headers: {
      "auth-token": token,
    },
    body: formData,
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

  const updateRecipe = async (
    id: string,
    recipeData: NewRecipe,
  ): Promise<void> => {
    try {
      error.value = null;

      validateRecipe(recipeData);

      const { token } = getTokenAndUserId();
      const updatedRecipeResponse = await updateRecipeOnServer(
        id,
        recipeData,
        token,
      );

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
