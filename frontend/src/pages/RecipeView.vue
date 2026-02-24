<template>
  <div class="page">
    <HeroSection v-if="recipe" :imageUrl="recipe.imageUrl"></HeroSection>

    <main class="container">
      <div v-if="!recipe" class="recipe-card">
        <RouterLink to="/" class="back">← Go back</RouterLink>
        <p style="margin-top: 12px">Recipe not found.</p>
      </div>

      <template v-else>
<RecipeDetails
  :recipe="recipe"
  @back="goBack"
  @toggle-save="toggleSave"
/>
        <section class="section">
          <h2>Comments</h2>
          <div class="box">[Comment editor]</div>
          <div class="box" style="margin-top: 16px">[Comment item]</div>
        </section>

        <section class="section">
          <h2>Other recipes</h2>
          <div class="other-grid">
            <RecipeCard
              v-for="r in otherRecipes"
              :key="r.id"
              :recipe="r"
              @toggle-save="() => {}"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import { mockRecipes } from "../data/mockRecipes"
import type { Recipe } from "../types/recipe"

import RecipeDetails from "../components/recipes/RecipeDetails.vue"
import HeroSection from "../components/common/HeroSection.vue"
import RecipeCard from "../components/recipes/RecipeCard.vue"

/**
 * Helpers
 * Build fake recipes until API is ready
 */
function buildDemoRecipes(times = 10): Recipe[] {
  const result: Recipe[] = []

  for (let t = 0; t < times; t++) {
    for (const r of mockRecipes) {
      result.push({
        ...r,
        id: `${r.id}-${t}`,               
        title: `${r.title} ${t + 1}`,    
        createdAt: r.createdAt - t * 86400000,
      })
    }
  }

  return result
}

const allRecipes = ref<Recipe[]>(buildDemoRecipes(10))

const route = useRoute()
const router = useRouter()

function goBack() {
  router.back()
}

const recipeId = computed(() => String(route.params.id))

const recipe = computed(() =>
  allRecipes.value.find((r) => r.id.startsWith(recipeId.value))
)

const otherRecipes = computed(() =>
  allRecipes.value
    .filter((r) => !r.id.startsWith(recipeId.value))
    .slice(0, 4)
)

function toggleSave(id: string) {
  const r = allRecipes.value.find((x) => x.id === id)
  if (r) r.saved = !r.saved
}
</script>

<style scoped>
.page {
  background: #f6f6fb;
  min-height: 100vh;
}

.container {
  max-width: 980px;
  margin: -180px auto 0px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

/* Recipe not found card */
.recipe-card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.back {
  color: #666;
  text-decoration: none;
}

.box {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.section {
  margin-top: 22px;
}
.other-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  align-items: start;
}

@media (max-width: 900px) {
  .other-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
