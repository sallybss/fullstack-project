<template>
  <div class="page">
    <AppHeader />

    <main class="page__main">
      <HeroSearch v-model="query" />

      <section class="section">
        <div class="section__top">
          <CategoryChips
            :items="categories"
            v-model="selectedCategory"
          />

          <SortSelect v-model="sortBy" />
        </div>

        <RecipeGrid>
          <RecipeCard
            v-for="r in pagedRecipes"
            :key="r.id"
            :recipe="r"
            @toggle-save="toggleSave"
            @view="viewRecipe"
          />
        </RecipeGrid>

        <PaginationBar
          :page="page"
          :page-size="pageSize"
          :total="filteredRecipes.length"
          @update:page="page = $event"
        />
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'


import AppHeader from '../components/common/AppHeader.vue'
import AppFooter from '../components/common/AppFooter.vue'
import PaginationBar from '../components/common/PaginationBar.vue'

import HeroSearch from '../components/home/HeroSearch.vue'
import CategoryChips from '../components/home/CategoryChips.vue'
import SortSelect from '../components/home/SortSelect.vue'

import RecipeGrid from '../components/recipes/RecipeGrid.vue'
import RecipeCard from '../components/recipes/RecipeCard.vue'

import { mockRecipes } from '../data/mockRecipes'
import type { Recipe } from '../types/recipe'

const query = ref('')
const selectedCategory = ref<string>('Desserts')
const sortBy = ref<'newest' | 'rating' | 'time'>('newest')

const page = ref(1)
const pageSize = 8

const categories = ['Desserts', 'Meat', 'Vegan', 'Vegetarian']

const filteredRecipes = computed(() => {
  const q = query.value.trim().toLowerCase()

  return mockRecipes
    .filter(r => selectedCategory.value ? r.category === selectedCategory.value : true)
    .filter(r => (q ? r.title.toLowerCase().includes(q) : true))
    .slice()
    .sort((a, b) => {
      if (sortBy.value === 'newest') return b.createdAt - a.createdAt
      if (sortBy.value === 'rating') return b.rating - a.rating
      return a.timeMinutes - b.timeMinutes
    })
})

// reset to page 1 whenever user changes filters/search/sort
watch([query, selectedCategory, sortBy], () => { page.value = 1 })

const pagedRecipes = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredRecipes.value.slice(start, start + pageSize)
})

function toggleSave(id: string) {
  const recipe = mockRecipes.find(r => r.id === id)
  if (recipe) recipe.saved = !recipe.saved
}

function viewRecipe(recipe: Recipe) {
  // later: router push to /recipes/:id
  console.log('view', recipe.id)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f5f5f7;
}

.page__main {
  display: grid;
  gap: 28px;
}

.section {
  width: min(1200px, 92vw);
  margin: 0 auto 64px;
}

.section__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 18px 0 18px;
}
</style>