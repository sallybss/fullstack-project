<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import HeroSection from "../../components/common/HeroSection.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import { useRecipes } from "../../modules/useRecipes";

const router = useRouter();
const { addRecipe, error } = useRecipes();

// Form state
const title = ref("");
const description = ref("");
const prepTime = ref<number | null>(null);
const cookTime = ref<number | null>(null);
const servings = ref<number | null>(null);
const category = ref("");
const imageUrl = ref("");

// Local UI feedback
const localError = ref("");
const successMessage = ref("");

// Dynamic rows
const ingredients = ref([{ qty: "", measurement: "", item: "" }]);
const steps = ref([""]);

// Navigation
function goBack() {
  router.back();
}

// Ingredient actions
function addIngredient() {
  ingredients.value.push({ qty: "", measurement: "", item: "" });
}

function removeIngredient(index: number) {
  ingredients.value.splice(index, 1);

  if (ingredients.value.length === 0) {
    ingredients.value.push({ qty: "", measurement: "", item: "" });
  }
}

// Step actions
function addStep() {
  steps.value.push("");
}

function removeStep(index: number) {
  steps.value.splice(index, 1);

  if (steps.value.length === 0) {
    steps.value.push("");
  }
}

/**
 * Backend expects ingredients as string[]
 * Example: "2 tbsp sugar"
 */
function buildIngredientList(): string[] {
  return ingredients.value
    .map((ingredient) =>
      [ingredient.qty, ingredient.measurement, ingredient.item]
        .filter(Boolean)
        .join(" ")
        .trim(),
    )
    .filter(Boolean);
}

async function submitRecipe() {
  localError.value = "";
  successMessage.value = "";

  const finalIngredients = buildIngredientList();
  const finalSteps = steps.value
    .map((step) => step.trim())
    .filter(Boolean);

  if (!title.value.trim()) {
    localError.value = "Recipe title is required.";
    return;
  }

  if (!description.value.trim()) {
    localError.value = "Description is required.";
    return;
  }

  if (cookTime.value === null || cookTime.value < 0) {
    localError.value = "Cook time is required.";
    return;
  }

  if (servings.value === null || servings.value < 1) {
    localError.value = "Servings is required.";
    return;
  }

  if (!category.value.trim()) {
    localError.value = "Category is required.";
    return;
  }

  if (finalIngredients.length === 0) {
    localError.value = "At least one ingredient is required.";
    return;
  }

  if (finalSteps.length === 0) {
    localError.value = "At least one instruction step is required.";
    return;
  }

  await addRecipe({
    title: title.value.trim(),
    description: description.value.trim(),
    ingredients: finalIngredients,
    instructions: finalSteps,
    prepTimeMinutes: prepTime.value ?? 0,
    cookTimeMinutes: cookTime.value,
    servings: servings.value,
    cuisine: category.value,
    isPublic: true,
    imageUrl:
      imageUrl.value.trim() || "https://picsum.photos/seed/recipe/900/600",
  });

  if (!error.value) {
    successMessage.value = "Recipe created successfully.";

    // Small delay so user can see the success state
    setTimeout(() => {
      router.push("/");
    }, 700);
  }
}
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/homehero/1400/700" />

    <main class="container">
      <div class="card">
        <button class="back" type="button" @click="goBack">← Go back</button>

        <h1 class="title">Add recipe</h1>

        <!-- Upload -->
        <div class="upload-head">
          <span class="section-title">Upload image</span>
          <span class="hint">JPG, PNG (5MB)</span>
        </div>

        <div class="upload-box">
          <BaseButton variant="outline" type="button">+ Add a photo</BaseButton>
        </div>

        <!-- Optional image URL -->
        <div class="field">
          <label>Image URL</label>
          <input
            v-model="imageUrl"
            type="text"
            placeholder="Paste an image URL (optional)"
          />
        </div>

        <!-- Recipe title -->
        <div class="field">
          <div class="field-head">
            <label>Recipe Title</label>
            <span class="counter">{{ title.length }}/100</span>
          </div>
          <input
            v-model="title"
            maxlength="100"
            type="text"
            placeholder="Enter recipe title"
          />
        </div>

        <!-- Description -->
        <div class="field">
          <div class="field-head">
            <label>Description <span class="req">*</span></label>
            <span class="counter">{{ description.length }}/500</span>
          </div>
          <textarea
            v-model="description"
            maxlength="500"
            placeholder="Describe your recipe..."
          />
        </div>

        <!-- Times / servings / category -->
        <div class="row">
          <div class="field">
            <label>Prep time</label>
            <div class="suffix">
              <input
                v-model.number="prepTime"
                type="number"
                min="0"
                placeholder=""
              />
              <span>min</span>
            </div>
          </div>

          <div class="field">
            <label>Cook time</label>
            <div class="suffix">
              <input
                v-model.number="cookTime"
                type="number"
                min="0"
                placeholder=""
              />
              <span>min</span>
            </div>
          </div>

          <div class="field">
            <label>Servings</label>
            <input
              v-model.number="servings"
              type="number"
              min="1"
              placeholder="e.g. 2"
            />
          </div>

          <div class="field">
            <label>Category</label>
            <select v-model="category">
              <option value="">Select</option>
              <option>Italian</option>
              <option>Dessert</option>
              <option>Lunch</option>
              <option>Dinner</option>
            </select>
          </div>
        </div>

        <!-- Ingredients -->
        <section class="section">
          <h2>Ingredients</h2>

          <div
            v-for="(ingredient, index) in ingredients"
            :key="index"
            class="ingredient-row"
          >
            <button
              class="trash-btn"
              type="button"
              aria-label="Remove ingredient"
              @click="removeIngredient(index)"
              :disabled="ingredients.length === 1"
              :title="
                ingredients.length === 1
                  ? 'At least one ingredient is required'
                  : 'Remove'
              "
            >
              <i class="pi pi-trash"></i>
            </button>

            <input v-model="ingredient.qty" placeholder="Qty" />
            <input v-model="ingredient.measurement" placeholder="Measurement" />
            <input v-model="ingredient.item" placeholder="Item" />
          </div>

          <BaseButton variant="outline" type="button" @click="addIngredient">
            Add ingredient
          </BaseButton>
        </section>

        <!-- Instructions -->
        <section class="section">
          <h2>Instructions</h2>
          <p class="sub">
            Break down your recipe into clear, step-by-step instructions.
          </p>

          <div v-for="(_, index) in steps" :key="index" class="step-row">
            <div class="step-head">
              <span class="step-label">Step {{ index + 1 }}</span>

              <button
                class="trash-btn"
                type="button"
                aria-label="Remove step"
                @click="removeStep(index)"
                :disabled="steps.length === 1"
                :title="
                  steps.length === 1
                    ? 'At least one step is required'
                    : 'Remove'
                "
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>

            <textarea
              v-model="steps[index]"
              maxlength="2000"
              placeholder="Input text"
            />
            <div class="step-counter">{{ steps[index].length }}/2000</div>
          </div>

          <BaseButton variant="outline" type="button" @click="addStep">
            Add step
          </BaseButton>
        </section>

        <!-- Feedback -->
        <p v-if="localError" style="color: #d9534f; margin-top: 16px;">
          {{ localError }}
        </p>

        <p v-if="error" style="color: #d9534f; margin-top: 16px;">
          {{ error }}
        </p>

        <p v-if="successMessage" style="color: #2e7d32; margin-top: 16px;">
          {{ successMessage }}
        </p>

        <!-- Actions -->
        <div class="actions">
          <BaseButton variant="outline" type="button" @click="goBack">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" type="button" @click="submitRecipe">
            Post
          </BaseButton>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Matches RecipeView layout */
.page {
  background: #f6f6fb;
  min-height: 100vh;
}

.container {
  max-width: 980px;
  margin: -180px auto 60px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

/* Main card */
.card {
  background: #fff;
  border-radius: 28px;
  padding: 28px 28px 36px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

/* Back */
.back {
  border: 0;
  background: transparent;
  color: #666;
  padding: 6px 0;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Title */
.title {
  margin: 12px 0 18px;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* Upload */
.upload-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  margin-bottom: 12px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #222;
}

.hint {
  font-size: 12px;
  color: #9a9a9a;
}

.upload-box {
  height: 140px;
  border-radius: 16px;
  border: 2px dashed #ff724c;
  background: rgba(255, 114, 76, 0.08);
  display: grid;
  place-items: center;
  margin-bottom: 22px;
}

/* Fields */
.field {
  margin-top: 16px;
}

.field-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

label {
  display: inline-block;
  font-weight: 600;
  font-size: 14px;
  color: #222;
}

.req {
  color: #ff724c;
}

.counter {
  font-size: 12px;
  color: #a0a0a0;
}

input,
textarea,
select {
  width: 100%;
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
  background: #fff;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #ff724c;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

/* Cook time suffix */
.suffix {
  position: relative;
}

.suffix input {
  padding-right: 46px;
}

.suffix span {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9a9a9a;
  font-size: 12px;
}

/* Row layout */
.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 8px;
}

/* Sections */
.section {
  margin-top: 22px;
}

.section h2 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
}

.sub {
  margin: -2px 0 12px;
  color: #777;
  font-size: 13px;
}

/* Ingredient rows with trash button */
.ingredient-row {
  display: grid;
  grid-template-columns: 40px 110px 180px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

/* Steps */
.step-row {
  margin-top: 14px;
}

.step-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.step-label {
  font-weight: 600;
  font-size: 13px;
  color: #222;
}

.step-counter {
  text-align: right;
  margin-top: 6px;
  font-size: 12px;
  color: #a0a0a0;
}

/* Trash icon button */
.trash-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #fff1ec;
  color: #ff724c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s ease;
}

.trash-btn:hover {
  background: #ffe3d9;
}

.trash-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Actions */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 28px;
}

/* Responsive */
@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr;
  }

  .ingredient-row {
    grid-template-columns: 40px 1fr;
  }

  .ingredient-row input {
    grid-column: 2 / -1;
  }

  .card {
    padding: 22px;
  }

  .title {
    font-size: 28px;
  }
}
</style>
