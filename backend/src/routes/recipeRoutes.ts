import { Router } from "express";
import { verifyToken } from "../controllers/authController";
import {
  addRecipeComment,
  createRecipe,
  deleteRecipeComment,
  updateRecipeComment,
  getAllRecipes,
  getFavoriteRecipeIds,
  getFavoriteRecipes,
  getRecipeComments,
  getRecipeById,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  updateRecipeById,
  deleteRecipeById,
  getRecipesByQuery,
  rateRecipe,
} from "../controllers/recipeController";

const router = Router();

router.get("/", getAllRecipes);
router.get("/query/:field/:value", getRecipesByQuery);
router.get("/favorites", verifyToken, getFavoriteRecipes);
router.get("/favorites/ids", verifyToken, getFavoriteRecipeIds);
router.get("/:id/comments", getRecipeComments);
router.get("/:id", getRecipeById);

router.post("/", verifyToken, createRecipe);
router.post("/:id/comments", verifyToken, addRecipeComment);
router.post("/:id/favorite", verifyToken, addFavoriteRecipe);
router.post("/:id/rating", verifyToken, rateRecipe);
router.put("/:id", verifyToken, updateRecipeById);
router.put("/:id/comments/:commentId", verifyToken, updateRecipeComment);
router.delete("/:id/comments/:commentId", verifyToken, deleteRecipeComment);
router.delete("/:id", verifyToken, deleteRecipeById);
router.delete("/:id/favorite", verifyToken, removeFavoriteRecipe);

export default router;
