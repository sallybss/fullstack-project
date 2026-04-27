<script setup lang="ts">
import BaseButton from "../common/BaseButton.vue";

export type IngredientRow = {
  qty: string;
  measurement: string;
  item: string;
};

defineProps<{
  ingredients: IngredientRow[];
}>();

const emit = defineEmits<{
  add: [];
  remove: [index: number];
  update: [index: number, field: keyof IngredientRow, value: string];
}>();
</script>

<template>
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
        :disabled="ingredients.length === 1"
        :title="ingredients.length === 1 ? 'At least one ingredient is required' : 'Remove'"
        @click="emit('remove', index)"
      >
        <i class="pi pi-trash"></i>
      </button>

      <input
        :value="ingredient.qty"
        maxlength="20"
        placeholder="Qty"
        @input="emit('update', index, 'qty', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="ingredient.measurement"
        maxlength="30"
        placeholder="Measurement"
        @input="emit('update', index, 'measurement', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="ingredient.item"
        maxlength="120"
        placeholder="Item"
        @input="emit('update', index, 'item', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <BaseButton variant="outline" type="button" @click="emit('add')">
      Add ingredient
    </BaseButton>
  </section>
</template>

<style scoped>
.section {
  margin-top: 22px;
}

.section h2 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
}

.ingredient-row {
  display: grid;
  grid-template-columns: 40px 110px 180px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

input {
  width: 100%;
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
  background: #fff;
}

input:focus {
  outline: none;
  border-color: #ff724c;
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

@media (max-width: 900px) {
  .ingredient-row {
    grid-template-columns: 40px 1fr;
  }

  .ingredient-row input {
    grid-column: 2 / -1;
  }
}
</style>
