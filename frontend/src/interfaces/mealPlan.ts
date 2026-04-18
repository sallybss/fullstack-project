export const MEAL_PLAN_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type MealPlanDay = (typeof MEAL_PLAN_DAYS)[number];

export const MEAL_PLAN_DAY_LABELS: Record<MealPlanDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const MEAL_PLAN_SLOTS = ["breakfast", "lunch", "dinner"] as const;

export type MealPlanSlot = (typeof MEAL_PLAN_SLOTS)[number];

export const MEAL_PLAN_SLOT_LABELS: Record<MealPlanSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export type MealPlanMealsBySlot = Record<MealPlanSlot, string>;

export type MealPlanRecipesByDay = Record<MealPlanDay, MealPlanMealsBySlot>;

export type MealPlan = {
  id: string;
  name: string;
  weekLabel: string;
  days: MealPlanRecipesByDay;
  createdAt: string;
  updatedAt: string;
};

export type NewMealPlan = {
  name: string;
  weekLabel: string;
  days: MealPlanRecipesByDay;
};

export function createEmptyMealPlanDays(): MealPlanRecipesByDay {
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

export function createEmptyMealPlan(): NewMealPlan {
  return {
    name: "",
    weekLabel: "",
    days: createEmptyMealPlanDays(),
  };
}

export function getFilledMealPlanDays(days: MealPlanRecipesByDay): MealPlanDay[] {
  return MEAL_PLAN_DAYS.filter((day) =>
    MEAL_PLAN_SLOTS.some((slot) => Boolean(days[day][slot])),
  );
}

export function getFilledMealPlanSlots(dayMeals: MealPlanMealsBySlot): MealPlanSlot[] {
  return MEAL_PLAN_SLOTS.filter((slot) => Boolean(dayMeals[slot]));
}
