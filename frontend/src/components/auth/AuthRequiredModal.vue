<template>
  <div class="auth-modal-overlay" @click.self="closeAuthRequiredModal">
    <div class="auth-modal">
      <button
        class="auth-modal__closeBtn"
        type="button"
        aria-label="Close"
        @click="closeAuthRequiredModal"
      >
        <i class="pi pi-times"></i>
      </button>

      <h2 class="auth-modal__title">You are not logged in</h2>

      <p class="auth-modal__text">
        You need an account to perform this action.
      </p>

      <div class="auth-modal__actions">
        <BaseButton variant="outline" type="button" @click="goToSignIn">
          Sign In
        </BaseButton>

        <BaseButton variant="primary" type="button" @click="goToSignUp">
          Sign Up
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import BaseButton from "../common/BaseButton.vue";
import { useAuthRequiredModal } from "../../composables/useAuthRequiredModal";

const router = useRouter();
const { closeAuthRequiredModal } = useAuthRequiredModal();

function goToSignIn() {
  closeAuthRequiredModal();
  router.push("/signin");
}

function goToSignUp() {
  closeAuthRequiredModal();
  router.push("/signup");
}
</script>

<style scoped lang="scss">
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
}

.auth-modal {
  position: relative;
  width: min(460px, 92vw);
  padding: 32px;
  border-radius: 24px;
  background: white;
  text-align: center;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.auth-modal__title {
  margin: 0 0 10px;
  font-size: 1.7rem;
  color: #111;
}

.auth-modal__text {
  margin: 0 0 22px;
  color: #666;
}

.auth-modal__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
}

.auth-modal__closeBtn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: #777;
  font-size: 18px;
}

.auth-modal__closeBtn:hover {
  color: #111;
}

@media (max-width: 640px) {
  .auth-modal__actions {
    flex-direction: column;
  }
}
</style>
