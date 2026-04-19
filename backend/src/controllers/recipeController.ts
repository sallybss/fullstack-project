import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { recipeModel } from "../models/recipeModel";
import { userModel } from "../models/userModel";
import { connect } from "../repository/database";

function isValidUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const RECIPE_TITLE_MAX_LENGTH = 100;
const RECIPE_DESCRIPTION_MAX_LENGTH = 500;
const RECIPE_IMAGE_URL_MAX_LENGTH = 500;
const RECIPE_CUISINE_MAX_LENGTH = 40;
const RECIPE_INGREDIENT_MAX_LENGTH = 200;
const RECIPE_STEP_MAX_LENGTH = 2000;

function pickRecipeBody(body: any) {
  const recipe: any = {};

  const parseStringArray = (value: unknown): string[] | undefined => {
    if (Array.isArray(value)) return value.map((v) => String(v).trim());
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim());
      } catch {
      }
    }
    return trimmed.split(",").map((v) => v.trim()).filter(Boolean);
  };

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) throw new Error("title is required");
    if (title.length > RECIPE_TITLE_MAX_LENGTH) {
      throw new Error(`title must be at most ${RECIPE_TITLE_MAX_LENGTH} characters`);
    }
    recipe.title = title;
  }
  if (typeof body.description === "string") {
    const description = body.description.trim();
    if (!description) throw new Error("description is required");
    if (description.length > RECIPE_DESCRIPTION_MAX_LENGTH) {
      throw new Error(`description must be at most ${RECIPE_DESCRIPTION_MAX_LENGTH} characters`);
    }
    recipe.description = description;
  }
  const ingredients = parseStringArray(body.ingredients);
  if (ingredients) {
    if (ingredients.some((entry) => !entry)) throw new Error("ingredients cannot contain empty values");
    if (ingredients.some((entry) => entry.length > RECIPE_INGREDIENT_MAX_LENGTH)) {
      throw new Error(`ingredient items must be at most ${RECIPE_INGREDIENT_MAX_LENGTH} characters`);
    }
    recipe.ingredients = ingredients;
  }
  const instructions = parseStringArray(body.instructions);
  if (instructions) {
    if (instructions.some((entry) => !entry)) throw new Error("instructions cannot contain empty values");
    if (instructions.some((entry) => entry.length > RECIPE_STEP_MAX_LENGTH)) {
      throw new Error(`instruction steps must be at most ${RECIPE_STEP_MAX_LENGTH} characters`);
    }
    recipe.instructions = instructions;
  }
  if (typeof body.cuisine === "string") {
    const cuisine = body.cuisine.trim();
    if (!cuisine) throw new Error("cuisine is required");
    if (cuisine.length > RECIPE_CUISINE_MAX_LENGTH) {
      throw new Error(`cuisine must be at most ${RECIPE_CUISINE_MAX_LENGTH} characters`);
    }
    recipe.cuisine = cuisine;
  }
  if (typeof body.isPublic === "boolean") recipe.isPublic = body.isPublic;

  if (body.imageUrl !== undefined) {
    const image = String(body.imageUrl ?? "").trim();
    if (image.length > RECIPE_IMAGE_URL_MAX_LENGTH) {
      throw new Error(`imageUrl must be at most ${RECIPE_IMAGE_URL_MAX_LENGTH} characters`);
    }
    if (image && !isValidUrl(image)) {
      throw new Error("imageUrl must be a valid http/https URL");
    }
    recipe.imageUrl = image;
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

function getAuthUser(req: Request): { id: string; username?: string; role?: string } | null {
  const user = (req as any).user as { id?: string; username?: string; role?: string } | undefined;
  if (typeof user?.id !== "string") return null;
  return {
    id: user.id,
    username: typeof user.username === "string" ? user.username : "",
    role: typeof user.role === "string" ? user.role : undefined,
  };
}

function getAuthUserId(req: Request): string | null {
  return getAuthUser(req)?.id ?? null;
}

function getCommentText(body: any): string {
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) throw new Error("Comment text is required");
  if (text.length > 500) throw new Error("Comment text must be at most 500 characters");
  return text;
}

function getRatingValue(body: any): number {
  const value = Number(body?.value);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Rating value must be an integer between 1 and 5");
  }
  return value;
}

function withRatingSummary(recipe: any) {
  const ratings = Array.isArray(recipe?.ratings) ? recipe.ratings : [];
  const count = ratings.length;
  const average = count ? ratings.reduce((sum: number, r: any) => sum + Number(r?.value || 0), 0) / count : 0;
  return {
    ...recipe,
    ratingSummary: {
      average: Number(average.toFixed(2)),
      count,
    },
  };
}

function isValidObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}

function requireParam(req: Request, res: Response, key: string): string | null {
  const value = req.params?.[key];
  if (typeof value !== "string" || !value.trim()) {
    res.status(400).json({ error: `Missing ${key}` });
    return null;
  }
  return value;
}

export async function createRecipe(req: Request, res: Response): Promise<void> {
  try {
    await connect();

    const data = pickRecipeBody(req.body);
    if (req.file?.filename) {
      data.imageUrl = `/uploads/recipes/${req.file.filename}`;
    }
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    data.owner = authUserId;

    const recipe = new recipeModel(data);
    const result = await recipe.save();

    res.status(201).send(result);
  } catch (err: any) {
    const msg = String(err?.message || err);
    const isValidationError =
      msg.includes("title") ||
      msg.includes("description") ||
      msg.includes("ingredient") ||
      msg.includes("instruction") ||
      msg.includes("cuisine") ||
      msg.includes("imageUrl") ||
      msg.includes("prepTimeMinutes") ||
      msg.includes("cookTimeMinutes") ||
      msg.includes("servings");
    res.status(isValidationError ? 400 : 500).send(msg);
  }
}

export async function getAllRecipes(req: Request, res: Response) {
  try {
    await connect();

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

    const result = await recipeModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate("owner", "username bio avatarUrl");
    res.status(200).send(result.map((r: any) => withRatingSummary(r.toObject())));
  } catch (err) {
    res.status(500).send("Error retrieving recipes. Error: " + err);
  }
}

export async function getRecipeById(req: Request, res: Response) {
  try {
    await connect();

    const id = requireParam(req, res, "id");
    if (!id) return;
    const result = await recipeModel.findById(id).populate("owner", "username bio avatarUrl");
    if (!result) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.status(200).send(withRatingSummary(result.toObject()));
  } catch (err) {
    res.status(500).send("Error retrieving recipe by id. Error: " + err);
  }
}

export async function getRecipesByQuery(req: Request, res: Response) {
  const field = String(req.params.field ?? "");
  const value = req.params.value ?? "";

  try {
    await connect();

    const result = await recipeModel.find({
      [field]: { $regex: value, $options: "i" },
    } as any).populate("owner", "username bio avatarUrl");

    res.status(200).send(result.map((r: any) => withRatingSummary(r.toObject())));
  } catch (err) {
    res.status(500).send("Error retrieving recipes. Error: " + err);
  }
}

export async function getRecipeComments(req: Request, res: Response) {
  try {
    await connect();

    const recipeId = requireParam(req, res, "id");
    if (!recipeId) return;
    if (!isValidObjectId(recipeId)) {
      res.status(400).json({ error: "Invalid recipe id" });
      return;
    }

    const recipe = await recipeModel.findById(recipeId).select("comments");
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.status(200).json({ error: null, data: recipe.comments || [] });
  } catch (err) {
    res.status(500).send("Error retrieving recipe comments. Error: " + err);
  }
}

export async function addRecipeComment(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const recipeId = requireParam(req, res, "id");
    if (!recipeId) return;
    if (!isValidObjectId(recipeId)) {
      res.status(400).json({ error: "Invalid recipe id" });
      return;
    }

    const text = getCommentText(req.body);

    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    const username = authUser.username || "User";
    const authUserDoc = await userModel.findById(authUser.id).select("avatarUrl");
    (recipe.comments as any).push({
      user: authUser.id,
      username,
      avatarUrl: authUserDoc?.avatarUrl || "",
      text,
    });

    await recipe.save();

    const createdComment = (recipe.comments as any)[recipe.comments.length - 1];
    res.status(201).json({ error: null, data: createdComment });
  } catch (err: any) {
    const msg = String(err?.message || err);
    const isValidationError = msg.includes("Comment text");
    res.status(isValidationError ? 400 : 500).send(msg);
  }
}

export async function deleteRecipeComment(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const recipeId = requireParam(req, res, "id");
    if (!recipeId) return;
    const commentId = requireParam(req, res, "commentId");
    if (!commentId) return;
    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    const comment = (recipe.comments as any).id(commentId);
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    const canDeleteComment =
      String(comment.user) === authUser.id || authUser.role === "admin";

    if (!canDeleteComment) {
      res.status(403).json({ error: "You can only delete your own comments unless you are an admin" });
      return;
    }

    comment.deleteOne();
    await recipe.save();

    res.status(200).json({ error: null, data: { commentId } });
  } catch (err) {
    res.status(500).send("Error deleting recipe comment. Error: " + err);
  }
}

export async function updateRecipeComment(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const recipeId = requireParam(req, res, "id");
    if (!recipeId) return;
    const commentId = requireParam(req, res, "commentId");
    if (!commentId) return;
    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const text = getCommentText(req.body);

    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    const comment = (recipe.comments as any).id(commentId);
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (String(comment.user) !== authUser.id) {
      res.status(403).json({ error: "You can only update your own comments" });
      return;
    }

    comment.text = text;
    await recipe.save();

    res.status(200).json({ error: null, data: comment });
  } catch (err: any) {
    const msg = String(err?.message || err);
    const isValidationError = msg.includes("Comment text");
    res.status(isValidationError ? 400 : 500).send(msg);
  }
}

export async function updateRecipeById(req: Request, res: Response) {
  const id = req.params.id ?? "";

  try {
    await connect();

    const update = pickRecipeBody(req.body);

    if (req.file?.filename) {
      update.imageUrl = `/uploads/recipes/${req.file.filename}`;
    }

    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const existingRecipe = await recipeModel.findById(id).select("owner");
    if (!existingRecipe) {
      res.status(404).send("Cannot update recipe with id=" + id);
      return;
    }
    if (String(existingRecipe.owner) !== authUserId) {
      res.status(403).json({ error: "You can only update your own recipes" });
      return;
    }

    const result = await recipeModel
      .findByIdAndUpdate(id, update, { returnDocument: "after" })
      .populate("owner", "username bio avatarUrl");

    if (!result) res.status(404).send("Cannot update recipe with id=" + id);
    else res.status(200).send(withRatingSummary(result.toObject()));
  } catch (err: any) {
    const msg = String(err?.message || err);
    const isValidationError =
      msg.includes("title") ||
      msg.includes("description") ||
      msg.includes("ingredient") ||
      msg.includes("instruction") ||
      msg.includes("cuisine") ||
      msg.includes("imageUrl") ||
      msg.includes("prepTimeMinutes") ||
      msg.includes("cookTimeMinutes") ||
      msg.includes("servings");
    res.status(isValidationError ? 400 : 500).send(msg);
  }
}

export async function deleteRecipeById(req: Request, res: Response) {
  const id = req.params.id ?? "";

  try {
    await connect();

    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const existingRecipe = await recipeModel.findById(id).select("owner");
    if (!existingRecipe) {
      res.status(404).send("Cannot delete recipe with id=" + id);
      return;
    }

    const authUser = await userModel.findById(authUserId).select("role");
    const canDeleteRecipe =
      String(existingRecipe.owner) === authUserId || authUser?.role === "admin";

    if (!canDeleteRecipe) {
      res.status(403).json({ error: "You can only delete your own recipes" });
      return;
    }

    const result = await recipeModel.findByIdAndDelete(id);

    if (!result) res.status(404).send("Cannot delete recipe with id=" + id);
    else res.status(200).send("Recipe was successfully deleted.");
  } catch (err) {
    res.status(500).send("Error deleting recipe by id. Error: " + err);
  }
}

export async function getFavoriteRecipeIds(req: Request, res: Response) {
  try {
    await connect();

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
    await connect();

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
    const recipes = await recipeModel
      .find({ _id: { $in: favorites } })
      .sort({ createdAt: -1 });

    res.status(200).json({ error: null, data: recipes });
  } catch (err) {
    res.status(500).send("Error retrieving favorite recipes. Error: " + err);
  }
}

export async function addFavoriteRecipe(req: Request, res: Response) {
  try {
    await connect();

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
      .findByIdAndUpdate(userId, { $addToSet: { favorites: recipeId } }, { returnDocument: "after" })
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
    await connect();

    const userId = getAuthUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const recipeId = req.params.id;

    const updated = await userModel
      .findByIdAndUpdate(userId, { $pull: { favorites: recipeId } }, { returnDocument: "after" })
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

export async function rateRecipe(req: Request, res: Response) {
  try {
    await connect();

    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const recipeId = requireParam(req, res, "id");
    if (!recipeId) return;
    if (!isValidObjectId(recipeId)) {
      res.status(400).json({ error: "Invalid recipe id" });
      return;
    }

    const value = getRatingValue(req.body);
    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    const existing = (recipe.ratings as any[]).find((r: any) => String(r.user) === authUserId);
    if (existing) {
      existing.value = value;
    } else {
      (recipe.ratings as any).push({ user: authUserId, value });
    }

    await recipe.save();

    const payload = withRatingSummary(recipe.toObject());
    res.status(200).json({ error: null, data: payload.ratingSummary });
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes("Rating value")) {
      res.status(400).json({ error: msg });
      return;
    }
    res.status(500).send("Error rating recipe. Error: " + err);
  }
}
