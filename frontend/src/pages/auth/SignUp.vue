<template>
  <div class="auth" :style="{ backgroundImage: `url(${bg})` }">
    <div class="auth__overlay"></div>

    <div class="auth__panel">
      <h1 class="auth__title">Sign Up</h1>
      <p class="auth__subtitle">Create your FoodFinder account.</p>

      <form class="auth__form" @submit.prevent="onSubmit">
        <label class="auth__label">
          Name
          <input
            v-model="name"            
            class="auth__input"
            type="text"
            placeholder="Your name"
            autocomplete="name"
            required
          />
        </label>

        <label class="auth__label">
          Email
          <input
            v-model="email"
            class="auth__input"
            type="email"
            placeholder="you@email.com"
            autocomplete="email"
            required
          />
        </label>

        <label class="auth__label">
          Password
          <input
            v-model="password"
            class="auth__input"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </label>

        <label class="auth__label">
          Confirm password
          <input
            v-model="confirmPassword"
            class="auth__input"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </label>

        <p v-if="localError" class="auth__message auth__message--error">
          {{ localError }}
        </p>

        <p v-if="error" class="auth__message auth__message--error">
          {{ error }}
        </p>

        <BaseButton type="submit" variant="primary">
          Create account
        </BaseButton>

        <p class="auth__footer">
          Already have an account?
          <RouterLink class="auth__link" to="/signin">Sign In</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "../../components/common/BaseButton.vue";
import bg from "../../assets/images/auth_bg.jpg";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();
const { registerUser, fetchToken, error, isLoggedIn, name, email, password, resetForm } = useUser();

const confirmPassword = ref("");
const localError = ref("");

async function onSubmit() {
  localError.value = "";

  if (password.value !== confirmPassword.value) {
    localError.value = "Passwords do not match.";
    return;
  }

  await registerUser();

  if (!error.value) {
    await fetchToken();

    if (isLoggedIn.value) {
      confirmPassword.value = "";
      resetForm();
      router.push("/");
    }
  }
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
}

.auth__message--error {
  color: #ff8f8f;
}
</style>