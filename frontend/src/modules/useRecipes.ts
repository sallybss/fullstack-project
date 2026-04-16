import { ref } from "vue";
import type { Recipe, NewRecipe, RecipeComment } from "../interfaces/recipe";

const recipes = ref<Recipe[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

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

  if (!recipe.cuisine.trim()) {
    throw new Error("Recipe category is required");
  }

  if (!recipe.ingredients.some((item) => item.trim())) {
    throw new Error("Please add at least one ingredient");
  }

  if (!recipe.instructions.some((step) => step.trim())) {
    throw new Error("Please add at least one instruction step");
  }
};

function buildRecipeFormData(recipe: NewRecipe): FormData {
  const formData = new FormData();
  formData.append("title", recipe.title.trim());
  formData.append("description", recipe.description.trim());
  formData.append("prepTimeMinutes", String(recipe.prepTimeMinutes ?? 0));
  formData.append("cookTimeMinutes", String(recipe.cookTimeMinutes ?? 0));
  formData.append("servings", String(recipe.servings ?? 1));
  formData.append("cuisine", recipe.cuisine);
  formData.append("isPublic", String(recipe.isPublic ?? true));
  formData.append("ingredients", JSON.stringify(recipe.ingredients));
  formData.append("instructions", JSON.stringify(recipe.instructions));

  if (recipe.imageFile) {
    formData.append("photo", recipe.imageFile);
  } else if (recipe.imageUrl) {
    formData.append("imageUrl", recipe.imageUrl);
  }

  return formData;
}

export const useRecipes = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const applySavedState = async (items: Recipe[]): Promise<Recipe[]> => {
    const favoriteIds = await fetchFavoriteIds();
    return items.map((recipe) => ({
      ...recipe,
      saved: favoriteIds.includes(recipe._id),
    }));
  };

  const fetchFavoriteIds = async (): Promise<string[]> => {
    const token = localStorage.getItem("lsToken");
    if (!token) return [];

    const response = await fetch(`${API_URL}/api/recipes/favorites/ids`, {
      headers: {
        "auth-token": token,
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return payload.data ?? [];
  };

  const fetchRecipes = async (
    filters?: { title?: string; cuisine?: string },
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters?.title?.trim()) {
        params.set("title", filters.title.trim());
      }
      if (filters?.cuisine?.trim()) {
        params.set("cuisine", filters.cuisine.trim());
      }

      const query = params.toString();
      const recipesResponse = await fetch(
        `${API_URL}/api/recipes${query ? `?${query}` : ""}`,
      );

      if (!recipesResponse.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data: Recipe[] = await recipesResponse.json();
      recipes.value = await applySavedState(data);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  const fetchRecipeById = async (id: string): Promise<Recipe | null> => {
    const response = await fetch(`${API_URL}/api/recipes/${id}`);

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to fetch recipe");
    }

    const recipe: Recipe = await response.json();
    const favoriteIds = await fetchFavoriteIds();
    const mappedRecipe = {
      ...recipe,
      saved: favoriteIds.includes(recipe._id),
    };

    const index = recipes.value.findIndex((item) => item._id === id);
    if (index === -1) {
      recipes.value.push(mappedRecipe);
    } else {
      recipes.value[index] = mappedRecipe;
    }

    return mappedRecipe;
  };

  const toggleSave = async (recipeId: string): Promise<void> => {
    const recipe = recipes.value.find((item) => item._id === recipeId);
    if (!recipe) return;

    const previous = Boolean(recipe.saved);
    recipe.saved = !previous;

    try {
      const { token } = getTokenAndUserId();
      const response = await fetch(`${API_URL}/api/recipes/${recipeId}/favorite`, {
        method: previous ? "DELETE" : "POST",
        headers: {
          "auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to update saved recipe");
      }
    } catch (err) {
      recipe.saved = previous;
      error.value = (err as Error).message;
    }
  };

  const addRecipe = async (newRecipe: NewRecipe): Promise<Recipe> => {
    try {
      error.value = null;
      validateRecipe(newRecipe);

      const { token } = getTokenAndUserId();
      const response = await fetch(`${API_URL}/api/recipes`, {
        method: "POST",
        headers: {
          "auth-token": token,
        },
        body: buildRecipeFormData(newRecipe),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to add recipe.");
      }

      const createdRecipe: Recipe = await response.json();
      recipes.value.unshift({
        ...createdRecipe,
        saved: false,
      });

      return createdRecipe;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    }
  };

  const updateRecipe = async (id: string, recipeData: NewRecipe): Promise<void> => {
    try {
      error.value = null;
      validateRecipe(recipeData);

      const { token } = getTokenAndUserId();
      const response = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: "PUT",
        headers: {
          "auth-token": token,
        },
        body: buildRecipeFormData(recipeData),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to update recipe");
      }

      const updatedRecipe: Recipe = await response.json();
      const existingIndex = recipes.value.findIndex((recipe) => recipe._id === id);

      if (existingIndex !== -1) {
        recipes.value[existingIndex] = {
          ...updatedRecipe,
          saved: recipes.value[existingIndex].saved,
        };
      }
    } catch (err) {
      error.value = (err as Error).message;
    }
  };

  const deleteRecipe = async (id: string): Promise<void> => {
    try {
      error.value = null;

      const { token } = getTokenAndUserId();
      const response = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: "DELETE",
        headers: {
          "auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to delete recipe");
      }

      recipes.value = recipes.value.filter((recipe) => recipe._id !== id);
    } catch (err) {
      error.value = (err as Error).message;
    }
  };

  const fetchComments = async (recipeId: string): Promise<RecipeComment[]> => {
    const response = await fetch(`${API_URL}/api/recipes/${recipeId}/comments`);

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to fetch comments");
    }

    const payload = await response.json();
    return payload.data ?? [];
  };

  const addComment = async (
    recipeId: string,
    text: string,
  ): Promise<RecipeComment> => {
    const { token } = getTokenAndUserId();
    const response = await fetch(`${API_URL}/api/recipes/${recipeId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to add comment");
    }

    const payload = await response.json();
    return payload.data;
  };

  const deleteComment = async (recipeId: string, commentId: string): Promise<void> => {
    const { token } = getTokenAndUserId();
    const response = await fetch(`${API_URL}/api/recipes/${recipeId}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        "auth-token": token,
      },
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to delete comment");
    }
  };

  const updateComment = async (
    recipeId: string,
    commentId: string,
    text: string,
  ): Promise<RecipeComment> => {
    const { token } = getTokenAndUserId();
    const response = await fetch(`${API_URL}/api/recipes/${recipeId}/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to update comment");
    }

    const payload = await response.json();
    return payload.data;
  };

  const rateRecipe = async (recipeId: string, value: number): Promise<Recipe["ratingSummary"]> => {
    const { token } = getTokenAndUserId();
    const response = await fetch(`${API_URL}/api/recipes/${recipeId}/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to rate recipe");
    }

    const payload = await response.json();
    const recipe = recipes.value.find((item) => item._id === recipeId);
    if (recipe) {
      recipe.ratingSummary = payload.data;
    }

    return payload.data;
  };

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    fetchRecipeById,
    toggleSave,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    fetchComments,
    addComment,
    deleteComment,
    updateComment,
    rateRecipe,
    getTokenAndUserId,
  };
};
