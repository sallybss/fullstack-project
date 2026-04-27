<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  category: string;
  categoryOptions: string[];
}>();

const emit = defineEmits<{
  "update:title": [value: string];
  "update:description": [value: string];
  "update:prepTime": [value: number | null];
  "update:cookTime": [value: number | null];
  "update:servings": [value: number | null];
  "update:category": [value: string];
}>();

function readNumber(event: Event): number | null {
  const value = (event.target as HTMLInputElement).value;
  return value === "" ? null : Number(value);
}
</script>

<template>
  <div class="field">
    <div class="field-head">
      <label>Recipe Title</label>
      <span class="counter">{{ title.length }}/100</span>
    </div>
    <input
      :value="title"
      maxlength="100"
      type="text"
      placeholder="Enter recipe title"
      @input="emit('update:title', ($event.target as HTMLInputElement).value)"
    />
  </div>

  <div class="field">
    <div class="field-head">
      <label>Description <span class="req">*</span></label>
      <span class="counter">{{ description.length }}/500</span>
    </div>
    <textarea
      :value="description"
      maxlength="500"
      placeholder="Describe your recipe..."
      @input="emit('update:description', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>

  <div class="row">
    <div class="field">
      <label>Prep time</label>
      <div class="suffix">
        <input :value="prepTime" type="number" min="0" @input="emit('update:prepTime', readNumber($event))" />
        <span>min</span>
      </div>
    </div>

    <div class="field">
      <label>Cook time</label>
      <div class="suffix">
        <input :value="cookTime" type="number" min="0" @input="emit('update:cookTime', readNumber($event))" />
        <span>min</span>
      </div>
    </div>

    <div class="field">
      <label>Servings</label>
      <input
        :value="servings"
        type="number"
        min="1"
        placeholder="e.g. 2"
        @input="emit('update:servings', readNumber($event))"
      />
    </div>

    <div class="field">
      <label>Category</label>
      <select :value="category" @change="emit('update:category', ($event.target as HTMLSelectElement).value)">
        <option value="">Select</option>
        <option
          v-for="option in categoryOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
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

@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
