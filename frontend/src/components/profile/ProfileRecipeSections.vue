<script setup lang="ts">
import RecipeCard from "../recipes/RecipeCard.vue";
import PaginationBar from "../common/PaginationBar.vue";
import type { Recipe } from "../../interfaces/recipe";

defineProps<{
  activeSection: "posts" | "saved";
  activePage: number;
  pageSize: number;
  activeTotal: number;
  pagedRecipes: Recipe[];
  pagedSavedRecipes: Recipe[];
  canAdminDeleteRecipes: boolean;
}>();

const emit = defineEmits<{
  "update:activeSection": [value: "posts" | "saved"];
  "update:activePage": [value: number];
  authRequired: [];
  toggleSave: [recipeId: string];
  deleteRecipe: [recipeId: string];
}>();
</script>

<template>
  <section class="section">
    <div class="content-tabs">
      <button
        class="content-tab"
        :class="{ 'content-tab--active': activeSection === 'posts' }"
        type="button"
        @click="emit('update:activeSection', 'posts')"
      >
        Posts
      </button>
      <button
        class="content-tab"
        :class="{ 'content-tab--active': activeSection === 'saved' }"
        type="button"
        @click="emit('update:activeSection', 'saved')"
      >
        Saved
      </button>
    </div>

    <div
      v-if="activeSection === 'posts' && pagedRecipes.length === 0"
      class="empty-state"
    >
      <h2>No recipes yet</h2>
      <p>This user has not published any recipes yet.</p>
    </div>

    <div
      v-else-if="activeSection === 'saved' && pagedSavedRecipes.length === 0"
      class="empty-state"
    >
      <h2>No saved recipes yet</h2>
      <p>This user has not saved any recipes yet.</p>
    </div>

    <div v-else class="grid">
      <RecipeCard
        v-for="recipe in activeSection === 'posts' ? pagedRecipes : pagedSavedRecipes"
        :key="recipe._id"
        :recipe="recipe"
        :show-delete="canAdminDeleteRecipes"
        :onAuthRequired="() => emit('authRequired')"
        :onSaveClick="(recipeId) => emit('toggleSave', recipeId)"
        :onDelete="(recipeId) => emit('deleteRecipe', recipeId)"
      />
    </div>

    <div class="pager" v-if="activeTotal > pageSize">
      <PaginationBar
        :page="activePage"
        :pageSize="pageSize"
        :total="activeTotal"
        @update:page="emit('update:activePage', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.section {
  margin-top: 18px;
}

.content-tabs {
  display: inline-flex;
  gap: 10px;
  margin-bottom: 16px;
}

.content-tab {
  border: 1px solid rgba(255, 114, 76, 0.24);
  background: white;
  color: #555;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
}

.content-tab--active {
  background: #ff724c;
  border-color: #ff724c;
  color: white;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.grid > * {
  min-width: 0;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .section {
    margin-top: 20px;
  }

  .content-tabs {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .content-tab {
    width: 100%;
    text-align: center;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 10px;
  }
}
</style>
