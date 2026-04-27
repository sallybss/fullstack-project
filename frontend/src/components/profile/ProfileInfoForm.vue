<script setup lang="ts">
import BaseButton from "../common/BaseButton.vue";

defineProps<{
  fullName: string;
  email: string;
  description: string;
  message: string;
  error?: string | null;
}>();

const emit = defineEmits<{
  "update:fullName": [value: string];
  "update:email": [value: string];
  "update:description": [value: string];
  save: [];
  cancel: [];
}>();
</script>

<template>
  <section class="sectionCard sectionCard--plain">
    <div class="sectionHead">
      <div>
        <h2 class="sectionTitle">Personal Information</h2>
        <p class="sectionSub">Update your public profile and login email.</p>
      </div>
    </div>

    <slot />

    <div class="formGrid">
      <div class="field">
        <div class="fieldHead">
          <label>Full name</label>
          <span class="counter">{{ fullName.length }}/100</span>
        </div>
        <input
          :value="fullName"
          maxlength="100"
          type="text"
          @input="emit('update:fullName', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="field">
        <div class="fieldHead">
          <label>Email address</label>
          <span class="counter">{{ email.length }}/255</span>
        </div>
        <input
          :value="email"
          maxlength="255"
          type="email"
          @input="emit('update:email', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="field field--full">
        <div class="fieldHead">
          <label>Bio</label>
          <span class="counter">{{ description.length }}/300</span>
        </div>
        <textarea
          :value="description"
          maxlength="300"
          @input="emit('update:description', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </div>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="actions">
      <BaseButton variant="outline" type="button" @click="emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton variant="primary" type="button" @click="emit('save')">
        Save
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.sectionCard {
  margin-top: 28px;
}

.sectionCard--plain {
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 0;
}

.sectionHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
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

.formGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.field {
  display: grid;
  gap: 8px;
}

.fieldHead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.field--full {
  grid-column: 1 / -1;
}

label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #7a6756;
}

.counter {
  font-size: 12px;
  color: #a89d95;
}

input,
textarea {
  width: 100%;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  color: #241d18;
  font: inherit;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: rgba(255, 114, 76, 0.58);
  box-shadow: 0 0 0 4px rgba(255, 114, 76, 0.12);
}

textarea {
  min-height: 150px;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
}

.success,
.error {
  margin: 18px 0 0;
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
}

.success {
  background: rgba(60, 133, 80, 0.09);
  border: 1px solid rgba(60, 133, 80, 0.16);
  color: #25633a;
}

.error {
  background: rgba(196, 56, 44, 0.08);
  border: 1px solid rgba(196, 56, 44, 0.14);
  color: #a6342a;
}

@media (max-width: 900px) {
  .formGrid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
