<template>
  <div class="chips">
    <button
      v-for="c in items"
      :key="c"
      type="button"
      class="chip"
      :class="{ 'chip--active': modelValue === c }"
      @click="$emit('update:modelValue', c)"
    >
      {{ c }}
    </button>

    <button type="button" class="chip chip--icon" aria-label="More categories">+</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: string[]; modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>

<style scoped lang="scss">
.chips { display: flex; gap: 10px; flex-wrap: wrap; }
.chip {
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.15);
  background: white;
  font-size: 12px;
  cursor: pointer;
}
.chip--active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
.chip--icon { width: 34px; padding: 0; }
</style>