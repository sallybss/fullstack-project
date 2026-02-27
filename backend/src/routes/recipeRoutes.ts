import { Router } from "express";
import { verifyToken } from "../controllers/authController";
import {
  createRecipe,
  getAllRecipes,
  getFavoriteRecipeIds,
  getFavoriteRecipes,
  getRecipeById,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  updateRecipeById,
  deleteRecipeById,
  getRecipesByQuery,
} from "../controllers/recipeController";

const router = Router();

router.get("/", getAllRecipes);
router.get("/query/:field/:value", getRecipesByQuery);
router.get("/favorites", verifyToken, getFavoriteRecipes);
router.get("/favorites/ids", verifyToken, getFavoriteRecipeIds);
router.get("/:id", getRecipeById);

router.post("/", verifyToken, createRecipe);
router.post("/:id/favorite", verifyToken, addFavoriteRecipe);
router.put("/:id", verifyToken, updateRecipeById);
router.delete("/:id", verifyToken, deleteRecipeById);
router.delete("/:id/favorite", verifyToken, removeFavoriteRecipe);

export default router;
