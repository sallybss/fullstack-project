<template>
  <div class="auth" :style="{ backgroundImage: `url(${bg})` }">
    <div class="auth__overlay"></div>

    <div class="auth__panel">
      <h1 class="auth__title">Reset Password</h1>
      <p class="auth__subtitle">Choose a new password for your FoodFinder account.</p>

      <form class="auth__form" @submit.prevent="onSubmit">
        <label class="auth__label">
          New password
          <input
            v-model="password"
            class="auth__input"
            :type="showPasswords ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="new-password"
            minlength="6"
            maxlength="72"
            required
          />
        </label>

        <label class="auth__label">
          Confirm password
          <input
            v-model="confirmPassword"
            class="auth__input"
            :type="showPasswords ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="new-password"
            minlength="6"
            maxlength="72"
            required
          />
        </label>

        <label class="auth__toggle">
          <input v-model="showPasswords" type="checkbox" />
          <span>Show password</span>
        </label>

        <p v-if="localError" class="auth__message auth__message--error">
          {{ localError }}
        </p>

        <p v-if="error" class="auth__message auth__message--error">
          {{ error }}
        </p>

        <p v-if="successMessage" class="auth__message auth__message--success">
          {{ successMessage }}
        </p>

        <BaseButton type="submit" variant="primary">Reset password</BaseButton>

        <p class="auth__footer">
          Remembered it?
          <RouterLink class="auth__link" to="/signin">Back to Sign In</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseButton from "../../components/common/BaseButton.vue";
import bg from "../../assets/images/auth_bg.jpg";
import { useUser } from "../../modules/auth/useUser";

const route = useRoute();
const router = useRouter();
const { resetPasswordWithToken, error } = useUser();

const password = ref("");
const confirmPassword = ref("");
const showPasswords = ref(false);
const localError = ref("");
const successMessage = ref("");

const token = computed(() => String(route.query.token || ""));

async function onSubmit() {
  localError.value = "";
  successMessage.value = "";

  if (!token.value) {
    localError.value = "Reset link is missing or invalid.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    localError.value = "Passwords do not match.";
    return;
  }

  const success = await resetPasswordWithToken(token.value, password.value);
  if (!success) return;

  successMessage.value = "Password updated. Redirecting to Sign In...";
  password.value = "";
  confirmPassword.value = "";

  window.setTimeout(() => {
    router.push("/signin");
  }, 1200);
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
</style>
