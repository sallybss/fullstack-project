<template>
  <section class="hero">
    <div class="hero__overlay"></div>

    <div class="hero__content">
      <p class="hero__text">Explore and share amazing recipes with even more amazing people.</p>

      <div class="hero__search">
        <input
          class="hero__input"
          type="search"
          placeholder="Search"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <button class="hero__btn" type="button" aria-label="Search">
          🔍
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>

<style scoped lang="scss">
.hero {
  position: relative;
  height: 320px;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  overflow: hidden;

  background: url('@/assets/images/hero.jpg') center/cover no-repeat;
}
.hero__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.55);
}
.hero__content {
  position: relative;
  z-index: 1;
  height: 100%;
  width: min(900px, 92vw);
  margin: 0 auto;
  display: grid;
  place-content: center;
  gap: 14px;
  color: white;
}
.hero__text { margin: 0; opacity: .85; }

.hero__search {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 999px;
  overflow: hidden;
  height: 46px;
}
.hero__input {
  flex: 1;
  border: 0;
  outline: 0;
  padding: 0 18px;
  font-family: inherit;
}
.hero__btn {
  width: 56px;
  height: 46px;
  border: 0;
  background: var(--accent);
  color: white;
  cursor: pointer;
}
</style>