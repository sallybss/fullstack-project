import { type Request, type Response } from "express";
import { recipeModel } from "../models/recipeModel";
import { userModel } from "../models/userModel";

function isValidUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function pickRecipeBody(body: any) {
  const recipe: any = {};

  if (typeof body.title === "string") recipe.title = body.title;
  if (typeof body.description === "string") recipe.description = body.description;
  if (Array.isArray(body.ingredients)) recipe.ingredients = body.ingredients;
  if (Array.isArray(body.instructions)) recipe.instructions = body.instructions;
  if (typeof body.cuisine === "string") recipe.cuisine = body.cuisine;
  if (typeof body.isPublic === "boolean") recipe.isPublic = body.isPublic;
  if (typeof body.owner === "string") recipe.owner = body.owner;

  if (body.imageUrl !== undefined) {
    if (!isValidUrl(body.imageUrl)) {
      throw new Error("imageUrl must be a valid http/https URL");
    }
    recipe.imageUrl = body.imageUrl;
  }

  if (body.prepTimeMinutes !== undefined) {
    const prep = Number(body.prepTimeMinutes);
    if (!Number.isFinite(prep) || prep < 0) {
      throw new Error("prepTimeMinutes must be a positive number");
    }
    recipe.prepTimeMinutes = prep;
  }

  if (body.cookTimeMinutes !== undefined) {
    const cook = Number(body.cookTimeMinutes);
    if (!Number.isFinite(cook) || cook < 0) {
      throw new Error("cookTimeMinutes must be a positive number");
    }
    recipe.cookTimeMinutes = cook;
  }

  if (body.servings !== undefined) {
    const servings = Number(body.servings);
    if (!Number.isFinite(servings) || servings < 1) {
      throw new Error("servings must be a number greater than or equal to 1");
    }
    recipe.servings = servings;
  }

  return recipe;
}

function getAuthUserId(req: Request): string | null {
  const user = (req as any).user as { id?: string } | undefined;
  return typeof user?.id === "string" ? user.id : null;
}

export async function createRecipe(req: Request, res: Response): Promise<void> {
  try {
    const data = pickRecipeBody(req.body);
    if (!data.owner) {
      const authUserId = getAuthUserId(req);
      if (authUserId) data.owner = authUserId;
    }

    const recipe = new recipeModel(data);
    const result = await recipe.save();

    res.status(201).send(result);
  } catch (err: any) {
    const msg = String(err?.message || err);
    const isValidationError =
      msg.includes("imageUrl") ||
      msg.includes("prepTimeMinutes") ||
      msg.includes("cookTimeMinutes") ||
      msg.includes("servings");
    res.status(isValidationError ? 400 : 500).send(msg);
  }
}

export async function getAllRecipes(req: Request, res: Response) {
  try {
    const { title, cuisine, owner, isPublic, maxPrepTime } = req.query;
    const filter: any = {};

    if (title) filter.title = { $regex: String(title), $options: "i" };
    if (cuisine) filter.cuisine = { $regex: String(cuisine), $options: "i" };
    if (owner) filter.owner = String(owner);
    if (isPublic !== undefined) filter.isPublic = String(isPublic) === "true";

    if (maxPrepTime !== undefined) {
      const prep = Number(maxPrepTime);
      if (!Number.isNaN(prep)) filter.prepTimeMinutes = { $lte: prep };
    }

    const result = await recipeModel.find(filter).sort({ createdAt: -1 });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Error retrieving recipes. Error: " + err);
  }
}

export async function getRecipeById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const result = await recipeModel.findById(id);

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Error retrieving recipe by id. Error: " + err);
  }
}

export async function getRecipesByQuery(req: Request, res: Response) {
  const field = String(req.params.field);
  const value = req.params.value;

  try {
    const result = await recipeModel.find({
      [field]: { $regex: value, $options: "i" },
    } as any);

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Error retrieving recipes. Error: " + err);
  }
}

export async function updateRecipeById(req: Request, res: Response) {
  const id = req.params.id;

  try {
    const update = pickRecipeBody(req.body);
    const result = await recipeModel.findByIdAndUpdate(id, update, { new: true });

    if (!result) res.status(404).send("Cannot update recipe with id=" + id);
    else res.status(200).send(result);
  } catch (err: any) {
    const msg = String(err?.message || err);
    const isValidationError =
      msg.includes("imageUrl") ||
      msg.includes("prepTimeMinutes") ||
      msg.includes("cookTimeMinutes") ||
      msg.includes("servings");
    res.status(isValidationError ? 400 : 500).send(msg);
  }
}

export async function deleteRecipeById(req: Request, res: Response) {
  const id = req.params.id;

  try {
    const result = await recipeModel.findByIdAndDelete(id);

    if (!result) res.status(404).send("Cannot delete recipe with id=" + id);
    else res.status(200).send("Recipe was successfully deleted.");
  } catch (err) {
    res.status(500).send("Error deleting recipe by id. Error: " + err);
  }
}

export async function getFavoriteRecipeIds(req: Request, res: Response) {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await userModel.findById(userId).select("favorites");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const favorites = Array.isArray(user.favorites)
      ? user.favorites.map((id: any) => String(id))
      : [];
    res.status(200).json({ error: null, data: favorites });
  } catch (err) {
    res.status(500).send("Error retrieving favorite recipes. Error: " + err);
  }
}

export async function getFavoriteRecipes(req: Request, res: Response) {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await userModel.findById(userId).select("favorites");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    const recipes = await recipeModel.find({ _id: { $in: favorites } }).sort({ createdAt: -1 });

    res.status(200).json({ error: null, data: recipes });
  } catch (err) {
    res.status(500).send("Error retrieving favorite recipes. Error: " + err);
  }
}

export async function addFavoriteRecipe(req: Request, res: Response) {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const recipeId = req.params.id;
    const recipe = await recipeModel.findById(recipeId).select("_id");
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    const updated = await userModel
      .findByIdAndUpdate(userId, { $addToSet: { favorites: recipeId } }, { new: true })
      .select("favorites");

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const favorites = Array.isArray(updated.favorites)
      ? updated.favorites.map((id: any) => String(id))
      : [];
    res.status(200).json({ error: null, data: favorites });
  } catch (err) {
    res.status(500).send("Error adding favorite recipe. Error: " + err);
  }
}

export async function removeFavoriteRecipe(req: Request, res: Response) {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const recipeId = req.params.id;
    const updated = await userModel
      .findByIdAndUpdate(userId, { $pull: { favorites: recipeId } }, { new: true })
      .select("favorites");

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const favorites = Array.isArray(updated.favorites)
      ? updated.favorites.map((id: any) => String(id))
      : [];
    res.status(200).json({ error: null, data: favorites });
  } catch (err) {
    res.status(500).send("Error removing favorite recipe. Error: " + err);
  }
}
