<template>
  <div class="page">
    <!-- Your AppHeader stays global (App.vue layout), not inside this page -->

    <!-- HERO image area (later we’ll make it dynamic) -->
<section
  v-if="recipe"
  class="hero"
  :style="{ backgroundImage: `url(${recipe.imageUrl})` }"
>
  <div class="hero-overlay"></div>
</section>
    <main class="container">
  <div v-if="!recipe" class="recipe-card">
    <RouterLink to="/" class="back">← Go back</RouterLink>
    <p style="margin-top: 12px;">Recipe not found.</p>
  </div>

  <template v-else>
    <section class="recipe-card">
      <div class="top-row">
        <RouterLink to="/" class="back">← Go back</RouterLink>
      </div>

      <div class="header">
        <div class="author-row">[Author block here]</div>

        <!-- ✅ dynamic -->
        <h1 class="title">{{ recipe.title }}</h1>

        <!-- ✅ dynamic (simple for now) -->
        <div class="meta-row">
          <span>🕒 {{ recipe.timeMinutes }} min</span>
          <span class="dot">•</span>
          <span>⭐ {{ recipe.rating }} ({{ recipe.ratingCount }})</span>
        </div>

        <p class="description">
          [short recipe description...]
        </p>
      </div>

      <div class="grid-2">
        <div class="box">[Ingredients]</div>
        <div class="box">[Instructions]</div>
      </div>
    </section>

    <section class="section">
      <h2>Comments</h2>
      <div class="box">[Comment editor]</div>
      <div class="box" style="margin-top: 16px;">[Comment item]</div>
    </section>

    <section class="section">
      <h2>Other recipes</h2>
      <div class="other-grid">
        <div class="other-card">[RecipeCard]</div>
        <div class="other-card">[RecipeCard]</div>
        <div class="other-card">[RecipeCard]</div>
        <div class="other-card">[RecipeCard]</div>
      </div>
    </section>
  </template>
</main>

    <!-- Your AppFooter stays global (App.vue layout), not inside this page -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// TEMP: use your mock list for now
import { mockRecipes } from '../data/mockRecipes' // adjust path if different

const route = useRoute()

const recipeId = computed(() => String(route.params.id))

const recipe = computed(() => {
  return mockRecipes.find(r => String(r.id) === recipeId.value)
})
</script>

<style scoped>
.meta-row { display: flex; align-items: center; gap: 10px; color: rgba(0,0,0,0.55); font-size: 13px; }
.dot { opacity: 0.6; }

.page { background: #f6f6fb; min-height: 100vh; }

.hero {
  height: 340px;
  background: url("https://picsum.photos/seed/hero/1400/600") center/cover no-repeat;
  position: relative;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45);
}

.container {
  max-width: 980px;
  margin: -120px auto 80px;
  padding: 0 16px;
}

.recipe-card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
}

.top-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
.back { color: #666; text-decoration: none; }

.title { font-size: 34px; margin: 8px 0 6px; }

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 18px;
}
.box {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.section { margin-top: 22px; }
.other-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .grid-2 { grid-template-columns: 1fr; }
  .other-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>