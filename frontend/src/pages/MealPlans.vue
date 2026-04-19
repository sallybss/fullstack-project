<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import HeroSection from "../components/common/HeroSection.vue";
import BaseButton from "../components/common/BaseButton.vue";
import { useMealPlans } from "../modules/useMealPlans";
import { useRecipes } from "../modules/useRecipes";
import {
  MEAL_PLAN_DAY_LABELS,
  MEAL_PLAN_SLOT_LABELS,
  getFilledMealPlanDays,
  getFilledMealPlanSlots,
  type MealPlan,
  type MealPlanDay,
} from "../interfaces/mealPlan";

const router = useRouter();

const { mealPlans, fetchMealPlans, deleteMealPlan, error } = useMealPlans();
const { recipes, fetchRecipes, error: recipesError } = useRecipes();
const selectedDaysByPlan = ref<Record<string, MealPlanDay>>({});
const expandedPlanIds = ref<string[]>([]);

const recipeTitles = computed(() => {
  const entries = recipes.value.map((recipe) => [recipe._id, recipe.title] as const);
  return Object.fromEntries(entries);
});

onMounted(async () => {
  await Promise.all([fetchMealPlans(), fetchRecipes()]);
  initializeSelectedDays();
});

function initializeSelectedDays(): void {
  const nextSelection: Record<string, MealPlanDay> = {};

  mealPlans.value.forEach((mealPlan) => {
    const filledDays = getFilledMealPlanDays(mealPlan.days);
    if (filledDays[0]) {
      nextSelection[mealPlan.id] = filledDays[0];
    }
  });

  selectedDaysByPlan.value = nextSelection;
}

function getVisibleDays(mealPlan: MealPlan): MealPlanDay[] {
  return getFilledMealPlanDays(mealPlan.days);
}

function getSelectedDay(mealPlan: MealPlan): MealPlanDay | null {
  const selectedDay = selectedDaysByPlan.value[mealPlan.id];
  if (selectedDay) {
    return selectedDay;
  }

  return getVisibleDays(mealPlan)[0] ?? null;
}

function chooseDay(mealPlanId: string, day: MealPlanDay): void {
  selectedDaysByPlan.value = {
    ...selectedDaysByPlan.value,
    [mealPlanId]: day,
  };
}

function isPlanExpanded(mealPlanId: string): boolean {
  return expandedPlanIds.value.includes(mealPlanId);
}

function togglePlan(mealPlanId: string): void {
  if (isPlanExpanded(mealPlanId)) {
    expandedPlanIds.value = expandedPlanIds.value.filter((id) => id !== mealPlanId);
    return;
  }

  expandedPlanIds.value = [...expandedPlanIds.value, mealPlanId];
}

function getRecipesForDay(mealPlan: MealPlan, day: MealPlanDay) {
  return getFilledMealPlanSlots(mealPlan.days[day]).map((slot) => ({
    slot,
    recipeId: mealPlan.days[day][slot],
    title: recipeTitles.value[mealPlan.days[day][slot]] || "Recipe not found",
  }));
}

function hasSelectedDay(mealPlan: MealPlan): boolean {
  return Boolean(getSelectedDay(mealPlan));
}

function getSelectedDayLabel(mealPlan: MealPlan): string {
  const selectedDay = getSelectedDay(mealPlan);
  return selectedDay ? MEAL_PLAN_DAY_LABELS[selectedDay] : "";
}

function getSelectedDayRecipes(mealPlan: MealPlan) {
  const selectedDay = getSelectedDay(mealPlan);
  return selectedDay ? getRecipesForDay(mealPlan, selectedDay) : [];
}

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleDateString();
}

function goToCreatePage(): void {
  router.push({ name: "meal-plans-create" });
}

function goToEditPage(mealPlanId: string): void {
  router.push({ name: "meal-plans-edit", params: { id: mealPlanId } });
}

function goToRecipe(recipeId: string): void {
  if (!recipeId) {
    return;
  }

  router.push({ name: "recipe", params: { id: recipeId } });
}

async function handleDeleteMealPlan(mealPlan: MealPlan): Promise<void> {
  const shouldDelete = window.confirm(
    `Delete "${mealPlan.name}"? This action cannot be undone.`,
  );

  if (!shouldDelete) {
    return;
  }

  await deleteMealPlan(mealPlan.id);
  expandedPlanIds.value = expandedPlanIds.value.filter((id) => id !== mealPlan.id);

  const nextSelectedDays = { ...selectedDaysByPlan.value };
  delete nextSelectedDays[mealPlan.id];
  selectedDaysByPlan.value = nextSelectedDays;
}
</script>

<template>
  <div class="page">
    <HeroSection
      imageUrl="https://picsum.photos/seed/mealplanner-overview/1400/700"
      setting-key="meal-plans-hero"
      title="Meal Planner"
      subtitle="Open a saved plan, review planned days, and jump back in to edit."
    />

    <main class="container">
      <section class="content-card">
        <div class="page-head">
          <div>
            <p class="eyebrow">Your Saved Plans</p>
            <h2>Weekly overviews in one place</h2>
          </div>

          <BaseButton type="button" @click="goToCreatePage">
            Create Meal Plan
          </BaseButton>
        </div>

        <p v-if="error || recipesError" class="message message--error">
          {{ error || recipesError }}
        </p>

        <section v-if="mealPlans.length === 0" class="empty-state">
          <h3>No meal plans yet</h3>
          <p>Create your first plan and start organizing recipes by day.</p>
          <BaseButton type="button" @click="goToCreatePage">
            Create Meal Plan
          </BaseButton>
        </section>

        <section v-else class="plan-grid">
          <article
            v-for="mealPlan in mealPlans"
            :key="mealPlan.id"
            class="plan-card"
            :class="{ 'plan-card--expanded': isPlanExpanded(mealPlan.id) }"
          >
            <button
              type="button"
              class="plan-summary"
              @click="togglePlan(mealPlan.id)"
            >
              <div class="plan-summary__content">
                <p class="plan-card__meta">Updated {{ formatUpdatedAt(mealPlan.updatedAt) }}</p>
                <h3>{{ mealPlan.name }}</h3>
              </div>

              <div class="plan-summary__actions">
                <BaseButton
                  variant="outline"
                  type="button"
                  class="plan-summary__edit"
                  @click.stop="goToEditPage(mealPlan.id)"
                >
                  Edit
                </BaseButton>

                <BaseButton
                  variant="ghost"
                  type="button"
                  class="plan-summary__delete"
                  @click.stop="handleDeleteMealPlan(mealPlan)"
                >
                  Delete
                </BaseButton>

                <span class="plan-summary__icon" :class="{ 'plan-summary__icon--open': isPlanExpanded(mealPlan.id) }">
                  <i class="pi pi-chevron-down"></i>
                </span>
              </div>
            </button>

            <div v-if="isPlanExpanded(mealPlan.id)" class="plan-card__body">
              <div v-if="getVisibleDays(mealPlan).length">
                <div class="section-label">Saved Days</div>

                <div class="day-list">
                  <button
                    v-for="day in getVisibleDays(mealPlan)"
                    :key="day"
                    type="button"
                    class="day-chip"
                    :class="{ 'day-chip--active': getSelectedDay(mealPlan) === day }"
                    @click="chooseDay(mealPlan.id, day)"
                  >
                    {{ MEAL_PLAN_DAY_LABELS[day] }}
                  </button>
                </div>

                <div v-if="hasSelectedDay(mealPlan)" class="recipes-list">
                  <div class="section-label">
                    {{ getSelectedDayLabel(mealPlan) }} Recipes
                  </div>

                  <div class="recipe-row" v-for="entry in getSelectedDayRecipes(mealPlan)" :key="`${mealPlan.id}-${getSelectedDay(mealPlan)}-${entry.slot}`">
                    <span class="recipe-row__slot">{{ MEAL_PLAN_SLOT_LABELS[entry.slot] }}</span>
                    <span class="recipe-row__title">{{ entry.title }}</span>
                    <BaseButton
                      type="button"
                      variant="ghost"
                      class="recipe-row__action"
                      @click="goToRecipe(entry.recipeId)"
                    >
                      View Recipe
                    </BaseButton>
                  </div>
                </div>
              </div>

              <div v-else class="empty-plan">
                No recipes saved in this meal plan yet.
              </div>
            </div>
          </article>
        </section>
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
  width: min(1200px, 94vw);
  margin: -150px auto 72px;
  position: relative;
  z-index: 5;
}

.content-card {
  background: #fff;
  border-radius: 32px;
  padding: 30px;
  border: 1px solid rgba(230, 222, 212, 0.9);
  box-shadow: 0 20px 50px rgba(41, 28, 16, 0.08);
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

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow,
.section-label,
.plan-card__meta {
  margin: 0;
  color: #7f7368;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-head h2,
.plan-card h3 {
  margin: 6px 0 0;
  color: #1f1711;
}

.plan-grid {
  display: grid;
  gap: 18px;
}

.plan-card,
.empty-state {
  background: #fff;
  border: 1px solid rgba(230, 222, 212, 0.9);
  border-radius: 26px;
  box-shadow: 0 12px 30px rgba(41, 28, 16, 0.05);
}

.plan-card--expanded {
  border-color: rgba(255, 114, 76, 0.28);
}

.plan-summary {
  width: 100%;
  border: 0;
  background: transparent;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 24px 26px;
  text-align: left;
  cursor: pointer;
}

.plan-summary__content {
  min-width: 0;
}

.plan-summary__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #faf6f0;
  color: #ff724c;
  transition: transform 0.2s ease;
}

.plan-summary__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.plan-summary__edit {
  min-width: 96px;
}

.plan-summary__delete {
  min-width: 96px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #efc8be;
  color: #c95f45;
  background: #fff7f4;
}

.plan-summary__delete:hover {
  background: #ffe8e1;
}

.plan-summary__icon--open {
  transform: rotate(180deg);
}

.plan-card__body {
  padding: 0 26px 26px;
  border-top: 1px solid #f0e7dc;
  padding-top: 22px;
}

.day-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.day-chip {
  border: 1px solid #e6ded4;
  background: #fff;
  border-radius: 999px;
  padding: 10px 18px;
  font: inherit;
  font-weight: 600;
  color: #251d17;
  cursor: pointer;
}

.day-chip--active {
  border-color: #ff724c;
  background: #ff724c;
  color: #fff;
}

.recipes-list {
  margin-top: 22px;
  display: grid;
  gap: 12px;
}

.recipe-row {
  display: grid;
  grid-template-columns: 130px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 18px;
  background: #faf6f0;
}

.recipe-row__slot {
  font-weight: 700;
  color: #ff724c;
}

.recipe-row__title {
  color: #251d17;
  font-weight: 600;
}

.recipe-row__action {
  justify-self: end;
  min-width: 118px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid #ff724c;
  color: #ff724c;
  background: #fff;
}

.recipe-row__action:hover {
  background: #ff724c;
  color: #fff;
}

.empty-plan,
.empty-state p {
  color: #6d6359;
}

.empty-state {
  text-align: center;
  display: grid;
  gap: 14px;
  justify-items: center;
  padding: 34px 24px 38px;
}

.empty-state h3 {
  margin: 0;
  color: #1f1711;
}

.message {
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 14px;
}

.message--error {
  background: #fff0f0;
  color: #a33b3b;
}

@media (max-width: 720px) {
  .container {
    margin-top: -110px;
    width: min(1200px, calc(100vw - 16px));
  }

  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .content-card {
    padding: 22px;
  }

  .back-link {
    margin-bottom: 20px;
  }

  .plan-summary,
  .plan-card__body {
    padding-left: 18px;
    padding-right: 18px;
  }

  .plan-summary {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .plan-summary__actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .recipe-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .recipe-row__action {
    justify-self: start;
  }
}

@media (max-width: 520px) {
  .container {
    margin-top: -124px;
    width: min(1200px, calc(100vw - 12px));
  }

  .content-card {
    border-radius: 24px;
    padding: 18px 14px 20px;
  }

  .page-head {
    margin-bottom: 18px;
    gap: 16px;
  }

  .page-head h2 {
    font-size: 2rem;
    line-height: 1.15;
  }

  .plan-grid {
    gap: 14px;
  }

  .plan-card {
    border-radius: 22px;
    overflow: hidden;
  }

  .plan-summary,
  .plan-card__body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .plan-summary {
    gap: 14px;
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .plan-summary__content {
    width: 100%;
  }

  .plan-summary__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr)) 40px;
    gap: 10px;
    width: 100%;
  }

  .plan-summary__edit,
  .plan-summary__delete {
    min-width: 0;
    width: 100%;
  }

  .plan-summary__icon {
    width: 40px;
    height: 40px;
    justify-self: end;
  }

  :deep(.hero .coverEditor) {
    top: 88px;
    bottom: auto;
    right: 14px;
  }
}
</style>
