<script setup lang="ts">
import { ref, watch } from "vue";
import BaseButton from "../common/BaseButton.vue";
import RecipeBasicFields from "./RecipeBasicFields.vue";
import RecipeImagePicker from "./RecipeImagePicker.vue";
import RecipeIngredientsEditor, { type IngredientRow } from "./RecipeIngredientsEditor.vue";
import RecipeInstructionsEditor from "./RecipeInstructionsEditor.vue";

export type RecipeFormValues = {
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: string;
  imageUrl?: string;
  imageFile?: File | null;
  ingredients: string[];
  instructions: string[];
  isPublic: boolean;
};

const props = withDefaults(
  defineProps<{
    pageTitle: string;
    submitLabel: string;
    initialValues?: Partial<RecipeFormValues>;
    serverError?: string | null;
    loading?: boolean;
    onSubmit?: (payload: RecipeFormValues) => void | Promise<void>;
    onCancel?: () => void;
  }>(),
  {
    serverError: null,
    loading: false,
  },
);

const title = ref("");
const description = ref("");
const prepTime = ref<number | null>(null);
const cookTime = ref<number | null>(null);
const servings = ref<number | null>(null);
const category = ref("");
const imageUrl = ref("");
const imageFile = ref<File | null>(null);
const imagePreview = ref("");
const localError = ref("");

const ingredients = ref<IngredientRow[]>([{ qty: "", measurement: "", item: "" }]);
const steps = ref<string[]>([""]);

const categoryOptions = ["Breakfast", "Lunch", "Dinner", "Dessert"];

function rowsFromStrings(values?: string[]): IngredientRow[] {
  if (!values || values.length === 0) {
    return [{ qty: "", measurement: "", item: "" }];
  }

  return values.map((value) => ({
    qty: "",
    measurement: "",
    item: value,
  }));
}

function initializeForm() {
  title.value = props.initialValues?.title ?? "";
  description.value = props.initialValues?.description ?? "";
  prepTime.value = props.initialValues?.prepTimeMinutes ?? 0;
  cookTime.value = props.initialValues?.cookTimeMinutes ?? 0;
  servings.value = props.initialValues?.servings ?? 1;
  category.value = props.initialValues?.cuisine ?? "";
  imageUrl.value = props.initialValues?.imageUrl ?? "";
  imageFile.value = props.initialValues?.imageFile ?? null;
  imagePreview.value = imageUrl.value
    ? imageUrl.value.startsWith("http")
      ? imageUrl.value
      : `${import.meta.env.VITE_API_URL}${imageUrl.value}`
    : "";
  ingredients.value = rowsFromStrings(props.initialValues?.ingredients);
  steps.value =
    props.initialValues?.instructions &&
    props.initialValues.instructions.length > 0
      ? [...props.initialValues.instructions]
      : [""];
}

watch(
  () => props.initialValues,
  () => {
    initializeForm();
  },
  { immediate: true, deep: true },
);

function addIngredient() {
  ingredients.value.push({ qty: "", measurement: "", item: "" });
}

function removeIngredient(index: number) {
  ingredients.value.splice(index, 1);

  if (ingredients.value.length === 0) {
    ingredients.value.push({ qty: "", measurement: "", item: "" });
  }
}

function updateIngredient(index: number, field: keyof IngredientRow, value: string) {
  ingredients.value[index] = {
    ...ingredients.value[index],
    [field]: value,
  };
}

function addStep() {
  steps.value.push("");
}

function removeStep(index: number) {
  steps.value.splice(index, 1);

  if (steps.value.length === 0) {
    steps.value.push("");
  }
}

function updateStep(index: number, value: string) {
  steps.value[index] = value;
}

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

function handleSubmit() {
  localError.value = "";

  const finalIngredients = buildIngredientList();
  const finalSteps = steps.value.map((step) => step.trim()).filter(Boolean);

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

  props.onSubmit?.({
    title: title.value.trim(),
    description: description.value.trim(),
    ingredients: finalIngredients,
    instructions: finalSteps,
    prepTimeMinutes: prepTime.value ?? 0,
    cookTimeMinutes: cookTime.value,
    servings: servings.value,
    cuisine: category.value,
    isPublic: true,
    imageUrl: imageUrl.value.trim(),
    imageFile: imageFile.value,
  });
}
</script>

<template>
  <div class="card">
    <button class="back" type="button" @click="props.onCancel?.()">
      ← Go back
    </button>

    <h1 class="title">{{ pageTitle }}</h1>

    <RecipeImagePicker
      v-model:image-url="imageUrl"
      v-model:image-file="imageFile"
      v-model:image-preview="imagePreview"
      @error="localError = $event"
    />

    <RecipeBasicFields
      v-model:title="title"
      v-model:description="description"
      v-model:prep-time="prepTime"
      v-model:cook-time="cookTime"
      v-model:servings="servings"
      v-model:category="category"
      :category-options="categoryOptions"
    />

    <RecipeIngredientsEditor
      :ingredients="ingredients"
      @add="addIngredient"
      @remove="removeIngredient"
      @update="updateIngredient"
    />

    <RecipeInstructionsEditor
      :steps="steps"
      @add="addStep"
      @remove="removeStep"
      @update="updateStep"
    />

    <p v-if="localError" class="message message--error">
      {{ localError }}
    </p>

    <p v-if="serverError" class="message message--error">
      {{ serverError }}
    </p>

    <div class="actions">
      <BaseButton variant="outline" type="button" @click="props.onCancel?.()">
        Cancel
      </BaseButton>

      <BaseButton
        variant="primary"
        type="button"
        :disabled="loading"
        @click="handleSubmit"
      >
        {{ loading ? "Saving..." : submitLabel }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 28px;
  padding: 28px 28px 36px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

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

.title {
  margin: 12px 0 18px;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.message {
  margin-top: 16px;
}

.message--error {
  color: #d9534f;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 28px;
}

@media (max-width: 900px) {
  .card {
    padding: 22px;
  }

  .title {
    font-size: 28px;
  }
}
</style>
