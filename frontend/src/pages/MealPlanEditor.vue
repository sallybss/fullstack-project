<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import HeroSection from "../components/common/HeroSection.vue";
import BaseButton from "../components/common/BaseButton.vue";
import type { Recipe } from "../interfaces/recipe";
import RecipeCard from "../components/recipes/RecipeCard.vue";
import { useRecipes } from "../modules/useRecipes";
import { useMealPlans } from "../modules/useMealPlans";
import {
  MEAL_PLAN_DAYS,
  MEAL_PLAN_DAY_LABELS,
  MEAL_PLAN_SLOTS,
  MEAL_PLAN_SLOT_LABELS,
  createEmptyMealPlan,
  type MealPlan,
  type MealPlanDay,
  type MealPlanSlot,
  type NewMealPlan,
} from "../interfaces/mealPlan";

const route = useRoute();
const router = useRouter();

const { recipes, fetchRecipes, error: recipesError } = useRecipes();
const {
  mealPlans,
  error,
  fetchMealPlans,
  addMealPlan,
  editMealPlan,
} = useMealPlans();

const form = ref<NewMealPlan>(createEmptyMealPlan());
const editingMealPlanId = ref<string | null>(null);

const selectedDay = ref<MealPlanDay>("monday");
const selectedSlot = ref<MealPlanSlot>("breakfast");
const recipeSearch = ref("");

const recipeOptions = computed(() =>
  [...recipes.value]
    .sort((a, b) => a.title.localeCompare(b.title))
    .filter((recipe) => matchesMealSlot(recipe, selectedSlot.value))
    .filter((recipe) => {
      const searchTerm = recipeSearch.value.trim().toLowerCase();
      if (!searchTerm) {
        return true;
      }

      return recipe.title.toLowerCase().includes(searchTerm);
    }),
);

const isEditing = computed(() => Boolean(editingMealPlanId.value));

onMounted(async () => {
  await Promise.all([fetchRecipes(), fetchMealPlans()]);
  initializeEditor();
});

watch(
  () => route.params.id,
  () => {
    initializeEditor();
  },
);

function initializeEditor(): void {
  const mealPlanId = typeof route.params.id === "string" ? route.params.id : null;

  if (!mealPlanId) {
    resetForm();
    return;
  }

  const mealPlan = mealPlans.value.find((entry) => entry.id === mealPlanId);

  if (!mealPlan) {
    error.value = "Meal plan not found";
    router.replace({ name: "meal-plans" });
    return;
  }

  loadMealPlanIntoForm(mealPlan);
}

function buildDefaultMealPlanName(): string {
  return `Meal Plan ${new Date().toLocaleDateString()}`;
}

function buildDefaultWeekLabel(): string {
  return `Created ${new Date().toLocaleDateString()}`;
}

function resetForm(): void {
  form.value = createEmptyMealPlan();
  editingMealPlanId.value = null;
  selectedDay.value = "monday";
  selectedSlot.value = "breakfast";
  recipeSearch.value = "";
}

function loadMealPlanIntoForm(mealPlan: MealPlan): void {
  form.value = {
    name: mealPlan.name,
    weekLabel: mealPlan.weekLabel,
    days: {
      monday: { ...mealPlan.days.monday },
      tuesday: { ...mealPlan.days.tuesday },
      wednesday: { ...mealPlan.days.wednesday },
      thursday: { ...mealPlan.days.thursday },
      friday: { ...mealPlan.days.friday },
      saturday: { ...mealPlan.days.saturday },
      sunday: { ...mealPlan.days.sunday },
    },
  };

  editingMealPlanId.value = mealPlan.id;
  selectedDay.value = "monday";
  selectedSlot.value = "breakfast";
  recipeSearch.value = "";
}

function chooseDay(day: MealPlanDay): void {
  selectedDay.value = day;
  recipeSearch.value = "";
}

function chooseSlot(slot: MealPlanSlot): void {
  selectedSlot.value = slot;
  recipeSearch.value = "";
}

function getSlotCount(slot: MealPlanSlot): number {
  return form.value.days[selectedDay.value][slot] ? 1 : 0;
}

async function persistPlan(): Promise<void> {
  const payload: NewMealPlan = {
    name: form.value.name.trim() || buildDefaultMealPlanName(),
    weekLabel: form.value.weekLabel.trim() || buildDefaultWeekLabel(),
    days: {
      monday: { ...form.value.days.monday },
      tuesday: { ...form.value.days.tuesday },
      wednesday: { ...form.value.days.wednesday },
      thursday: { ...form.value.days.thursday },
      friday: { ...form.value.days.friday },
      saturday: { ...form.value.days.saturday },
      sunday: { ...form.value.days.sunday },
    },
  };

  if (editingMealPlanId.value) {
    await editMealPlan(editingMealPlanId.value, payload);
  } else {
    await addMealPlan(payload);
  }
}

async function assignRecipeToSelectedSlot(recipeId: string): Promise<void> {
  const currentRecipeId = form.value.days[selectedDay.value][selectedSlot.value];

  form.value.days[selectedDay.value][selectedSlot.value] =
    currentRecipeId === recipeId ? "" : recipeId;
}

function matchesMealSlot(recipe: Recipe, slot: MealPlanSlot): boolean {
  if (recipe.mealType) {
    return recipe.mealType === slot;
  }

  const searchableText = [
    recipe.title,
    recipe.description,
    recipe.cuisine,
    ...(recipe.ingredients ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const keywords: Record<MealPlanSlot, string[]> = {
    breakfast: ["breakfast", "egg", "omelet", "pancake", "waffle", "toast", "oat", "granola", "smoothie", "yogurt"],
    lunch: ["lunch", "salad", "sandwich", "wrap", "bowl", "soup", "pasta"],
    dinner: ["dinner", "steak", "chicken", "rice", "roast", "curry", "salmon", "burger"],
  };

  return keywords[slot].some((keyword) => searchableText.includes(keyword));
}

function selectedMealCount(day: MealPlanDay): number {
  return MEAL_PLAN_SLOTS.filter((slot) => Boolean(form.value.days[day][slot])).length;
}

function isSelectedRecipeForSlot(recipeId: string): boolean {
  return form.value.days[selectedDay.value][selectedSlot.value] === recipeId;
}

function isSlotFilled(slot: MealPlanSlot): boolean {
  return Boolean(form.value.days[selectedDay.value][slot]);
}

async function handleSave(): Promise<void> {
  await persistPlan();
  router.push({ name: "meal-plans" });
}

function handleCancel(): void {
  router.push({ name: "meal-plans" });
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push({ name: "meal-plans" });
}
</script>

<template>
  <div class="page">
    <HeroSection
      imageUrl="https://picsum.photos/seed/mealplanner/1400/700"
      :title="isEditing ? 'Edit Meal Plan' : 'Weekly Meal Planner'"
      subtitle="Pick a day, pick a meal, pick a recipe."
    />

    <main class="container">
      <section class="card">
        <button type="button" class="back-link" @click="goBack">
          <i class="pi pi-arrow-left"></i>
          <span>Go back</span>
        </button>

        <div class="assign-box">
          <div class="top-fields">
            <label class="field">
              <span class="field__label">Title</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="Week name"
              />
            </label>
          </div>

          <div class="section-label">Pick A Day</div>

          <div class="day-picker">
            <button
              v-for="day in MEAL_PLAN_DAYS"
              :key="day"
              type="button"
              class="day-chip"
              :class="{ 'day-chip--active': selectedDay === day }"
              @click="chooseDay(day)"
            >
              {{ MEAL_PLAN_DAY_LABELS[day] }}<span v-if="selectedMealCount(day)"> ({{ selectedMealCount(day) }})</span>
            </button>
          </div>

          <div class="day-workspace">
            <div class="slots-panel">
              <div class="section-label">Choose A Meal</div>
              <div class="slot-picker">
                <button
                  v-for="slot in MEAL_PLAN_SLOTS"
                  :key="slot"
                  type="button"
                  class="slot-button"
                  :class="{ 'slot-button--active': selectedSlot === slot }"
                  @click="chooseSlot(slot)"
                >
                  {{ MEAL_PLAN_SLOT_LABELS[slot] }}<span v-if="getSlotCount(slot)">({{ getSlotCount(slot) }})</span>
                </button>
              </div>
            </div>

            <div class="recipes-panel">
              <label class="field field--search">
                <input
                  v-model="recipeSearch"
                  type="text"
                  placeholder="Search by recipe title"
                />
              </label>

              <div v-if="recipeOptions.length === 0" class="empty-state empty-state--small">
                No {{ MEAL_PLAN_SLOT_LABELS[selectedSlot].toLowerCase() }} recipes found.
              </div>

              <div v-else class="recipe-grid">
                <RecipeCard
                  v-for="recipe in recipeOptions"
                  :key="recipe._id"
                  :recipe="recipe"
                  :planner-mode="true"
                  :planner-added="isSelectedRecipeForSlot(recipe._id)"
                  :planner-disabled="isSlotFilled(selectedSlot) && !isSelectedRecipeForSlot(recipe._id)"
                  :planner-label="`Add To ${MEAL_PLAN_SLOT_LABELS[selectedSlot]}`"
                  @planner-add="assignRecipeToSelectedSlot"
                  @auth-required="() => {}"
                  @save-click="() => {}"
                />
              </div>
            </div>
          </div>
        </div>

        <p v-if="error || recipesError" class="message message--error">
          {{ error || recipesError }}
        </p>

        <div class="actions">
          <BaseButton variant="outline" type="button" @click="handleCancel">
            Cancel
          </BaseButton>

          <BaseButton type="button" @click="handleSave">
            Save
          </BaseButton>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3f5fb;
}

.container {
  width: min(1280px, 96vw);
  margin: -120px auto 64px;
  position: relative;
  z-index: 2;
}

.card {
  background: #fff;
  border-radius: 32px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(41, 28, 16, 0.08);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  padding: 0;
  margin-bottom: 24px;
  font: inherit;
  font-size: 16px;
  color: #5d6777;
  cursor: pointer;
}

.back-link i {
  font-size: 20px;
}

.field {
  display: grid;
  gap: 8px;
}

.field__label {
  color: #6f645a;
  font-size: 14px;
  font-weight: 700;
}

.field input,
.field select {
  width: 100%;
  min-height: 46px;
  border: 1px solid #ddd;
  border-radius: 14px;
  padding: 0 14px;
  font: inherit;
  background: white;
}

.top-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 26px;
}

.field--search {
  max-width: 360px;
}

.field--search input {
  min-height: 44px;
  border-radius: 999px;
  background: #fff;
}

.assign-box {
  padding: 0;
}

.day-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.day-chip,
.slot-button {
  border: 1px solid #e6ded4;
  background: white;
  border-radius: 999px;
  padding: 10px 18px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  color: #251d17;
}

.day-chip--active,
.slot-button--active {
  border-color: #ff724c;
  background: #ff724c;
  color: white;
}

.day-workspace {
  display: grid;
  gap: 20px;
}

.slots-panel {
  margin-bottom: 0;
}

.slot-picker {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px;
  border: 1px solid #e6ded4;
  border-radius: 999px;
  background: #faf6f0;
}

.slot-button {
  border-color: transparent;
  background: transparent;
  color: #251d17;
}

.slot-button--active {
  background: white;
  color: #ff724c;
  border-color: white;
  box-shadow: 0 1px 2px rgba(31, 22, 16, 0.06);
}

.section-label {
  margin-bottom: 14px;
  color: #7f7368;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-top: 18px;
}

.message {
  margin: 20px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
}

.message--error {
  background: #fff0f0;
  color: #a33b3b;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.empty-state {
  padding: 24px;
  border-radius: 22px;
  background: #f4f2f6;
  color: #666;
  text-align: center;
}

.empty-state--small {
  padding: 16px;
  margin-top: 14px;
}

@media (max-width: 900px) {
  .top-fields,
  .recipe-grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 20px;
    border-radius: 24px;
  }

  .back-link {
    margin-bottom: 20px;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
