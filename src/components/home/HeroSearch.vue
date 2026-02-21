<template>
  <section class="hero">
    <div class="hero__overlay"></div>

    <div class="hero__content">
      <p class="hero__text">
        Explore and share amazing recipes with even more amazing people.
      </p>

      <div class="hero__search" role="search">
        <input
          class="hero__input"
          type="search"
          placeholder="Search"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />

        <button class="hero__btn" type="button" aria-label="Search">
          <i class="pi pi-search"></i>
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
  height: 450px;
  border-bottom-left-radius: 44px;
  border-bottom-right-radius: 44px;
  overflow: hidden;

  background-image: url('../../assets/images/hero.jpg');
  background-size: cover;
  background-position: bottom;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
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
  text-align: center;
}

.hero__text {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.hero__search {
  display: flex;
  align-items: center;

  height: 46px;
  border-radius: 999px;
  overflow: hidden;

  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.18);
}

.hero__input {
  flex: 1;
  height: 100%;
  border: 0;
  outline: 0;
  padding: 0 18px;

  font: inherit;
  font-size: 14px;
}

.hero__btn {
  width: 56px;
  height: 100%;
  border: 0;
  background: var(--accent);
  color: white;
  cursor: pointer;

  display: grid;
  place-items: center;
}

.hero__btn:hover {
  filter: brightness(0.92);
}

/* icon size */
.hero__btn .pi {
  font-size: 16px;
}

@media (max-width: 520px) {
  .hero {
    height: 280px;
  }
  .hero__search {
    height: 44px;
  }
  .hero__btn {
    width: 52px;
  }
}
</style>