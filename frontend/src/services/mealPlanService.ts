import type { MealPlan, NewMealPlan } from "../interfaces/mealPlan";

const STORAGE_KEY = "mealPlans";

// reads plas from local storage, gives error if empty
function readMealPlans(): MealPlan[] {
  const storedMealPlans = localStorage.getItem(STORAGE_KEY);

  if (!storedMealPlans) {
    return [];
  }

  try {
    return JSON.parse(storedMealPlans) as MealPlan[];
  } catch {
    return [];
  }
}

function saveMealPlans(mealPlans: MealPlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mealPlans));
}

function normalizeDayMeals(value: unknown) {
  if (typeof value === "string") {
    return {
      breakfast: value,
      lunch: "",
      dinner: "",
    };
  }

  if (Array.isArray(value)) {
    return {
      breakfast: typeof value[0] === "string" ? value[0] : "",
      lunch: typeof value[1] === "string" ? value[1] : "",
      dinner: typeof value[2] === "string" ? value[2] : "",
    };
  }

  if (value && typeof value === "object") {
    const dayMeals = value as Record<string, unknown>;
    return {
      breakfast: typeof dayMeals.breakfast === "string" ? dayMeals.breakfast : "",
      lunch: typeof dayMeals.lunch === "string" ? dayMeals.lunch : "",
      dinner: typeof dayMeals.dinner === "string" ? dayMeals.dinner : "",
    };
  }

  return {
    breakfast: "",
    lunch: "",
    dinner: "",
  };
}

function normalizeMealPlans(mealPlans: MealPlan[]): MealPlan[] {
  return mealPlans.map((mealPlan) => ({
    ...mealPlan,
    days: {
      monday: normalizeDayMeals(mealPlan.days?.monday),
      tuesday: normalizeDayMeals(mealPlan.days?.tuesday),
      wednesday: normalizeDayMeals(mealPlan.days?.wednesday),
      thursday: normalizeDayMeals(mealPlan.days?.thursday),
      friday: normalizeDayMeals(mealPlan.days?.friday),
      saturday: normalizeDayMeals(mealPlan.days?.saturday),
      sunday: normalizeDayMeals(mealPlan.days?.sunday),
    },
  }));
}

function generateMealPlanId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

//Promise represents futere data and we waiting for fata before using it
export async function fetchMealPlans(): Promise<MealPlan[]> {
  return normalizeMealPlans(readMealPlans()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function addMealPlan(mealPlanData: NewMealPlan): Promise<MealPlan> {
  const mealPlans = readMealPlans();
  const now = new Date().toISOString();

  const newMealPlan: MealPlan = {
    id: generateMealPlanId(),
    name: mealPlanData.name,
    weekLabel: mealPlanData.weekLabel,
    days: {
      monday: { ...mealPlanData.days.monday },
      tuesday: { ...mealPlanData.days.tuesday },
      wednesday: { ...mealPlanData.days.wednesday },
      thursday: { ...mealPlanData.days.thursday },
      friday: { ...mealPlanData.days.friday },
      saturday: { ...mealPlanData.days.saturday },
      sunday: { ...mealPlanData.days.sunday },
    },
    createdAt: now,
    updatedAt: now,
  };

  mealPlans.unshift(newMealPlan);
  saveMealPlans(mealPlans);

  return newMealPlan;
}

export async function editMealPlan(
  mealPlanId: string,
  mealPlanData: NewMealPlan,
): Promise<MealPlan> {
  const mealPlans = readMealPlans();
  const mealPlanIndex = mealPlans.findIndex((mealPlan) => mealPlan.id === mealPlanId);

  if (mealPlanIndex === -1) {
    throw new Error("Meal plan not found");
  }

  const updatedMealPlan: MealPlan = {
    ...mealPlans[mealPlanIndex],
    name: mealPlanData.name,
    weekLabel: mealPlanData.weekLabel,
    days: {
      monday: { ...mealPlanData.days.monday },
      tuesday: { ...mealPlanData.days.tuesday },
      wednesday: { ...mealPlanData.days.wednesday },
      thursday: { ...mealPlanData.days.thursday },
      friday: { ...mealPlanData.days.friday },
      saturday: { ...mealPlanData.days.saturday },
      sunday: { ...mealPlanData.days.sunday },
    },
    updatedAt: new Date().toISOString(),
  };

  mealPlans[mealPlanIndex] = updatedMealPlan;
  saveMealPlans(mealPlans);

  return updatedMealPlan;
}

export async function deleteMealPlan(mealPlanId: string): Promise<void> {
  const mealPlans = readMealPlans().filter((mealPlan) => mealPlan.id !== mealPlanId);
  saveMealPlans(mealPlans);
}
