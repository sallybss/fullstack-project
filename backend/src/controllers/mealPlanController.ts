import { type Request, type Response } from "express";
import { Types } from "mongoose";

import { connect } from "../repository/database";
import { mealPlanModel } from "../models/mealPlanModel";

const MEAL_PLAN_NAME_MAX_LENGTH = 80;
const MEAL_PLAN_LABEL_MAX_LENGTH = 80;
const MEAL_PLAN_RECIPE_REF_MAX_LENGTH = 64;
const MEAL_PLAN_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
const MEAL_PLAN_SLOTS = ["breakfast", "lunch", "dinner"] as const;

type MealPlanDay = Record<(typeof MEAL_PLAN_SLOTS)[number], string>;
type MealPlanDays = Record<(typeof MEAL_PLAN_DAYS)[number], MealPlanDay>;

function getAuthUserId(req: Request): string | null {
  return typeof (req as any).user?.id === "string" ? (req as any).user.id : null;
}

function emptyDays(): MealPlanDays {
  return {
    monday: { breakfast: "", lunch: "", dinner: "" },
    tuesday: { breakfast: "", lunch: "", dinner: "" },
    wednesday: { breakfast: "", lunch: "", dinner: "" },
    thursday: { breakfast: "", lunch: "", dinner: "" },
    friday: { breakfast: "", lunch: "", dinner: "" },
    saturday: { breakfast: "", lunch: "", dinner: "" },
    sunday: { breakfast: "", lunch: "", dinner: "" },
  };
}

function sanitizeRecipeRef(value: unknown): string {
  const next = typeof value === "string" ? value.trim() : "";
  if (next.length > MEAL_PLAN_RECIPE_REF_MAX_LENGTH) {
    throw new Error(`meal plan recipe references must be at most ${MEAL_PLAN_RECIPE_REF_MAX_LENGTH} characters`);
  }
  return next;
}

function sanitizeDays(value: unknown): MealPlanDays {
  const base = emptyDays();
  if (!value || typeof value !== "object") {
    return base;
  }

  const days = value as Record<string, unknown>;

  for (const day of MEAL_PLAN_DAYS) {
    const rawDay = days[day];
    if (!rawDay || typeof rawDay !== "object") continue;
    const slots = rawDay as Record<string, unknown>;

    for (const slot of MEAL_PLAN_SLOTS) {
      base[day][slot] = sanitizeRecipeRef(slots[slot]);
    }
  }

  return base;
}

function sanitizeMealPlanBody(body: any): { name: string; weekLabel: string; days: MealPlanDays } {
  const name = String(body?.name ?? "").trim();
  if (!name) {
    throw new Error("meal plan name is required");
  }
  if (name.length > MEAL_PLAN_NAME_MAX_LENGTH) {
    throw new Error(`meal plan name must be at most ${MEAL_PLAN_NAME_MAX_LENGTH} characters`);
  }

  const weekLabel = String(body?.weekLabel ?? "").trim();
  if (weekLabel.length > MEAL_PLAN_LABEL_MAX_LENGTH) {
    throw new Error(`meal plan label must be at most ${MEAL_PLAN_LABEL_MAX_LENGTH} characters`);
  }

  return {
    name,
    weekLabel,
    days: sanitizeDays(body?.days),
  };
}

function toMealPlanResponse(doc: any) {
  const raw = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(raw._id),
    name: raw.name,
    weekLabel: raw.weekLabel,
    days: raw.days,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function getMyMealPlans(req: Request, res: Response) {
  try {
    await connect();

    const owner = getAuthUserId(req);
    if (!owner) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mealPlans = await mealPlanModel.find({ owner }).sort({ createdAt: -1 });
    res.status(200).json({ error: null, data: mealPlans.map(toMealPlanResponse) });
  } catch (err) {
    res.status(500).send("Error retrieving meal plans. Error: " + err);
  }
}

export async function createMealPlan(req: Request, res: Response) {
  try {
    await connect();

    const owner = getAuthUserId(req);
    if (!owner) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const payload = sanitizeMealPlanBody(req.body);
    const created = await mealPlanModel.create({ owner, ...payload });
    res.status(201).json({ error: null, data: toMealPlanResponse(created) });
  } catch (err: any) {
    const message = String(err?.message || err);
    const isValidationError = message.includes("meal plan");
    res.status(isValidationError ? 400 : 500).send(message);
  }
}

export async function getMealPlanById(req: Request, res: Response) {
  try {
    await connect();

    const owner = getAuthUserId(req);
    if (!owner) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mealPlanId = String(req.params.id || "");
    if (!Types.ObjectId.isValid(mealPlanId)) {
      res.status(400).json({ error: "Invalid meal plan id" });
      return;
    }

    const mealPlan = await mealPlanModel.findOne({ _id: mealPlanId, owner });
    if (!mealPlan) {
      res.status(404).json({ error: "Meal plan not found" });
      return;
    }

    res.status(200).json({ error: null, data: toMealPlanResponse(mealPlan) });
  } catch (err) {
    res.status(500).send("Error retrieving meal plan. Error: " + err);
  }
}

export async function updateMealPlan(req: Request, res: Response) {
  try {
    await connect();

    const owner = getAuthUserId(req);
    if (!owner) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mealPlanId = String(req.params.id || "");
    if (!Types.ObjectId.isValid(mealPlanId)) {
      res.status(400).json({ error: "Invalid meal plan id" });
      return;
    }

    const payload = sanitizeMealPlanBody(req.body);
    const updated = await mealPlanModel.findOneAndUpdate(
      { _id: mealPlanId, owner },
      { $set: payload },
      { returnDocument: "after" },
    );

    if (!updated) {
      res.status(404).json({ error: "Meal plan not found" });
      return;
    }

    res.status(200).json({ error: null, data: toMealPlanResponse(updated) });
  } catch (err: any) {
    const message = String(err?.message || err);
    const isValidationError = message.includes("meal plan");
    res.status(isValidationError ? 400 : 500).send(message);
  }
}

export async function deleteMealPlan(req: Request, res: Response) {
  try {
    await connect();

    const owner = getAuthUserId(req);
    if (!owner) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mealPlanId = String(req.params.id || "");
    if (!Types.ObjectId.isValid(mealPlanId)) {
      res.status(400).json({ error: "Invalid meal plan id" });
      return;
    }

    const deleted = await mealPlanModel.findOneAndDelete({ _id: mealPlanId, owner });
    if (!deleted) {
      res.status(404).json({ error: "Meal plan not found" });
      return;
    }

    res.status(200).json({ error: null, data: { id: mealPlanId } });
  } catch (err) {
    res.status(500).send("Error deleting meal plan. Error: " + err);
  }
}
