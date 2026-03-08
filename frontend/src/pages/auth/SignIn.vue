<template>
  <div class="auth" :style="{ backgroundImage: `url(${bg})` }">
    <div class="auth__overlay"></div>

    <div class="auth__panel">
      <h1 class="auth__title">Sign In</h1>
      <p class="auth__subtitle">Welcome back! Sign in to continue.</p>

      <form class="auth__form" @submit.prevent="onSubmit">
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
            autocomplete="current-password"
            required
          />
        </label>

        <div class="auth__row">
          <button type="button" class="auth__link" @click="onForgotPassword">
            Forget Password?
          </button>
        </div>

        <p v-if="error" class="auth__message auth__message--error">
          {{ error }}
        </p>

        <BaseButton type="submit" variant="primary">Sign In</BaseButton>

        <p class="auth__footer">
          New User?
          <RouterLink class="auth__link" to="/signup">Sign Up</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import bg from "../../assets/images/auth_bg.jpg";
import BaseButton from "../../components/common/BaseButton.vue";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();
const { fetchToken, error, isLoggedIn, email, password, resetForm } = useUser();

async function onSubmit() {
  await fetchToken();

  if (isLoggedIn.value) {
    resetForm();
    router.push("/");
  }
}

function onForgotPassword() {
  console.log("forgot password");
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
  background: rgba(0, 0, 0, 0.25);
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
  justify-content: flex-end;
  margin-top: -8px;
}

.auth__footer {
  margin: 0;
  color: var(--muted);
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