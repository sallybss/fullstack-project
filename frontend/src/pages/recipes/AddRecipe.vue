<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import HeroSection from "../../components/common/HeroSection.vue";
import RecipeForm from "../../components/recipes/RecipeForm.vue";
import type { RecipeFormValues } from "../../components/recipes/RecipeForm.vue";
import { useRecipes } from "../../modules/useRecipes";

const router = useRouter();
const { addRecipe, error } = useRecipes();

const successMessage = ref("");
const isSubmitting = ref(false);

function goBack() {
  router.back();
}

const handleAddRecipe = async (payload: RecipeFormValues) => {
  successMessage.value = "";
  isSubmitting.value = true;

  await addRecipe(payload);

  if (!error.value) {
    successMessage.value = "Recipe created successfully.";

    setTimeout(() => {
      router.push("/");
    }, 700);
  }

  isSubmitting.value = false;
};
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/homehero/1400/700" />

    <main class="container">
      <RecipeForm
        pageTitle="Add recipe"
        submitLabel="Post"
        :serverError="error"
        :loading="isSubmitting"
        :onSubmit="handleAddRecipe"
        :onCancel="goBack"
      />

      <p v-if="successMessage" class="success-message">
        {{ successMessage }}
      </p>
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

.success-message {
  margin-top: 16px;
  color: #2e7d32;
}
</style>
