<script setup lang="ts">
import BaseButton from "../common/BaseButton.vue";

const emit = defineEmits<{
  delete: [];
}>();
</script>

<template>
  <section class="card sectionCardOuter">
    <div class="sectionHead deleteHead">
      <div>
        <h2 class="sectionTitle">Delete account</h2>
        <p class="sectionSub">
          Permanently delete your account and your own recipes.
        </p>
      </div>

      <BaseButton variant="primary" type="button" class="dangerBtn" @click="emit('delete')">
        Delete
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 28px;
  padding: 22px;
}

.sectionCardOuter {
  padding: 24px;
}

.sectionHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.deleteHead {
  align-items: center;
  margin-bottom: 0;
}

.sectionTitle {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.1;
  color: #1f1a16;
}

.sectionSub {
  margin: 8px 0 0;
  color: #7a6d61;
  line-height: 1.5;
  font-size: 14px;
}

.dangerBtn {
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .deleteHead {
    flex-direction: column;
    align-items: stretch;
  }

  .dangerBtn {
    width: 100%;
  }
}
</style>
