<template>
  <div class="auth" :style="{ backgroundImage: `url(${bg})` }">
    <div class="auth__overlay"></div>

    <div class="auth__panel">
      <h1 class="auth__title">Sign In</h1>
      <p class="auth__subtitle">Welcome back! Sign in to continue.</p>

      <form class="auth__form" @submit.prevent="onSubmit">
        <label class="auth__label">
          <div class="auth__fieldHead">
            <span>Email</span>
            <span class="auth__counter">{{ email.length }}/255</span>
          </div>
          <input
            v-model="email"
            class="auth__input"
            type="email"
            placeholder="you@email.com"
            autocomplete="email"
            maxlength="255"
            required
          />
        </label>

        <label class="auth__label">
          Password
          <input
            v-model="password"
            class="auth__input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            maxlength="72"
          />
        </label>

        <div class="auth__row">
          <label class="auth__toggle">
            <input v-model="showPassword" type="checkbox" />
            <span>Show password</span>
          </label>

          <button type="button" class="auth__link" @click="onForgotPassword">
            Forget Password?
          </button>
        </div>

        <p v-if="error" class="auth__message auth__message--error">
          {{ error }}
        </p>

        <p v-if="forgotSuccess" class="auth__message auth__message--success">
          {{ forgotSuccess }}
        </p>

        <BaseButton type="submit" variant="primary">Sign In</BaseButton>

        <p class="auth__footer">
          New User?
          <RouterLink class="auth__link" to="/signup">Sign Up</RouterLink>
        </p>
      </form>
    </div>

    <div
      v-if="showForgotPasswordModal"
      class="authModalOverlay"
      @click.self="closeForgotPasswordModal"
    >
      <div class="authModal">
        <button
          class="authModal__close"
          type="button"
          aria-label="Close"
          @click="closeForgotPasswordModal"
        >
          <i class="pi pi-times"></i>
        </button>

        <h2 class="authModal__title">Reset password</h2>
        <p class="authModal__text">Enter your email and we’ll send you a reset link.</p>

        <form class="authModal__form" @submit.prevent="submitForgotPassword">
          <label class="auth__label">
            Email
            <input
              v-model="forgotPasswordEmail"
              class="auth__input"
              type="email"
              placeholder="you@email.com"
              autocomplete="email"
              maxlength="255"
              required
            />
          </label>

        <p v-if="forgotError" class="auth__message auth__message--error">
          {{ forgotError }}
        </p>

          <BaseButton type="submit" variant="primary">Send reset link</BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import bg from "../../assets/images/auth_bg.jpg";
import BaseButton from "../../components/common/BaseButton.vue";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();
const { fetchToken, requestPasswordReset, error, isLoggedIn, email, password, resetForm } = useUser();
const showPassword = ref(false);
const showForgotPasswordModal = ref(false);
const forgotPasswordEmail = ref("");
const forgotError = ref("");
const forgotSuccess = ref("");

async function onSubmit() {
  await fetchToken();

  if (isLoggedIn.value) {
    resetForm();
    router.push("/");
  }
}

function onForgotPassword() {
  forgotError.value = "";
  forgotPasswordEmail.value = email.value;
  showForgotPasswordModal.value = true;
}

function closeForgotPasswordModal() {
  showForgotPasswordModal.value = false;
  forgotError.value = "";
}

async function submitForgotPassword() {
  forgotError.value = "";
  forgotSuccess.value = "";

  const result = await requestPasswordReset(forgotPasswordEmail.value);
  if (!result) {
    forgotError.value = error.value || "Failed to send reset email.";
    return;
  }

  forgotSuccess.value = result.message;
  closeForgotPasswordModal();
}
</script>

<style scoped>
.auth {
  min-height: 100vh;
  position: relative;
  background-color: #b36363;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 32px 140px;
}

.auth__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.auth__panel {
  position: relative;
  z-index: 1;
  width: 500px;
  max-width: 100%;
}

.auth__title {
  margin: 0 0 8px;
  font-size: 40px;
  font-weight: 700;
  color: var(--text);
}

.auth__subtitle {
  margin: 0 0 28px;
  color: var(--muted);
  line-height: 1.4;
}

.auth__form {
  display: grid;
  gap: 18px;
}

.auth__label {
  display: grid;
  gap: 8px;
  font-size: 14px;
  color: var(--text);
}

.auth__fieldHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.auth__counter {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.auth__input {
  height: 48px;
  border-radius: 999px;
  border: 1px solid var(--stroke);
  background: rgba(89, 89, 89, 0.25);
  padding: 0 18px;
  color: var(--text);
  outline: none;
}

.auth__input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.auth__input:focus {
  border-color: rgba(255, 255, 255, 0.5);
}

.auth__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: -8px;
}

.auth__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
}

.auth__toggle input {
  margin: 0;
  accent-color: #f08b62;
}

.auth__footer {
  margin: 0;
  color: #ffffff;
  font-size: 14px;
}

.auth__link {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
}

.auth__message {
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid transparent;
}

.auth__message--error {
  color: #ffd2c8;
  background: rgba(196, 84, 63, 0.16);
  border-color: rgba(255, 143, 143, 0.24);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.auth__message--success {
  color: #f6efe7;
  background: rgba(58, 120, 88, 0.22);
  border-color: rgba(127, 190, 155, 0.3);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.authModalOverlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.62);
}

.authModal {
  position: relative;
  width: min(460px, 100%);
  border-radius: 24px;
  padding: 24px;
  background: #16120f;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
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
  font-size: 1.8rem;
  color: #fff;
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
</style>
