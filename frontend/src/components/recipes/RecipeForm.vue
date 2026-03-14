<script setup lang="ts">
import { ref, watch } from "vue";
import BaseButton from "../common/BaseButton.vue";

type IngredientRow = {
  qty: string;
  measurement: string;
  item: string;
};

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
  }>(),
  {
    serverError: null,
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "submit", payload: RecipeFormValues): void;
  (e: "cancel"): void;
}>();

const title = ref("");
const description = ref("");
const prepTime = ref<number | null>(null);
const cookTime = ref<number | null>(null);
const servings = ref<number | null>(null);
const category = ref("");
const imageUrl = ref("");

const localError = ref("");

const ingredients = ref<IngredientRow[]>([
  { qty: "", measurement: "", item: "" },
]);
const steps = ref<string[]>([""]);

const fileInput = ref<HTMLInputElement | null>(null);
const imageFile = ref<File | null>(null);
const imagePreview = ref("");

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

function addStep() {
  steps.value.push("");
}

function removeStep(index: number) {
  steps.value.splice(index, 1);

  if (steps.value.length === 0) {
    steps.value.push("");
  }
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

function openFilePicker() {
  fileInput.value?.click();
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const allowedTypes = ["image/png", "image/jpeg"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    localError.value = "Only JPG and PNG images are allowed.";
    target.value = "";
    return;
  }

  if (file.size > maxSize) {
    localError.value = "Image must be smaller than 5MB.";
    target.value = "";
    return;
  }

  localError.value = "";
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
}


function removeImage() {
  imagePreview.value = "";
  imageFile.value = null;
  imageUrl.value = "";

  if (fileInput.value) {
    fileInput.value.value = "";
  }
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

  emit("submit", {
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
    <button class="back" type="button" @click="$emit('cancel')">
      ← Go back
    </button>

    <h1 class="title">{{ pageTitle }}</h1>

    <div class="upload-head">
      <span class="section-title">Upload image</span>
      <span class="hint">JPG, PNG (5MB)</span>
    </div>

    <div class="upload-box">
  <input
    ref="fileInput"
    type="file"
    accept=".jpg,.jpeg,.png"
    hidden
    @change="handleImageChange"
  />

  <template v-if="imagePreview">
    <img :src="imagePreview" alt="Recipe preview" class="preview-image" />

    <div class="image-overlay">
      <BaseButton variant="outline" type="button" @click="openFilePicker">
        Change photo
      </BaseButton>

      <button class="remove-image-btn" type="button" @click="removeImage">
        Remove photo
      </button>
    </div>
  </template>

  <template v-else>
    <BaseButton variant="outline" type="button" @click="openFilePicker">
      + Add a photo
    </BaseButton>
  </template>
</div>

    <div v-if="!imagePreview" class="field">
      <label>Image URL</label>
      <input
        v-model="imageUrl"
        type="text"
        placeholder="Paste an image URL (optional)"
      />
    </div>

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

    <div class="row">
      <div class="field">
        <label>Prep time</label>
        <div class="suffix">
          <input v-model.number="prepTime" type="number" min="0" />
          <span>min</span>
        </div>
      </div>

      <div class="field">
        <label>Cook time</label>
        <div class="suffix">
          <input v-model.number="cookTime" type="number" min="0" />
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
              steps.length === 1 ? 'At least one step is required' : 'Remove'
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

    <p v-if="localError" class="message message--error">
      {{ localError }}
    </p>

    <p v-if="serverError" class="message message--error">
      {{ serverError }}
    </p>

    <div class="actions">
      <BaseButton variant="outline" type="button" @click="$emit('cancel')">
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
  overflow: hidden;
  position: relative;
}

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

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 8px;
}

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

.ingredient-row {
  display: grid;
  grid-template-columns: 40px 110px 180px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

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

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.upload-box:hover .image-overlay {
  opacity: 1;
}

.remove-image-btn {
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(3px);
}

.remove-image-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

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
