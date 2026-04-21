import { describe, test, expect, vi, beforeEach } from "vitest";
import { createEmptyMealPlanDays } from "../interfaces/mealPlan";

//vi.fn() creates a mock function
const mockFetchMealPlans = vi.fn();
const mockAddMealPlan = vi.fn();

//replace this imported file with fake functions
vi.mock("../services/mealPlanService", () => ({
  fetchMealPlans: mockFetchMealPlans,
  addMealPlan: mockAddMealPlan,
  editMealPlan: vi.fn(),
  deleteMealPlan: vi.fn(),
}));

describe("useMealPlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("fetchMealPlans saves meal plans in state", async () => {
    const fakeMealPlans = [
      {
        id: "1",
        name: "My Plan",
        weekLabel: "Week 1",
        days: createEmptyMealPlanDays(),
        createdAt: "2026-04-21",
        updatedAt: "2026-04-21",
      },
    ];

    mockFetchMealPlans.mockResolvedValue(fakeMealPlans);

    const { useMealPlans } = await import("../modules/useMealPlans");
    const { mealPlans, fetchMealPlans } = useMealPlans();

    await fetchMealPlans();

    expect(mockFetchMealPlans).toHaveBeenCalled();
    expect(mealPlans.value).toEqual(fakeMealPlans);
  });

  test("addMealPlan adds a new plan to the list", async () => {
    const newPlanData = {
      name: "New Plan",
      weekLabel: "Week 2",
      days: createEmptyMealPlanDays(),
    };

    const savedPlan = {
      id: "2",
      ...newPlanData,
      createdAt: "2026-04-21",
      updatedAt: "2026-04-21",
    };

    mockAddMealPlan.mockResolvedValue(savedPlan);

    const { useMealPlans } = await import("../modules/useMealPlans");
    const { mealPlans, addMealPlan } = useMealPlans();

    await addMealPlan(newPlanData);

    expect(mockAddMealPlan).toHaveBeenCalledWith(newPlanData);
    expect(mealPlans.value[0]).toEqual(savedPlan);
  });
});
