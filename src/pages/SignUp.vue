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
import { ref } from 'vue'
import BaseButton from '../components/BaseButton.vue'
import bg from '../assets/images/auth_bg.jpg'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

function onSubmit() {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  // later: call your register service here
  console.log('sign up', { name: name.value, email: email.value, password: password.value })
}
</script>

<style scooped>
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

  &::placeholder { color: rgba(255, 255, 255, 0.45); }

  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.auth__row {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
}

.auth__button {
  height: 54px;
  border: none;
  border-radius: 999px;
  background: var(--accent);
  color: white;
  font-weight: 700;
  cursor: pointer;
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

</style>