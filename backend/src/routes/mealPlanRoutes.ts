import { Router } from "express";
import { verifyToken } from "../controllers/authController";
import { createUserRateLimiter } from "../middleware/rateLimit";
import {
  createMealPlan,
  deleteMealPlan,
  getMealPlanById,
  getMyMealPlans,
  updateMealPlan,
} from "../controllers/mealPlanController";

const router = Router();

const mealPlanCreateRateLimiter = createUserRateLimiter({
  keyPrefix: "meal-plans-create",
  windowMs: 5 * 60 * 1000,
  maxRequests: 2,
  message: "You can only add 2 meal plans every 5 minutes. Please try again later.",
});

router.get("/", verifyToken, getMyMealPlans);
router.post("/", verifyToken, mealPlanCreateRateLimiter, createMealPlan);
router.get("/:id", verifyToken, getMealPlanById);
router.put("/:id", verifyToken, updateMealPlan);
router.delete("/:id", verifyToken, deleteMealPlan);

export default router;
