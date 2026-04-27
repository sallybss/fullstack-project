<script setup lang="ts">
import BaseButton from "../common/BaseButton.vue";

defineProps<{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPasswords: boolean;
  message: string;
  error: string;
}>();

const emit = defineEmits<{
  "update:currentPassword": [value: string];
  "update:newPassword": [value: string];
  "update:confirmPassword": [value: string];
  "update:showPasswords": [value: boolean];
  submit: [];
  cancel: [];
  forgotPassword: [];
}>();
</script>

<template>
  <section class="card sectionCardOuter">
    <div class="sectionHead">
      <div>
        <h2 class="sectionTitle">Change password</h2>
        <p class="sectionSub">Use a strong password with at least 6 characters.</p>
      </div>
    </div>

    <div class="formGrid">
      <div class="field field--full">
        <label>Current password</label>
        <input
          :value="currentPassword"
          maxlength="72"
          :type="showPasswords ? 'text' : 'password'"
          @input="emit('update:currentPassword', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="field field--full">
        <label>New password</label>
        <input
          :value="newPassword"
          maxlength="72"
          :type="showPasswords ? 'text' : 'password'"
          @input="emit('update:newPassword', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="field field--full">
        <label>Confirm new password</label>
        <input
          :value="confirmPassword"
          maxlength="72"
          :type="showPasswords ? 'text' : 'password'"
          @input="emit('update:confirmPassword', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="actions actions--split">
      <label class="passwordToggle">
        <input
          :checked="showPasswords"
          type="checkbox"
          @change="emit('update:showPasswords', ($event.target as HTMLInputElement).checked)"
        />
        <span>Show password</span>
      </label>

      <button class="forgotPasswordLink" type="button" @click="emit('forgotPassword')">
        Forgot password?
      </button>

      <BaseButton variant="outline" type="button" @click="emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton variant="primary" type="button" @click="emit('submit')">
        Update
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

input {
  width: 100%;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  color: #241d18;
  font: inherit;
}

input:focus {
  outline: none;
  border-color: rgba(255, 114, 76, 0.58);
  box-shadow: 0 0 0 4px rgba(255, 114, 76, 0.12);
}

.passwordToggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  margin-right: auto;
  color: #7a6d61;
  font-size: 14px;
  font-weight: 500;
  text-transform: none;
  cursor: pointer;
}

.passwordToggle input {
  width: auto;
  margin: 0;
  accent-color: #f08b62;
  box-shadow: none;
}

.forgotPasswordLink {
  border: 0;
  background: transparent;
  color: #ff724c;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
}

.actions--split {
  align-items: center;
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

  .actions,
  .actions--split {
    flex-direction: column;
    align-items: stretch;
  }

  .passwordToggle {
    margin-right: 0;
  }

  .forgotPasswordLink {
    text-align: left;
  }
}
</style>
