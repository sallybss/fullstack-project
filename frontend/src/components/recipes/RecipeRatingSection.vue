<script setup lang="ts">
import Rating from "primevue/rating";

defineProps<{
  selectedRating: number;
  feedback: string;
}>();

const emit = defineEmits<{
  "update:selectedRating": [value: number];
  submit: [];
}>();
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h2>Rate this recipe</h2>
      <p v-if="feedback" class="feedback">{{ feedback }}</p>
    </div>

    <div class="box rating-box">
      <Rating
        :model-value="selectedRating"
        :cancel="false"
        @update:model-value="emit('update:selectedRating', $event)"
      />
      <button class="primary-btn" type="button" @click="emit('submit')">
        Submit rating
      </button>
    </div>
  </section>
</template>

<style scoped>
.box {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.section {
  margin-top: 22px;
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.rating-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.primary-btn {
  border: 0;
  cursor: pointer;
  font: inherit;
  padding: 10px 16px;
  border-radius: 999px;
  background: #ff724c;
  color: #fff;
}

.feedback {
  color: #2e7d32;
}

@media (max-width: 640px) {
  .box {
    border-radius: 18px;
  }

  .section__head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
