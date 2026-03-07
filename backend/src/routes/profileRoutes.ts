import { Router } from "express";
import { verifyToken } from "../controllers/authController";
import {
  followUserProfile,
  getMyProfile,
  getMySavedRecipes,
  getProfileByUserId,
  getProfileFollowers,
  getProfileFollowing,
  getRecipesByUserId,
  getSavedRecipesByUserId,
  unfollowUserProfile,
  updateMyProfile,
} from "../controllers/profileController";

const router = Router();

router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);
router.get("/me/saved", verifyToken, getMySavedRecipes);

router.get("/:userId", getProfileByUserId);
router.get("/:userId/recipes", getRecipesByUserId);
router.get("/:userId/saved", getSavedRecipesByUserId);
router.get("/:userId/followers", getProfileFollowers);
router.get("/:userId/following", getProfileFollowing);
router.post("/:userId/follow", verifyToken, followUserProfile);
router.delete("/:userId/follow", verifyToken, unfollowUserProfile);

export default router;
