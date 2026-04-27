<script setup lang="ts">
import BaseButton from "../common/BaseButton.vue";

defineProps<{
  email: string;
  error: string;
}>();

const emit = defineEmits<{
  "update:email": [value: string];
  close: [];
  submit: [];
}>();
</script>

<template>
  <div class="authModalOverlay" @click.self="emit('close')">
    <div class="authModal">
      <button
        class="authModal__close"
        type="button"
        aria-label="Close"
        @click="emit('close')"
      >
        <i class="pi pi-times"></i>
      </button>

      <h2 class="authModal__title">Reset password</h2>
      <p class="authModal__text">Enter your email and we'll send you a reset link.</p>

      <form class="authModal__form" @submit.prevent="emit('submit')">
        <label class="field authModal__field">
          <span>Email</span>
          <input
            :value="email"
            maxlength="255"
            type="email"
            autocomplete="email"
            placeholder="you@email.com"
            required
            @input="emit('update:email', ($event.target as HTMLInputElement).value)"
          />
        </label>

        <p v-if="error" class="error authModal__message">
          {{ error }}
        </p>

        <BaseButton variant="primary" type="submit">
          Send reset link
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.authModalOverlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.58);
}

.authModal {
  position: relative;
  width: min(460px, 100%);
  border-radius: 24px;
  padding: 24px;
  background: #1b1512;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
}

.authModal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
}

.authModal__title {
  margin: 0;
  color: #fff;
  font-size: 1.8rem;
}

.authModal__text {
  margin: 10px 0 20px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.5;
}

.authModal__form {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.authModal__field span {
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.authModal__field input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 14px;
  padding: 14px 16px;
  color: #241d18;
  font: inherit;
  background: rgba(255, 255, 255, 0.95);
}

.authModal__message {
  margin: 0;
}

.error {
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  background: rgba(196, 56, 44, 0.08);
  border: 1px solid rgba(196, 56, 44, 0.14);
  color: #a6342a;
}
</style>
