<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import HeroSection from "../../components/common/HeroSection.vue";
import RecipeForm from "../../components/recipes/RecipeForm.vue";
import type { RecipeFormValues } from "../../components/recipes/RecipeForm.vue";
import { useRecipes } from "../../modules/useRecipes";

const route = useRoute();
const router = useRouter();

const { recipes, fetchRecipes, updateRecipe, error } = useRecipes();

const successMessage = ref("");
const isSubmitting = ref(false);
const pageLoading = ref(true);

const recipeId = route.params.id as string;

function goBack() {
  router.back();
}

onMounted(async () => {
  if (recipes.value.length === 0) {
    await fetchRecipes();
  }

  pageLoading.value = false;
});

const recipeToEdit = computed(() =>
  recipes.value.find((recipe) => recipe._id === recipeId)
);

const initialValues = computed<Partial<RecipeFormValues> | undefined>(() => {
  if (!recipeToEdit.value) return undefined;

  return {
    title: recipeToEdit.value.title,
    description: recipeToEdit.value.description,
    prepTimeMinutes: recipeToEdit.value.prepTimeMinutes,
    cookTimeMinutes: recipeToEdit.value.cookTimeMinutes,
    servings: recipeToEdit.value.servings,
    cuisine: recipeToEdit.value.cuisine,
    imageUrl: recipeToEdit.value.imageUrl ?? "",
    ingredients: recipeToEdit.value.ingredients,
    instructions: recipeToEdit.value.instructions,
    isPublic: recipeToEdit.value.isPublic,
  };
});

const handleUpdateRecipe = async (payload: RecipeFormValues) => {
  isSubmitting.value = true;
  successMessage.value = "";

  await updateRecipe(recipeId, payload);

  if (!error.value) {
    successMessage.value = "Recipe updated successfully.";

    setTimeout(() => {
      router.push("/my-profile");
    }, 700);
  }

  isSubmitting.value = false;
};
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/homehero/1400/700" />

    <main class="container">
      <p v-if="pageLoading" class="info">Loading recipe...</p>

      <p v-else-if="!recipeToEdit" class="error-message">
        Recipe not found.
      </p>

      <template v-else>
        <RecipeForm
          pageTitle="Edit recipe"
          submitLabel="Save changes"
          :initialValues="initialValues"
          :serverError="error"
          :loading="isSubmitting"
          :onSubmit="handleUpdateRecipe"
          :onCancel="goBack"
        />

        <p v-if="successMessage" class="success-message">
          {{ successMessage }}
        </p>
      </template>
    </main>
  </div>
</template>

<style scoped>
.page {
  background: #f6f6fb;
  min-height: 100vh;
}

.container {
  max-width: 980px;
  margin: -180px auto 60px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

.info {
  text-align: center;
  color: #666;
  margin-top: 20px;
}

.error-message {
  text-align: center;
  color: #d9534f;
  margin-top: 20px;
}

.success-message {
  margin-top: 16px;
  color: #2e7d32;
}
</style>
