import { ref } from "vue";
import type { MealPlan, NewMealPlan } from "../interfaces/mealPlan";
import {
  addMealPlan as addMealPlanService,
  deleteMealPlan as deleteMealPlanService,
  editMealPlan as editMealPlanService,
  fetchMealPlans as fetchMealPlansService,
} from "../services/mealPlanService";

const mealPlans = ref<MealPlan[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

function validateMealPlan(mealPlan: NewMealPlan): void {
  if (!mealPlan.name.trim()) {
    throw new Error("Meal plan name is required");
  }
  if (mealPlan.name.trim().length > 80) {
    throw new Error("Meal plan name must be at most 80 characters");
  }
  if (mealPlan.weekLabel.trim().length > 80) {
    throw new Error("Meal plan label must be at most 80 characters");
  }
}

export const useMealPlans = () => {
  const fetchMealPlans = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      mealPlans.value = await fetchMealPlansService();
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  const addMealPlan = async (mealPlanData: NewMealPlan): Promise<MealPlan> => {
    loading.value = true;
    error.value = null;

    try {
      validateMealPlan(mealPlanData);

      const createdMealPlan = await addMealPlanService(mealPlanData);
      mealPlans.value.unshift(createdMealPlan);

      return createdMealPlan;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const editMealPlan = async (
    mealPlanId: string,
    mealPlanData: NewMealPlan,
  ): Promise<MealPlan> => {
    loading.value = true;
    error.value = null;

    try {
      validateMealPlan(mealPlanData);

      const updatedMealPlan = await editMealPlanService(mealPlanId, mealPlanData);
      mealPlans.value = mealPlans.value.map((mealPlan) =>
        mealPlan.id === mealPlanId ? updatedMealPlan : mealPlan,
      );

      return updatedMealPlan;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteMealPlan = async (mealPlanId: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await deleteMealPlanService(mealPlanId);
      mealPlans.value = mealPlans.value.filter((mealPlan) => mealPlan.id !== mealPlanId);
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    mealPlans,
    loading,
    error,
    fetchMealPlans,
    addMealPlan,
    editMealPlan,
    deleteMealPlan,
  };
};
