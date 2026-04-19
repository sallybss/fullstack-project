import type { MealPlan, NewMealPlan } from "../interfaces/mealPlan";

const API_URL = import.meta.env.VITE_API_URL;
const LEGACY_STORAGE_KEY = "mealPlans";

function getAuthToken(): string {
  const token = localStorage.getItem("lsToken");
  if (!token) {
    throw new Error("Authentication token missing");
  }
  return token;
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

function normalizeMealPlan(mealPlan: MealPlan): MealPlan {
  return {
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
  };
}

function normalizeMealPlans(mealPlans: MealPlan[]): MealPlan[] {
  return mealPlans.map(normalizeMealPlan);
}

function readLegacyMealPlans(): MealPlan[] {
  const storedMealPlans = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!storedMealPlans) return [];

  try {
    return normalizeMealPlans(JSON.parse(storedMealPlans) as MealPlan[]);
  } catch {
    return [];
  }
}

function clearLegacyMealPlans(): void {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/meal-plans${path}`, {
    ...init,
    headers: {
      "auth-token": token,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "Meal plan request failed");
  }

  const payload = await response.json();
  return payload.data as T;
}

async function migrateLegacyMealPlans(existing: MealPlan[]): Promise<MealPlan[]> {
  if (existing.length > 0) {
    clearLegacyMealPlans();
    return existing;
  }

  const legacyMealPlans = readLegacyMealPlans();
  if (legacyMealPlans.length === 0) {
    return existing;
  }

  const migrated: MealPlan[] = [];
  for (const mealPlan of legacyMealPlans) {
    const created = await addMealPlan({
      name: mealPlan.name,
      weekLabel: mealPlan.weekLabel,
      days: mealPlan.days,
    });
    migrated.push(created);
  }

  clearLegacyMealPlans();
  return migrated.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchMealPlans(): Promise<MealPlan[]> {
  const mealPlans = normalizeMealPlans(await request<MealPlan[]>(""));
  return migrateLegacyMealPlans(mealPlans);
}

export async function addMealPlan(mealPlanData: NewMealPlan): Promise<MealPlan> {
  return normalizeMealPlan(
    await request<MealPlan>("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mealPlanData),
    }),
  );
}

export async function editMealPlan(
  mealPlanId: string,
  mealPlanData: NewMealPlan,
): Promise<MealPlan> {
  return normalizeMealPlan(
    await request<MealPlan>(`/${mealPlanId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mealPlanData),
    }),
  );
}

export async function deleteMealPlan(mealPlanId: string): Promise<void> {
  await request<{ id: string }>(`/${mealPlanId}`, {
    method: "DELETE",
  });
}
