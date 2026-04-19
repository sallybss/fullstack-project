import { Schema, model } from "mongoose";

const mealPlanDaySchema = new Schema(
  {
    breakfast: { type: String, default: "", trim: true, maxlength: 64 },
    lunch: { type: String, default: "", trim: true, maxlength: 64 },
    dinner: { type: String, default: "", trim: true, maxlength: 64 },
  },
  { _id: false },
);

const mealPlanSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    weekLabel: { type: String, default: "", trim: true, maxlength: 80 },
    days: {
      monday: { type: mealPlanDaySchema, required: true },
      tuesday: { type: mealPlanDaySchema, required: true },
      wednesday: { type: mealPlanDaySchema, required: true },
      thursday: { type: mealPlanDaySchema, required: true },
      friday: { type: mealPlanDaySchema, required: true },
      saturday: { type: mealPlanDaySchema, required: true },
      sunday: { type: mealPlanDaySchema, required: true },
    },
  },
  { timestamps: true },
);

export const mealPlanModel = model("MealPlan", mealPlanSchema);
