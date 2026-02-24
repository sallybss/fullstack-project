<template>
  <div class="pager" v-if="totalPages > 1">
    <button
      class="pager__btn"
      type="button"
      :disabled="page <= 1"
      @click="$emit('update:page', page - 1)"
      aria-label="Previous page"
    >
      ‹
    </button>

    <button
      v-for="p in pages"
      :key="p"
      class="pager__page"
      type="button"
      :class="{ 'is-active': p === page }"
      @click="$emit('update:page', p)"
    >
      {{ p }}
    </button>

    <button
      class="pager__btn"
      type="button"
      :disabled="page >= totalPages"
      @click="$emit('update:page', page + 1)"
      aria-label="Next page"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
}>()

defineEmits<{ (e: 'update:page', v: number): void }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pages = computed(() => {
  const max = totalPages.value
  const current = props.page
  const windowSize = 5

  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = Math.min(max, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  const arr: number[] = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
})
</script>

<style scoped lang="scss">
.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
}

.pager__btn,
.pager__page {
  height: 32px;
  min-width: 32px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.18);
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: rgba(0,0,0,0.7);
}

.pager__page.is-active {
  border-color: var(--accent);
  background: rgba(255, 114, 76, 0.14);
  color: #111;
}

.pager__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>