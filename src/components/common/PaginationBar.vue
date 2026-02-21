<template>
  <div class="pager" v-if="pageCount > 1">
    <button class="pager__btn" :disabled="page <= 1" @click="$emit('update:page', page - 1)">‹</button>

    <button
      v-for="p in visiblePages"
      :key="p"
      class="pager__page"
      :class="{ 'is-active': p === page }"
      @click="$emit('update:page', p)"
    >
      {{ p }}
    </button>

    <button class="pager__btn" :disabled="page >= pageCount" @click="$emit('update:page', page + 1)">›</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ page: number; pageSize: number; total: number }>()
defineEmits<{ (e: 'update:page', v: number): void }>()

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))

const visiblePages = computed(() => {
  const total = pageCount.value
  const current = props.page
  const start = Math.max(1, current - 1)
  const end = Math.min(total, start + 2)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<style scoped>
.pager { display: flex; justify-content: center; gap: 10px; margin-top: 28px; }
.pager__btn, .pager__page {
  width: 34px; height: 34px; border-radius: 999px;
  border: 1px solid rgba(0,0,0,.12); background: white; cursor: pointer;
}
.pager__page.is-active { background: rgba(255,114,76,.15); border-color: rgba(255,114,76,.3); }
.pager__btn:disabled { opacity: .4; cursor: not-allowed; }
</style>