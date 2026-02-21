<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink to="/" class="brand" aria-label="FoodFinder home">
        <img class="brand__logo" width="700px" src="../../assets/images/foodfinder.svg" alt="" />
      </RouterLink>

      <nav class="nav" aria-label="Main navigation">
        <RouterLink to="/" class="nav__link" active-class="is-active">Home</RouterLink>
        <RouterLink to="/story" class="nav__link" active-class="is-active">Our story</RouterLink>
        <RouterLink to="/contact" class="nav__link" active-class="is-active">Ask us</RouterLink>
      </nav>

      <div class="actions">
        <button class="iconBtn" type="button" aria-label="Saved recipes">
          <i class="pi pi-bookmark"></i>
        </button>

        <button class="iconBtn" type="button" aria-label="Profile">
            <i class="pi pi-user"></i>
        </button>

        <BaseButton variant="outline" class="addBtn">Add recipe</BaseButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue'
</script>

<style scoped lang="scss">

.header {
  position: absolute; 
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 18px 0;
}

.header__inner {
  width: min(1200px, 92vw);
  margin: 0 auto;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

/* Brand */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand__logo {
  width: 200px;
  height: auto;
  display: block;
}

.brand__name {
  color: var(--accent);
  font-weight: 700;
  letter-spacing: 0.2px;
}

/* Nav */
.nav {
  display: flex;
  gap: 28px;
  justify-content: center;
}

.nav__link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.nav__link:hover {
  color: white;
}

.nav__link.is-active {
  color: white;
}

/* Actions */
.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.iconBtn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.iconBtn:hover {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.3);
}

.addBtn {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
}

/* Mobile quick fallback */
@media (max-width: 820px) {
  .nav {
    display: none;
  }
  .header__inner {
    grid-template-columns: 1fr 1fr;
  }
}
</style>