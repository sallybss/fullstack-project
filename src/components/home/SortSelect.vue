<template>
  <label class="sort">
    <span class="sort__label">Sort by:</span>
    <select
      class="sort__select"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value as any)"
    >
      <option value="newest">Newest</option>
      <option value="rating">Rating</option>
      <option value="time">Time</option>
    </select>
  </label>
</template>

<script setup lang="ts">
defineProps<{ modelValue: 'newest' | 'rating' | 'time' }>()
defineEmits<{ (e: 'update:modelValue', v: 'newest' | 'rating' | 'time'): void }>()
</script>

<style scoped>
.sort { display: flex; gap: 8px; align-items: center; }
.sort__label { font-size: 12px; opacity: .7; }
.sort__select { border-radius: 10px; padding: 6px 10px; }
</style>