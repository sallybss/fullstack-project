<template>
  <div class="sort" ref="root">
    <span class="sort__label">Sort by:</span>

    <button class="sort__btn" type="button" @click="open = !open">
      {{ label }}
      <i class="pi pi-chevron-down" />
    </button>

    <div v-if="open" class="sort__menu">
      <button
        v-for="o in options"
        :key="o.value"
        class="sort__item"
        :class="{ 'is-active': o.value === modelValue }"
        type="button"
        @click="select(o.value)"
      >
        {{ o.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type SortValue = 'newest' | 'rating' | 'time'

const props = defineProps<{ modelValue: SortValue }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: SortValue): void }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const options: { label: string; value: SortValue }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Highest rating', value: 'rating' },
  { label: 'Shortest time', value: 'time' }
]

const label = computed(() => options.find(o => o.value === props.modelValue)?.label ?? 'Newest')

function select(v: SortValue) {
  emit('update:modelValue', v)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (!root.value) return
  if (!root.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped lang="scss">
.sort { position: relative; display: inline-flex; align-items: center; gap: 10px; }
.sort__label { font-size: 12px; color: rgba(0,0,0,.55); }

.sort__btn {
  height: 32px;
  min-width: 130px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.2);
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
}

.sort__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 160px;
  background: #fff;
  border: 1px solid rgba(0,0,0,.14);
  border-radius: 12px;
  box-shadow: 0 14px 40px rgba(0,0,0,.12);
  padding: 6px;
  z-index: 20;
}

.sort__item {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 10px;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
}

.sort__item:hover { background: rgba(0,0,0,.06); }
.sort__item.is-active { background: rgba(255,114,76,.14); }
</style>