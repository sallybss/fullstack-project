<script setup lang="ts">
import BaseButton from "../common/BaseButton.vue";

defineProps<{
  steps: string[];
}>();

const emit = defineEmits<{
  add: [];
  remove: [index: number];
  update: [index: number, value: string];
}>();
</script>

<template>
  <section class="section">
    <h2>Instructions</h2>
    <p class="sub">
      Break down your recipe into clear, step-by-step instructions.
    </p>

    <div v-for="(step, index) in steps" :key="index" class="step-row">
      <div class="step-head">
        <span class="step-label">Step {{ index + 1 }}</span>

        <button
          class="trash-btn"
          type="button"
          aria-label="Remove step"
          :disabled="steps.length === 1"
          :title="steps.length === 1 ? 'At least one step is required' : 'Remove'"
          @click="emit('remove', index)"
        >
          <i class="pi pi-trash"></i>
        </button>
      </div>

      <textarea
        :value="step"
        maxlength="2000"
        placeholder="Input text"
        @input="emit('update', index, ($event.target as HTMLTextAreaElement).value)"
      />
      <div class="step-counter">{{ step.length }}/2000</div>
    </div>

    <BaseButton variant="outline" type="button" @click="emit('add')">
      Add step
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

.sub {
  margin: -2px 0 12px;
  color: #777;
  font-size: 13px;
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

textarea {
  width: 100%;
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
  background: #fff;
  min-height: 120px;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #ff724c;
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
</style>
