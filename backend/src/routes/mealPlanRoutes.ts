import { Router } from "express";
import { verifyToken } from "../controllers/authController";
import {
  createMealPlan,
  deleteMealPlan,
  getMealPlanById,
  getMyMealPlans,
  updateMealPlan,
} from "../controllers/mealPlanController";

const router = Router();

router.get("/", verifyToken, getMyMealPlans);
router.post("/", verifyToken, createMealPlan);
router.get("/:id", verifyToken, getMealPlanById);
router.put("/:id", verifyToken, updateMealPlan);
router.delete("/:id", verifyToken, deleteMealPlan);

export default router;
