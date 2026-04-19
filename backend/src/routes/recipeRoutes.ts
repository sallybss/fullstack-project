import { Router } from "express";
import { verifyToken } from "../controllers/authController";
import { uploadRecipePhoto } from "../middleware/recipeUpload";
import { createUserRateLimiter } from "../middleware/rateLimit";
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

const recipeCreateRateLimiter = createUserRateLimiter({
  keyPrefix: "recipes-create",
  windowMs: 5 * 60 * 1000,
  maxRequests: 1,
  message: "You can only add 1 recipe every 5 minutes. Please try again later.",
});

const recipeCommentRateLimiter = createUserRateLimiter({
  keyPrefix: "recipes-comments-create",
  windowMs: 5 * 60 * 1000,
  maxRequests: 2,
  message: "You can only add 2 comments every 5 minutes. Please try again later.",
});

router.get("/", getAllRecipes);
router.get("/query/:field/:value", getRecipesByQuery);
router.get("/favorites", verifyToken, getFavoriteRecipes);
router.get("/favorites/ids", verifyToken, getFavoriteRecipeIds);
router.get("/:id/comments", getRecipeComments);
router.get("/:id", getRecipeById);

router.post("/", verifyToken, recipeCreateRateLimiter, uploadRecipePhoto.single("photo"), createRecipe);
router.post("/:id/comments", verifyToken, recipeCommentRateLimiter, addRecipeComment);
router.post("/:id/favorite", verifyToken, addFavoriteRecipe);
router.post("/:id/rating", verifyToken, rateRecipe);
router.put("/:id", verifyToken, uploadRecipePhoto.single("photo"), updateRecipeById);
router.put("/:id/comments/:commentId", verifyToken, updateRecipeComment);
router.delete("/:id/comments/:commentId", verifyToken, deleteRecipeComment);
router.delete("/:id", verifyToken, deleteRecipeById);
router.delete("/:id/favorite", verifyToken, removeFavoriteRecipe);

export default router;
