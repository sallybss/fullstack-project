<template>
  <div class="hero-search">
    <p class="text">
      Explore and share amazing recipes with even more amazing people.
    </p>

    <div class="search" role="search">
      <input
        class="input"
        type="search"
        placeholder="Search"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <button class="btn" type="button" aria-label="Search">
        <i class="pi pi-search"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>

<style scoped>
.hero-search {
  display: grid;
  gap: 14px;
  text-align: center;
  color: white;
}

.text {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.search {
  display: flex;
  align-items: center;
  height: 46px;
  border-radius: 999px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.18);
}

.input {
  flex: 1;
  height: 100%;
  border: 0;
  outline: 0;
  padding: 0 18px;
  font: inherit;
  font-size: 14px;
}

.btn {
  width: 56px;
  height: 100%;
  border: 0;
  background: var(--accent);
  color: white;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.btn:hover {
  filter: brightness(0.92);
}
</style>